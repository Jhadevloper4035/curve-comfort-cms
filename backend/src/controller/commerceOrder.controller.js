const Order = require("../model/order.model.js");
const User = require("../model/user.model.js");
const Refund = require("../model/refund.model.js");
const EmailEvent = require("../model/emailEvent.model.js");
const OutboxEvent = require("../model/outboxEvent.model.js");
const { cashfreeRequest, httpError, newRefundId, recordFinancialAudit } = require("../service/commerceAdmin.service.js");

const transitions = { pending_payment: ["cancelled"], confirmed: ["processing", "cancel_requested"], processing: ["shipped", "cancel_requested"], shipped: ["delivered", "cancelled"], cancel_requested: ["cancelled"], payment_review_required: ["cancelled"] };

exports.listOrders = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = {};
  const conditions = [];
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.view === "failed") conditions.push({ $or: [{ status: "payment_failed" }, { paymentStatus: "failed" }] });
  if (req.query.q?.trim()) {
    const search = req.query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({ $or: [{ fullName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { mobileNumber: { $regex: search, $options: "i" } }] }).distinct("_id");
    conditions.push({ $or: [{ orderNumber: { $regex: search, $options: "i" } }, ...(users.length ? [{ user: { $in: users } }] : [])] });
  }
  if (conditions.length) filter.$and = conditions;
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "fullName email mobileNumber"),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderId })
    .populate("user", "fullName email mobileNumber")
    .populate("paymentTransaction activePaymentTransaction advancePaymentTransaction");
  if (!order) throw httpError(404, "Order not found");
  res.json({ success: true, data: { order } });
};

exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderId });
  if (!order) throw httpError(404, "Order not found");
  const status = req.body.status;
  if (!transitions[order.status]?.includes(status)) throw httpError(400, "Invalid order status transition");
  if (order.paymentMethod === "cod" && order.codBalanceDuePaise > 0 && order.codBalanceStatus !== "collected" && status === "delivered") throw httpError(409, "Record the COD balance as collected before delivery");
  const previousState = { status: order.status, paymentStatus: order.paymentStatus };
  order.status = status;
  await order.save();
  await recordFinancialAudit({ actor: req.user._id, actorType: "admin", order: order._id, paymentTransaction: order.paymentTransaction, action: "order_status_updated", previousState, newState: { status: order.status, paymentStatus: order.paymentStatus }, correlationId: `ADMIN:${req.user._id}:${order._id}` });
  res.json({ success: true, message: "Order updated", data: { order } });
};

exports.resolveCodBalance = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderId });
  if (!order) throw httpError(404, "Order not found");
  if (order.paymentMethod !== "cod" || order.codBalanceStatus !== "due") throw httpError(409, "This order has no COD balance due");
  if (!["collected", "refused", "failed_delivery"].includes(req.body.status)) throw httpError(400, "Invalid COD balance status");

  const previousState = { status: order.status, paymentStatus: order.paymentStatus, codBalanceStatus: order.codBalanceStatus };
  const resolvedAt = new Date();
  order.codBalanceStatus = req.body.status;
  order.codBalanceResolvedAt = resolvedAt;
  order.codBalanceConfirmedBy = req.user._id;
  if (req.body.status === "collected") {
    order.codBalanceCollectedAt = resolvedAt;
    order.paymentStatus = "paid";
  }
  await order.save();
  await recordFinancialAudit({ actor: req.user._id, actorType: "admin", order: order._id, paymentTransaction: order.paymentTransaction, action: "cod_balance_resolved", previousState, newState: { status: order.status, paymentStatus: order.paymentStatus, codBalanceStatus: order.codBalanceStatus }, correlationId: `COD:${req.user._id}:${order._id}`, details: { codBalanceStatus: order.codBalanceStatus, codBalanceDuePaise: order.codBalanceDuePaise } });
  res.json({ success: true, message: "COD balance updated", data: { order } });
};

