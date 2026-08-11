import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const useCategoryStore = create(
  devtools(
    (set, get) => ({
      categories: [],
      loading: false,
      lastFetched: null,

      fetchCategories: async (force = false) => {
        const { categories, lastFetched } = get();
        const isStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
        if (!force && categories.length > 0 && !isStale) return;

        set({ loading: true }, false, "fetchCategories/start");
        try {
          const data = await apiFetch("/api/category", {
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set({ categories: data?.data || [], loading: false, lastFetched: Date.now() }, false, "fetchCategories/success");
        } catch (err) {
          set({ loading: false }, false, "fetchCategories/error");
          toast.error(err.message || "Failed to load categories", { position: "top-right", toastId: "categories-error" });
        }
      },

      createCategory: async (payload) => {
        try {
          const data = await apiFetch("/api/category", {
            method: "POST",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const created = data?.data || data;
          set((state) => ({ categories: [...state.categories, created] }), false, "createCategory/success");
          toast.success("Category created", { position: "top-right", toastId: "category-create-success" });
          return created;
        } catch (err) {
          toast.error(err.message || "Failed to create category", { position: "top-right", toastId: "category-create-error" });
          return null;
        }
      },

      updateCategory: async (id, payload) => {
        try {
          const data = await apiFetch(`/api/category/${id}`, {
            method: "PUT",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const updated = data?.data || data;
          set(
            (state) => ({ categories: state.categories.map((category) => (category._id === id ? updated : category)) }),
            false,
            "updateCategory/success"
          );
          toast.success("Category updated", { position: "top-right", toastId: "category-update-success" });
          return updated;
        } catch (err) {
          toast.error(err.message || "Failed to update category", { position: "top-right", toastId: "category-update-error" });
          return null;
        }
      },

      deleteCategory: async (id) => {
        try {
          await apiFetch(`/api/category/${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set((state) => ({ categories: state.categories.filter((category) => category._id !== id) }), false, "deleteCategory/success");
          toast.success("Category deleted", { position: "top-right", toastId: "category-delete-success" });
          return true;
        } catch (err) {
          toast.error(err.message || "Failed to delete category", { position: "top-right", toastId: "category-delete-error" });
          return false;
        }
      },
    }),
    { name: "CategoryStore" }
  )
);

export default useCategoryStore;
