const crypto = require("crypto");

const hasValidSetupAdminCode = (code) => {
  const expected = process.env.ADMIN_SETUP_CODE;
  if (!expected || typeof code !== "string") return false;

  const actualBuffer = Buffer.from(code);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
};

module.exports = { hasValidSetupAdminCode };
