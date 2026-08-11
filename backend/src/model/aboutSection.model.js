const mongoose = require("mongoose");

const aboutTabSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    stepNumber: { type: String, required: true },
    heading: { type: String, required: true },
    body: { type: String, required: true },
    image: { url: { type: String, required: true }, key: { type: String, required: true } },
    caption: { type: String, required: true },
    ctaText: { type: String, required: true },
    ctaLink: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const aboutSectionSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, unique: true },
    eyebrow: { type: String, required: true },
    heading: { type: String, required: true },
    introText: { type: String, required: true },
    mainImage: { url: { type: String, required: true }, key: { type: String, required: true } },
    mainCaption: { type: String, required: true },
    tabs: { type: [aboutTabSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutSection", aboutSectionSchema);
