const Product = require("../model/product.model.js");
const Category = require("../model/category.model.js");
const slugify = require("slugify");
const XLSX = require("xlsx");
const { sendExcelDownload } = require("../utils/excel.js");
const { createActivity } = require("../utils/activityLogger.js");
const { copyDropboxImage, isDropboxUrl } = require("../utils/dropboxImage.js");

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

const formatProductForBulkUpdate = (product) => ({
  "Product ID": product._id.toString(),
  Title: product.title || "",
  Description: product.description || "",
  "Base Price": product.basePrice ?? "",
  Category: product.category?.name || product.category?.slug || product.category || "",
  Images: Array.isArray(product.images) ? product.images.join("|") : "",
  Slug: product.slug || "",
  Stock: product.stock ?? 0,
  Currency: product.currency || "INR",
  Subcategories: Array.isArray(product.subcategories)
    ? product.subcategories.map((item) => item?.name || item?.slug || item).join("|")
    : "",
  Tags: Array.isArray(product.tags) ? product.tags.join("|") : "",
  "Care Instructions": Array.isArray(product.careInstructions) ? product.careInstructions.join("|") : "",
  Warranty: product.warranty || "",
  "Is Active": product.isActive ? "true" : "false",
  "Assembly Required": product.assemblyRequired ? "true" : "false",
  "Dimension Length": product.dimensions?.length ?? "",
  "Dimension Width": product.dimensions?.width ?? "",
  "Dimension Height": product.dimensions?.height ?? "",
  "Dimension Unit": product.dimensions?.unit || "cm",
  Weight: product.weight?.value ?? "",
  "Weight Unit": product.weight?.unit || "kg",
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


const csvValue = (row, column) => row[column.replace(/[^a-z0-9]/gi, "").toLowerCase()];

const csvList = (value) =>
  String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

const csvNumber = (value, field, rowNumber, { required = false } = {}) => {
  if (value === "" || value === undefined) {
    if (required) throw new Error("Row " + rowNumber + ": " + field + " is required.");
    return undefined;
  }

  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error("Row " + rowNumber + ": " + field + " must be a non-negative number.");
  return number;
};

const csvBoolean = (value, fallback, field, rowNumber) => {
  if (value === "" || value === undefined) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0"].includes(normalized)) return false;
  throw new Error("Row " + rowNumber + ": " + field + " must be true or false.");
};

const normalizeCsvRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.replace(/[^a-z0-9]/gi, "").toLowerCase(), value])
  );

const parseProductCsv = (csv) => {
  if (typeof csv !== "string" || !csv.trim()) throw new Error("Choose a non-empty CSV file.");
  if (Buffer.byteLength(csv, "utf8") > 1_000_000) throw new Error("CSV files must be 1 MB or smaller.");

  const workbook = XLSX.read(csv, { type: "string", raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = sheet ? XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }) : [];

  if (!rows.length) throw new Error("The CSV file has no product rows.");
  if (rows.length > 500) throw new Error("Import up to 500 products per CSV file.");
  return rows.map(normalizeCsvRow);
};

const parseProductFile = ({ csv, file } = {}) => {
  if (csv !== undefined) return parseProductCsv(csv);
  if (typeof file !== "string" || !file.trim()) throw new Error("Choose a non-empty Excel or CSV file.");

  const buffer = Buffer.from(file, "base64");
  if (!buffer.length || buffer.length > 1_000_000) throw new Error("Excel files must be 1 MB or smaller.");

  const workbook = XLSX.read(buffer, { type: "buffer", raw: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = sheet ? XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }) : [];

  if (!rows.length) throw new Error("The Excel file has no product rows.");
  if (rows.length > 500) throw new Error("Import up to 500 products per file.");
  return rows.map(normalizeCsvRow);
};

const categoryLookup = async () => {
  const categories = await Category.find({ isDeleted: false }).select("_id name slug path").lean();
  const lookup = new Map();

  const addAlias = (alias, id) => {
    const key = String(alias || "").trim().toLowerCase();
    if (!key) return;
    const current = lookup.get(key);
    lookup.set(key, lookup.has(key) && current !== id ? null : id);
  };

  categories.forEach((category) => {
    const id = category._id.toString();
    [id, category.name, category.slug, category.path].forEach((alias) => addAlias(alias, id));
  });

  return (value, field, rowNumber) => {
    const id = lookup.get(String(value || "").trim().toLowerCase());
    if (!id) throw new Error("Row " + rowNumber + ": " + field + " must match an existing category name, slug, path, or ID.");
    return id;
  };
};

