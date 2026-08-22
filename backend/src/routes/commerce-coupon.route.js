const router = require("express").Router();
const controller = require("../controller/commerceCoupon.controller.js");
const { protect, adminOnly } = require("../middleware/jwt.js");

router.use(protect, adminOnly);
router.get("/", controller.listCoupons);
router.get("/:code", controller.getCoupon);
router.post("/", controller.createCoupon);
router.patch("/:couponId", controller.updateCoupon);

module.exports = router;
