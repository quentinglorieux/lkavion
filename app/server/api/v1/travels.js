export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const base = process.env.DIRECTUS_URL || 'http://localhost:8055'
  const userToken = getHeader(event, 'authorization')
  const serviceToken = process.env.DIRECTUS_API_TOKEN

  if (!userToken) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))
  }

  if (!serviceToken) {
    console.error('Missing DIRECTUS_API_TOKEN environment variable')
    return sendError(event, createError({ statusCode: 500, statusMessage: 'Service token missing' }))
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await $fetch(`${base}/items/travels`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceToken}`,
        'Content-Type': 'application/json'
      },
      body,
      signal: controller.signal
    })
    clearTimeout(timer)
    return res
  } catch (err) {
    console.error('Directus API error:', err)
    return sendError(event, createError({
      statusCode: err.response?.status || 500,
      statusMessage: 'Failed to create travel',
      data: err.data || null
    }))
  }
})