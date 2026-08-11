const path = require("path");
const Lead = require("../model/lead.model.js");
const Enquiry = require("../model/enquiry.model.js");
const ProductEnquiry = require("../model/productenquiry.model.js");
const { createActivity } = require("../utils/activityLogger.js");

const {
  MAX_DOWNLOAD_LIMIT,
  formatProductType,
  sendExcelDownload,
} = require("../utils/excel.js");



const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(
    Math.max(1, parseInt(req.query.limit) || 200),
    MAX_DOWNLOAD_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const fetchLeads = async (filter, { skip, limit }) => {
  const total = await Lead.countDocuments(filter);

  const leads = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return { total, leads };
};

const fetchPaginatedDocuments = async (Model, filter, { skip, limit }) => {
  const total = await Model.countDocuments(filter);

  const documents = await Model.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return { total, documents };
};


const exportLeadsToExcel = async (res, filter) => {
  const data = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  const cleanData = data
    .map(formatProductType)
    .map(({ _id, __v, ...rest }) => rest);

  sendExcelDownload(res, cleanData);
};

const exportDocumentsToExcel = async (res, Model, filter, filename) => {
  const documents = await Model.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  const cleanData = documents.map(({ _id, __v, ...rest }) => rest);

  sendExcelDownload(res, cleanData, filename);
};

const getActorName = (req) => req.user?.name || "Public Visitor";

const getLeadName = (lead = {}) =>
  lead.fullName ||
  lead.name ||
  lead.email ||
  lead.mobileNumber ||
  lead.phone ||
  lead._id?.toString?.() ||
  "lead";

const logLeadActivity = (req, payload) =>
  createActivity(req, {
    module: "leads",
    ...payload,
  });



module.exports.seedLeads = async (req, res) => {
  try {
    const dataPath = path.join(__dirname, "../data/leads.json");
    const { allLead } = require(dataPath);

    const mapped = allLead.map(({ _id, UserType, ProductEnquire, __v, createdAt, updatedAt, ...rest }) => ({
      _id,
      ...rest,
      userType: UserType,
      productType: Array.isArray(ProductEnquire) ? ProductEnquire : [ProductEnquire].filter(Boolean),
    }));

    const result = await Lead.insertMany(mapped, { ordered: false, rawResult: true });

    return res.status(200).json({
      success: true,
      message: "Seed completed",
      inserted: result.insertedCount,
      total: mapped.length,
    });
  } catch (error) {
    // ordered:false means partial success; BulkWriteError still returns inserted count
    if (error.name === "MongoBulkWriteError") {
      return res.status(200).json({
        success: true,
        message: "Seed completed with some duplicates skipped",
        inserted: error.result?.insertedCount ?? 0,
        duplicatesSkipped: error.writeErrors?.length ?? 0,
      });
    }
    console.error("Seed error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getLeads = async (req, res) => {
  const allLead = await Lead.find().lean();
  return res.status(200).json({
allLead,
  })
}



module.exports.submitFormEvent = async (req, res) => {
  try {
    const { mobileNumber, ...rest } = req.body;
    const { place } = req.params;

    const existingLead = await Lead.findOne({
      mobileNumber,
      place,
      leadType: "event",
    });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        status: "already_submitted",
        message: "You have already registered for this event.",
      });
    }

    const lead = await Lead.create({
      ...rest,
      mobileNumber,
      place,
      leadType: "event",
    });

    const leadName = getLeadName(lead);
    await logLeadActivity(req, {
      title: "Lead Created",
      description: `${getActorName(req)} created lead ${leadName}`,
      action: "LEAD_CREATED",
      targetId: lead._id,
      targetName: leadName,
      status: "completed",
      badge: "Completed",
      iconType: "success",
    });

    return res.status(201).json({
      success: true,
      status: "submitted",
      message: "Thank you! Your registration was successful.",
      data: { id: lead._id },
    });
  } catch (error) {
    console.error("Event form submission error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Error submitting form. Please try again.",
    });
  }
};


