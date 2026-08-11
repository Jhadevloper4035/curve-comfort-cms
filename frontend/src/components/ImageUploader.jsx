// components/ImageUploader.jsx
import { useRef } from "react";
import { useStore } from "zustand";
import { createUploadStore, deleteImage } from "../store/useUploadStore";

/**
 * Drop-zone image uploader. Use everywhere for uploading and removing images.
 *
 * Props
 * ──────────────────────────────────────────────────────────
 * folder     string          S3 folder prefix          "uploads"
 * multiple   bool            allow multiple files      true
 * maxFiles   number          cap on total files        10
 * value      string[]        already-uploaded S3 keys  []
 *                            (shown as removable thumbs in edit forms)
 * onComplete (keys) => void  called after upload with all successful keys
 * onRemove   (key)  => void  called when an existing (value) image is removed
 *
 * Usage examples
 * ──────────────────────────────────────────────────────────
 * // Product thumbnail (single)
 * <ImageUploader folder="products" multiple={false}
 *   value={form.thumbnail ? [form.thumbnail] : []}
 *   onComplete={([key]) => setForm(f => ({ ...f, thumbnail: key }))}
 *   onRemove={() => setForm(f => ({ ...f, thumbnail: "" }))} />
 *
 * // Product gallery (multi)
 * <ImageUploader folder="products" multiple maxFiles={6}
 *   value={form.images}
 *   onComplete={(keys) => setForm(f => ({ ...f, images: [...f.images, ...keys] }))}
 *   onRemove={(key) => setForm(f => ({ ...f, images: f.images.filter(k => k !== key) }))} />
 *
 * // Blog cover (single)
 * <ImageUploader folder="blogs" multiple={false}
 *   value={blog.coverImage ? [blog.coverImage] : []}
 *   onComplete={([key]) => setBlog(b => ({ ...b, coverImage: key }))}
 *   onRemove={() => setBlog(b => ({ ...b, coverImage: "" }))} />
 *
 * // Event gallery (multi)
 * <ImageUploader folder="events" multiple maxFiles={5}
 *   value={event.gallery}
 *   onComplete={(keys) => setEvent(e => ({ ...e, gallery: [...e.gallery, ...keys] }))}
 *   onRemove={(key) => setEvent(e => ({ ...e, gallery: e.gallery.filter(k => k !== key) }))} />
 */

