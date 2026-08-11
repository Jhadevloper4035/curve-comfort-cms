const Product = require("../model/product.model.js");
const slugify = require("slugify");
const { sendExcelDownload } = require("../utils/excel.js");
const { createActivity } = require("../utils/activityLogger.js");

const actorName = (req) => req.user?.name || "Admin User";
const getProductName = (product = {}) =>
  product.title || product.productName || product.slug || product.productCode || product._id?.toString?.() || "product";
const logProductActivity = (req, payload) =>
  createActivity(req, {
    module: "products",
    ...payload,
  });

const formatProductForExport = (product) => ({
  Title: product.title || product.productName || "",
  Slug: product.slug || product.productCode || "",
  "Base Price": product.basePrice ?? "",
  Currency: product.currency || "",
  Stock: product.stock ?? "",
  "In Stock": product.inStock === undefined ? "" : product.inStock ? "Yes" : "No",
  Description: product.description || "",
  Images: Array.isArray(product.images) ? product.images.join(", ") : product.image || "",
  Category: product.category?.title || product.category?.name || product.category || "",
  Subcategories: Array.isArray(product.subcategories) ? product.subcategories.map((item) => item?.title || item?.name || item).join(", ") : product.subCategory || "",
  Status: product.isActive ? "Active" : "Inactive",
  "Product Code": product.productCode || "",
  "Product Name": product.productName || "",
  "Design Name": product.designName || "",
  "Product Type": product.productType || "",
  "Sub Category": product.subCategory || "",
  Texture: product.texture || "",
  "Texture Code": product.textureCode || "",
  Size: product.size || "",
  Thickness: product.thickness || "",
  Width: product.width || "",
  "Image URL": product.image || "",
  "Application Images": Array.isArray(product.applicationImage) ? product.applicationImage.join(", ") : "",
  "PDF URL": product.pdfUrlPath || "",
  "Created At": product.createdAt ? new Date(product.createdAt).toISOString() : "",
  "Updated At": product.updatedAt ? new Date(product.updatedAt).toISOString() : "",
});

const PRODUCT_FIELDS = [
  "title",
  "slug",
  "description",
  "basePrice",
  "currency",
  "stock",
  "images",
  "category",
  "subcategories",
  "optionPricing",
  "customizationGroups",
  "dimensions",
  "weight",
  "assemblyRequired",
  "warranty",
  "careInstructions",
  "tags",
  "isActive",
];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const booleanFromQuery = (value) => {
  if (value === undefined || value === "" || value === "all") return undefined;
  if (["true", "active", "in-stock"].includes(String(value))) return true;
  if (["false", "inactive", "out-of-stock"].includes(String(value))) return false;
  return undefined;
};

const productFilter = (query = {}) => {
  const filter = { isDeleted: { $ne: true } };

  if (query.q) {
    const term = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [
      { title: term },
      { slug: term },
      { description: term },
      { tags: term },
    ];
  }

  if (query.category) filter.category = query.category;
  if (query.subcategory) filter.subcategories = query.subcategory;

  const status = booleanFromQuery(query.status);
  if (status !== undefined) filter.isActive = status;

  const inStock = booleanFromQuery(query.inStock || query.stock);
  if (inStock !== undefined) filter.inStock = inStock;

  return filter;
};

const productSort = (sort = "newest") => ({
  oldest: { createdAt: 1 },
  "price-low": { basePrice: 1 },
  "price-high": { basePrice: -1 },
  title: { title: 1 },
}[sort] || { createdAt: -1 });

const populateProduct = (query) =>
  query
    .populate("category", "name slug path")
    .populate("subcategories", "name slug path");

const productPayload = (body, { requireFields = false } = {}) => {
  const payload = {};
  PRODUCT_FIELDS.forEach((field) => {
    if (body[field] !== undefined) payload[field] = body[field];
  });

  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title, { lower: true, strict: true });
  } else if (payload.slug) {
    payload.slug = slugify(payload.slug, { lower: true, strict: true });
  }

  if (payload.stock !== undefined) payload.inStock = Number(payload.stock) > 0;

  if (requireFields && (!payload.title || !payload.description || payload.basePrice === undefined || !payload.category || !payload.images?.length)) {
    const error = new Error("Title, description, base price, category and at least one image are required.");
    error.statusCode = 400;
    throw error;
  }

  return payload;
};

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 2000, 2000);
    const skip = (page - 1) * limit;

    const filter = productFilter(req.query);

    const [products, totalProducts] = await Promise.all([
      populateProduct(Product.find(filter))
        .sort(productSort(req.query.sort))
        .select("-__v")
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      currentPage: page,
      totalPages,
      totalProducts,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
};

exports.downloadProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } })
      .populate("category", "name slug path")
      .populate("subcategories", "name slug path")
      .sort({ createdAt: -1 })
      .select("-__v -searchText")
      .lean();

    sendExcelDownload(res, products.map(formatProductForExport), "Products.xlsx");
    await logProductActivity(req, {
      title: "Products Exported",
      description: `${actorName(req)} exported products`,
      action: "PRODUCT_EXPORTED",
      targetName: "Products",
      status: "completed",
      badge: "Exported",
      iconType: "info",
    });
  } catch (error) {
    console.error("Error downloading products:", error);
    res.status(500).json({ success: false, message: "Error downloading products", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(productPayload(req.body, { requireFields: true }));
    const saved = await product.save();
    const populated = await saved.populate([
      { path: "category", select: "name slug path" },
      { path: "subcategories", select: "name slug path" },
    ]);
    const name = getProductName(populated);

    await logProductActivity(req, {
      title: "Product Created",
      description: `${actorName(req)} created product ${name}`,
      action: "PRODUCT_CREATED",
      targetId: populated._id,
      targetName: name,
      status: "completed",
      badge: "Created",
      iconType: "success",
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "An error occurred while creating the product." });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Product.findOne({ _id: id, isDeleted: { $ne: true } }).lean();

    if (!existing) {
      return res.status(404).json({ error: "Product not found." });
    }

    const update = productPayload(req.body);

    const updated = await populateProduct(Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }));

    const name = getProductName(updated);

    await logProductActivity(req, {
      title: "Product Updated",
      description: `${actorName(req)} updated product ${name}`,
      action: "PRODUCT_UPDATED",
      targetId: updated._id,
      targetName: name,
      status: "completed",
      badge: "Updated",
      iconType: "info",
    });

    if (existing.isActive !== updated.isActive) {
      await logProductActivity(req, {
        title: "Product Status Updated",
        description: `${actorName(req)} changed ${name} status from ${existing.isActive ? "active" : "inactive"} to ${updated.isActive ? "active" : "inactive"}`,
        action: "PRODUCT_STATUS_CHANGED",
        targetId: updated._id,
        targetName: name,
        status: "completed",
        badge: "Completed",
        iconType: "success",
      });
    }

    res.json({
      status: "success",
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "An error occurred while updating the product." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findOne({ _id: id, isDeleted: { $ne: true } });

    if (!deleted) {
      return res.status(404).json({ error: "Product not found." });
    }

    const name = getProductName(deleted);
    await deleted.softDelete();

    await logProductActivity(req, {
      title: "Product Deleted",
      description: `${actorName(req)} deleted product ${name}`,
      action: "PRODUCT_DELETED",
      targetId: deleted._id,
      targetName: name,
      status: "warning",
      badge: "Security",
      iconType: "danger",
    });

    res.json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "An error occurred while deleting the product." });
  }
};
