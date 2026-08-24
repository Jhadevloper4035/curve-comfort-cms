const router = require("express").Router();
const { createEnquiry } = require("../controller/lead.controller.js");
const { subscribeNewsletter } = require("../controller/newsletter.controller.js");

router.post("/contact/submit", createEnquiry);
router.post("/newsletter/subscribe", subscribeNewsletter);

module.exports = router;
