import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const authHeaders = {
  "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET,
  "Content-Type": "application/json",
};

const useJobStore = create(
  devtools(
    (set, get) => ({
      jobs: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchJobs: async (force = false) => {
        const { jobs, lastFetched } = get();
        const isStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
        if (!force && jobs.length > 0 && !isStale) return;

        set({ loading: true, error: null }, false, "fetchJobs/start");
        try {
          const data = await apiFetch("/api/jobs", {
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set({ jobs: data?.data || data, loading: false, lastFetched: Date.now() }, false, "fetchJobs/success");
        } catch (err) {
          const message = err.message || "Failed to load jobs";
          set({ error: message, loading: false }, false, "fetchJobs/error");
          toast.error(message, { position: "top-right", toastId: "jobs-fetch-error" });
        }
      },

      createJob: async (payload) => {
        try {
          const data = await apiFetch("/api/jobs", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify(payload),
          });
          const created = data?.data || data;
          set((state) => ({ jobs: [created, ...state.jobs] }), false, "createJob/success");
          toast.success("Job created successfully", { position: "top-right", toastId: "job-create-success" });
          return created;
        } catch (err) {
          toast.error(err.message || "Failed to create job", { position: "top-right", toastId: "job-create-error" });
          return null;
        }
      },

      updateJob: async (id, payload) => {
        try {
          const data = await apiFetch(`/api/jobs/${id}`, {
            method: "PUT",
            headers: authHeaders,
            body: JSON.stringify(payload),
          });
          const updated = data?.data || data;
          set(
            (state) => ({ jobs: state.jobs.map((job) => (job._id === id ? updated : job)) }),
            false,
            "updateJob/success"
          );
          toast.success("Job updated successfully", { position: "top-right", toastId: "job-update-success" });
          return updated;
        } catch (err) {
          toast.error(err.message || "Failed to update job", { position: "top-right", toastId: "job-update-error" });
          return null;
        }
      },

      deleteJob: async (id) => {
        try {
          await apiFetch(`/api/jobs/${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": import.meta.env.VITE_ADMIN_SECRET },
          });
          set((state) => ({ jobs: state.jobs.filter((job) => job._id !== id) }), false, "deleteJob/success");
          toast.success("Job deleted", { position: "top-right", toastId: "job-delete-success" });
          return true;
        } catch (err) {
          toast.error(err.message || "Failed to delete job", { position: "top-right", toastId: "job-delete-error" });
          return false;
        }
      },

      resetJobs: () => set({ jobs: [], lastFetched: null }, false, "resetJobs"),
    }),
    { name: "JobStore" }
  )
);

export default useJobStore;
