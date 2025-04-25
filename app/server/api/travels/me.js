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
    const user = await $fetch('http://localhost:8055/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const userId = user.data.id

    // Step 2: Get flights for this user
    const flights = await $fetch('http://localhost:8055/items/flights', {
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
      }
    })

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