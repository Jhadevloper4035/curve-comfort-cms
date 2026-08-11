const NewsletterSubscriber = require("../model/newsletterSubscriber.model.js");
const { MAX_DOWNLOAD_LIMIT, sendExcelDownload } = require("../utils/excel.js");
const { createActivity } = require("../utils/activityLogger.js");

const actorName = (req) => req.user?.name || "Admin User";
const logNewsletterActivity = (req, payload) =>
  createActivity(req, {
    module: "newsletter",
    ...payload,
  });

const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(
    Math.max(1, parseInt(req.query.limit) || 200),
    MAX_DOWNLOAD_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  return filter;
};

exports.subscribeNewsletter = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email },
      {
        email,
        source: req.body.source || "footer",
        status: "active",
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await logNewsletterActivity(req, {
      title: "Newsletter Subscriber Saved",
      description: `${email} subscribed to newsletter`,
      action: "NEWSLETTER_SUBSCRIBED",
      targetId: subscriber._id,
      targetName: email,
      status: "completed",
      badge: "Subscribed",
      iconType: "success",
    });

    return res.status(200).json({
      success: true,
      status: "ok",
      message: "Newsletter subscription saved successfully",
      data: subscriber,
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to save newsletter subscription",
    });
  }
};

exports.getNewsletterSubscribers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const filter = buildFilter(req.query);
    const total = await NewsletterSubscriber.countDocuments(filter);
    const subscribers = await NewsletterSubscriber.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      status: "ok",
      count: subscribers.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: subscribers,
    });
  } catch (error) {
    console.error("Newsletter subscribers error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Internal server error",
    });
  }
};

exports.downloadNewsletterSubscribers = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const subscribers = await NewsletterSubscriber.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    const cleanData = subscribers.map(({ _id, __v, ...rest }) => rest);

    sendExcelDownload(res, cleanData, "Newsletter-Subscribers.xlsx");
    await logNewsletterActivity(req, {
      title: "Newsletter Subscribers Exported",
      description: `${actorName(req)} exported newsletter subscribers`,
      action: "NEWSLETTER_SUBSCRIBERS_EXPORTED",
      targetName: "Newsletter Subscribers",
      status: "completed",
      badge: "Exported",
      iconType: "info",
    });
  } catch (error) {
    console.error("Newsletter subscribers export error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Error generating Excel file",
    });
  }
};
