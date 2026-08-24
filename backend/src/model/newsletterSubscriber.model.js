const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    source: {
      type: String,
      default: "popup",
    },
  },
  {
    timestamps: true,
    collection: "newsletter_subscribers",
  }
);

newsletterSubscriberSchema.index({ createdAt: -1 });

const NewsletterSubscriber = mongoose.model(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);

module.exports = NewsletterSubscriber;
