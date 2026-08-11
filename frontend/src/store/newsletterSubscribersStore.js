import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-toastify";
import { apiFetch } from "@/helpers/httpClient";

const SECRET = import.meta.env.VITE_ADMIN_SECRET;

const useNewsletterSubscribersStore = create(
  devtools(
    (set, get) => ({
      subscribers: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchSubscribers: async (force = false) => {
        const { subscribers, lastFetched } = get();
        const isStale = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
        if (!force && subscribers.length > 0 && !isStale) return;

        set({ loading: true, error: null }, false, "fetchSubscribers/start");
        try {
          const data = await apiFetch("/api/newsletter", {
            headers: { "x-admin-secret": SECRET },
          });
          set(
            {
              subscribers: data?.data || data,
              loading: false,
              lastFetched: Date.now(),
            },
            false,
            "fetchSubscribers/success"
          );
        } catch (err) {
          const message = err.message || "Failed to load newsletter subscribers";
          set({ error: message, loading: false }, false, "fetchSubscribers/error");
          toast.error(message, {
            position: "top-right",
            toastId: "newsletter-subscribers-error",
          });
        }
      },

      resetSubscribers: () =>
        set({ subscribers: [], lastFetched: null }, false, "resetSubscribers"),
    }),
    { name: "NewsletterSubscribersStore" }
  )
);

export default useNewsletterSubscribersStore;
