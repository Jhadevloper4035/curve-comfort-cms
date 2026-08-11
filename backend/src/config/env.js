const path = require("path");
const dotenv = require("dotenv");

const NODE_ENV = process.env.NODE_ENV || "development";
// Load .env file if present; in Docker, vars are injected via env_file in compose.
dotenv.config({ path: path.resolve(process.cwd(), `.env.${NODE_ENV}`), quiet: true });

console.log(`🌍 Environment: ${NODE_ENV}`);
module.exports = NODE_ENV;
