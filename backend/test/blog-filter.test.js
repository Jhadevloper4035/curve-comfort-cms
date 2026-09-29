const assert = require("node:assert/strict");
const test = require("node:test");
const { blogFilter } = require("../src/controller/blog.controller.js");

test("blog filters combine category, tag, status, and safe search", () => {
  const filter = blogFilter({ category: "Guides", tag: "Care", status: "active", q: "sofa+care" });

  assert.equal(filter.category, "Guides");
  assert.equal(filter.tags, "Care");
  assert.equal(filter.status, "active");
  assert.equal(filter.$or[0].title.test("sofa+care"), true);
  assert.equal(filter.$or[0].title.test("sofa-care"), false);
});
