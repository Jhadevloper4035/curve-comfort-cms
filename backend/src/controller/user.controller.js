const User = require("../model/user.model.js");
const mongoose = require("mongoose");
const { generateToken } = require("../middleware/jwt.js");
const { createActivity } = require("../utils/activityLogger.js");

const userPayload = (user) => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  mobileNumber: user.mobileNumber,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isBlocked: user.isBlocked,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  name: user.fullName,
  accessType: user.accessType,
  permissions: [],
});

const actorName = (req) => req.user?.fullName || req.user?.name || "System";
const targetUserName = (user = {}) => user.fullName || user.name || user.email || user._id?.toString?.() || "user";
const logUserActivity = (req, payload) =>
  createActivity(req, {
    module: "users",
    ...payload,
  });

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

const cleanEmail = (email = "") => email.trim().toLowerCase();
const cleanRole = (role = "user") => (role === "admin" ? "admin" : "user");
const publicSelect = "-password -emailOtpHash -refreshTokens -passwordResetTokenHash";

const revokeStorefrontSessions = (userId) =>
  mongoose.connection.collection("sessions").updateMany(
    { userId, isRevoked: false },
    { $set: { isRevoked: true, revokedAt: new Date() } }
  );

exports.register = async (req, res) => {
  const {
    fullName = req.body.name,
    email,
    mobileNumber,
    password,
    role = req.body.accessType === "superadmin" || req.body.accessType === "admin" ? "admin" : "user",
  } = req.body;

  if (!fullName || !email || !mobileNumber || !password) {
    return res.status(400).json({
      success: false,
      status: "validation_error",
      message: "Full name, email, mobile number, and password are required.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      status: "validation_error",
      message: "Password must be at least 8 characters.",
    });
  }

  if (cleanRole(role) === "admin" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      status: "forbidden",
      message: "Only admin users can create admin accounts.",
    });
  }

  try {
    const userExists = await User.findOne({ email: cleanEmail(email) });
    if (userExists) {
      return res.status(400).json({
        success: false,
        status: "user_exists",
        message: "User already exists.",
      });
    }

    const user = await User.create({
      fullName,
      email: cleanEmail(email),
      mobileNumber,
      password,
      role: cleanRole(role),
    });
    const targetName = targetUserName(user);

    await logUserActivity(req, {
      title: "User Created",
      description: `${actorName(req)} created user ${targetName}`,
      action: "USER_CREATED",
      targetId: user._id,
      targetName,
      status: "completed",
      badge: "Created",
      iconType: "success",
    });

    return res.status(201).json({
      success: true,
      status: "registered",
      message: "Registration successful.",
      data: { user: userPayload(user) },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Registration failed. Please try again.",
    });
  }
};

exports.login = async (req, res) => {
  const email = cleanEmail(req.body.email || req.body.name);
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      status: "validation_error",
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        status: "invalid_credentials",
        message: "Invalid email or password.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        status: "blocked",
        message: "This account is blocked.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        status: "forbidden",
        message: "Dashboard access is limited to admin accounts.",
      });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions());
    req.user = user;

    await logUserActivity(req, {
      title: "User Login",
      description: `${targetUserName(user)} logged in`,
      action: "USER_LOGIN",
      targetId: user._id,
      targetName: targetUserName(user),
      status: "completed",
      badge: "Login",
      iconType: "success",
    });

    return res.status(200).json({
      success: true,
      status: "logged_in",
      message: "Login successful.",
      data: { user: userPayload(user) },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Login failed. Please try again.",
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  return res.status(200).json({
    success: true,
    status: "logged_out",
    message: "Logged out successfully.",
  });
};

exports.getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    data: { user: userPayload(req.user) },
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      status: "validation_error",
      message: "Current password and new password are required.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      status: "validation_error",
      message: "New password must be at least 8 characters.",
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        status: "invalid_current_password",
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    await revokeStorefrontSessions(user._id);

    await logUserActivity(req, {
      title: "Password Changed",
      description: `${actorName(req)} changed password`,
      action: "USER_PASSWORD_CHANGED",
      targetId: user._id,
      targetName: targetUserName(user),
      status: "completed",
      badge: "Security",
      iconType: "warning",
    });

    return res.status(200).json({
      success: true,
      status: "password_changed",
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Failed to change password." });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(publicSelect).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: { users: users.map(userPayload) },
    });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

exports.updateUser = async (req, res) => {
  const { fullName = req.body.name, email, mobileNumber, role, isBlocked, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (cleanRole(role || user.role) === "admin" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin users can manage admin accounts.",
      });
    }

    const previousRole = user.role;
    if (fullName) user.fullName = fullName;
    if (email) user.email = cleanEmail(email);
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (role) user.role = cleanRole(role);
    const isBlocking = isBlocked === true || isBlocked === "true";
    if (isBlocked !== undefined) user.isBlocked = isBlocking;
    if (password) {
      user.password = password;
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();
    if (password || isBlocking) await revokeStorefrontSessions(user._id);
    const targetName = targetUserName(user);

    await logUserActivity(req, {
      title: "User Updated",
      description: `${actorName(req)} updated user ${targetName}`,
      action: "USER_UPDATED",
      targetId: user._id,
      targetName,
      status: "completed",
      badge: "Updated",
      iconType: "info",
    });

    if (previousRole !== user.role) {
      await logUserActivity(req, {
        title: "User Role Changed",
        description: `${actorName(req)} changed ${targetName} role from ${previousRole} to ${user.role}`,
        action: "USER_ROLE_CHANGED",
        targetId: user._id,
        targetName,
        status: "completed",
        badge: "Role",
        iconType: "warning",
      });
    }

    if (password) {
      await logUserActivity(req, {
        title: "User Password Reset",
        description: `${actorName(req)} reset password for ${targetName}`,
        action: "USER_PASSWORD_RESET",
        targetId: user._id,
        targetName,
        status: "completed",
        badge: "Security",
        iconType: "warning",
      });
    }

    return res.status(200).json({
      success: true,
      status: "updated",
      data: { user: userPayload(user) },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ success: false, message: "Failed to update user." });
  }
};

exports.deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: "You cannot delete your own account." });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const targetName = targetUserName(user);
    await logUserActivity(req, {
      title: "User Deleted",
      description: `${actorName(req)} deleted user ${targetName}`,
      action: "USER_DELETED",
      targetId: user._id,
      targetName,
      status: "warning",
      badge: "Security",
      iconType: "danger",
    });
    return res.status(200).json({ success: true, status: "deleted", message: "User deleted." });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};
