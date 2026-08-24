const mongoose = require("mongoose");

const websiteContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    mobileNumber: { type: String, required: true, match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"] },
    subject: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
  },
  { timestamps: true, collection: "contacts" }
);

module.exports = mongoose.model("WebsiteContact", websiteContactSchema);
