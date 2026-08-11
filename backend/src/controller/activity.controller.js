const ActivityLog = require("../model/activityLog.model.js");

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit, 10) || 25), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildFilter = (query, defaults = {}) => {
  const filter = { ...defaults };

  if (query.module) filter.module = query.module;
  if (query.action) filter.action = query.action;
  if (query.user) filter.user = query.user;
  if (query.status) filter.status = query.status;

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }

  if (query.search) {
    const search = new RegExp(String(query.search).trim(), "i");
    filter.$or = [
      { title: search },
      { description: search },
      { targetName: search },
      { userName: search },
      { action: search },
      { module: search },
      { realIpAddress: search },
    ];
  }

  return filter;
};

const listActivities = async (req, res, defaults = {}) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildFilter(req.query, defaults);
    const total = await ActivityLog.countDocuments(filter);
    const activities = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Activity stream error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch activity stream",
    });
  }
};

exports.getActivityStream = (req, res) => listActivities(req, res);

exports.getLeadActivityStream = (req, res) =>
  listActivities(req, res, { module: "leads" });