module.exports.getEventLeads = async (req, res) => {
  try {
    const { place } = req.params;
    const { page, limit, skip } = getPagination(req);

    const { total, leads } = await fetchLeads(
      { leadType: "event", place },
      { skip, limit }
    );

    return res.status(200).json({
      success: true,
      status: "ok",
      count: leads.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: leads.map(formatProductType),
    });
  } catch (error) {
    console.error("Event leads error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * EVENT: Download Excel
 */
module.exports.downloadEventLeads = async (req, res) => {
  try {
    const { place } = req.params;
    await exportLeadsToExcel(res, { leadType: "event", place });
    await logLeadActivity(req, {
      title: "Leads Exported",
      description: `${getActorName(req)} exported event leads`,
      action: "LEAD_EXPORTED",
      targetName: place,
      status: "completed",
      badge: "Exported",
      iconType: "info",
    });
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Error generating Excel file",
    });
  }
};

/**
 * SHOWROOM: Submit Form
 */
module.exports.submitFormShowroom = async (req, res) => {
  try {
    const { mobileNumber, ...rest } = req.body;

    const existingLead = await Lead.findOne({
      mobileNumber,
      leadType: "showroom",
    });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        status: "already_submitted",
        message: "You have already submitted a showroom enquiry.",
      });
    }

    const lead = await Lead.create({
      ...rest,
      mobileNumber,
      leadType: "showroom",
      place: rest.place || "kirti nagar",
    });

    const leadName = getLeadName(lead);
    await logLeadActivity(req, {
      title: "Lead Created",
      description: `${getActorName(req)} created lead ${leadName}`,
      action: "LEAD_CREATED",
      targetId: lead._id,
      targetName: leadName,
      status: "completed",
      badge: "Completed",
      iconType: "success",
    });

    return res.status(201).json({
      success: true,
      status: "submitted",
      message: "Thank you! Your showroom enquiry was submitted successfully.",
      data: { id: lead._id },
    });
  } catch (error) {
    console.error("Showroom form submission error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Error submitting form. Please try again.",
    });
  }
};

/**
 * SHOWROOM: Get Leads
 */
module.exports.getShowroomLeads = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const { total, leads } = await fetchLeads(
      { leadType: "showroom" },
      { skip, limit }
    );

    return res.status(200).json({
      success: true,
      status: "ok",
      count: leads.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: leads.map(formatProductType),
    });
  } catch (error) {
    console.error("Showroom leads error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * SHOWROOM: Download Excel
 */
module.exports.downloadShowroomLeads = async (req, res) => {
  try {
    await exportLeadsToExcel(res, { leadType: "showroom" });
    await logLeadActivity(req, {
      title: "Leads Exported",
      description: `${getActorName(req)} exported showroom leads`,
      action: "LEAD_EXPORTED",
      targetName: "showroom",
      status: "completed",
      badge: "Exported",
      iconType: "info",
    });
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Error generating Excel file",
    });
  }
};

module.exports.submitFormDubaiwood = async (req, res) => {
  try {
    const { mobileNumber, ...rest } = req.body;

    const existingLead = mobileNumber
      ? await Lead.findOne({
          mobileNumber,
          leadType: "dubaiwood",
        })
      : null;

    if (existingLead) {
      return res.status(409).json({
        success: false,
        status: "already_submitted",
        message: "You have already submitted a Dubaiwood Show enquiry.",
      });
    }

    const lead = await Lead.create({
      ...rest,
      mobileNumber,
      leadType: "dubaiwood",
      place: "dubaiwoodshow",
    });

    const leadName = getLeadName(lead);
    await logLeadActivity(req, {
      title: "Lead Created",
      description: `${getActorName(req)} created lead ${leadName}`,
      action: "LEAD_CREATED",
      targetId: lead._id,
      targetName: leadName,
      status: "completed",
      badge: "Completed",
      iconType: "success",
    });

    return res.status(201).json({
      success: true,
      status: "submitted",
      message: "Thank you! Your Dubaiwood Show enquiry was submitted successfully.",
      data: { id: lead._id },
    });
  } catch (error) {
    console.error("Dubaiwood form submission error:", error);
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((fieldError) => fieldError.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        status: "validation_error",
        message,
      });
    }

    return res.status(500).json({
      success: false,
      status: "error",
      message: "Error submitting form. Please try again.",
    });
  }
};

module.exports.getDubaiwoodLeads = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const { total, leads } = await fetchLeads(
      { leadType: "dubaiwood" },
      { skip, limit }
    );

    return res.status(200).json({
      success: true,
      status: "ok",
      count: leads.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: leads.map(formatProductType),
    });
  } catch (error) {
    console.error("Dubaiwood leads error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports.downloadDubaiwoodLeads = async (req, res) => {
  try {
    await exportLeadsToExcel(res, { leadType: "dubaiwood" });
    await logLeadActivity(req, {
      title: "Leads Exported",
      description: `${getActorName(req)} exported Dubaiwood Show leads`,
      action: "LEAD_EXPORTED",
      targetName: "dubaiwoodshow",
      status: "completed",
      badge: "Exported",
      iconType: "info",
    });
  } catch (error) {
    console.error("Dubaiwood Excel export error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Error generating Excel file",
    });
  }
};

module.exports.getEnquiries = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { total, documents } = await fetchPaginatedDocuments(
      Enquiry,
      {},
      { skip, limit }
    );

    return res.status(200).json({
      success: true,
      status: "ok",
      count: documents.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: documents,
    });
  } catch (error) {
    console.error("Website enquiries error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports.createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    const leadName = getLeadName(enquiry);

    await logLeadActivity(req, {
      title: "Lead Created",
      description: `${getActorName(req)} created lead ${leadName}`,
      action: "LEAD_CREATED",
      targetId: enquiry._id,
      targetName: leadName,
      status: "completed",
      badge: "Completed",
      iconType: "success",
    });

    return res.status(201).json({
      success: true,
      status: "created",
      data: enquiry,
    });
  } catch (error) {
    console.error("Create website enquiry error:", error);
    return res.status(400).json({
      success: false,
      status: "error",
      message: error.message || "Unable to create enquiry",
    });
  }
};

