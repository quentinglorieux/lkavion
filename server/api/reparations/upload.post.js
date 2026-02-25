export default defineEventHandler(async (event) => {
  const rawHeader = getHeader(event, 'authorization')
  if (!rawHeader || !rawHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userToken = rawHeader.replace('Bearer ', '')
  const config = useRuntimeConfig()
  const base = config.directusUrl

  try {
    // We read the multi-part data from the client request
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Missing form data' })
    }

    // Reconstruct FormData for Directus
    const directusFormData = new FormData()
    
    for (const part of formData) {
      if (part.name === 'file') {
        const blob = new Blob([part.data], { type: part.type })
        directusFormData.append('file', blob, part.filename)
      } else if (part.name) {
        directusFormData.append(part.name, part.data.toString())
      }
    }

    // Forward to Directus using the user's token so uploaded_by is correct
    const response = await $fetch(`${base}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`
      },
      body: directusFormData
    })

    return response.data
  } catch (error) {
    console.error('Error in POST /api/reparations/upload:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to upload file to Directus'
    })
  }
})
