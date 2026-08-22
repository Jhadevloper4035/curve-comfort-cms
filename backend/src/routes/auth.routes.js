
const router = require("express").Router();
const { register, setupAdmin, login, logout, getMe, changePassword, listUsers, getUserDetails, updateUser, deleteUser } = require("../controller/user.controller.js");
const { authLimiter } = require("../middleware/rateLimiter.js");
const { protect, requirePermission } = require("../middleware/jwt.js");

const userManagementAccess = [protect, requirePermission("users.manage")];

// Register is protected — admin/superadmin or users.manage can create scoped users
router.post("/register", ...userManagementAccess, register);
router.post("/setup-admin", authLimiter, setupAdmin);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

// User management
router.get("/users", ...userManagementAccess, listUsers);
router.get("/users/:id", ...userManagementAccess, getUserDetails);
router.put("/users/:id", ...userManagementAccess, updateUser);
router.delete("/users/:id", ...userManagementAccess, deleteUser);

module.exports = router;
