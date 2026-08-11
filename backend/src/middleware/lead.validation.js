const validator = require("validator");

module.exports.validateEventForm = (req, res, next) => {
  const { fullName, mobileNumber, productType, email } = req.body;

  if (!fullName || !mobileNumber || !productType) {
    return res.status(400).json({ message: "Name, mobile number and product enquiry are required." });
  }

  if (!validator.isLength(fullName.trim(), { min: 2, max: 100 })) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  }

  if (!validator.isMobilePhone(mobileNumber.toString(), "en-IN")) {
    return res.status(400).json({ message: "Please enter a valid Indian mobile number." });
  }

  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  next();
};

module.exports.validateShowroomForm = (req, res, next) => {
  const { fullName, mobileNumber, userType, productType, companyName, city, state, representative, email } = req.body;

  const required = { fullName, mobileNumber, userType, productType, companyName, city, state, representative };
  for (const [field, value] of Object.entries(required)) {
    if (!value || !value.toString().trim()) {
      return res.status(400).json({ message: "All fields are required." });
    }
  }

  if (!validator.isLength(fullName.trim(), { min: 2, max: 100 })) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  }

  if (!validator.isMobilePhone(mobileNumber.toString(), "en-IN")) {
    return res.status(400).json({ message: "Please enter a valid Indian mobile number." });
  }

  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  next();
};

module.exports.validateDubaiwoodForm = (req, res, next) => {
  const { fullName, mobileNumber, userType, productType, companyName, country, representative, email } = req.body;
  const validUserTypes = ["Architect", "End Customer", "Retailer"];
  const validProductTypes = [
    "0.8mm Laminates",
    "1mm+ Laminates",
    "PVC HPL",
    "Decorative HPL",
    "Acrylic HPL",
    "Edgeband",
    "MDF Boards",
    "Acoustic Panels",
    "Matteva",
  ];

  if (userType && !validUserTypes.includes(userType)) {
    return res.status(400).json({ message: "Please select a valid user type." });
  }

  if (
    productType != null &&
    (!Array.isArray(productType) || productType.some((product) => !validProductTypes.includes(product)))
  ) {
    return res.status(400).json({ message: "Please select a valid product." });
  }

  if (fullName && !validator.isLength(fullName.trim(), { min: 2, max: 100 })) {
    return res.status(400).json({ message: "Name must be between 2 and 100 characters." });
  }

  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const optionalTextFields = { fullName, mobileNumber, userType, companyName, country, representative, email };
  for (const [field, value] of Object.entries(optionalTextFields)) {
    if (typeof value === "string" && !value.trim()) {
      delete req.body[field];
    }
  }

  if (typeof mobileNumber === "string" && mobileNumber.trim()) {
    req.body.mobileNumber = mobileNumber.trim();
  }
  next();
};
