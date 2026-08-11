// seed.js
// Seeds MongoDB with the content that currently lives hardcoded inside
// kitchen.html and wardrobe.html, split by pageType ("kitchen" | "wardrobe").
//
// NOTE ON IMAGES: the html currently points at local files
// (assets/images/...). Those are used here as placeholders for both `url`
// and `key` so the seed runs standalone. Once these images are uploaded to
// S3, replace each `url`/`key` pair with the real S3 location + object key.
//
// Usage: node seed.js   (reads MONGODB_URI from env, falls back to local)

require("./src/config/env.js");
const { ConnectDB, closeDB } = require("./src/config/db.js");

const HeroSlide = require("./src/model/heroSlide.model.js");
const AboutSection = require("./src/model/aboutSection.model.js");
const LayoutCard = require("./src/model/layoutCard.model.js");
const WhyChooseItem = require("./src/model/whyChooseItem.model.js");
const ProcessStep = require("./src/model/processStep.model.js");
const ParallaxCta = require("./src/model/parallaxCta.model.js");
const ConsultationCta = require("./src/model/consultationCta.model.js");
const FaqItem = require("./src/model/faqItem.model.js");
const PageMeta = require("./src/model/pageMeta.model.js");

// Placeholder image builder — same local path used for url and key until
// the real S3 upload replaces it.
const img = (path) => ({ url: path, key: path });

// ---------------------------------------------------------------------
// Hero slides
// ---------------------------------------------------------------------
const heroSlides = [
  {
    pageType: "kitchen",
    order: 0,
    title: "Kitchens",
    subtitle: "made around your room.",
    description:
      "Curve & Comfort kitchens are planned around movement, storage, cooking habits, and finishes that feel calm, luxurious, and easy to live with.",
    ctaText: "View Kitchens",
    ctaLink: "#kitchen-layouts",
    bgImage: img("assets/images/kitchen-banner/1.webp"),
  },
  {
    pageType: "kitchen",
    order: 1,
    title: "Cabinets",
    subtitle: "designed to work beautifully.",
    description:
      "From pantry columns to lift-up shutters, every cabinet is measured for daily access, clean lines, durable hardware, and quiet long-term use.",
    ctaText: "View Cabinets",
    ctaLink: "#storage",
    bgImage: img("assets/images/kitchen-banner/5.png"),
  },
  {
    pageType: "kitchen",
    order: 2,
    title: "Wardrobes",
    subtitle: "for calm everyday order.",
    description:
      "Integrated wardrobes and utility storage are designed with warm finishes, smooth hardware, and layouts that keep every essential visible and easy to reach.",
    ctaText: "View Wardrobes",
    ctaLink: "wardrobe.html#wardrobe-layouts",
    bgImage: img("assets/images/kitchen-banner/3.webp"),
  },
  {
    pageType: "wardrobe",
    order: 0,
    title: "Wardrobes",
    subtitle: "made around your rhythm.",
    description:
      "Curve & Comfort wardrobes are planned around what you wear, store, fold, hang, display, and reach for every day.",
    ctaText: "View Wardrobes",
    ctaLink: "#wardrobe-layouts",
    bgImage: img("assets/images/wardrobe/7.avif"),
  },
  {
    pageType: "wardrobe",
    order: 1,
    title: "Closets",
    subtitle: "designed for daily order.",
    description:
      "From hanging zones to accessory trays, every closet is measured for smooth access, clean visibility, and calm day-to-day use.",
    ctaText: "View Closets",
    ctaLink: "#storage",
    bgImage: img("assets/images/wardrobe/9.jpeg"),
  },
  {
    pageType: "wardrobe",
    order: 2,
    title: "Wardrobes",
    subtitle: "for calm everyday order.",
    description:
      "Material palettes, shutters, mirrors, handles, lights, and internal accessories are coordinated so storage feels elegant, personal, and easy to maintain.",
    ctaText: "View Wardrobes",
    ctaLink: "kitchen.html#kitchen-layouts",
    bgImage: img("assets/images/wardrobe/1.webp"),
  },
];

