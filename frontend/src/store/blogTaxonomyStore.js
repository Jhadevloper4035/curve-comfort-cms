import { create } from 'zustand';
import { toast } from 'react-toastify';
import { apiFetch } from '@/helpers/httpClient';

const headers = { 'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET };

const useBlogTaxonomyStore = create((set, get) => ({
  items: { category: [], tag: [] },
  loading: false,

  fetchTaxonomies: async (type, force = false) => {
    if (!force && get().items[type].length) return;

    set({ loading: true });
    try {
      const data = await apiFetch(`/api/blog/taxonomies?type=${type}`, { headers });
      set((state) => ({ items: { ...state.items, [type]: data?.data || [] }, loading: false }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || `Failed to load blog ${type}s`);
    }
  },

  createTaxonomy: async (type, name) => {
    try {
      const data = await apiFetch('/api/blog/taxonomies', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name }),
      });
      const created = data?.data || data;
      set((state) => ({ items: { ...state.items, [type]: [...state.items[type], created] } }));
      toast.success(`${type === 'category' ? 'Category' : 'Tag'} created`);
      return created;
    } catch (error) {
      toast.error(error.message || `Failed to create blog ${type}`);
      return null;
    }
  },

  deleteTaxonomy: async (type, id) => {
    try {
      await apiFetch(`/api/blog/taxonomies/${id}?type=${type}`, { method: 'DELETE', headers });
      set((state) => ({ items: { ...state.items, [type]: state.items[type].filter((item) => item._id !== id) } }));
      toast.success(`${type === 'category' ? 'Category' : 'Tag'} deleted`);
      return true;
    } catch (error) {
      toast.error(error.message || `Failed to delete blog ${type}`);
      return false;
    }
  },
}));

export default useBlogTaxonomyStore;
