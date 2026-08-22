const router = require("express").Router();
const controller = require("../controller/commerceAdmin.controller.js");
const { protect, adminOnly } = require("../middleware/jwt.js");

router.use(protect, adminOnly);
router.get("/dashboard", controller.dashboard);
router.get("/monitoring", controller.monitoring);
router.get("/payments", controller.paymentTimeline);
router.post("/payments/:orderId/reconcile", controller.reconcilePayment);
router.get("/users", controller.listUsers);
router.patch("/users/:id/role", controller.updateUserRole);
router.patch("/users/:id/block", controller.blockUser);

module.exports = router;
