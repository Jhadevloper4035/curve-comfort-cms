const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ROLES = ["user", "admin"];

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    ip: String,
    userAgent: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, minlength: 2, maxlength: 60, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    emailOtpHash: { type: String, default: null },
    emailOtpExpiresAt: { type: Date, default: null },

    otpRequestCount: { type: Number, default: 0 },
    otpWindowStartAt: { type: Date, default: null },
    otpLastRequestedAt: { type: Date, default: null },

    refreshTokens: { type: [refreshTokenSchema], default: [] },

    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ passwordResetTokenHash: 1 }, { sparse: true });

userSchema.virtual("name").get(function () {
  return this.fullName;
});

userSchema.virtual("name").set(function (value) {
  this.fullName = value;
});

userSchema.virtual("accessType").get(function () {
  return this.role === "admin" ? "admin" : "custom";
});

userSchema.virtual("accessType").set(function (value) {
  this.role = ["admin", "superadmin"].includes(value) ? "admin" : "user";
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.matchPassword = userSchema.methods.comparePassword;

module.exports = mongoose.model("User", userSchema);
