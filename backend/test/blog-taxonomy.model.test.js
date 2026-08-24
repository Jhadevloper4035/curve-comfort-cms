const assert = require("node:assert/strict");
const test = require("node:test");
const BlogTaxonomy = require("../src/model/blog-taxonomy.model.js");

test("blog taxonomy normalizes its slug and rejects unknown types", async () => {
  const category = new BlogTaxonomy({ type: "category", name: "Design Ideas" });
  await category.validate();
  assert.equal(category.slug, "design-ideas");

  const invalid = new BlogTaxonomy({ type: "other", name: "Invalid" });
  await assert.rejects(invalid.validate(), /`other` is not a valid enum value/);
});
