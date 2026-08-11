const mongoose = require("mongoose");

const whyChooseItemSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, index: true },
    stepNumber: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

whyChooseItemSchema.index({ pageType: 1, order: 1 });

module.exports = mongoose.model("WhyChooseItem", whyChooseItemSchema);
