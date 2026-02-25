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

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    
    let res
    let loginError = null

    // 1. Try LDAP login first
    try {
      res = await $fetch(base + '/auth/login/ldap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { identifier, password },
        signal: controller.signal
      })
    } catch (ldapErr) {
      console.warn('LDAP login failed, trying standard login...', ldapErr.response?.status)
      loginError = ldapErr
      
      // 2. If LDAP fails (especially with 401 or 404), try standard Directus login
      if (ldapErr.response?.status === 401 || ldapErr.response?.status === 404) {
        try {
          res = await $fetch(base + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { email: identifier, password },
            signal: controller.signal
          })
          loginError = null // Success!
        } catch (stdErr) {
          console.error('Standard login also failed:', stdErr.response?.status)
          loginError = stdErr
        }
      }
    }

    if (loginError) {
      throw loginError
    }

    // Sync password to Directus if login successful
    if (res?.data?.access_token) {
      try {
        // 1. Get User ID using the new token
        const meRes = await $fetch(base + '/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${res.data.access_token}`
          }
        })
        const userId = meRes?.data?.id

        // 2. Update password using Admin Token (bypass user permissions)
        if (userId && config.directusApiToken) {
          await $fetch(base + `/users/${userId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${config.directusApiToken}`,
              'Content-Type': 'application/json'
            },
            body: { password }
          })
          console.log('Password synced to Directus for user:', userId)
        } else {
          console.warn('Skipping password sync: Admin token missing or User ID not found')
        }
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