export const useDirectusFile = () => {
    const config = useRuntimeConfig()
  
    const getUrl = (id?: string | null, options?: Record<string, any>): string => {
      if (!id) return '/_nuxt/assets/img/default-avatar.png'
  
      const params = new URLSearchParams(options).toString()
      return `${config.public.directusUrl}/assets/${id}${params ? '?' + params : ''}`
    }
  
    return {
      getUrl
    }
  }