const Coupon = require("../model/coupon.model.js");
const { httpError } = require("../service/commerceAdmin.service.js");

const couponFields = ["code", "title", "description", "discountPercent", "isActive", "usageLimit", "perUserLimit", "minOrderPaise", "maxDiscountPaise", "allowedProductIds", "allowedCategoryIds", "startsAt", "expiresAt"];

function couponPayload(body) {
  return Object.fromEntries(couponFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

exports.listCoupons = async (req, res) => {
  const now = new Date();
  const filter = req.query.active === "true"
    ? { isActive: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] }] }
    : {};
  const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: { coupons } });
};

exports.getCoupon = async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
  if (!coupon) throw httpError(404, "Coupon not found");
  res.json({ success: true, data: { coupon } });
};

exports.createCoupon = async (req, res) => {
  const coupon = await Coupon.create(couponPayload(req.body));
  res.status(201).json({ success: true, message: "Coupon created", data: { coupon } });
};

exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.couponId, couponPayload(req.body), { new: true, runValidators: true });
  if (!coupon) throw httpError(404, "Coupon not found");
  res.json({ success: true, message: "Coupon updated", data: { coupon } });
};
