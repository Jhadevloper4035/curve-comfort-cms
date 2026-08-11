// store/useUploadStore.js
import { createStore } from 'zustand'

const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  ''

const normalizedApiBase = rawApiBase.replace(/\/$/, '')
const API = normalizedApiBase.endsWith('/api')
  ? normalizedApiBase
  : `${normalizedApiBase}/api`

function parseS3Error(status, responseText) {
  if (!responseText) return `S3 upload failed: ${status}`

  const codeMatch = responseText.match(/<Code>([^<]+)<\/Code>/i)
  const messageMatch = responseText.match(/<Message>([^<]+)<\/Message>/i)
  const code = codeMatch?.[1]
  const message = messageMatch?.[1]

  if (code && message) return `${code}: ${message}`
  if (message) return message
  return `S3 upload failed: ${status}`
}

function extractStorageKey(value) {
  if (!value) return ''

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      return decodeURIComponent(url.pathname.replace(/^\/+/, ''))
    } catch {
      return ''
    }
  }

  return value.replace(/^\/+/, '')
}

// Delete a previously uploaded S3 object by key
export async function deleteImage(key) {
  const res = await fetch(`${API}/upload/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ key: extractStorageKey(key) }),
  })
  if (!res.ok) throw new Error('Failed to delete image')
}

// Factory — call once per ImageUploader instance (via useRef) so each
// uploader has its own isolated file list and upload state.
export function createUploadStore() {
  return createStore((set, get) => ({
    files: [],
    isUploading: false,

    // ── File Selection ──
    addFiles: (fileList, maxFiles = 10) => {
      const current = get().files.length
      const allowed = maxFiles - current
      if (allowed <= 0) return
      const newFiles = Array.from(fileList)
        .slice(0, allowed)
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'idle', // idle | uploading | success | error
          key: null,
          error: null,
        }))
      set((s) => ({ files: [...s.files, ...newFiles] }))
    },

    replaceFile: (fileList) => {
      // For single-file mode — clear existing then add one
      get().files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
      const file = Array.from(fileList)[0]
      if (!file) return
      set({
        files: [
          {
            id: crypto.randomUUID(),
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'idle',
            key: null,
            error: null,
          },
        ],
      })
    },

    removeFile: (id) =>
      set((s) => {
        const target = s.files.find((f) => f.id === id)
        if (target?.preview) URL.revokeObjectURL(target.preview)
        return { files: s.files.filter((f) => f.id !== id) }
      }),

    clearFiles: () => {
      get().files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
      set({ files: [], isUploading: false })
    },

    _update: (id, patch) =>
      set((s) => ({
        files: s.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      })),

    // ── S3 PUT via XMLHttpRequest (fetch has no upload progress API) ──
    _uploadToS3: (presignedUrl, file, id) => {
      const { _update } = get()
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', file.type)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            _update(id, { progress: Math.round((e.loaded / e.total) * 100) })
          }
        }

        xhr.onload = () =>
          (xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(parseS3Error(xhr.status, xhr.responseText))))

        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(file)
      })
    },

    // ── Single Image Upload ──
    uploadSingle: async (id, folder = 'upload') => {
      const { files, _update, _uploadToS3 } = get()
      const target = files.find((f) => f.id === id)
      if (!target) return null

      set({ isUploading: true })
      _update(id, { status: 'uploading', progress: 0 })

      try {
        console.log('[upload] requesting presign →', `${API}/upload/presign`, { folder, fileName: target.file.name, contentType: target.file.type })
        const res = await fetch(`${API}/upload/presign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            contentType: target.file.type,
            fileName: target.file.name,
            folder,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          const msg = err.error || `Presign failed: ${res.status}`
          console.error('[upload] presign error →', res.status, err)
          throw new Error(msg)
        }

        const { presignedUrl, key, publicUrl } = await res.json()
        console.log('[upload] presign ok, uploading to S3 key →', key)
        await _uploadToS3(presignedUrl, target.file, id)
        _update(id, { status: 'success', progress: 100, key: publicUrl || key, storageKey: key, publicUrl: publicUrl || key })
        console.log('[upload] S3 upload success →', key)
        return publicUrl || key
      } catch (err) {
        console.error('[upload] upload failed →', err.message)
        _update(id, { status: 'error', error: err.message })
        return null
      } finally {
        set({ isUploading: false })
      }
    },

    // ── Multi Image Upload ──
    uploadAll: async (folder = 'uploads') => {
      const { files, _update, _uploadToS3 } = get()
      const pending = files.filter((f) => f.status === 'idle' || f.status === 'error')
      if (!pending.length) return []

      set({ isUploading: true })

      try {
        const res = await fetch(`${API}/upload/presign-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            folder,
            files: pending.map((f) => ({
              contentType: f.file.type,
              fileName: f.file.name,
            })),
          }),
        })

        if (!res.ok) throw new Error('Batch presign failed')
        const { uploads } = await res.json()

        await Promise.allSettled(
          uploads.map((upload, i) => {
            const entry = pending[i]
            _update(entry.id, { status: 'uploading', progress: 0 })
            return _uploadToS3(upload.presignedUrl, entry.file, entry.id)
              .then(() => _update(entry.id, { status: 'success', progress: 100, key: upload.publicUrl || upload.key, storageKey: upload.key, publicUrl: upload.publicUrl || upload.key }))
              .catch((err) => _update(entry.id, { status: 'error', error: err.message }))
          }),
        )

        return get()
          .files.filter((f) => f.status === 'success')
          .map((f) => f.key)
      } catch (err) {
        pending.forEach((f) => _update(f.id, { status: 'error', error: 'Batch presign failed' }))
        return []
      } finally {
        set({ isUploading: false })
      }
    },
  }))
}
