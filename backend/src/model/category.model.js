const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    path: {
      type: String,
      default: "",
      index: true,
    },
    images: [
      {
        label: { type: String },
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    seo: {
      title: { type: String, maxlength: 60 },
      description: { type: String, maxlength: 160 },
      keywords: [String],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: { type: Number, default: 0 },
    productCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index(
  { parent: 1, slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
categorySchema.index({ slug: 1, isDeleted: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

categorySchema.pre("validate", async function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  } else if (this.slug) {
    this.slug = slugify(this.slug, { lower: true, strict: true });
  }

  if (!this.parent) {
    this.level = 0;
    this.path = this.slug;
    return next();
  }

  const parent = await this.constructor.findOne({ _id: this.parent, isDeleted: false });
  if (!parent) return next(new Error("Parent category not found"));
  if (parent.level >= 3) return next(new Error("Category nesting cannot exceed 3 levels"));

  this.level = parent.level + 1;
  this.path = [parent.path, this.slug].filter(Boolean).join("/");
  next();
});

categorySchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

categorySchema.statics.getTree = async function () {
  const categories = await this.find({ isDeleted: false })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  const categoryMap = new Map();
  const tree = [];
  categories.forEach((cat) => categoryMap.set(cat._id.toString(), { ...cat, children: [] }));
  categories.forEach((cat) => {
    const node = categoryMap.get(cat._id.toString());
    if (cat.parent) {
      const parent = categoryMap.get(cat.parent.toString());
      if (parent) parent.children.push(node);
    } else {
      tree.push(node);
    }
  });
  return tree;
};

module.exports = mongoose.model("Category", categorySchema);
