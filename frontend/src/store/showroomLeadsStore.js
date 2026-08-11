import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const useShowroomLeadsStore = create(
  devtools(
    (set, get) => ({
      leads: [],
      loading: false,
      error: null,
      lastFetched: null,

      // 🔹 Fetch Leads
      fetchLeads: async (force = false) => {
        const { leads, lastFetched } = get();

        const isStale =
          !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;

        if (!force && leads.length > 0 && !isStale) return;

        set({ loading: true, error: null }, false, "fetchLeads/start");

        try {
          const data = await apiFetch("/api/lead/showroom"); // ✅ correct

          console.log("Fetched showroom leads:", data);

          set(
            {
              leads: data?.data || data,
              loading: false,
              lastFetched: Date.now(),
            },
            false,
            "fetchLeads/success"
          );
        } catch (err) {
          const message =
            err.message || "Failed to load leads"; // ✅ fetch doesn't have err.response

          set({ error: message, loading: false }, false, "fetchLeads/error");

          toast.error(message, {
            position: "top-right",
            toastId: "leads-load-error",
          });
        }
      },

      // 🔹 Reset
      resetLeads: () =>
        set({ leads: [], lastFetched: null }, false, "resetLeads"),
    }),
    {
      name: "ShowroomLeadsStore",
    }
  )
);

export default useShowroomLeadsStore;