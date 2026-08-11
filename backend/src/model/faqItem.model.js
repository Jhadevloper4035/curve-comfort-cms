const mongoose = require("mongoose");

const faqItemSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqItemSchema.index({ pageType: 1, order: 1 });

module.exports = mongoose.model("FaqItem", faqItemSchema);
