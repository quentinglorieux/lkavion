export function useI18n() {
  const nuxtApp = useNuxtApp()
  if (!nuxtApp.$i18n) {
    throw new Error('i18n plugin is not initialized')
  }
  return nuxtApp.$i18n
}
