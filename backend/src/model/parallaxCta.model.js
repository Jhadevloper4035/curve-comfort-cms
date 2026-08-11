const mongoose = require("mongoose");

const parallaxCtaSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, unique: true },
    eyebrow: { type: String, required: true },
    heading: { type: String, required: true },
    bgImage: { url: { type: String, required: true }, key: { type: String, required: true } },
    linkText: { type: String, required: true },
    linkHref: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ParallaxCta", parallaxCtaSchema);
