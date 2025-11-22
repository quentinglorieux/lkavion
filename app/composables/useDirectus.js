// composables/useDirectus.js
export function useDirectus() {
  const config = useRuntimeConfig()
  const base = config.public?.directusUrl || config.directusUrl || process.env.DIRECTUS_URL || 'http://localhost:8055'

  async function directusFetch(path, { method = 'GET', headers = {}, body, token, timeout = 8000 } = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const finalHeaders = { ...headers }
    if (token) finalHeaders.Authorization = `Bearer ${token}`
    try {
      return await $fetch(base + path, {
        method,
        headers: finalHeaders,
        body,
        signal: controller.signal
      })
    } finally {
      clearTimeout(timer)
    }
  }

  return { directusFetch, base }
}