const models = {
  heroSlides: require("../model/heroSlide.model.js"),
  aboutSection: require("../model/aboutSection.model.js"),
  layoutCards: require("../model/layoutCard.model.js"),
  whyChooseItems: require("../model/whyChooseItem.model.js"),
  processSteps: require("../model/processStep.model.js"),
  parallaxCta: require("../model/parallaxCta.model.js"),
  consultationCta: require("../model/consultationCta.model.js"),
  faqItems: require("../model/faqItem.model.js"),
  pageMeta: require("../model/pageMeta.model.js"),
};

const singletonSections = new Set(["aboutSection", "parallaxCta", "consultationCta", "pageMeta"]);
const pageTypes = new Set(["kitchen", "wardrobe"]);

const validPageType = (pageType) => pageTypes.has(pageType);
const sectionModel = (section) => models[section];

const errorResponse = (res, error) => {
  if (error.name === "ValidationError") return res.status(400).json({ error: error.message });
  if (error.code === 11000) return res.status(409).json({ error: "Only one entry is allowed for this page and section." });
  return res.status(500).json({ error: "Unable to save landing page content." });
};

exports.getLandingPage = async (req, res) => {
  try {
    const { pageType } = req.params;
    if (!validPageType(pageType)) return res.status(400).json({ error: "Invalid page type." });

    const entries = await Promise.all(
      Object.entries(models).map(async ([section, Model]) => [
        section,
        singletonSections.has(section)
          ? await Model.findOne({ pageType }).lean()
          : await Model.find({ pageType }).sort({ order: 1, createdAt: 1 }).lean(),
      ])
    );

    if (req.baseUrl.includes("/public/")) res.set("Cache-Control", "public, max-age=60, s-maxage=300");
    res.json({ status: "success", data: Object.fromEntries(entries) });
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.createSection = async (req, res) => {
  try {
    const Model = sectionModel(req.params.section);
    if (!Model) return res.status(404).json({ error: "Unknown landing page section." });
    if (!validPageType(req.body.pageType)) return res.status(400).json({ error: "Invalid page type." });

    const created = await Model.create(req.body);
    res.status(201).json({ status: "success", data: created });
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.updateSection = async (req, res) => {
  try {
    const Model = sectionModel(req.params.section);
    if (!Model) return res.status(404).json({ error: "Unknown landing page section." });
    if (req.body.pageType && !validPageType(req.body.pageType)) return res.status(400).json({ error: "Invalid page type." });

    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Landing page entry not found." });
    res.json({ status: "success", data: updated });
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const Model = sectionModel(req.params.section);
    if (!Model) return res.status(404).json({ error: "Unknown landing page section." });

    const deleted = await Model.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Landing page entry not found." });
    res.json({ status: "success", message: "Landing page entry deleted." });
  } catch (error) {
    errorResponse(res, error);
  }
};
