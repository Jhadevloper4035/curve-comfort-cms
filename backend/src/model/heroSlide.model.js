const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    ctaText: { type: String, required: true },
    ctaLink: { type: String, required: true },
    bgImage: { url: { type: String, required: true }, key: { type: String, required: true } },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

heroSlideSchema.index({ pageType: 1, order: 1 });

module.exports = mongoose.model("HeroSlide", heroSlideSchema);
