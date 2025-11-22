export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const base = process.env.DIRECTUS_URL || 'http://localhost:8055'
  const token = getHeader(event, 'authorization')

  if (!token) {
    return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await $fetch(`${base}/items/flights`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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