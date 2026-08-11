const mongoose = require("mongoose");
const slugify = require("slugify");
const seoFields = require("./seoFields.js");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: [2, "Job title must be at least 2 characters"],
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [80, "Department cannot exceed 80 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    employmentType: {
      type: String,
      required: [true, "Employment type is required"],
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
      default: "Full-time",
    },
    experience: {
      type: String,
      required: [true, "Experience level is required"],
      enum: [
        "Fresher",
        "0-1 years",
        "1-3 years",
        "3-5 years",
        "5-10 years",
        "10+ years",
      ],
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
      minlength: [2, "Qualification must be at least 2 characters"],
      maxlength: [150, "Qualification cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: [20, "Job description must be at least 20 characters"],
      maxlength: [10000, "Job description cannot exceed 10000 characters"],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    openings: {
      type: Number,
      min: [1, "Openings must be at least 1"],
      default: 1,
    },
    salaryRange: {
      type: String,
      trim: true,
      maxlength: [80, "Salary range cannot exceed 80 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    seo: {
      type: seoFields,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: "text", department: "text", location: "text" });

jobSchema.pre("validate", async function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.isModified("slug") || this.isNew) {
    const baseSlug = slugify(this.slug || this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    this.slug = slug;
  }

  next();
});

module.exports = mongoose.model("Job", jobSchema);
