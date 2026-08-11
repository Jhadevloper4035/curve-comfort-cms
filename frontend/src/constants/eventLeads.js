export const EVENT_LEADS = [
  {
    key: 'event-lead-1',
    label: 'Matecia 2025',
    value: 'MATECIA 2025',
  },
  {
    key: 'event-lead-2',
    label: 'Foaid 2025 Delhi',
    value: 'FOAID 2025 Delhi',
  },
  {
    key: 'event-lead-3',
    label: 'Legacy 3.0 Meerut',
    value: 'Legacy 3.0 Meerut',
  },
  {
    key: 'event-lead-4',
    label: 'Foaid Mumbai Exhibition',
    value: 'FOAID MUMBAI exhibition',
  },
  {
    key: 'event-lead-6',
    label: 'Indiawood Exhibition',
    value: 'indiawood-exhibition',
  },
  {
    key: 'event-lead-7',
    label: 'Idac Mumbai 2026',
    value: 'idac-mumbai-2026',
  },
   {
    key: 'event-lead-8',
    label: 'bharat build con 2026',
    value: 'bharat-build-con-2026',
  },
]

export const getEventLeadLabel = (value = '') => {
  const normalizedValue = decodeURIComponent(value).trim().toLowerCase()
  const leadEvent = EVENT_LEADS.find((event) => event.value.toLowerCase() === normalizedValue)

  if (leadEvent?.label) return leadEvent.label

  return decodeURIComponent(value)
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