module.exports.updateEnquiry = async (req, res) => {
  try {
    const existing = await Enquiry.findById(req.params.id).lean();

    if (!existing) {
      return res.status(404).json({
        success: false,
        status: "not_found",
        message: "Enquiry not found",
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const leadName = getLeadName(enquiry);

    await logLeadActivity(req, {
      title: "Lead Updated",
      description: `${getActorName(req)} updated lead ${leadName}`,
      action: "LEAD_UPDATED",
      targetId: enquiry._id,
      targetName: leadName,
      status: "completed",
      badge: "Updated",
      iconType: "info",
    });

    if (existing.status !== enquiry.status) {
      await logLeadActivity(req, {
        title: "Lead Status Updated",
        description: `${getActorName(req)} changed ${leadName} status from ${existing.status || "unset"} to ${enquiry.status || "unset"}`,
        action: "LEAD_STATUS_CHANGED",
        targetId: enquiry._id,
        targetName: leadName,
        status: "completed",
        badge: "Completed",
        iconType: "success",
      });
    }

    const oldAssignedTo = existing.assignedTo?.toString?.() || "";
    const newAssignedTo = enquiry.assignedTo?.toString?.() || "";
    if (oldAssignedTo !== newAssignedTo) {
      await logLeadActivity(req, {
        title: "Lead Assigned",
        description: `${getActorName(req)} assigned lead ${leadName}`,
        action: "LEAD_ASSIGNED",
        targetId: enquiry._id,
        targetName: leadName,
        status: "completed",
        badge: "Assigned",
        iconType: "info",
      });
    }

    if (enquiry.notes && existing.notes !== enquiry.notes) {
      await logLeadActivity(req, {
        title: "Lead Note Added",
        description: `${getActorName(req)} added a note to ${leadName}`,
        action: "LEAD_NOTE_ADDED",
        targetId: enquiry._id,
        targetName: leadName,
        status: "completed",
        badge: "Note",
        iconType: "info",
      });
    }

    return res.status(200).json({
      success: true,
      status: "updated",
      data: enquiry,
    });
  } catch (error) {
    console.error("Update website enquiry error:", error);
    return res.status(400).json({
      success: false,
      status: "error",
      message: error.message || "Unable to update enquiry",
    });
  }
};

module.exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        status: "not_found",
        message: "Enquiry not found",
      });
    }

    const leadName = getLeadName(enquiry);
    await logLeadActivity(req, {
      title: "Lead Deleted",
      description: `${getActorName(req)} deleted lead ${leadName}`,
      action: "LEAD_DELETED",
      targetId: enquiry._id,
      targetName: leadName,
      status: "warning",
      badge: "Security",
      iconType: "danger",
    });

    return res.status(200).json({
      success: true,
      status: "deleted",
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete website enquiry error:", error);
    return res.status(400).json({
      success: false,
      status: "error",
      message: error.message || "Unable to delete enquiry",
    });
  }
};

module.exports.getProductEnquiries = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { total, documents } = await fetchPaginatedDocuments(
      ProductEnquiry,
      {},
      { skip, limit }
    );

    return res.status(200).json({
      success: true,
      status: "ok",
      count: documents.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: documents,
    });
  } catch (error) {
    console.error("Product enquiries error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports.downloadWebsiteEnquiries = async (req, res) => {
  try {
    await exportDocumentsToExcel(
      res,
      Enquiry,
      {},
      "Website-Enquiries.xlsx"
    );
    await logLeadActivity(req, {
      title: "Leads Exported",
      description: `${getActorName(req)} exported website leads`,
      action: "LEAD_EXPORTED",
      targetName: "website",
      status: "completed",
      badge: "Exported",
      iconType: "info",
    });
  } catch (error) {
    console.error("Website enquiries export error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Error generating Excel file",
    });
  }
};

module.exports.downloadProductEnquiries = async (req, res) => {
  try {
    await exportDocumentsToExcel(
      res,
      ProductEnquiry,
      {},
      "Product-Enquiries.xlsx"
    );
    await logLeadActivity(req, {
      title: "Leads Exported",
      description: `${getActorName(req)} exported product enquiries`,
      action: "LEAD_EXPORTED",
      targetName: "product enquiries",
      status: "completed",
      badge: "Exported",
      iconType: "info",
    });
  } catch (error) {
    console.error("Product enquiries export error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Error generating Excel file",
    });
  }
};
