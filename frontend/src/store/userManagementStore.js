import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { toast } from 'react-toastify'
import { apiFetch } from '@/helpers/httpClient'

const useUserManagementStore = create(
  devtools(
    (set, get) => ({
      users: [],
      loading: false,
      error: null,

      fetchUsers: async () => {
        set({ loading: true, error: null }, false, 'fetchUsers/start')
        try {
          const res = await apiFetch('/api/auth/users')
          set({ users: res.data?.users ?? [], loading: false }, false, 'fetchUsers/success')
        } catch (err) {
          const message = err.message || 'Failed to load users'
          set({ error: message, loading: false }, false, 'fetchUsers/error')
          toast.error(message, { toastId: 'users-load-error' })
        }
      },

      createUser: async (payload) => {
        try {
          const res = await apiFetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          set(
            (state) => ({ users: [res.data.user, ...state.users] }),
            false,
            'createUser/success'
          )
          toast.success('User created successfully')
          return true
        } catch (err) {
          toast.error(err.message || 'Failed to create user')
          return false
        }
      },

      updateUser: async (id, payload) => {
        try {
          const res = await apiFetch(`/api/auth/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          set(
            (state) => ({
              users: state.users.map((u) =>
                u._id === id ? { ...u, ...res.data.user } : u
              ),
            }),
            false,
            'updateUser/success'
          )
          toast.success('User updated successfully')
          return true
        } catch (err) {
          toast.error(err.message || 'Failed to update user')
          return false
        }
      },

      deleteUser: async (id) => {
        try {
          await apiFetch(`/api/auth/users/${id}`, { method: 'DELETE' })
          set(
            (state) => ({ users: state.users.filter((u) => u._id !== id) }),
            false,
            'deleteUser/success'
          )
          toast.success('User deleted')
          return true
        } catch (err) {
          toast.error(err.message || 'Failed to delete user')
          return false
        }
      },
    }),
    { name: 'UserManagementStore' }
  )
)

export default useUserManagementStore
