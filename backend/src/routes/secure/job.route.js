const express = require("express");
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require("../../controller/jobs.controller.js");

const router = express.Router();

router.get("/", getJobs);
router.get("/:id", getJobById);
router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

module.exports = router;
