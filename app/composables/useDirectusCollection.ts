export const useDirectusCollection = <T = any>(collection: string, options?: {
    fields?: string,
    filter?: Record<string, any>,
    sort?: string,
    limit?: number,
    page?: number
  }) => {
    const query: Record<string, any> = {}
  
    if (options?.fields) query.fields = options.fields
    if (options?.filter) query.filter = options.filter
    if (options?.sort) query.sort = options.sort
    if (options?.limit) query.limit = options.limit
    if (options?.page) query.page = options.page
  
    const { data, error } = useFetch<{ data: T[] }>(`/api/v1/${collection}`, {
      key: `${collection}-ssr-${JSON.stringify(query)}`,
      server: true,
      params: query
    })
  

    return {
      data,
      error
    }
  }