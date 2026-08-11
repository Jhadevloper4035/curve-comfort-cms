import { create } from 'zustand'
import { getAllTeamMembers } from '@/helpers/data'

const useTeamStore = create((set, get) => ({
  teamMembers: [],
  loading: false,
  error: null,

  fetchTeamMembers: async () => {
    if (get().teamMembers.length > 0) return // already loaded
    set({ loading: true, error: null })
    try {
      const data = await getAllTeamMembers()
      set({ teamMembers: data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },
}))

export default useTeamStore
