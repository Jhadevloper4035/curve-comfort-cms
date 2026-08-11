const mongoose = require("mongoose");
const seoFields = require("./seoFields.js");

const pageMetaSchema = new mongoose.Schema(
  {
    pageType: { type: String, enum: ["kitchen", "wardrobe"], required: true, unique: true },
    ...seoFields,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PageMeta", pageMetaSchema);