// ---------------------------------------------------------------------
// About section (one doc per pageType, each with 3 tabs)
// ---------------------------------------------------------------------
const aboutSections = [
  {
    pageType: "kitchen",
    eyebrow: "Kitchen Approach",
    heading: "A kitchen is a room, first.",
    introText:
      "Every Curve & Comfort kitchen is shaped around real routines, exact measurements, durable surfaces, and calm storage. We plan each corner with proportion, movement, and daily comfort in mind so the kitchen feels personal, practical, and beautifully resolved.",
    mainImage: img("assets/images/kitchen/straight-kitchen.jpeg"),
    mainCaption: "Plate 1 / Interior",
    tabs: [
      {
        label: "Studio",
        stepNumber: "01",
        heading: "A studio, not a showroom.",
        body:
          "Curve & Comfort kitchens are planned around how your home actually moves: cooking, storing, gathering, cleaning, and returning to calm. We study your daily rhythm before drawing the first line, so every counter, cabinet, and walkway feels natural from morning prep to late-night hosting.",
        image: img("assets/images/kitchen/straight-kitchen.jpeg"),
        caption: "Plate 1 / Interior",
        ctaText: "Book Consultation",
        ctaLink: "contact-us.html",
        order: 0,
      },
      {
        label: "Measure",
        stepNumber: "02",
        heading: "Millimetres, not modules.",
        body:
          "Every cabinet line, shutter size, and storage detail is measured against the room, so the finished kitchen feels built-in rather than selected from a catalogue. Clearances, appliances, storage zones, and work triangles are resolved together, giving the layout a precise fit without wasting useful space.",
        image: img("assets/images/kitchen/parallel-kitchen.jpeg"),
        caption: "Fig. 02 / Custom Fit",
        ctaText: "View Layouts",
        ctaLink: "#kitchen-layouts",
        order: 1,
      },
      {
        label: "Material",
        stepNumber: "03",
        heading: "Materials that soften with time.",
        body:
          "Wood textures, marble tones, and durable decorative films are chosen for surfaces that look composed on day one and better with everyday use. Finishes are balanced for touch, tone, cleaning, and long-term wear, so the kitchen stays elegant through real family routines.",
        image: img("assets/images/kitchen/island-kitchen.jpeg"),
        caption: "Fig. 03 / Material Palette",
        ctaText: "Explore Finishes",
        ctaLink: "#finishes",
        order: 2,
      },
    ],
  },
  {
    pageType: "wardrobe",
    eyebrow: "Wardrobe Approach",
    heading: "A wardrobe is a daily ritual, first.",
    introText:
      "Every Curve & Comfort wardrobe is shaped around real routines, exact measurements, garment types, and calm storage. We plan each shelf, rail, drawer, and shutter with proportion, access, and long-term comfort in mind.",
    mainImage: img("assets/images/wardrobe/side.jpg"),
    mainCaption: "Plate 1 / Wardrobe",
    tabs: [
      {
        label: "Ritual",
        stepNumber: "01",
        heading: "A wardrobe, not a cabinet.",
        body:
          "Curve & Comfort wardrobes are planned around how your day actually starts: choosing, dressing, storing, editing, and returning to order. We study your habits before drawing the first line.",
        image: img("assets/images/wardrobe/openable-wardrobe.jpg"),
        caption: "Plate 1 / Wardrobe",
        ctaText: "Book Consultation",
        ctaLink: "contact-us.html",
        order: 0,
      },
      {
        label: "Measure",
        stepNumber: "02",
        heading: "Millimetres, not standard boxes.",
        body:
          "Every shutter, shelf depth, hanging height, and drawer detail is measured against the room, so the finished wardrobe feels built-in, efficient, and naturally aligned.",
        image: img("assets/images/wardrobe/sliding-wardrobe.jpg"),
        caption: "Fig. 02 / Custom Fit",
        ctaText: "View Wardrobes",
        ctaLink: "#wardrobe-layouts",
        order: 1,
      },
      {
        label: "Material",
        stepNumber: "03",
        heading: "Materials that soften with time.",
        body:
          "Wood textures, glass, mirrors, matte shutters, and warm hardware are chosen for surfaces that look composed on day one and stay elegant through daily use.",
        image: img("assets/images/wardrobe/walkin-wardrobe.jpg"),
        caption: "Fig. 03 / Material Palette",
        ctaText: "Explore Finishes",
        ctaLink: "#finishes",
        order: 2,
      },
    ],
  },
];

