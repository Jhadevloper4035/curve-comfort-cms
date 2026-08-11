const router = require("express").Router();

const {
  getActivityStream,
  getLeadActivityStream,
} = require("../../controller/activity.controller.js");
const { protect, adminOnly } = require("../../middleware/jwt.js");

router.get("/", protect, adminOnly, getActivityStream);
router.get("/leads", protect, adminOnly, getLeadActivityStream);

module.exports = router;
