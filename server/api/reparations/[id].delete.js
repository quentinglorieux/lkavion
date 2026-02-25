export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')
  if (!raw || !raw.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const userToken = raw.replace('Bearer ', '')
  const config = useRuntimeConfig()
  const base = config.directusUrl

  try {
    // Delete the item using the user's token
    // Directus will enforce permissions (ensure they own the item)
    await $fetch(`${base}/items/reparations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    })

    return { success: true }
  } catch (error) {
    console.error(`Error in DELETE /api/reparations/${id}:`, error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete reparation'
    })
  }
})
