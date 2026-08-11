const express = require("express");
const { getBlogs, createBlog, updateBlog, deleteBlog } = require("../../controller/blog.controller.js");

const router = express.Router();

router.get("/", getBlogs);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;