// ---------------------------------------------------------------------
// Layout cards
// ---------------------------------------------------------------------
const layoutCards = [
  {
    pageType: "kitchen",
    order: 0,
    stepNumber: "01",
    title: "Straight Kitchen",
    description: "Clean single-wall planning for compact modular kitchens.",
    image: img("assets/images/kitchen/straight-kitchen.jpeg"),
    imageAlt: "Straight kitchen layout finish",
  },
  {
    pageType: "kitchen",
    order: 1,
    stepNumber: "02",
    title: "I-Shaped Kitchen",
    description: "A linear layout with practical work zones for modern homes.",
    image: img("assets/images/kitchen/i-shape-kitchen.jpeg"),
    imageAlt: "I shaped kitchen layout inspiration",
  },
  {
    pageType: "kitchen",
    order: 2,
    stepNumber: "03",
    title: "U-Shaped Kitchen",
    description: "Generous storage and work zones for larger kitchen spaces.",
    image: img("assets/images/kitchen/u-shape-kitchen.jpeg"),
    imageAlt: "U shaped kitchen layout inspiration",
  },
  {
    pageType: "kitchen",
    order: 3,
    stepNumber: "04",
    title: "Parallel Kitchen",
    description: "Balanced counters on both sides for fast daily movement.",
    image: img("assets/images/kitchen/parallel-kitchen.jpeg"),
    imageAlt: "Parallel kitchen layout finish",
  },
  {
    pageType: "kitchen",
    order: 4,
    stepNumber: "05",
    title: "Island Kitchen",
    description: "A premium open-plan layout for cooking, serving, and gathering.",
    image: img("assets/images/kitchen/island-kitchen.jpeg"),
    imageAlt: "Island kitchen layout inspiration",
  },
  {
    pageType: "kitchen",
    order: 5,
    stepNumber: "06",
    title: "Openable Kitchen",
    description: "Flexible shutter planning for accessible storage and daily ease.",
    image: img("assets/images/kitchen/openable-kitchen.jpeg"),
    imageAlt: "Openable kitchen layout inspiration",
  },
  {
    pageType: "wardrobe",
    order: 0,
    stepNumber: "01",
    title: "Hinged Wardrobe",
    description: "Classic shutter planning with full access and flexible internal zones.",
    image: img("assets/images/wardrobe/openable-wardrobe.jpg"),
    imageAlt: "Hinged wardrobe layout",
  },
  {
    pageType: "wardrobe",
    order: 1,
    stepNumber: "02",
    title: "Sliding Wardrobe",
    description: "Space-saving shutters for bedrooms that need clean movement.",
    image: img("assets/images/wardrobe/sliding-wardrobe.jpg"),
    imageAlt: "Sliding wardrobe layout",
  },
  {
    pageType: "wardrobe",
    order: 2,
    stepNumber: "03",
    title: "Walk-in Closet",
    description: "A dedicated dressing room with open, closed, and display storage.",
    image: img("assets/images/wardrobe/walkin-wardrobe.jpg"),
    imageAlt: "Walk in wardrobe layout",
  },
];

// ---------------------------------------------------------------------
// Why choose items
// ---------------------------------------------------------------------
const whyChooseItems = [
  {
    pageType: "kitchen",
    order: 0,
    stepNumber: "01",
    title: "Measured planning",
    description:
      "Every layout starts with exact site measurements, movement flow, appliance placement, and storage needs.",
  },
  {
    pageType: "kitchen",
    order: 1,
    stepNumber: "02",
    title: "Complete kitchen scope",
    description:
      "Cabinets, counters, shutters, accessories, storage systems, and finishes are coordinated as one kitchen language.",
  },
  {
    pageType: "kitchen",
    order: 2,
    stepNumber: "03",
    title: "Finish clarity",
    description:
      "We help select practical, premium materials that suit your room, lighting, cleaning routine, and budget.",
  },
  {
    pageType: "kitchen",
    order: 3,
    stepNumber: "04",
    title: "Storage-first details",
    description:
      "Corner units, pantry columns, tandem drawers, and lift-ups are planned around easy everyday access.",
  },
  {
    pageType: "kitchen",
    order: 4,
    stepNumber: "05",
    title: "Reliable hardware",
    description:
      "Hinges, channels, lift systems, and drawer hardware are chosen for smooth motion and long-term use.",
  },
  {
    pageType: "kitchen",
    order: 5,
    stepNumber: "06",
    title: "Guided installation",
    description:
      "Our team coordinates drawings, materials, site readiness, and installation details through completion.",
  },
  {
    pageType: "wardrobe",
    order: 0,
    stepNumber: "01",
    title: "Wardrobe mapping",
    description:
      "Every design starts with what you hang, fold, display, store, and reach for every day.",
  },
  {
    pageType: "wardrobe",
    order: 1,
    stepNumber: "02",
    title: "Complete storage scope",
    description:
      "Shutters, shelves, drawers, lights, mirrors, accessories, and finishes are coordinated as one wardrobe system.",
  },
  {
    pageType: "wardrobe",
    order: 2,
    stepNumber: "03",
    title: "Finish clarity",
    description:
      "We help select practical, premium materials that suit your room, lighting, usage pattern, and budget.",
  },
  {
    pageType: "wardrobe",
    order: 3,
    stepNumber: "04",
    title: "Accessory-first details",
    description:
      "Trouser racks, valet rods, jewelry trays, shoe shelves, and drawers are planned around easy access.",
  },
  {
    pageType: "wardrobe",
    order: 4,
    stepNumber: "05",
    title: "Reliable hardware",
    description:
      "Hinges, channels, sliding systems, and drawer hardware are chosen for smooth motion and long-term use.",
  },
  {
    pageType: "wardrobe",
    order: 5,
    stepNumber: "06",
    title: "Guided installation",
    description:
      "Our team coordinates drawings, materials, site readiness, and installation details through completion.",
  },
];

