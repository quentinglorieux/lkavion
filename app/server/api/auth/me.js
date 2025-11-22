export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')
  if (!raw || !raw.startsWith('Bearer ')) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    }))
  }

  const token = raw.replace('Bearer ', '')
  // console.log('Token:', token)
  const base = process.env.DIRECTUS_URL || 'http://localhost:8055'
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const user = await $fetch(base + '/users/me', {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}` 
      },
      signal: controller.signal
    })
    clearTimeout(timer)
    // console.log('User data:', user)
    return user
  } catch (err) {
    console.error('Error fetching user:', err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user',
      data: err.data
    }))
  }
})