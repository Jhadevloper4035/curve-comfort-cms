const assert = require("node:assert/strict");
const test = require("node:test");

const { getMe } = require("../src/controller/user.controller.js");
const { optionalProtect } = require("../src/middleware/jwt.js");

const response = () => ({
  statusCode: undefined,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("anonymous session probe returns a signed-out response", async () => {
  const req = { cookies: {} };
  await new Promise((resolve) => optionalProtect(req, {}, resolve));

  const res = response();
  getMe(req, res);

  assert.equal(req.user, undefined);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data, { user: null });
});
