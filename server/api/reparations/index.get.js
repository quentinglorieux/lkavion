export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')

  if (!raw || !raw.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const userToken = raw.replace('Bearer ', '')
  const config = useRuntimeConfig()
  const base = config.directusUrl

  try {
    // Fetch reparations using the user's own token
    // This ensures Directus filters based on their permissions (view own items)
    const reparations = await $fetch(`${base}/items/reparations`, {
      headers: { Authorization: `Bearer ${userToken}` },
      params: {
        sort: '-date_created',
        fields: '*.*'
      }
    })

    return reparations.data
  } catch (error) {
    console.error('Error in GET /api/reparations:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch reparations'
    })
  }
})
