export default defineEventHandler(async (event) => {
    const { collection } = event.context.params!
    const config = useRuntimeConfig()
    const query = getQuery(event)
  
    const allowedCollections = ['flights']
    if (!allowedCollections.includes(collection)) {
      throw createError({ statusCode: 400, message: 'Invalid collection name' })
    }
  
    const response = await $fetch<{ data: any[] }>(`${config.public.directusUrl}/items/${collection}`, {
      params: query
    })
  
    return response.data ?? []
  })