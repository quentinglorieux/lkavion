export default defineEventHandler(async (event) => {
    const body = await readBody(event)
  
    // Replace with your actual Directus base URL and token
    const directusUrl = 'http://localhost:8055' // <-- replace this
    const token = getHeader(event, 'authorization') // from client

    try {
      const res = await $fetch(`${directusUrl}/items/flights`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      })
  
      return res
    } catch (err) {
      console.error('Directus API error:', err)
      return sendError(event, createError({
        statusCode: err.response?.status ,
        statusMessage: 'Failed to create travel',
        data: err.data || null
      }))
    }
  })