const router = require("express").Router();

const {
  getLeads,
  seedLeads,
  submitFormEvent,
  submitFormShowroom,
  submitFormDubaiwood,
  getEventLeads,
  downloadEventLeads,
  getShowroomLeads,
  downloadShowroomLeads,
  getDubaiwoodLeads,
  downloadDubaiwoodLeads,
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getProductEnquiries,
  downloadWebsiteEnquiries,
  downloadProductEnquiries,
} = require("../../controller/lead.controller.js");

const { validateEventForm, validateShowroomForm, validateDubaiwoodForm } = require("../../middleware/lead.validation.js");
const { protect, requirePermission } = require("../../middleware/jwt.js");

const allLeadsAccess = [
  protect,
  requirePermission(
    "eventLeads.view",
    "dubaiwoodLeads.view",
    "showroomLeads.manage",
    "websiteLeads.manage",
    "productEnquiries.view"
  ),
];
const eventLeadsAccess = [protect, requirePermission("eventLeads.view")];
const showroomLeadsAccess = [protect, requirePermission("showroomLeads.manage")];
const dubaiwoodLeadsAccess = [protect, requirePermission("dubaiwoodLeads.view")];
const websiteLeadsAccess = [protect, requirePermission("websiteLeads.manage")];
const productEnquiryAccess = [protect, requirePermission("productEnquiries.view")];

// ── Public routes (website form submissions — no auth) ────────────────────────
router.post("/event/contact-form-submit/:place", validateEventForm, submitFormEvent);
router.post("/showroom/contact-form-submit", validateShowroomForm, submitFormShowroom);
router.post("/dubaiwood/contact-form-submit", validateDubaiwoodForm, submitFormDubaiwood);
router.post("/contactleads", createEnquiry);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.get("/all-leads", allLeadsAccess, getLeads);
router.get("/seed", protect, requirePermission("eventLeads.view"), seedLeads);

router.get("/event/:place", eventLeadsAccess, getEventLeads);
router.get("/event/download/:place", eventLeadsAccess, downloadEventLeads);

router.get("/showroom", showroomLeadsAccess, getShowroomLeads);
router.get("/showroom/download", showroomLeadsAccess, downloadShowroomLeads);

router.get("/dubaiwood", dubaiwoodLeadsAccess, getDubaiwoodLeads);
router.get("/dubaiwood/download", dubaiwoodLeadsAccess, downloadDubaiwoodLeads);

router.get("/contactleads", websiteLeadsAccess, getEnquiries);
router.put("/contactleads/:id", websiteLeadsAccess, updateEnquiry);
router.delete("/contactleads/:id", websiteLeadsAccess, deleteEnquiry);
router.get("/website/download", websiteLeadsAccess, downloadWebsiteEnquiries);

router.get("/productEnquiry", productEnquiryAccess, getProductEnquiries);
router.get("/product-enquiry/download", productEnquiryAccess, downloadProductEnquiries);

module.exports = router;
