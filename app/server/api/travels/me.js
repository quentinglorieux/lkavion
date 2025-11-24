export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')

  if (!raw || !raw.startsWith('Bearer ')) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    }))
  }

  const token = raw.replace('Bearer ', '')
  const serviceToken = process.env.DIRECTUS_API_TOKEN
  if (!serviceToken) {
    console.error('Missing DIRECTUS_API_TOKEN environment variable')
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Service token missing'
    }))
  }

  try {
    // Step 1: Get user ID from /users/me
    const base = process.env.DIRECTUS_URL || 'http://localhost:8055'
    const controllerUser = new AbortController()
    const timerUser = setTimeout(() => controllerUser.abort(), 8000)
    const user = await $fetch(base + '/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: controllerUser.signal
    })
    clearTimeout(timerUser)

    const userId = user.data.id

    // Step 2: Get travels for this user
    const controllerTravels = new AbortController()
    const timerTravels = setTimeout(() => controllerTravels.abort(), 8000)
    const travels = await $fetch(base + '/items/travels', {
      headers: {
        Authorization: `Bearer ${serviceToken}`
      },
      params: {
        filter: {
          traveler: {
            _eq: userId
          }
        },
        fields: 'distance,co2,transport_mode,departure,final,price'
      },
      signal: controllerTravels.signal
    })
    clearTimeout(timerTravels)

    return travels.data || []

  } catch (err) {
    console.error('Error fetching user travels:', err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch travels',
      data: err.data || null
    }))
  }
})