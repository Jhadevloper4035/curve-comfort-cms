const ActivityLog = require("../model/activityLog.model.js");
const { getClientIp } = require("./clientIp.js");

const PUBLIC_USER = {
  userName: "Public Visitor",
  userEmail: "",
  userRole: "public",
  userAvatarLetter: "P",
};

const userMeta = (user) => {
  if (!user) return PUBLIC_USER;
  const userName = user.name || user.userName || "Admin User";

  return {
    user: user._id || user.id,
    userName,
    userEmail: user.email || "",
    userRole: user.accessType || user.role || "",
    userAvatarLetter: userName.charAt(0).toUpperCase(),
  };
};

const createActivity = async (req, payload = {}) => {
  try {
    const ipMeta = getClientIp(req);
    await ActivityLog.create({
      ...userMeta(req?.user),
      title: payload.title,
      description: payload.description || "",
      module: payload.module || "",
      action: payload.action || "",
      targetId: payload.targetId,
      targetName: payload.targetName || "",
      status: payload.status || "completed",
      badge: payload.badge || "",
      iconType: payload.iconType || "info",
      method: req?.method || "",
      route: req?.originalUrl || req?.url || "",
      userAgent: req?.get?.("user-agent") || req?.headers?.["user-agent"] || "",
      ...ipMeta,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Activity logging failed:", error);
    }
  }
};

module.exports = {
  createActivity,
};
