import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const useBlogStore = create(
  devtools(
    
    (set, get) => ({
      blogs: [],
      loading: false,
      error: null,
      lastFetched: null,
      lastFilter: "",

      fetchBlogs: async ({ category = "", tag = "" } = {}, force = false) => {
        const filter = new URLSearchParams(
          Object.entries({ category, tag }).filter(([, value]) => value)
        ).toString();
        const { blogs, lastFetched, lastFilter } = get();
        const isStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
        if (!force && filter === lastFilter && blogs.length > 0 && !isStale) return;

        set({ loading: true, error: null }, false, "fetchBlogs/start");
        try {
          const data = await apiFetch(`/api/blog${filter ? `?${filter}` : ""}`, {
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set({ blogs: data?.data || data, loading: false, lastFetched: Date.now(), lastFilter: filter }, false, "fetchBlogs/success");
        } catch (err) {
          const message = err.message || "Failed to load blogs";
          set({ error: message, loading: false }, false, "fetchBlogs/error");
          toast.error(message, { position: "top-right", toastId: "blogs-error" });
        }
      },

      createBlog: async (payload) => {
        try {
          const data = await apiFetch("/api/blog", {
            method: "POST",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const created = data?.data || data;
          set(
            (state) => ({ blogs: [created, ...state.blogs] }),
            false,
            "createBlog/success"
          );
          toast.success("Blog created successfully", { position: "top-right", toastId: "blog-create-success" });
          return created;
        } catch (err) {
          const message = err.message || "Failed to create blog";
          toast.error(message, { position: "top-right", toastId: "blog-create-error" });
          return null;
        }
      },

      updateBlog: async (id, payload) => {
        try {
          const data = await apiFetch(`/api/blog/${id}`, {
            method: "PUT",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const updated = data?.data || data;
          set(
            (state) => ({ blogs: state.blogs.map((b) => (b._id === id ? updated : b)) }),
            false,
            "updateBlog/success"
          );
          toast.success("Blog updated successfully", { position: "top-right", toastId: "blog-update-success" });
          return updated;
        } catch (err) {
          const message = err.message || "Failed to update blog";
          toast.error(message, { position: "top-right", toastId: "blog-update-error" });
          return null;
        }
      },

      deleteBlog: async (id) => {
        try {
          await apiFetch(`/api/blog/${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set(
            (state) => ({ blogs: state.blogs.filter((b) => b._id !== id) }),
            false,
            "deleteBlog/success"
          );
          toast.success("Blog deleted", { position: "top-right", toastId: "blog-delete-success" });
          return true;
        } catch (err) {
          const message = err.message || "Failed to delete blog";
          toast.error(message, { position: "top-right", toastId: "blog-delete-error" });
          return false;
        }
      },

      resetBlogs: () => set({ blogs: [], lastFetched: null, lastFilter: "" }, false, "resetBlogs"),
    }),
    { name: "BlogStore" }
  )
);

export default useBlogStore;
