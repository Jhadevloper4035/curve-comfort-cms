import { apiFetch } from '@/helpers/httpClient'

const buildQuery = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const getActivityStream = (params = {}) =>
  apiFetch(`/api/activity-stream${buildQuery(params)}`)

export const getLeadActivityStream = (params = {}) =>
  apiFetch(`/api/activity-stream/leads${buildQuery(params)}`)
