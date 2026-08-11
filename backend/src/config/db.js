const mongoose = require("mongoose");

async function ConnectDB() {
  try {
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
    const database = new URL(uri).pathname;
    const options = {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false,
    };
    if (!database || database === "/") options.dbName = process.env.DBNAME;
    await mongoose.connect(uri, options);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

async function closeDB() {
  await mongoose.connection.close();
  console.log("🔌 Mongoose connection closed");
}

module.exports = { ConnectDB, closeDB };
