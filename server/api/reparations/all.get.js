export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')
  if (!raw || !raw.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  const base = config.directusUrl
  const serviceToken = config.directusApiToken

  try {
    // 1. Fetch all reparations with user details
    const reparations = await $fetch(`${base}/items/reparations`, {
      headers: { Authorization: `Bearer ${serviceToken}` },
      params: {
        sort: '-date_created',
        fields: '*,user_created.first_name,user_created.last_name,user_created.email'
      }
    })

    return reparations.data
  } catch (error) {
    console.error('Error in GET /api/reparations/all:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch all reparations'
    })
  }
})
