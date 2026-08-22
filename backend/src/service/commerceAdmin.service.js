const crypto = require("crypto");
const Order = require("../model/order.model.js");
const PaymentTransaction = require("../model/paymentTransaction.model.js");
const PaymentWebhookEvent = require("../model/paymentWebhookEvent.model.js");
const PaymentGatewayCall = require("../model/paymentGatewayCall.model.js");
const PaymentReconciliationAction = require("../model/paymentReconciliationAction.model.js");
const Refund = require("../model/refund.model.js");
const EmailEvent = require("../model/emailEvent.model.js");
const FinancialAuditLog = require("../model/financialAuditLog.model.js");

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });
const byTime = (items) => [...items].sort((left, right) => new Date(left.createdAt || left.at) - new Date(right.createdAt || right.at));

async function recordFinancialAudit(data) {
  return FinancialAuditLog.create(data);
}

async function getAdminDashboard(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [data, customers] = await Promise.all([
    Order.aggregate([{ $facet: {
      summary: [{ $group: { _id: null, totalOrders: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "confirmed"] }, { $eq: ["$paymentStatus", "paid"] }] }, 1, 0] } }, pendingPayments: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] } }, toFulfil: { $sum: { $cond: [{ $and: [{ $eq: ["$paymentStatus", "paid"] }, { $in: ["$status", ["confirmed", "processing"]] }] }, 1, 0] } }, collectedPaise: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "confirmed"] }, { $eq: ["$paymentStatus", "paid"] }] }, "$pricing.totalPaise", 0] } }, refundedPaise: { $sum: "$refundedPaise" } } }],
      status: [{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
      trend: [{ $match: { createdAt: { $gte: start, $lt: end }, status: "confirmed", paymentStatus: "paid" } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } }, orders: { $sum: 1 }, collectedPaise: { $sum: { $subtract: ["$pricing.totalPaise", "$advancePaidPaise"] } } } }, { $sort: { _id: 1 } }],
    } }]),
    require("../model/user.model.js").countDocuments({ role: "user" }),
  ]);
  const summary = data[0]?.summary[0] || {};
  const trends = new Map((data[0]?.trend || []).map((item) => [item._id, item]));
  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    const key = date.toISOString().slice(0, 7);
    const item = trends.get(key) || {};
    return { month: date.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }), orders: item.orders || 0, collectedPaise: item.collectedPaise || 0 };
  });
  return { generatedAt: now.toISOString(), metrics: { totalOrders: summary.totalOrders || 0, customers, collectedPaise: summary.collectedPaise || 0, pendingPayments: summary.pendingPayments || 0, toFulfil: summary.toFulfil || 0, refundedPaise: summary.refundedPaise || 0 }, trend, status: data[0]?.status || [] };
}

async function getAdminPaymentTimeline(query) {
  let order = await Order.findOne({ orderNumber: query });
  if (!order) {
    const payment = await PaymentTransaction.findOne({ $or: [{ cfPaymentId: query }, { cfOrderId: query }] });
    if (payment) order = await Order.findById(payment.order);
  }
  if (!order) throw httpError(404, "Order not found");
  const attempts = await PaymentTransaction.find({ order: order._id });
  const paymentIds = attempts.map((attempt) => attempt.cfPaymentId).filter(Boolean);
  const cashfreeOrderIds = attempts.map((attempt) => attempt.cfOrderId).filter(Boolean);
  const [refunds, webhooks, reconciliations, emails, audits] = await Promise.all([
    Refund.find({ order: order._id }),
    PaymentWebhookEvent.find({ $or: [{ orderId: order.orderNumber }, ...(paymentIds.length ? [{ cfPaymentId: { $in: paymentIds } }] : []), ...(cashfreeOrderIds.length ? [{ cfOrderId: { $in: cashfreeOrderIds } }] : [])] }),
    PaymentReconciliationAction.find({ order: order._id }),
    EmailEvent.find({ order: order._id }),
    FinancialAuditLog.find({ order: order._id }),
  ]);
  const timeline = byTime([
    ...attempts.map((attempt) => ({ type: "payment_attempt", at: attempt.processedAt || attempt.createdAt, status: attempt.status, paymentId: attempt.cfPaymentId || "", details: { cashfreeStatus: attempt.cashfreeStatus || "" } })),
    ...webhooks.map((webhook) => ({ type: "webhook", at: webhook.processedAt || webhook.receivedAt || webhook.createdAt, status: webhook.status, paymentId: webhook.cfPaymentId, details: { eventType: webhook.eventType, signatureValid: webhook.signatureValid, error: webhook.processingError, duplicateCount: webhook.duplicateCount } })),
    ...reconciliations.map((action) => ({ type: "reconciliation", at: action.createdAt, status: action.type, paymentId: action.cfPaymentId, details: action.details })),
    ...refunds.map((refund) => ({ type: "refund", at: refund.updatedAt || refund.createdAt, status: refund.status, details: { refundId: refund.refundId, amountPaise: refund.amountPaise, reason: refund.reason, cashfreeStatus: refund.cashfreeStatus } })),
    ...emails.map((email) => ({ type: "email", at: email.lastAttemptAt || email.createdAt, status: email.status, details: { type: email.type, to: email.to, error: email.finalError } })),
    ...audits.map((audit) => ({ type: "audit", at: audit.createdAt, status: audit.action, paymentId: audit.paymentId, details: audit.details })),
  ]);
  return { order, attempts: byTime(attempts), refunds: byTime(refunds), webhooks: byTime(webhooks), reconciliations: byTime(reconciliations), emails: byTime(emails), timeline };
}

