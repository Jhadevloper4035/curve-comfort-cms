const SeoMeta = require("../model/seometa.model.js");
const { createActivity } = require("../utils/activityLogger.js");

const actorName = (req) => req.user?.name || "Admin User";
const seoMetaName = (entry = {}) =>
  entry.pageName || entry.pageSlug || entry.canonicalUrl || entry.title || entry._id?.toString?.() || "SEO meta entry";
const logSeoMetaActivity = (req, payload) =>
  createActivity(req, {
    module: "seo-meta",
    ...payload,
  });

exports.getSeoMetaEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 60;
    const skip = (page - 1) * limit;

    const seoMetaEntries = await SeoMeta.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      message: "SEO Meta entries fetched successfully",
      data: seoMetaEntries,
    });
  } catch (error) {
    console.error("Error fetching SEO Meta:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching SEO Meta." });
  }
};

exports.createSeoMetaEntry = async (req, res) => {
  try {
    const created = await SeoMeta.create(req.body);
    const name = seoMetaName(created);

    await logSeoMetaActivity(req, {
      title: "SEO Meta Created",
      description: `${actorName(req)} created SEO meta ${name}`,
      action: "SEO_META_CREATED",
      targetId: created._id,
      targetName: name,
      status: "completed",
      badge: "Created",
      iconType: "success",
    });

    res.status(201).json({
      status: "success",
      message: "SEO Meta entry created successfully",
      data: created,
    });
  } catch (error) {
    console.error("Error creating SEO Meta:", error);
    res.status(500).json({
      error: error.message || "An error occurred while creating SEO Meta.",
    });
  }
};

exports.updateSeoMetaEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await SeoMeta.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "SEO Meta entry not found." });
    }

    const name = seoMetaName(updated);

    await logSeoMetaActivity(req, {
      title: "SEO Meta Updated",
      description: `${actorName(req)} updated SEO meta ${name}`,
      action: "SEO_META_UPDATED",
      targetId: updated._id,
      targetName: name,
      status: "completed",
      badge: "Updated",
      iconType: "info",
    });

    res.status(200).json({
      status: "success",
      message: "SEO Meta entry updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating SEO Meta:", error);
    res.status(500).json({
      error: error.message || "An error occurred while updating SEO Meta.",
    });
  }
};

exports.deleteSeoMetaEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SeoMeta.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "SEO Meta entry not found." });
    }

    const name = seoMetaName(deleted);

    await logSeoMetaActivity(req, {
      title: "SEO Meta Deleted",
      description: `${actorName(req)} deleted SEO meta ${name}`,
      action: "SEO_META_DELETED",
      targetId: deleted._id,
      targetName: name,
      status: "warning",
      badge: "Security",
      iconType: "danger",
    });

    res.status(200).json({
      status: "success",
      message: "SEO Meta entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SEO Meta:", error);
    res.status(500).json({
      error: error.message || "An error occurred while deleting SEO Meta.",
    });
  }
};
