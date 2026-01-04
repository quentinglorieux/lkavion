// server/api/auth/login.js
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const base = config.directusUrl
  const body = await readBody(event)
  const { identifier, password } = body || {}

  if (!identifier || !password) {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Identifiant et mot de passe requis' }))
  }

  try {
    console.log('Login attempt for identifier:', identifier)

    const payload = { email: identifier, password }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await $fetch(base + '/auth/login/ldap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { identifier, password }, // LDAP provider requires 'identifier'
      signal: controller.signal
    })

    // Sync password to Directus if login successful
    if (res?.data?.access_token) {
      try {
        await $fetch(base + '/users/me', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${res.data.access_token}`,
            'Content-Type': 'application/json'
          },
          body: { password }
        })
        console.log('Password synced to Directus for:', identifier)
      } catch (syncErr) {
        console.error('Failed to sync password:', syncErr)
      }
    }

    clearTimeout(timer)
    return res
  } catch (err) {
    console.error('Directus login error:', err)
    return sendError(event, createError({
      statusCode: err.response?.status || 401,
      statusMessage: err.data?.errors?.[0]?.message || 'Echec de connexion'
    }))
  }
})