const express = require("express");
const router = express.Router();

const productAdminRoute = require("./secure/product.route.js");
const categoryAdminRoute = require("./secure/category.route.js");
const landingPageAdminRoute = require("./secure/landing-page.route.js");
const blogAdminRoute = require("./secure/blog.route.js");
const seoMetaAdminRoute = require("./secure/seo-meta.route.js");
const newsletterRoute = require("./secure/newsletter.route.js");
const activityRoute = require("./secure/activity.route.js");
const commerceAdminRoute = require("./commerce-admin.route.js");
const commerceOrderRoute = require("./commerce-order.route.js");
const commerceCouponRoute = require("./commerce-coupon.route.js");

const leadAdminRoute = require("./secure/lead.routes.js");
const authAdminRoute = require("./auth.routes.js");

const uploadRoute = require("./upload.route.js");
const healthRoute = require("./health.route.js");
const { getLandingPage } = require("../controller/landing-page.controller.js");

const { protect, requirePermission } = require("../middleware/jwt.js");

const uploadAccess = [
  protect,
  requirePermission(
    "products.manage",
    "blogs.manage",
    "seoMeta.manage",
    "landingPage.manage"
  ),
];

// Public routes — no auth required
router.use("/health", healthRoute);
router.use("/auth", authAdminRoute);
router.get("/public/landing-page/:pageType", getLandingPage);

// Lead routes handle their own auth (some endpoints are public form submissions)
router.use("/lead", leadAdminRoute);
router.use("/leads", leadAdminRoute);
router.use("/newsletter", newsletterRoute);
router.use("/activity-stream", activityRoute);
router.use("/admin", commerceAdminRoute);
router.use("/orders", commerceOrderRoute);
router.use("/coupons", commerceCouponRoute);

// Protected routes — admin or superadmin only
router.use("/upload", uploadAccess, uploadRoute);
router.use("/seo-meta", protect, requirePermission("seoMeta.manage"), seoMetaAdminRoute);
router.use("/blog", protect, requirePermission("blogs.manage"), blogAdminRoute);
router.use("/product", protect, requirePermission("products.manage"), productAdminRoute);
router.use("/category", protect, requirePermission("products.manage"), categoryAdminRoute);
router.use("/landing-page", protect, requirePermission("landingPage.manage"), landingPageAdminRoute);

module.exports = router;
