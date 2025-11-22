// server/api/auth/login.js
export default defineEventHandler(async (event) => {
  const base = process.env.DIRECTUS_URL || 'http://localhost:8055'
  const body = await readBody(event)
  const { email, password } = body || {}

  if (!email || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Email et mot de passe requis' }))
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await $fetch(base + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email, password },
      signal: controller.signal
    })
    clearTimeout(timer)
    return res
  } catch (err) {
    console.error('Directus login error:', err)
    return sendError(event, createError({
      statusCode: err.response?.status || 401,
      statusMessage: err.data?.errors?.[0]?.message || 'Échec de connexion'
    }))
  }
})