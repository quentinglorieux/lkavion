export default defineEventHandler(async (event) => {
  const method = event.method
  const id = getRouterParam(event, 'id')
  const body = method === 'PATCH' ? await readBody(event) : null
  
  const config = useRuntimeConfig()
  const base = config.directusUrl
  const userToken = getHeader(event, 'authorization')
  const serviceToken = config.directusApiToken || process.env.DIRECTUS_API_TOKEN

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
    
    const res = await $fetch(`${base}/items/travels/${id}`, {
      method,
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
    console.error(`Directus API error (${method}):`, err)
    return sendError(event, createError({
      statusCode: err.response?.status || 500,
      statusMessage: `Failed to ${method.toLowerCase()} travel`,
      data: err.data || null
    }))
  }
})
