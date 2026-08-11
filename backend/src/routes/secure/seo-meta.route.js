const express = require("express");
const {
  getSeoMetaEntries,
  createSeoMetaEntry,
  updateSeoMetaEntry,
  deleteSeoMetaEntry,
} = require("../../controller/seo-meta.controller.js");

const router = express.Router();

router.get("/", getSeoMetaEntries);
router.post("/", createSeoMetaEntry);
router.put("/:id", updateSeoMetaEntry);
router.delete("/:id", deleteSeoMetaEntry);

module.exports = router;
