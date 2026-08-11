const express = require("express");
const {
  getLandingPage,
  createSection,
  updateSection,
  deleteSection,
} = require("../../controller/landing-page.controller.js");

const router = express.Router();

router.get("/:pageType", getLandingPage);
router.post("/:section", createSection);
router.put("/:section/:id", updateSection);
router.delete("/:section/:id", deleteSection);

module.exports = router;
