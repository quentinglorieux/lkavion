export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')
  if (!raw || !raw.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userToken = raw.replace('Bearer ', '')
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const base = config.directusUrl

  try {
    // Save reparation using the user's token
    // Directus will automatically set user_created correctly
    const response = await $fetch(`${base}/items/reparations`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: body
    })

    return response.data
  } catch (error) {
    console.error('Error in POST /api/reparations:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to save reparation'
    })
  }
})
