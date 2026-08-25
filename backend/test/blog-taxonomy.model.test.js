const assert = require("node:assert/strict");
const test = require("node:test");
const BlogTaxonomy = require("../src/model/blog-taxonomy.model.js");
const Blog = require("../src/model/blog.model.js");
const { getBlogs } = require("../src/controller/blog.controller.js");

test("blog taxonomy normalizes its slug and rejects unknown types", async () => {
  const category = new BlogTaxonomy({ type: "category", name: "Design Ideas" });
  await category.validate();
  assert.equal(category.slug, "design-ideas");

  const invalid = new BlogTaxonomy({ type: "other", name: "Invalid" });
  await assert.rejects(invalid.validate(), /`other` is not a valid enum value/);
});

test("blog list combines category and tag filters", async () => {
  const originalFind = Blog.find;
  let filter;
  Blog.find = (value) => {
    filter = value;
    return { sort: () => ({ skip: () => ({ limit: async () => [] }) }) };
  };

  try {
    const res = { status: () => res, json: () => {} };
    await getBlogs({ query: { category: " Design Ideas ", tag: " lighting " } }, res);
    assert.deepEqual(filter, { category: "Design Ideas", tags: "lighting" });
  } finally {
    Blog.find = originalFind;
  }
});
