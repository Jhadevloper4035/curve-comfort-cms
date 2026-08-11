const User = require("../model/user.model.js");

async function seedDevAdmin() {
  if (process.env.NODE_ENV !== "development") return;

  const name = process.env.DEV_ADMIN_NAME;
  const email = process.env.DEV_ADMIN_EMAIL || (name?.includes("@") ? name : "");
  const mobileNumber = process.env.DEV_ADMIN_MOBILE || "0000000000";
  const password = process.env.DEV_ADMIN_PASSWORD;

  if (!name || !email || !password) return;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) return;

  await User.create({
    fullName: name,
    email,
    mobileNumber,
    password,
    role: "admin",
  });

  console.log(`Development admin user created: ${email}`);
}

module.exports = { seedDevAdmin };
