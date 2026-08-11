const mongoose = require("mongoose");

const consultationCtaSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, unique: true },
    eyebrow: { type: String, required: true },
    heading: { type: String, required: true },
    bgImage: { url: { type: String, required: true }, key: { type: String, required: true } },
    ctaText: { type: String, required: true },
    ctaLink: { type: String, default: "/contact-us" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsultationCta", consultationCtaSchema);
