const Job = require("../model/job.model.js");
const { createActivity } = require("../utils/activityLogger.js");

const actorName = (req) => req.user?.name || "Admin User";
const jobName = (job = {}) => job.title || job.slug || job._id?.toString?.() || "job";
const logJobActivity = (req, payload) =>
  createActivity(req, {
    module: "jobs",
    ...payload,
  });

const cleanList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const buildJobPayload = (body) => {
  const payload = {
    title: body.title,
    slug: body.slug,
    department: body.department,
    location: body.location,
    employmentType: body.employmentType,
    experience: body.experience,
    qualification: body.qualification,
    description: body.description,
    responsibilities: cleanList(body.responsibilities),
    requirements: cleanList(body.requirements),
    openings: body.openings,
    salaryRange: body.salaryRange,
    status: body.status,
    postedAt: body.postedAt,
    expiresAt: body.expiresAt || undefined,
  };
  if (body.seo !== undefined) payload.seo = body.seo;
  return payload;
};

exports.getJobs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const jobs = await Job.find(filter).sort({ postedAt: -1, createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      status: "ok",
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch jobs" });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const name = jobName(job);
    await logJobActivity(req, {
      title: "Job Viewed",
      description: `${actorName(req)} viewed job ${name}`,
      action: "JOB_VIEWED",
      targetId: job._id,
      targetName: name,
      status: "completed",
      badge: "",
      iconType: "info",
    });

    return res.status(200).json({ success: true, status: "ok", data: job });
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch job" });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create(buildJobPayload(req.body));
    const name = jobName(job);

    await logJobActivity(req, {
      title: "Job Created",
      description: `${actorName(req)} created job ${name}`,
      action: "JOB_CREATED",
      targetId: job._id,
      targetName: name,
      status: "completed",
      badge: "Created",
      iconType: "success",
    });

    return res.status(201).json({
      success: true,
      status: "created",
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create job",
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const existing = await Job.findById(req.params.id).lean();

    if (!existing) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, buildJobPayload(req.body), {
      new: true,
      runValidators: true,
    });

    const name = jobName(job);

    await logJobActivity(req, {
      title: "Job Updated",
      description: `${actorName(req)} updated job ${name}`,
      action: "JOB_UPDATED",
      targetId: job._id,
      targetName: name,
      status: "completed",
      badge: "Updated",
      iconType: "info",
    });

    if (existing.status !== job.status) {
      await logJobActivity(req, {
        title: "Job Status Updated",
        description: `${actorName(req)} changed ${name} status from ${existing.status || "unset"} to ${job.status || "unset"}`,
        action: "JOB_STATUS_CHANGED",
        targetId: job._id,
        targetName: name,
        status: "completed",
        badge: "Completed",
        iconType: "success",
      });
    }

    return res.status(200).json({
      success: true,
      status: "updated",
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update job",
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const name = jobName(job);
    await logJobActivity(req, {
      title: "Job Deleted",
      description: `${actorName(req)} deleted job ${name}`,
      action: "JOB_DELETED",
      targetId: job._id,
      targetName: name,
      status: "warning",
      badge: "Security",
      iconType: "danger",
    });

    return res.status(200).json({
      success: true,
      status: "deleted",
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to delete job",
    });
  }
};
