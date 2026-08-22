const mongoose = require("mongoose");
const User = require("../model/user.model.js");
const Order = require("../model/order.model.js");
const PaymentTransaction = require("../model/paymentTransaction.model.js");
const PaymentReconciliationAction = require("../model/paymentReconciliationAction.model.js");
const { cashfreeRequest, getAdminDashboard, getAdminPaymentTimeline, getMonitoringSnapshot, httpError, recordFinancialAudit } = require("../service/commerceAdmin.service.js");

const safeUser = (user) => ({ id: user._id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, role: user.role, isEmailVerified: user.isEmailVerified, isBlocked: user.isBlocked, createdAt: user.createdAt, updatedAt: user.updatedAt });

exports.listUsers = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const [users, total] = await Promise.all([User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), User.countDocuments()]);
  res.json({ success: true, data: { users: users.map(safeUser), pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
};

exports.updateUserRole = async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw httpError(400, "You cannot change your own role");
  if (!["user", "admin"].includes(req.body.role)) throw httpError(400, "Role must be user or admin");
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, "User not found");
  user.role = req.body.role;
  await user.save();
  res.json({ success: true, message: "Role updated", data: { user: safeUser(user) } });
};

exports.blockUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw httpError(400, "You cannot block your own account");
  if (typeof req.body.isBlocked !== "boolean") throw httpError(400, "isBlocked must be boolean");
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, "User not found");
  user.isBlocked = req.body.isBlocked;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  if (user.isBlocked) await mongoose.connection.collection("sessions").updateMany({ userId: user._id, isRevoked: false }, { $set: { isRevoked: true, revokedAt: new Date() } });
  res.json({ success: true, message: user.isBlocked ? "User blocked" : "User unblocked", data: { user: safeUser(user) } });
};

exports.dashboard = async (req, res) => res.json({ success: true, data: { dashboard: await getAdminDashboard() } });
exports.monitoring = async (req, res) => res.json({ success: true, data: { monitoring: await getMonitoringSnapshot() } });

exports.paymentTimeline = async (req, res) => {
  if (!req.query.q?.trim()) throw httpError(400, "q is required");
  res.json({ success: true, data: { timeline: await getAdminPaymentTimeline(req.query.q.trim()) } });
};

exports.reconcilePayment = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderId }).populate(["activePaymentTransaction", "paymentTransaction"]);
  if (!order) throw httpError(404, "Order not found");
  const transaction = order.activePaymentTransaction || order.paymentTransaction;
  if (!transaction) throw httpError(409, "Order has no payment attempt to reconcile");

  const payments = await cashfreeRequest("get_payments", `/pg/orders/${encodeURIComponent(order.orderNumber)}/payments`);
  const payment = payments.find((item) => item.payment_status === "SUCCESS" && item.cf_order_id === transaction.cfOrderId);
  const previousState = { status: order.status, paymentStatus: order.paymentStatus };
  const amountPaise = payment ? Math.round(Number(payment.payment_amount) * 100) : null;
  const validPayment = payment && amountPaise === transaction.amountPaise && payment.payment_currency === transaction.currency;

  if (payment && !validPayment) {
    transaction.status = "review_required";
    transaction.cashfreeStatus = payment.payment_status;
    await transaction.save();
    order.status = "payment_review_required";
    await order.save();
    await PaymentReconciliationAction.updateOne({ dedupeKey: `RECONCILE:${transaction._id}:${payment.cf_payment_id}` }, { $setOnInsert: { order: order._id, paymentTransaction: transaction._id, cfPaymentId: payment.cf_payment_id || "", type: amountPaise !== transaction.amountPaise ? "amount_mismatch" : "currency_mismatch", details: { expectedAmountPaise: transaction.amountPaise, receivedAmountPaise: amountPaise, expectedCurrency: transaction.currency, receivedCurrency: payment.payment_currency } } }, { upsert: true });
  } else if (validPayment) {
    transaction.status = "paid";
    transaction.cashfreeStatus = payment.payment_status;
    transaction.cfPaymentId = payment.cf_payment_id;
    transaction.processedAt = new Date();
    await transaction.save();
    order.paymentTransaction = transaction._id;
    order.activePaymentTransaction = transaction._id;
    order.paymentStatus = "paid";
    if (order.status === "pending_payment") order.status = "confirmed";
    order.lastPaymentReconciledAt = new Date();
    await order.save();
  }

  await recordFinancialAudit({ actor: req.user._id, actorType: "admin", order: order._id, paymentTransaction: transaction._id, action: "payment_reconciled", previousState, newState: { status: order.status, paymentStatus: order.paymentStatus }, correlationId: `ADMIN_RECONCILIATION:${req.user._id}:${order._id}`, details: { reason: req.body.reason || "", outcome: validPayment ? "confirmed" : payment ? "review_required" : "no_change" } });
  res.json({ success: true, message: "Payment reconciled", data: { order, paymentPending: !payment } });
};
