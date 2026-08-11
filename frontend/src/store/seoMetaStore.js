import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const useSeoMetaStore = create(
  devtools(
    (set, get) => ({
      seoMetas: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchSeoMetas: async (force = false) => {
        const { seoMetas, lastFetched } = get();
        const isStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
        if (!force && seoMetas.length > 0 && !isStale) return;

        set({ loading: true, error: null }, false, "fetchSeoMetas/start");
        try {
          const data = await apiFetch("/api/seo-meta", {
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set(
            { seoMetas: data?.data || data, loading: false, lastFetched: Date.now() },
            false,
            "fetchSeoMetas/success"
          );
        } catch (err) {
          const message = err.message || "Failed to load SEO meta entries";
          set({ error: message, loading: false }, false, "fetchSeoMetas/error");
          toast.error(message, { position: "top-right", toastId: "seo-fetch-error" });
        }
      },

      createSeoMeta: async (payload) => {
        try {
          const data = await apiFetch("/api/seo-meta", {
            method: "POST",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const created = data?.data || data;
          set(
            (state) => ({ seoMetas: [created, ...state.seoMetas] }),
            false,
            "createSeoMeta/success"
          );
          toast.success("SEO meta created successfully", { position: "top-right", toastId: "seo-create-success" });
          return created;
        } catch (err) {
          const message = err.message || "Failed to create SEO meta";
          toast.error(message, { position: "top-right", toastId: "seo-create-error" });
          return null;
        }
      },

      updateSeoMeta: async (id, payload) => {
        try {
          const data = await apiFetch(`/api/seo-meta/${id}`, {
            method: "PUT",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const updated = data?.data || data;
          set(
            (state) => ({
              seoMetas: state.seoMetas.map((s) => (s._id === id ? updated : s)),
            }),
            false,
            "updateSeoMeta/success"
          );
          toast.success("SEO meta updated successfully", { position: "top-right", toastId: "seo-update-success" });
          return updated;
        } catch (err) {
          const message = err.message || "Failed to update SEO meta";
          toast.error(message, { position: "top-right", toastId: "seo-update-error" });
          return null;
        }
      },

      deleteSeoMeta: async (id) => {
        try {
          await apiFetch(`/api/seo-meta/${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set(
            (state) => ({ seoMetas: state.seoMetas.filter((s) => s._id !== id) }),
            false,
            "deleteSeoMeta/success"
          );
          toast.success("SEO meta deleted", { position: "top-right", toastId: "seo-delete-success" });
          return true;
        } catch (err) {
          const message = err.message || "Failed to delete SEO meta";
          toast.error(message, { position: "top-right", toastId: "seo-delete-error" });
          return false;
        }
      },

      resetSeoMetas: () => set({ seoMetas: [], lastFetched: null }, false, "resetSeoMetas"),
    }),
    { name: "SeoMetaStore" }
  )
);

export default useSeoMetaStore;
