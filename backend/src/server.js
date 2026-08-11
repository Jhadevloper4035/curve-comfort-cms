require("./config/env.js");

const app = require("./app.js");
const { ConnectDB, closeDB } = require("./config/db.js");
const { seedDevAdmin } = require("./config/seedDevAdmin.js");

const PORT = process.env.PORT || 8000;

async function start() {
  try {
    await ConnectDB();
    await seedDevAdmin();

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port: ${PORT}`);
    });

    async function shutdown(signal) {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await closeDB();
        console.log("🔌 HTTP server and database closed.");
        process.exit(0);
      });
    }

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch {
    console.error("❌ Server not started due to database connection failure.");
    process.exit(1);
  }
}

start();
