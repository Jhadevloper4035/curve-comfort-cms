const router = require("express").Router();

const {
  subscribeNewsletter,
  getNewsletterSubscribers,
  downloadNewsletterSubscribers,
} = require("../../controller/newsletter.controller.js");

const { protect, requirePermission } = require("../../middleware/jwt.js");

const newsletterAccess = [
  protect,
  requirePermission("newsletterSubscribers.view"),
];

router.post("/subscribe", subscribeNewsletter);
router.get("/", newsletterAccess, getNewsletterSubscribers);
router.get("/download", newsletterAccess, downloadNewsletterSubscribers);

module.exports = router;
