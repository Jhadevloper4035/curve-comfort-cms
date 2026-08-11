const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");


const { notFound, errorHandler } = require("./middleware/errorHandler.js");

const routes = require("./routes/index.js");

const app = express();

app.set("trust proxy", true);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — allow React dev server + production origin ────────────────────────
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret"],
};

// Respond to all OPTIONS preflight requests before any other middleware
app.options("/{*path}", cors(corsOptions));
app.use(cors(corsOptions));


// ── HTTP request logging ──────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api", routes);

// ── Error handling (must be last) ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