export default function ImageUploader({
  multiple = true,
  maxFiles = 10,
  folder = "uploads",
  value = [],
  onComplete,
  onCompleteDetails,
  onRemove,
  maxFileSizeMB,
}) {
  const resolveImageSrc = (imageValue) => {
    if (!imageValue) return "";
    if (/^https?:\/\//i.test(imageValue)) return imageValue;

    const cdnBase = (import.meta.env.VITE_CDN_URL || "").replace(/\/$/, "");
    return cdnBase ? `${cdnBase}/${imageValue}` : imageValue;
  };

  // Each instance gets its own isolated store — no shared state between uploaders
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = createUploadStore();

  const {
    files, isUploading,
    addFiles, replaceFile, removeFile, clearFiles,
    uploadSingle, uploadAll,
  } = useStore(storeRef.current);

  const inputId = useRef(`file-input-${crypto.randomUUID()}`).current;
  const validFiles = (fileList) => {
    const selected = Array.from(fileList);
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024));
    if (invalid) {
      window.alert(`Use JPG, PNG, WebP, or AVIF images${maxFileSizeMB ? ` up to ${maxFileSizeMB} MB each` : ""}.`);
      return [];
    }
    return selected;
  };

  const handleChange = async (e) => {
    if (!e.target.files?.length) return;
    const selected = validFiles(e.target.files);
    if (!selected.length) return;
    if (multiple) {
      addFiles(selected, maxFiles);
    } else {
      replaceFile(selected);
      e.target.value = "";
      // Auto-upload immediately for single-file mode.
      // replaceFile uses vanilla Zustand set() which is synchronous,
      // so files[0] is available right away via getState().
      const fileId = storeRef.current.getState().files[0]?.id;
      if (fileId) {
        const key = await storeRef.current.getState().uploadSingle(fileId, folder);
        if (key) {
          const uploaded = storeRef.current.getState().files.find((file) => file.id === fileId);
          onComplete?.([key]);
          onCompleteDetails?.([{ key: uploaded?.storageKey || key, url: uploaded?.publicUrl || key }]);
        }
      }
      return;
    }
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    const selected = validFiles(e.dataTransfer.files);
    if (!selected.length) return;
    if (multiple) {
      addFiles(selected, maxFiles);
    } else {
      replaceFile(selected);
      const fileId = storeRef.current.getState().files[0]?.id;
      if (fileId) {
        const key = await storeRef.current.getState().uploadSingle(fileId, folder);
        if (key) {
          const uploaded = storeRef.current.getState().files.find((file) => file.id === fileId);
          onComplete?.([key]);
          onCompleteDetails?.([{ key: uploaded?.storageKey || key, url: uploaded?.publicUrl || key }]);
        }
      }
    }
  };

  const handleUpload = async () => {
    let keys;
    if (multiple) {
      keys = await uploadAll(folder);
    } else {
      const target = files.find((f) => f.status === "idle" || f.status === "error");
      if (target) {
        const key = await uploadSingle(target.id, folder);
        keys = key ? [key] : [];
      }
    }
    if (keys?.length) {
      onComplete?.(keys);
      onCompleteDetails?.(
        storeRef.current.getState().files
          .filter((file) => file.status === "success")
          .map((file) => ({ key: file.storageKey || file.key, url: file.publicUrl || file.key }))
      );
      // Remove successfully uploaded files — they now appear as "Saved" in the preview above
      storeRef.current.getState().files
        .filter((f) => f.status === "success")
        .forEach((f) => removeFile(f.id));
    }
  };

  const pendingCount = files.filter((f) => f.status === "idle" || f.status === "error").length;
  const canAddMore = multiple
    ? files.length + value.length < maxFiles
    : value.length === 0 && files.length === 0;

  return (
    <div style={{ fontFamily: "inherit" }}>

      {/* ── Existing uploaded images (from value prop) ── */}
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          {value.map((key) => (
            <div key={key} style={{ position: "relative", width: 120 }}>
              <img
                src={resolveImageSrc(key)}
                alt=""
                style={{
                  width: 120, height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "2px solid #22c55e",
                }}
              />
              <span
                style={{
                  position: "absolute", top: 2, left: 4,
                  fontSize: 10, color: "#22c55e", fontWeight: 600,
                }}
              >
                ✓ Saved
              </span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => { deleteImage(key).catch(() => {}); onRemove(key); }}
                  title="Remove image"
                  style={{
                    position: "absolute", top: 2, right: 2,
                    background: "rgba(220,38,38,0.85)", color: "#fff",
                    border: "none", borderRadius: "50%",
                    width: 22, height: 22, cursor: "pointer",
                    fontSize: 12, lineHeight: "22px", textAlign: "center",
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Drop Zone (hidden when single-file slot is filled) ── */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById(inputId).click()}
          style={{
            border: "2px dashed #94a3b8",
            borderRadius: 8,
            padding: "28px 16px",
            textAlign: "center",
            cursor: "pointer",
            color: "#64748b",
            userSelect: "none",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
          <p style={{ margin: 0, fontSize: 14 }}>
            Drag & drop image{multiple ? "s" : ""} here, or{" "}
            <span style={{ color: "#3b82f6", textDecoration: "underline" }}>browse</span>
          </p>
          {multiple && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
              Up to {maxFiles - value.length - files.length} more • JPG, PNG, WebP, AVIF{maxFileSizeMB ? ` • max ${maxFileSizeMB} MB each` : ''}
            </p>
          )}
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple={multiple}
            onChange={handleChange}
            hidden
          />
        </div>
      )}

      {/* ── New file previews ── */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
          {files.map((f) => (
            <div key={f.id} style={{ position: "relative", width: 120 }}>
              <img
                src={f.preview}
                alt=""
                style={{
                  width: 120, height: 120,
                  objectFit: "cover", borderRadius: 6,
                  opacity: f.status === "uploading" ? 0.7 : 1,
                  border: f.status === "success"
                    ? "2px solid #22c55e"
                    : f.status === "error"
                      ? "2px solid #ef4444"
                      : "2px solid #e2e8f0",
                }}
              />

              {/* Progress bar */}
              {f.status === "uploading" && (
                <div
                  style={{
                    position: "absolute", bottom: 0, left: 0,
                    height: 4,
                    width: `${f.progress}%`,
                    background: "#3b82f6",
                    borderRadius: "0 0 6px 6px",
                    transition: "width 0.2s",
                  }}
                />
              )}

              {/* Status label */}
              <span style={{ fontSize: 11, display: "block", marginTop: 3, color: "#64748b" }}>
                {f.status === "success" && <span style={{ color: "#22c55e" }}>✓ Uploaded</span>}
                {f.status === "error" && <span style={{ color: "#ef4444" }} title={f.error}>✕ Failed</span>}
                {f.status === "uploading" && `${f.progress}%`}
                {f.status === "idle" && "Ready"}
              </span>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                title="Remove"
                style={{
                  position: "absolute", top: 2, right: 2,
                  background: "rgba(0,0,0,0.55)", color: "#fff",
                  border: "none", borderRadius: "50%",
                  width: 22, height: 22, cursor: "pointer",
                  fontSize: 12, lineHeight: "22px", textAlign: "center",
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Action buttons ── */}
      {files.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                padding: "6px 16px", borderRadius: 6, border: "none",
                background: isUploading ? "#93c5fd" : "#3b82f6",
                color: "#fff", cursor: isUploading ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 500,
              }}
            >
              {isUploading
                ? "Uploading..."
                : `Upload${multiple ? ` (${pendingCount})` : ""}`}
            </button>
          )}
          <button
            type="button"
            onClick={clearFiles}
            disabled={isUploading}
            style={{
              padding: "6px 14px", borderRadius: 6,
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#64748b", cursor: isUploading ? "not-allowed" : "pointer",
              fontSize: 14,
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
