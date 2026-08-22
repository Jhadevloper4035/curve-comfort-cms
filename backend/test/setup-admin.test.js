const assert = require("node:assert/strict");
const test = require("node:test");
const { hasValidSetupAdminCode } = require("../src/utils/setupAdmin.js");

test("setup admin code must match the configured value", () => {
  const original = process.env.ADMIN_SETUP_CODE;
  process.env.ADMIN_SETUP_CODE = "setup-code";

  assert.equal(hasValidSetupAdminCode("setup-code"), true);
  assert.equal(hasValidSetupAdminCode("wrong-code"), false);
  process.env.ADMIN_SETUP_CODE = "";
  assert.equal(hasValidSetupAdminCode("setup-code"), false);

  if (original === undefined) delete process.env.ADMIN_SETUP_CODE;
  else process.env.ADMIN_SETUP_CODE = original;
});
