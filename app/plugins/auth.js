export default defineNuxtPlugin(async (nuxtApp) => {
    const { user, token } = useAuth()

    if (token.value && !user.value) {
        try {
            const data = await $fetch('/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token.value}`
                }
            })
            user.value = data
        } catch (error) {
            console.error('Failed to fetch user on init:', error)
            token.value = null
            user.value = null
        }
    }
})
