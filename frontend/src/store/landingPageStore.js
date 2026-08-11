import { create } from 'zustand';
import { toast } from 'react-toastify';
import { apiFetch } from '@/helpers/httpClient';

const headers = (json = false) => ({
  'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET,
  ...(json && { 'Content-Type': 'application/json' }),
});

const useLandingPageStore = create((set) => ({
  content: null,
  loading: false,

  fetchContent: async (pageType) => {
    set({ loading: true });
    try {
      const result = await apiFetch(`/api/landing-page/${pageType}`, { headers: headers() });
      set({ content: result.data, loading: false });
      return result.data;
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || 'Failed to load landing page content');
      return null;
    }
  },

  saveSection: async (section, id, payload) => {
    try {
      const result = await apiFetch(`/api/landing-page/${section}${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: headers(true),
        body: JSON.stringify(payload),
      });
      toast.success('Landing page section saved');
      return result.data;
    } catch (error) {
      toast.error(error.message || 'Failed to save landing page section');
      return null;
    }
  },

  deleteSection: async (section, id) => {
    try {
      await apiFetch(`/api/landing-page/${section}/${id}`, { method: 'DELETE', headers: headers() });
      toast.success('Landing page section deleted');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to delete landing page section');
      return false;
    }
  },
}));

export default useLandingPageStore;
