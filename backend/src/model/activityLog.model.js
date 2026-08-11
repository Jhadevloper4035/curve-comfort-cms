const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userName: {
      type: String,
      trim: true,
      default: "Guest",
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    userRole: {
      type: String,
      trim: true,
      default: "public",
    },
    userAvatarLetter: {
      type: String,
      trim: true,
      uppercase: true,
      default: "G",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    module: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    action: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.Mixed,
    },
    targetName: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "warning"],
      default: "completed",
      index: true,
    },
    badge: {
      type: String,
      trim: true,
      default: "",
    },
    iconType: {
      type: String,
      enum: ["success", "warning", "danger", "info"],
      default: "info",
    },
    ipAddress: {
      type: String,
      trim: true,
      default: "",
    },
    realIpAddress: {
      type: String,
      trim: true,
      default: "",
    },
    forwardedFor: {
      type: String,
      trim: true,
      default: "",
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
    method: {
      type: String,
      trim: true,
      default: "",
    },
    route: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