// ---------------------------------------------------------------------
// Process steps — identical content on both pages, seeded per pageType
// ---------------------------------------------------------------------
const processStepsTemplate = [
  {
    order: 0,
    title: "Discovery & Collaboration",
    description: "We listen closely to your needs and understand the story behind your space.",
    image: img("assets/images/work/eight.webp"),
  },
  {
    order: 1,
    title: "Design & Ideation",
    description: "Mood boards, drawings, and materials shape a design that fits the way you live.",
    image: img("assets/images/work/nine.webp"),
  },
  {
    order: 2,
    title: "Execution & Excellence",
    description: "Skilled craftsmen bring each drawing to life with care, precision, and detail.",
    image: img("assets/images/work/ten.webp"),
  },
  {
    order: 3,
    title: "Seamless Handover",
    description: "We complete the transition from studio to home with a final walk-through and aftercare plan.",
    image: img("assets/images/work/eleven.webp"),
  },
];
const processSteps = ["kitchen", "wardrobe"].flatMap((pageType) =>
  processStepsTemplate.map((step) => ({ ...step, pageType }))
);

// ---------------------------------------------------------------------
// Parallax CTA (one per pageType)
// ---------------------------------------------------------------------
const parallaxCtas = [
  {
    pageType: "kitchen",
    eyebrow: "(Curve & Comfort Studio)",
    heading:
      "From kitchen layout to finish palette, every decision is shaped around how your home moves, stores, cooks, and gathers.",
    bgImage: img("assets/images/kitchen-banner/2.jpeg"),
    linkText: "View kitchen layouts",
    linkHref: "#kitchen-layouts",
  },
  {
    pageType: "wardrobe",
    eyebrow: "(Curve & Comfort Wardrobes)",
    heading:
      "From wardrobe layout to finish palette, every decision is shaped around how you dress, store, organise, and live.",
    bgImage: img("assets/images/wardrobe/6.webp"),
    linkText: "View wardrobe layouts",
    linkHref: "#wardrobe-layouts",
  },
];

// ---------------------------------------------------------------------
// Consultation CTA (one per pageType)
// ---------------------------------------------------------------------
const consultationCtas = [
  {
    pageType: "kitchen",
    eyebrow: "(Book A Studio Call)",
    heading:
      "Begin with measurements, finish direction, storage priorities, and a kitchen plan shaped around your home.",
    bgImage: img("assets/images/kitchen-banner/2.jpeg"),
    ctaText: "Book Consultation",
    ctaLink: "contact-us.html",
  },
  {
    pageType: "wardrobe",
    eyebrow: "(Book A Studio Call)",
    heading:
      "Begin with measurements, finish direction, storage priorities, and a wardrobe plan shaped around your daily routine.",
    bgImage: img("assets/images/wardrobe/4.jpeg"),
    ctaText: "Book Consultation",
    ctaLink: "contact-us.html",
  },
];