exports.createRefund = async (req, res) => {
  const amountPaise = Math.round(Number(req.body.amount) * 100);
  if (!Number.isInteger(amountPaise) || amountPaise < 1 || !req.body.reason || !req.body.idempotencyKey) throw httpError(400, "amount, reason, and idempotencyKey are required");
  const order = await Order.findOne({ orderNumber: req.params.orderId }).populate("paymentTransaction");
  if (!order) throw httpError(404, "Order not found");
  const payment = order.paymentTransaction;
  if (!payment || !["paid", "partially_refunded"].includes(payment.status)) throw httpError(409, "This payment cannot be refunded");
  const existing = await Refund.findOne({ order: order._id, idempotencyKey: req.body.idempotencyKey });
  if (existing) return res.status(existing.status === "review_required" ? 202 : 200).json({ success: true, data: { refund: existing } });
  if (order.refundedPaise + order.refundReservedPaise + amountPaise > payment.amountPaise) throw httpError(409, "Refund amount exceeds the collected payment");

  const refund = await Refund.create({ order: order._id, paymentTransaction: payment._id, refundId: newRefundId(), idempotencyKey: req.body.idempotencyKey, amountPaise, reason: req.body.reason, previousOrderStatus: order.status, previousPaymentStatus: order.paymentStatus, status: "pending" });
  const previousState = { status: order.status, paymentStatus: order.paymentStatus };
  order.refundReservedPaise += amountPaise;
  order.status = "refund_pending";
  order.paymentStatus = "refund_pending";
  await order.save();
  await OutboxEvent.create({ type: "REFUND_INITIATED", order: order._id, paymentTransaction: payment._id, refund: refund._id, dedupeKey: `REFUND_INITIATED:${refund._id}` });

  try {
    const response = await cashfreeRequest("create_refund", `/pg/orders/${encodeURIComponent(order.orderNumber)}/refunds`, { method: "POST", headers: { "content-type": "application/json", "x-idempotency-key": refund.refundId }, body: JSON.stringify({ refund_amount: Number((amountPaise / 100).toFixed(2)), refund_id: refund.refundId, refund_note: refund.reason, refund_speed: "STANDARD" }) });
    refund.cashfreeStatus = response.refund_status || "";
    refund.cfRefundId = response.cf_refund_id ? String(response.cf_refund_id) : null;
    if (response.refund_status === "SUCCESS") {
      refund.status = "success";
      refund.appliedAt = new Date();
      order.refundReservedPaise -= amountPaise;
      order.refundedPaise += amountPaise;
      const complete = order.refundedPaise >= payment.amountPaise;
      order.status = complete ? "refunded" : "partially_refunded";
      order.paymentStatus = complete ? "refunded" : "partially_refunded";
      payment.status = complete ? "refunded" : "partially_refunded";
      await payment.save();
      await OutboxEvent.create({ type: "REFUND_COMPLETED", order: order._id, paymentTransaction: payment._id, refund: refund._id, dedupeKey: `REFUND_COMPLETED:${refund._id}` });
    } else if (response.refund_status !== "PENDING") {
      refund.status = "review_required";
      await OutboxEvent.create({ type: "REFUND_FAILED", order: order._id, paymentTransaction: payment._id, refund: refund._id, dedupeKey: `REFUND_FAILED:${refund._id}` });
    }
  } catch (error) {
    refund.status = "review_required";
    refund.cashfreeStatus = "UNKNOWN";
    await OutboxEvent.create({ type: "REFUND_FAILED", order: order._id, paymentTransaction: payment._id, refund: refund._id, dedupeKey: `REFUND_FAILED:${refund._id}` });
  }
  await Promise.all([refund.save(), order.save()]);
  await recordFinancialAudit({ actor: req.user._id, actorType: "admin", order: order._id, paymentTransaction: payment._id, refund: refund._id, action: "refund_requested", previousState, newState: { status: order.status, paymentStatus: order.paymentStatus }, correlationId: req.body.idempotencyKey, details: { amountPaise } });
  res.status(refund.status === "review_required" ? 202 : 201).json({ success: true, data: { refund } });
};

exports.resendEmail = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderId });
  if (!order) throw httpError(404, "Order not found");
  const emailEvent = await EmailEvent.findOne({ _id: req.params.emailEventId, order: order._id });
  if (!emailEvent) throw httpError(404, "Email event not found");
  const outboxEvent = await OutboxEvent.findByIdAndUpdate(
    emailEvent.outboxEvent,
    { $set: { status: "pending", nextAttemptAt: new Date(), lastError: "" } },
    { new: true }
  );
  if (!outboxEvent) throw httpError(409, "Email outbox event not found");
  emailEvent.status = "pending";
  emailEvent.manualResendCount += 1;
  emailEvent.finalError = "";
  await emailEvent.save();
  await recordFinancialAudit({ actor: req.user._id, actorType: "admin", order: order._id, action: "email_resent", correlationId: `EMAIL:${emailEvent._id}`, details: { emailEvent: emailEvent._id, type: emailEvent.type, reason: req.body.reason || "" } });
  res.status(202).json({ success: true, message: "Email resend queued", data: { emailEventId: emailEvent._id } });
};
