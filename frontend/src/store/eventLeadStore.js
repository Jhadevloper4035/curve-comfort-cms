import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const useEventLeadsStore = create(
  devtools(
    (set, get) => ({

      leads: [],
      loading: false,
      error: null,
      lastFetched: null,
      currentPlace: null,

      // 🔹 Fetch Leads
      fetchLeads: async (place, force = false) => {
        const { leads, lastFetched, currentPlace } = get();

        const isStale =
          !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;

        const placeChanged = currentPlace !== place;

        if (!force && !placeChanged && leads.length > 0 && !isStale) return;

        set({ loading: true, error: null }, false, "fetchLeads/start");

        try {
          const data = await apiFetch(`/api/lead/event/${place}`);

          set(
            {
              leads: data?.data || data,
              loading: false,
              lastFetched: Date.now(),
              currentPlace: place,
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
        set({ leads: [], lastFetched: null, currentPlace: null }, false, "resetLeads"),
    }),
    {
      name: "useEventLeadsStore",
    }
  )
);

export default useEventLeadsStore;