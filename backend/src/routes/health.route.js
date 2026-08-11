const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const mongoose = require("mongoose");
const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/s3");

// Mongoose readyState codes: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
const MONGO_STATES = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

router.get("/", async (req, res) => {
    const bucket = process.env.S3_BUCKET;
    const checks = {
        server: "ok",
        mongodb: "unknown",
        s3: "unknown",
        env: {
            AWS_REGION: !!process.env.AWS_REGION,
            AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
            S3_BUCKET: bucket || "(not set)",
            DATABASE_URL: !!process.env.DATABASE_URL,
        },
    };

    // ── MongoDB check ──────────────────────────────────────────────────────────
    const state = mongoose.connection.readyState;
    checks.mongodb = MONGO_STATES[state] ?? `unknown (${state})`;

    // ── S3 check ───────────────────────────────────────────────────────────────
    try {
        const key = `health-check/${Date.now()}-${crypto.randomUUID()}.txt`;
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: "text/plain",
        });
        await getSignedUrl(s3Client, command, { expiresIn: 60 });
        await s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: "health-check",
            ContentType: "text/plain",
        }));
        await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        checks.s3 = "connected";
    } catch (err) {
        checks.s3 = {
            error: err.message,
            code: err.name || err.Code,
            statusCode: err.$metadata?.httpStatusCode,
        };
    }

    const allOk = checks.mongodb === "connected" && checks.s3 === "connected";
    res.status(allOk ? 200 : 500).json(checks);
});

module.exports = router;
