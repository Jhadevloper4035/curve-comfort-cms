const assert = require("node:assert/strict");
const test = require("node:test");
const User = require("../src/model/user.model.js");

test("user schema includes storefront authentication fields", () => {
  const user = new User({
    fullName: "Test User",
    email: "test@example.com",
    password: "password",
    mobileNumber: "1234567890",
  });

  for (const field of ["failedLoginAttempts", "lockedUntil", "tokenVersion", "cartItems", "wishlistItems"]) {
    assert.ok(User.schema.path(field));
  }
  assert.equal(user.failedLoginAttempts, 0);
  assert.equal(user.lockedUntil, null);
  assert.equal(user.tokenVersion, 0);
  assert.deepEqual(user.cartItems, []);
  assert.deepEqual(user.wishlistItems, []);
});

test("a shared storefront admin has dashboard access", () => {
  const user = new User({
    fullName: "Storefront Admin",
    email: "admin@example.com",
    password: "password",
    mobileNumber: "1234567890",
    role: "admin",
  });

  assert.equal(user.accessType, "admin");
});
