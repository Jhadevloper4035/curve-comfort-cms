const mongoose = require("mongoose");

const layoutCardSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, index: true },
    image: { url: { type: String, required: true }, key: { type: String, required: true } },
    imageAlt: { type: String, required: true },
    tagLabel: { type: String, default: "Curve" },
    stepNumber: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

layoutCardSchema.index({ pageType: 1, order: 1 });

module.exports = mongoose.model("LayoutCard", layoutCardSchema);
