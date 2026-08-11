const mongoose = require("mongoose");

const processStepSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, index: true },
    image: { url: { type: String, required: true }, key: { type: String, required: true } },
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

processStepSchema.index({ pageType: 1, order: 1 });

module.exports = mongoose.model("ProcessStep", processStepSchema);
