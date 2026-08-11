
const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  "";

const API_BASE_URL = rawApiBase.replace(/\/$/, "");

const buildApiUrl = (url) => {
  if (API_BASE_URL.endsWith("/api") && url.startsWith("/api/")) {
    return `${API_BASE_URL}${url.slice(4)}`;
  }

  return `${API_BASE_URL}${url}`;
};

export const apiFetch = async (url, options = {}) => {
  const res = await fetch(buildApiUrl(url), {
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      if (body?.error) message = body.error;
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  return res.json();
};

export const downloadExcel = async (url, filename) => {
  const res = await fetch(buildApiUrl(url), {
    credentials: "include",
  });

  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
};