async function getMonitoringSnapshot(now = new Date()) {
  const pendingBefore = new Date(now.getTime() - Number(process.env.PENDING_PAYMENT_REVIEW_MINUTES || 10) * 60_000);
  const [paid, failed, pending, userDropped, cashfreeFailures, invalidWebhookSignatures, webhookFailures, refundFailures, emailFailures, inventoryReservationLeaks] = await Promise.all([
    PaymentTransaction.countDocuments({ status: "paid" }), PaymentTransaction.countDocuments({ status: "failed" }), PaymentTransaction.countDocuments({ status: "pending" }), PaymentTransaction.countDocuments({ status: "user_dropped" }), PaymentGatewayCall.countDocuments({ success: false }), PaymentWebhookEvent.countDocuments({ signatureValid: false }), PaymentWebhookEvent.countDocuments({ status: "failed" }), Refund.countDocuments({ status: { $in: ["failed", "cancelled", "review_required"] } }), EmailEvent.countDocuments({ status: "failed" }), Order.countDocuments({ status: "pending_payment", expiresAt: { $lte: now } }),
  ]);
  const oldPendingPayments = await PaymentTransaction.countDocuments({ status: "pending", $or: [{ pendingSince: { $lte: pendingBefore } }, { pendingSince: null, createdAt: { $lte: pendingBefore } }] });
  return { generatedAt: now.toISOString(), payments: { successRate: paid + failed ? Number(((paid / (paid + failed)) * 100).toFixed(1)) : 0, failureRate: paid + failed ? Number(((failed / (paid + failed)) * 100).toFixed(1)) : 0, pending, userDropped, oldPendingPayments }, cashfree: { failures: cashfreeFailures }, webhooks: { invalidSignatures: invalidWebhookSignatures, failures: webhookFailures }, refunds: { failures: refundFailures }, emailFailures, inventoryReservationLeaks };
}

function cashfreeHeaders() {
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) throw httpError(503, "Cashfree is not configured");
  return { "x-api-version": process.env.CASHFREE_API_VERSION || "2025-01-01", "x-client-id": process.env.CASHFREE_CLIENT_ID, "x-client-secret": process.env.CASHFREE_CLIENT_SECRET };
}

function cashfreeBaseUrl() {
  return process.env.CASHFREE_ENVIRONMENT === "production" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
}

async function cashfreeRequest(operation, path, options = {}) {
  const startedAt = Date.now();
  try {
    const response = await fetch(`${cashfreeBaseUrl()}${path}`, { ...options, headers: { ...cashfreeHeaders(), ...options.headers }, signal: AbortSignal.timeout(15000) });
    await PaymentGatewayCall.create({ operation, success: response.ok, statusCode: response.status, durationMs: Date.now() - startedAt });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw httpError(502, data.message || "Cashfree request failed");
    return data;
  } catch (error) {
    if (!(error.statusCode)) await PaymentGatewayCall.create({ operation, success: false, durationMs: Date.now() - startedAt, error: error.message }).catch(() => {});
    throw error;
  }
}

function newRefundId() {
  return `RF${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

module.exports = { cashfreeRequest, getAdminDashboard, getAdminPaymentTimeline, getMonitoringSnapshot, httpError, newRefundId, recordFinancialAudit };
