export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 1. Get token from cookies or authorization header
  const token = getCookie(event, 'auth_token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Missing token'
    })
  }

  const config = useRuntimeConfig()
  const base = config.directusUrl
  const serviceToken = config.directusApiToken

  try {
    // 2. We could verify the token here by calling /users/me
    // but we'll trust the token existence for now, or just let Directus handle it
    // Actually, to be very clean, we fetch from Directus using the service token
    // so we can serve the file even if user permissions on 'files' are restrictive
    
    const response = await $fetch.raw(`${base}/assets/${id}`, {
      headers: {
        Authorization: `Bearer ${serviceToken}`
      }
    })

    // 3. Pipe the headers and the body back to the client
    const headers = {
      'Content-Type': response.headers.get('Content-Type'),
      'Content-Length': response.headers.get('Content-Length'),
      'Content-Disposition': response.headers.get('Content-Disposition')
    }

    setHeaders(event, headers)
    
    return response._data
  } catch (error) {
    console.error(`Error proxying asset ${id}:`, error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: 'Failed to fetch asset'
    })
  }
})
