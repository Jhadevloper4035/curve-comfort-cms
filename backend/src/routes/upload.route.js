const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3");
const { createActivity } = require("../utils/activityLogger.js");

const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function buildPublicUrl(key) {
    const baseUrl = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (baseUrl) return `${baseUrl}/${key}`;
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

function extractKey(input) {
    if (!input) return "";

    if (/^https?:\/\//i.test(input)) {
        try {
            const parsed = new URL(input);
            return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
        } catch {
            return "";
        }
    }

    return input.replace(/^\/+/, "");
}

const actorName = (req) => req.user?.name || "Admin User";
const logUploadActivity = (req, payload) =>
    createActivity(req, {
        module: "uploads",
        ...payload,
    });

// Single presign
router.post("/presign", async (req, res) => {
    try {
        const { contentType, fileName, folder = "uploads" } = req.body;

        if (!ALLOWED_TYPES.includes(contentType)) {
            return res.status(400).json({ error: "Unsupported file type" });
        }

        const ext = fileName.split(".").pop();
        const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        await logUploadActivity(req, {
            title: "Upload URL Generated",
            description: `${actorName(req)} generated upload URL for ${key}`,
            action: "UPLOAD_URL_GENERATED",
            targetName: key,
            status: "completed",
            badge: "Upload",
            iconType: "info",
        });
        res.json({ presignedUrl, key, publicUrl: buildPublicUrl(key) });
    } catch (err) {
        console.error("Presign error:", err);
        res.status(500).json({ error: "Failed to generate upload URL" });
    }
});

// Batch presign
router.post("/presign-batch", async (req, res) => {
    try {
        const { files, folder = "uploads" } = req.body;

        if (!Array.isArray(files) || files.length === 0 || files.length > 20) {
            return res.status(400).json({ error: "Provide 1-20 files" });
        }

        const results = await Promise.all(
            files.map(async ({ contentType, fileName }) => {
                if (!ALLOWED_TYPES.includes(contentType)) {
                    throw new Error(`Unsupported type: ${contentType}`);
                }

                const ext = fileName.split(".").pop();
                const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

                const command = new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                    ContentType: contentType,
                });

                const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
                return { presignedUrl, key, fileName, publicUrl: buildPublicUrl(key) };
            })
        );

        await logUploadActivity(req, {
            title: "Batch Upload URLs Generated",
            description: `${actorName(req)} generated ${results.length} upload URLs for ${folder}`,
            action: "BATCH_UPLOAD_URLS_GENERATED",
            targetName: folder,
            status: "completed",
            badge: "Upload",
            iconType: "info",
        });
        res.json({ uploads: results });
    } catch (err) {
        console.error("Batch presign error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Delete a single S3 object
router.delete("/delete", async (req, res) => {
    try {
        const key = extractKey(req.body?.key);
        if (!key) return res.status(400).json({ error: "key is required" });

        await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
        await logUploadActivity(req, {
            title: "Uploaded File Deleted",
            description: `${actorName(req)} deleted uploaded file ${key}`,
            action: "UPLOADED_FILE_DELETED",
            targetName: key,
            status: "warning",
            badge: "Security",
            iconType: "danger",
        });
        res.json({ success: true });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Failed to delete object" });
    }
});

module.exports = router;