const productFromCsvRow = (row, resolveCategory, rowNumber) => {
  const title = String(csvValue(row, "title") || "").trim();
  const description = String(csvValue(row, "description") || "").trim();
  const category = csvValue(row, "category");
  const images = csvList(csvValue(row, "images") || csvValue(row, "imageurl"));

  if (!title || !description || !category || !images.length) {
    throw new Error("Row " + rowNumber + ": title, description, category, and images are required.");
  }

  return productPayload({
    title,
    slug: String(csvValue(row, "slug") || "").trim(),
    description,
    basePrice: csvNumber(csvValue(row, "baseprice"), "basePrice", rowNumber, { required: true }),
    currency: String(csvValue(row, "currency") || "INR").trim().toUpperCase(),
    stock: csvNumber(csvValue(row, "stock"), "stock", rowNumber) ?? 0,
    images,
    category: resolveCategory(category, "category", rowNumber),
    subcategories: csvList(csvValue(row, "subcategories")).map((value) => resolveCategory(value, "subcategories", rowNumber)),
    tags: csvList(csvValue(row, "tags")),
    careInstructions: csvList(csvValue(row, "careinstructions")),
    warranty: String(csvValue(row, "warranty") || "").trim(),
    isActive: csvBoolean(csvValue(row, "isactive"), true, "isActive", rowNumber),
    assemblyRequired: csvBoolean(csvValue(row, "assemblyrequired"), false, "assemblyRequired", rowNumber),
    dimensions: {
      length: csvNumber(csvValue(row, "dimensionlength"), "dimensionLength", rowNumber),
      width: csvNumber(csvValue(row, "dimensionwidth"), "dimensionWidth", rowNumber),
      height: csvNumber(csvValue(row, "dimensionheight"), "dimensionHeight", rowNumber),
      unit: String(csvValue(row, "dimensionunit") || "cm").trim(),
    },
    weight: {
      value: csvNumber(csvValue(row, "weight"), "weight", rowNumber),
      unit: String(csvValue(row, "weightunit") || "kg").trim(),
    },
  }, { requireFields: true });
};

const copyDropboxImages = async (images, rowNumber) => {
  const copied = [];
  for (const image of images) {
    try {
      copied.push(isDropboxUrl(image) ? await copyDropboxImage(image) : image);
    } catch (error) {
      throw new Error("Row " + rowNumber + ": " + error.message);
    }
  }
  return copied;
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

exports.downloadBulkUpdateTemplate = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } })
      .populate("category", "name slug path")
      .populate("subcategories", "name slug path")
      .sort({ createdAt: -1 })
      .select("-__v -searchText")
      .lean();

    sendExcelDownload(res, products.map(formatProductForBulkUpdate), "Product-bulk-update.xlsx");
  } catch (error) {
    console.error("Error preparing product bulk-update template:", error);
    res.status(500).json({ success: false, message: "Error preparing product bulk-update template" });
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


exports.importProducts = async (req, res) => {
  try {
    const rows = parseProductFile(req.body);
    const resolveCategory = await categoryLookup();
    const items = [];
    // ponytail: copies are sequential to avoid overwhelming Dropbox or S3; add bounded concurrency only if imports become slow.
    for (const [index, row] of rows.entries()) {
      const product = productFromCsvRow(row, resolveCategory, index + 2);
      product.images = await copyDropboxImages(product.images, index + 2);
      items.push({ id: String(csvValue(row, "productid") || csvValue(row, "id") || "").trim(), product });
    }
    const products = items.map((item) => item.product);
    const slugs = products.map((product) => product.slug);
    const ids = items.map((item) => item.id).filter(Boolean);

    if (new Set(slugs).size !== slugs.length || new Set(ids).size !== ids.length) {
      return res.status(400).json({ error: "CSV contains duplicate product titles or slugs." });
    }

    const [existingBySlug, existingById] = await Promise.all([
      Product.find({ slug: { $in: slugs }, isDeleted: { $ne: true } }).select("_id slug").lean(),
      ids.length ? Product.find({ _id: { $in: ids }, isDeleted: { $ne: true } }).lean() : [],
    ]);
    const productsById = new Map(existingById.map((product) => [product._id.toString(), product]));
    const unknownIds = ids.filter((id) => !productsById.has(id));
    if (unknownIds.length) {
      return res.status(404).json({ error: "Products not found for IDs: " + unknownIds.join(", ") + "." });
    }

    const conflictingSlugs = existingBySlug.filter((product) => {
      const item = items.find((entry) => entry.product.slug === product.slug);
      return !item.id || item.id !== product._id.toString();
    });
    if (conflictingSlugs.length) {
      return res.status(409).json({ error: "Products already exist for: " + conflictingSlugs.map((product) => product.slug).join(", ") + "." });
    }

    await Promise.all(items.map(({ id, product }) => new Product(id ? { ...productsById.get(id), ...product, _id: id } : product).validate()));

    const updates = items.filter((item) => item.id);
    const creates = items.filter((item) => !item.id).map((item) => item.product);
    if (updates.length) {
      await Product.bulkWrite(updates.map(({ id, product }) => ({
        updateOne: { filter: { _id: id, isDeleted: { $ne: true } }, update: { $set: product } },
      })), { ordered: true });
    }
    if (creates.length) await Product.insertMany(creates, { ordered: true });

    await logProductActivity(req, {
      title: "Products Imported",
      description: actorName(req) + " imported " + creates.length + " products and updated " + updates.length + " products",
      action: "PRODUCTS_IMPORTED",
      targetName: items.length + " products",
      status: "completed",
      badge: "Imported",
      iconType: "success",
    });

    res.status(201).json({ status: "success", message: creates.length + " products imported and " + updates.length + " products updated.", data: { created: creates.length, updated: updates.length } });
  } catch (error) {
    const statusCode = error.code === 11000 ? 409 : error.statusCode || 400;
    res.status(statusCode).json({ error: error.message || "Unable to import products." });
  }
};

exports.parseProductCsv = parseProductCsv;
exports.parseProductFile = parseProductFile;

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