// ---------------------------------------------------------------------
// FAQ items
// ---------------------------------------------------------------------
const faqItems = [
  {
    pageType: "kitchen",
    order: 0,
    question: "How long does a Curve & Comfort kitchen take?",
    answer:
      "Timelines depend on layout, finish selection, and site readiness. Once measurements and materials are confirmed, our team shares a clear production and installation schedule.",
  },
  {
    pageType: "kitchen",
    order: 1,
    question: "Do you handle appliances and countertops?",
    answer:
      "We can plan kitchen modules around appliance sizes and countertop requirements so the finished kitchen feels coordinated, practical, and ready for daily use.",
  },
  {
    pageType: "kitchen",
    order: 2,
    question: "Is there a minimum project size?",
    answer:
      "Projects are reviewed by requirement, layout, and material scope. Share your room size and finish preference, and we will guide you on the best-fit solution.",
  },
  {
    pageType: "kitchen",
    order: 3,
    question: "What is the warranty?",
    answer:
      "Warranty coverage depends on the selected product and application. Our team explains the applicable care, usage, and warranty details before finalization.",
  },
  {
    pageType: "kitchen",
    order: 4,
    question: "Where do you work?",
    answer:
      "Curve & Comfort coordinates kitchen conversations based on your city, site status, project size, and installation requirements. Share your location and our team will guide the next step.",
  },
  {
    pageType: "wardrobe",
    order: 0,
    question: "How long does a Curve & Comfort wardrobe take?",
    answer:
      "Timelines depend on wardrobe size, finish selection, and site readiness. Once measurements and materials are confirmed, our team shares a clear production and installation schedule.",
  },
  {
    pageType: "wardrobe",
    order: 1,
    question: "Do you handle mirrors, lighting, and accessories?",
    answer:
      "We can plan mirrors, lighting, drawer inserts, shoe racks, valet rods, and hardware so the finished wardrobe feels coordinated and ready for daily use.",
  },
  {
    pageType: "wardrobe",
    order: 2,
    question: "Is there a minimum project size?",
    answer:
      "Projects are reviewed by requirement, layout, and material scope. Share your room size and finish preference, and we will guide you on the best-fit solution.",
  },
  {
    pageType: "wardrobe",
    order: 3,
    question: "What is the warranty?",
    answer:
      "Warranty coverage depends on the selected product and application. Our team explains the applicable care, usage, and warranty details before finalization.",
  },
  {
    pageType: "wardrobe",
    order: 4,
    question: "Where do you work?",
    answer:
      "Curve & Comfort coordinates wardrobe conversations based on your city, site status, project size, and installation requirements. Share your location and our team will guide the next step.",
  },
];

// ---------------------------------------------------------------------
// Page meta (one per pageType)
// ---------------------------------------------------------------------
const pageMetas = [
  {
    pageType: "kitchen",
    title: "Curve & Comfort | Modular Kitchens, Cabinets & Wardrobes",
    keywords:
      "curve and comfort, modular kitchen, luxury kitchen, kitchen cabinets, wardrobes, kitchen storage",
    description:
      "Curve & Comfort designs refined modular kitchens, cabinets, wardrobes, storage systems, and finish palettes for modern homes.",
  },
  {
    pageType: "wardrobe",
    title: "Curve & Comfort | Custom Wardrobes, Closets & Storage",
    keywords:
      "curve and comfort, custom wardrobe, luxury wardrobe, sliding wardrobe, walk in closet, wardrobe storage",
    description:
      "Curve & Comfort designs refined wardrobes, walk-in closets, sliding shutters, storage systems, and finish palettes for modern homes.",
  },
];

// ---------------------------------------------------------------------
// Run with --replace to intentionally refresh existing landing-page content.
// ---------------------------------------------------------------------
async function seed() {
  await ConnectDB();

  const jobs = [
    [HeroSlide, heroSlides],
    [AboutSection, aboutSections],
    [LayoutCard, layoutCards],
    [WhyChooseItem, whyChooseItems],
    [ProcessStep, processSteps],
    [ParallaxCta, parallaxCtas],
    [ConsultationCta, consultationCtas],
    [FaqItem, faqItems],
    [PageMeta, pageMetas],
  ];

  for (const [Model, data] of jobs) {
    const filter = { pageType: { $in: ["kitchen", "wardrobe"] } };
    const exists = await Model.exists(filter);
    if (exists && !process.argv.includes("--replace")) {
      console.log(`Skipped ${Model.modelName}; landing-page content already exists.`);
      continue;
    }
    if (exists) await Model.deleteMany(filter);
    await Model.insertMany(data);
    console.log(`Seeded ${data.length} ${Model.modelName} docs`);
  }

  await closeDB();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
