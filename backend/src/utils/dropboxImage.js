const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/s3.js");

const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DROPBOX_HOSTS = new Set(["dropbox.com", "www.dropbox.com", "dl.dropboxusercontent.com"]);

const imageType = (buffer) => {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { contentType: "image/jpeg", extension: "jpg" };
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { contentType: "image/png", extension: "png" };
  if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return { contentType: "image/webp", extension: "webp" };
  if (buffer.subarray(4, 8).toString() === "ftyp" && buffer.subarray(8, 12).toString().includes("avif")) return { contentType: "image/avif", extension: "avif" };
  return null;
};

const publicUrl = (key) => {
  const baseUrl = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/${key}` : `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
};

const dropboxUrl = (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || !DROPBOX_HOSTS.has(url.hostname.toLowerCase())) return null;
  if (url.hostname !== "dl.dropboxusercontent.com") url.searchParams.set("dl", "1");
  return url;
};

const readImage = async (response) => {
  const length = Number(response.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_IMAGE_BYTES) throw new Error("Dropbox image must be 5 MB or smaller.");

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Dropbox did not return an image.");

  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_IMAGE_BYTES) throw new Error("Dropbox image must be 5 MB or smaller.");
    chunks.push(value);
  }
  return Buffer.concat(chunks);
};

const copyDropboxImage = async (source, folder = "products") => {
  const url = dropboxUrl(source);
  if (!url) throw new Error("Use a public https://www.dropbox.com image link.");

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error("Dropbox image could not be downloaded. Check its public access.");

  const image = await readImage(response);
  const type = imageType(image);
  if (!type) throw new Error("Dropbox link must download a JPG, PNG, WebP, or AVIF image.");

  const key = `${folder}/dropbox/${Date.now()}-${crypto.randomUUID()}.${type.extension}`;
  await s3Client.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: image, ContentType: type.contentType }));
  return publicUrl(key);
};

module.exports = { copyDropboxImage, isDropboxUrl: (value) => Boolean(dropboxUrl(value)) };
