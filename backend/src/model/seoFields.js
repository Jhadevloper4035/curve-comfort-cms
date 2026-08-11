const mongoose = require("mongoose");

module.exports = {
  title: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
  keywords: { type: String, trim: true, default: "" },
  robots: { type: String, trim: true, default: "index, follow" },
  canonicalUrl: { type: String, trim: true, default: "" },
  ogTitle: { type: String, trim: true, default: "" },
  ogDescription: { type: String, trim: true, default: "" },
  ogImage: { type: String, trim: true, default: "" },
  ogType: { type: String, trim: true, default: "website" },
  twitterTitle: { type: String, trim: true, default: "" },
  twitterDescription: { type: String, trim: true, default: "" },
  twitterImage: { type: String, trim: true, default: "" },
  schemaMarkup: { type: mongoose.Schema.Types.Mixed, default: null },
};
