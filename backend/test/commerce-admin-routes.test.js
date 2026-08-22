const test = require("node:test");
const assert = require("node:assert/strict");
const Order = require("../src/model/order.model.js");
const Product = require("../src/model/product.model.js");
const User = require("../src/model/user.model.js");
const adminRoutes = require("../src/routes/commerce-admin.route.js");
const orderRoutes = require("../src/routes/commerce-order.route.js");
const couponRoutes = require("../src/routes/commerce-coupon.route.js");
const authRoutes = require("../src/routes/auth.routes.js");

const routePaths = (router) => router.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);

test("commerce admin routes and shared schemas cover the storefront admin domain", () => {
  assert.deepEqual(routePaths(adminRoutes), [
    "GET /dashboard",
    "GET /monitoring",
    "GET /payments",
    "POST /payments/:orderId/reconcile",
    "GET /users",
    "PATCH /users/:id/role",
    "PATCH /users/:id/block",
  ]);
  assert.deepEqual(routePaths(orderRoutes), [
    "GET /",
    "GET /:orderId",
    "PATCH /:orderId/status",
    "PATCH /:orderId/cod-balance",
    "POST /:orderId/refunds",
    "POST /:orderId/emails/:emailEventId/resend",
  ]);
  assert.deepEqual(routePaths(couponRoutes), ["GET /", "GET /:code", "POST /", "PATCH /:couponId"]);
  assert.ok(Order.schema.path("paymentTransaction"));
  assert.ok(Product.schema.path("gstPercent"));
  assert.ok(User.schema.path("cartItems"));
});

test("user management exposes a protected user details route", () => {
  assert.ok(routePaths(authRoutes).includes("GET /users/:id"));
});
