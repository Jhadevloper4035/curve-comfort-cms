const VALID_ACCESS_TYPES = [
  "event",
  "admin",
  "showroom",
  "website",
  "superadmin",
  "sales",
  "jobs",
  "seo",
  "custom",
];

const VALID_PERMISSIONS = [
  "dashboard.view",
  "users.manage",
  "products.manage",
  "blogs.manage",
  "seoMeta.manage",
  "landingPage.manage",
  "websiteLeads.manage",
  "newsletterSubscribers.view",
  "productEnquiries.view",
  "jobs.manage",
  "eventLeads.view",
  "dubaiwoodLeads.view",
  "showroomLeads.manage",
];

const ROLE_PERMISSIONS = {
  superadmin: ["*"],
  admin: ["*"],
  website: [
    "dashboard.view",
    "websiteLeads.manage",
    "newsletterSubscribers.view",
    "productEnquiries.view",
    "landingPage.manage",
  ],
  sales: [
    "dashboard.view",
    "websiteLeads.manage",
    "newsletterSubscribers.view",
    "productEnquiries.view",
  ],
  event: ["dashboard.view", "eventLeads.view", "dubaiwoodLeads.view", "showroomLeads.manage"],
  showroom: ["dashboard.view", "showroomLeads.manage"],
  jobs: ["jobs.manage"],
  seo: ["seoMeta.manage"],
  custom: [],
};

module.exports = {
  VALID_ACCESS_TYPES,
  VALID_PERMISSIONS,
  ROLE_PERMISSIONS,
};
