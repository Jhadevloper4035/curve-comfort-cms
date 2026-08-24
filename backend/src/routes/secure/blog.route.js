const express = require("express");
const {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogTaxonomies,
  createBlogTaxonomy,
  deleteBlogTaxonomy,
} = require("../../controller/blog.controller.js");

const router = express.Router();

router.get("/", getBlogs);
router.post("/", createBlog);
router.get("/taxonomies", getBlogTaxonomies);
router.post("/taxonomies", createBlogTaxonomy);
router.delete("/taxonomies/:id", deleteBlogTaxonomy);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;
