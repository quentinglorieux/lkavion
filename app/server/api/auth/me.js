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
  try {
    const user = await $fetch('http://localhost:8055/users/me', {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}` 
      }
    })
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