const router = require("express").Router();
const controller = require("../controller/commerceOrder.controller.js");
const { protect, adminOnly } = require("../middleware/jwt.js");

router.use(protect, adminOnly);
router.get("/", controller.listOrders);
router.get("/:orderId", controller.getOrder);
router.patch("/:orderId/status", controller.updateOrderStatus);
router.patch("/:orderId/cod-balance", controller.resolveCodBalance);
router.post("/:orderId/refunds", controller.createRefund);
router.post("/:orderId/emails/:emailEventId/resend", controller.resendEmail);

module.exports = router;
