const jwt = require("jsonwebtoken");
const User = require("../model/user.model.js");
const { ROLE_PERMISSIONS } = require("../constants/access.js");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

// ── Auth guard ────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      status: "unauthenticated",
      message: "Not authenticated. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password -emailOtpHash -refreshTokens -passwordResetTokenHash");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        status: "unauthenticated",
        message: "User no longer exists.",
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        status: "blocked",
        message: "This account is blocked.",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      success: false,
      status: "token_invalid",
      message: "Session expired or invalid. Please log in again.",
    });
  }
};

// ── Role guard ────────────────────────────────────────────────────────────────
// Usage: requireRole('admin', 'superadmin')
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.accessType)) {
    return res.status(403).json({
      success: false,
      status: "forbidden",
      message: "Access denied: insufficient permissions.",
    });
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (!["admin", "superadmin"].includes(req.user?.accessType)) {
    return res.status(403).json({
      success: false,
      status: "forbidden",
      message: "Access denied: admin users only.",
    });
  }

  next();
};

const hasPermission = (user, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[user.accessType] || [];
  const explicitPermissions = user.permissions || [];

  return (
    rolePermissions.includes("*") ||
    rolePermissions.includes(permission) ||
    explicitPermissions.includes(permission)
  );
};

const requirePermission = (...permissions) => (req, res, next) => {
  if (!permissions.some((permission) => hasPermission(req.user, permission))) {
    return res.status(403).json({
      success: false,
      status: "forbidden",
      message: "Access denied: insufficient permissions.",
    });
  }

  next();
};

module.exports = {
  generateToken,
  protect,
  requireRole,
  adminOnly,
  requirePermission,
  hasPermission,
};
