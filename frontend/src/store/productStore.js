import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const productsUrl = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") query.set(key, value);
  });
  const qs = query.toString();
  return `/api/product${qs ? `?${qs}` : ""}`;
};

const useProductStore = create(
  devtools(
    (set, get) => ({
      products: [],
      meta: null,
      loading: false,
      error: null,
      lastFetched: null,
      lastQuery: "",

      fetchProducts: async (paramsOrForce = {}, forceArg = false) => {
        const force = typeof paramsOrForce === "boolean" ? paramsOrForce : forceArg;
        const params = typeof paramsOrForce === "boolean" ? {} : paramsOrForce;
        const queryKey = JSON.stringify(params);
        const { products, lastFetched, lastQuery } = get();
        const isStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
        if (!force && products.length > 0 && !isStale && lastQuery === queryKey) return;

        set({ loading: true, error: null }, false, "fetchProducts/start");
        try {
          const data = await apiFetch(productsUrl(params), {
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set({
            products: data?.data || data,
            meta: data?.data ? {
              currentPage: data.currentPage,
              totalPages: data.totalPages,
              totalProducts: data.totalProducts,
            } : null,
            loading: false,
            lastFetched: Date.now(),
            lastQuery: queryKey,
          }, false, "fetchProducts/success");
        } catch (err) {
          const message = err.message || "Failed to load products";
          set({ error: message, loading: false }, false, "fetchProducts/error");
          toast.error(message, { position: "top-right", toastId: "products-error" });
        }
      },

      createProduct: async (payload) => {
        try {
          const data = await apiFetch("/api/product", {
            method: "POST",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const created = data?.data || data;
          set(
            (state) => ({ products: [created, ...state.products] }),
            false,
            "createProduct/success"
          );
          toast.success("Product created successfully", { position: "top-right", toastId: "product-create-success" });
          return created;
        } catch (err) {
          const message = err.message || "Failed to create product";
          toast.error(message, { position: "top-right", toastId: "product-create-error" });
          return null;
        }
      },

      updateProduct: async (id, payload) => {
        try {
          const data = await apiFetch(`/api/product/${id}`, {
            method: "PUT",
            headers: {
              "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          const updated = data?.data || data;
          set(
            (state) => ({ products: state.products.map((p) => (p._id === id ? updated : p)) }),
            false,
            "updateProduct/success"
          );
          toast.success("Product updated successfully", { position: "top-right", toastId: "product-update-success" });
          return updated;
        } catch (err) {
          const message = err.message || "Failed to update product";
          toast.error(message, { position: "top-right", toastId: "product-update-error" });
          return null;
        }
      },

      deleteProduct: async (id) => {
        try {
          await apiFetch(`/api/product/${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set(
            (state) => ({ products: state.products.filter((p) => p._id !== id) }),
            false,
            "deleteProduct/success"
          );
          toast.success("Product deleted", { position: "top-right", toastId: "product-delete-success" });
          return true;
        } catch (err) {
          const message = err.message || "Failed to delete product";
          toast.error(message, { position: "top-right", toastId: "product-delete-error" });
          return false;
        }
      },

      resetProducts: () => set({ products: [], meta: null, lastFetched: null, lastQuery: "" }, false, "resetProducts"),
    }),
    { name: "ProductStore" }
  )
);

export default useProductStore;
