const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    source: {
      type: String,
      default: "footer",
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

newsletterSubscriberSchema.index({ createdAt: -1 });
newsletterSubscriberSchema.index({ status: 1 });

const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);

module.exports = NewsletterSubscriber;
