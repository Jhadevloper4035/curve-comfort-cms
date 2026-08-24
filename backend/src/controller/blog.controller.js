const Blog = require("../model/blog.model.js");
const BlogTaxonomy = require("../model/blog-taxonomy.model.js");
const mongoose = require("mongoose");
const slugify = require("slugify");
const { createActivity } = require("../utils/activityLogger.js");

const actorName = (req) => req.user?.name || "Admin User";
const blogName = (blog = {}) => blog.title || blog.url || blog._id?.toString?.() || "blog";
const logBlogActivity = (req, payload) =>
  createActivity(req, {
    module: "blogs",
    ...payload,
  });

const taxonomyTypes = ["category", "tag"];
const isTaxonomyType = (type) => taxonomyTypes.includes(type);

const blogUsageQuery = (type, name) =>
  type === "category" ? { category: name } : { tags: name };

exports.getBlogTaxonomies = async (req, res) => {
  try {
    const { type } = req.query;
    if (!isTaxonomyType(type)) {
      return res.status(400).json({ error: "Type must be category or tag." });
    }

    const taxonomies = await BlogTaxonomy.find({ type }).sort({ name: 1 }).lean();
    const usage = await Promise.all(
      taxonomies.map(async (taxonomy) => ({
        ...taxonomy,
        blogCount: await Blog.countDocuments(blogUsageQuery(type, taxonomy.name)),
      }))
    );

    res.json({ status: "success", data: usage });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error fetching blog taxonomy." });
  }
};

exports.createBlogTaxonomy = async (req, res) => {
  try {
    const { type, name } = req.body;
    if (!isTaxonomyType(type)) {
      return res.status(400).json({ error: "Type must be category or tag." });
    }
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }

    const taxonomy = await BlogTaxonomy.create({ type, name: name.trim() });
    res.status(201).json({ status: "success", data: taxonomy });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: `This ${req.body.type} already exists.` });
    }
    res.status(500).json({ error: error.message || "Error creating blog taxonomy." });
  }
};

exports.deleteBlogTaxonomy = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    if (!isTaxonomyType(type)) {
      return res.status(400).json({ error: "Type must be category or tag." });
    }
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid taxonomy id." });
    }

    const taxonomy = await BlogTaxonomy.findOne({ _id: id, type });
    if (!taxonomy) {
      return res.status(404).json({ error: "Blog taxonomy not found." });
    }
    if (await Blog.exists(blogUsageQuery(type, taxonomy.name))) {
      return res.status(400).json({ error: `Remove ${taxonomy.name} from its blogs before deleting it.` });
    }

    await taxonomy.deleteOne();
    res.json({ status: "success", message: "Blog taxonomy deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error deleting blog taxonomy." });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 60;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      message: "Blogs fetched successfully",
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "An error occurred while fetching blogs." });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, image, text, status, meta_name, meta_tags, meta_title, meta_description, author, category, tags, url, seo } = req.body;

    if (!title || !image || !text) {
      return res.status(400).json({ error: "Title, image, and text are required." });
    }

    const normalizedUrl = url?.trim()
      ? slugify(url, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    const newBlog = new Blog({
      title,
      url: normalizedUrl,
      image,
      text,
      status,
      meta_name,
      meta_tags,
      meta_title,
      meta_description,
      author,
      category,
      tags,
      seo,
    });

    const savedBlog = await newBlog.save();
    const name = blogName(savedBlog);

    await logBlogActivity(req, {
      title: "Blog Created",
      description: `${actorName(req)} created blog ${name}`,
      action: "BLOG_CREATED",
      targetId: savedBlog._id,
      targetName: name,
      status: "completed",
      badge: "Created",
      iconType: "success",
    });

    res.status(201).json({
      status: "success",
      message: "Blog created successfully",
      data: savedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: error.message || "An error occurred while creating the blog." });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Blog.findById(id).lean();

    if (!existing) {
      return res.status(404).json({ error: "Blog not found." });
    }

    const { title, url, image, text, status, meta_name, meta_tags, meta_title, meta_description, author, category, tags, seo } = req.body;
    const update = { title, image, text, status, meta_name, meta_tags, meta_title, meta_description, author, category, tags };
    if (seo !== undefined) update.seo = seo;

    if (url !== undefined || title !== undefined) {
      const slugSource = url?.trim() || title?.trim();
      if (slugSource) {
        update.url = slugify(slugSource, { lower: true, strict: true });
      }
    }

    const updated = await Blog.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    const name = blogName(updated);

    await logBlogActivity(req, {
      title: "Blog Updated",
      description: `${actorName(req)} updated blog ${name}`,
      action: "BLOG_UPDATED",
      targetId: updated._id,
      targetName: name,
      status: "completed",
      badge: "Updated",
      iconType: "info",
    });

    if (existing.status !== updated.status) {
      await logBlogActivity(req, {
        title: "Blog Status Updated",
        description: `${actorName(req)} changed ${name} status from ${existing.status || "unset"} to ${updated.status || "unset"}`,
        action: "BLOG_STATUS_CHANGED",
        targetId: updated._id,
        targetName: name,
        status: "completed",
        badge: "Completed",
        iconType: "success",
      });
    }

    res.json({
      status: "success",
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: error.message || "An error occurred while updating the blog." });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Blog.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Blog not found." });
    }

    const name = blogName(deleted);
    await logBlogActivity(req, {
      title: "Blog Deleted",
      description: `${actorName(req)} deleted blog ${name}`,
      action: "BLOG_DELETED",
      targetId: deleted._id,
      targetName: name,
      status: "warning",
      badge: "Security",
      iconType: "danger",
    });

    res.json({ status: "success", message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: error.message || "An error occurred while deleting the blog." });
  }
};
