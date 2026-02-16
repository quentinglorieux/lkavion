export default defineEventHandler(async (event) => {
  const raw = getHeader(event, 'authorization')

  if (!raw || !raw.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const token = raw.replace('Bearer ', '')
  const config = useRuntimeConfig()
  const base = config.directusUrl
  const serviceToken = config.directusApiToken || process.env.DIRECTUS_API_TOKEN

  if (!serviceToken) {
    console.error('Missing DIRECTUS_API_TOKEN environment variable')
    throw createError({
      statusCode: 500,
      statusMessage: 'Service token missing'
    })
  }

  try {
    // Step 1: Get user ID using the user's token
    const userMe = await $fetch(base + '/users/me', {
      headers: { Authorization: `Bearer ${token}` },
      params: { fields: 'id,role' }
    })
    
    const userId = userMe.data?.id || userMe.id
    // If the role is already there as a string (UUID), use it
    let roleId = userMe.data?.role || userMe.role

    console.log(`[AdminCheck] Raw userMe result:`, JSON.stringify(userMe))

    if (!userId) {
      throw createError({ statusCode: 401, statusMessage: 'Could not identify user' })
    }

    // Step 2: If roleId is still missing, fetch full user with service token
    if (!roleId || typeof roleId === 'object') {
      const fullUser = await $fetch(base + `/users/${userId}`, {
        headers: { Authorization: `Bearer ${serviceToken}` },
        params: { fields: 'role' }
      })
      const userData = fullUser.data || fullUser
      roleId = typeof userData.role === 'object' ? userData.role?.id : userData.role
      console.log(`[AdminCheck] Full user role lookup:`, roleId)
    }

    const adminRoles = ['35e06b60-fb46-4893-b19d-38c768a0b41c', 'd29315b3-f1bd-4c57-ba83-ee463ce8433d']
    const isAdmin = adminRoles.includes(roleId)

    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: `Forbidden: Admin access required. Detected Role: ${roleId || 'None'}. Full UserMe: ${JSON.stringify(userMe)}`
      })
    }

    // Step 2: Get ALL travels
    const travels = await $fetch(base + '/items/travels', {
      headers: {
        Authorization: `Bearer ${serviceToken}`
      },
      params: {
        fields: 'id,date_created,date_travel,distance,co2,transport_mode,departure,final,price,visitor,visitor_name,traveler.first_name,traveler.last_name',
        limit: -1, // Fetch all entries
        sort: '-date_travel'
      }
    })

    return travels.data || []

  } catch (err) {
    console.error('Admin API error:', err)
    if (err.statusCode) throw err
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch travels for admin',
      data: err.data || null
    })
  }
})
