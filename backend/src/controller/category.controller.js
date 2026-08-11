const Category = require("../model/category.model.js");
const Product = require("../model/product.model.js");

const cleanParent = (parent) => parent || null;

const isDescendant = async (categoryId, maybeChildId) => {
  let current = maybeChildId;
  while (current) {
    if (current.toString() === categoryId.toString()) return true;
    const category = await Category.findOne({ _id: current, isDeleted: false }).select("parent").lean();
    current = category?.parent;
  }
  return false;
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false })
      .populate("parent", "name slug path")
      .sort({ level: 1, displayOrder: 1, name: 1 })
      .lean();

    res.json({ status: "success", data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error fetching categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, parent, images, seo, isActive, displayOrder } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required." });

    const saved = await Category.create({
      name,
      slug,
      description,
      parent: cleanParent(parent),
      images: Array.isArray(images) ? images : [],
      seo,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder,
    });

    const category = await Category.findById(saved._id).populate("parent", "name slug path").lean();
    res.status(201).json({ status: "success", data: category });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error creating category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parent, images, seo, isActive, displayOrder } = req.body;
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) return res.status(404).json({ error: "Category not found." });
    if (parent && parent === id) return res.status(400).json({ error: "Category cannot be its own parent." });
    if (parent && await isDescendant(id, parent)) {
      return res.status(400).json({ error: "Category cannot use a child category as parent." });
    }

    if (name !== undefined) category.name = name;
    if (slug !== undefined) category.slug = slug;
    else if (name !== undefined) category.slug = undefined;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = cleanParent(parent);
    if (images !== undefined) category.images = Array.isArray(images) ? images : [];
    if (seo !== undefined) category.seo = seo;
    if (isActive !== undefined) category.isActive = isActive;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;

    await category.save();
    const updated = await Category.findById(category._id).populate("parent", "name slug path").lean();
    res.json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error updating category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) return res.status(404).json({ error: "Category not found." });

    const [childCount, productCount] = await Promise.all([
      Category.countDocuments({ parent: id, isDeleted: false }),
      Product.countDocuments({ isDeleted: false, $or: [{ category: id }, { subcategories: id }] }),
    ]);

    if (childCount > 0) return res.status(400).json({ error: "Delete child categories first." });
    if (productCount > 0) return res.status(400).json({ error: "Category is used by products." });

    await category.softDelete();
    res.json({ status: "success", message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error deleting category" });
  }
};
