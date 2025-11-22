export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')

  if (!raw || !raw.startsWith('Bearer ')) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    }))
  }

  const token = raw.replace('Bearer ', '')

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

    // Step 2: Get flights for this user
    const controllerFlights = new AbortController()
    const timerFlights = setTimeout(() => controllerFlights.abort(), 8000)
    const flights = await $fetch(base + '/items/flights', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        filter: {
          traveler: {
            _eq: userId
          }
        },
        fields: 'distance,co2,transport_mode,departure,final'
      },
      signal: controllerFlights.signal
    })
    clearTimeout(timerFlights)

    return flights.data || []

  } catch (err) {
    console.error('Error fetching user flights:', err)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch flights',
      data: err.data || null
    }))
  }
})