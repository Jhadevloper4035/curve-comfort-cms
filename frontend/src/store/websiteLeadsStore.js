import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const SECRET = import.meta.env.VITE_ADMIN_SECRET;

const useWebsiteLeadsStore = create(
  devtools(
    (set, get) => ({
      leads: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchLeads: async (force = false) => {
        const { leads, lastFetched } = get();
        const isStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
        if (!force && leads.length > 0 && !isStale) return;

        set({ loading: true, error: null }, false, "fetchLeads/start");
        try {
          const data = await apiFetch("/api/lead/contactleads", {
            headers: { "x-admin-secret": SECRET },
          });
          set({ leads: data?.data || data, loading: false, lastFetched: Date.now() }, false, "fetchLeads/success");
        } catch (err) {
          const message = err.message || "Failed to load website leads";
          set({ error: message, loading: false }, false, "fetchLeads/error");
          toast.error(message, { position: "top-right", toastId: "website-leads-error" });
        }
      },

      createLead: async (payload) => {
        try {
          const isFormData = payload instanceof FormData;
          const data = await apiFetch("/api/lead/contactleads", {
            method: "POST",
            headers: {
              "x-admin-secret": SECRET,
              ...(!isFormData && { "Content-Type": "application/json" }),
            },
            body: isFormData ? payload : JSON.stringify(payload),
          });
          const created = data?.data || data;
          set(
            (state) => ({ leads: [created, ...state.leads] }),
            false,
            "createLead/success"
          );
          toast.success("Lead created successfully", { position: "top-right", toastId: "website-lead-create-success" });
          return created;
        } catch (err) {
          const message = err.message || "Failed to create lead";
          toast.error(message, { position: "top-right", toastId: "website-lead-create-error" });
          return null;
        }
      },

      updateLead: async (id, payload) => {
        try {
          const isFormData = payload instanceof FormData;
          const data = await apiFetch(`/api/lead/contactleads/${id}`, {
            method: "PUT",
            headers: {
              "x-admin-secret": SECRET,
              ...(!isFormData && { "Content-Type": "application/json" }),
            },
            body: isFormData ? payload : JSON.stringify(payload),
          });
          const updated = data?.data || data;
          set(
            (state) => ({ leads: state.leads.map((l) => (l._id === id ? updated : l)) }),
            false,
            "updateLead/success"
          );
          toast.success("Lead updated successfully", { position: "top-right", toastId: "website-lead-update-success" });
          return updated;
        } catch (err) {
          const message = err.message || "Failed to update lead";
          toast.error(message, { position: "top-right", toastId: "website-lead-update-error" });
          return null;
        }
      },

      deleteLead: async (id) => {
        try {
          await apiFetch(`/api/lead/contactleads/${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": SECRET },
          });
          set(
            (state) => ({ leads: state.leads.filter((l) => l._id !== id) }),
            false,
            "deleteLead/success"
          );
          toast.success("Lead deleted", { position: "top-right", toastId: "website-lead-delete-success" });
          return true;
        } catch (err) {
          const message = err.message || "Failed to delete lead";
          toast.error(message, { position: "top-right", toastId: "website-lead-delete-error" });
          return false;
        }
      },

      resetLeads: () => set({ leads: [], lastFetched: null }, false, "resetLeads"),
    }),
    { name: "WebsiteLeadsStore" }
  )
);

export default useWebsiteLeadsStore;
