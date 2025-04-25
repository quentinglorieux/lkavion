import { ref, watch, reactive } from 'vue'
import debounce from 'lodash.debounce'

export function useCitySearch() {
  const query = ref('')
  const results = ref([])
  const loading = ref(false)

  const search = debounce(async () => {
    if (query.value.length < 2) {
      results.value = []
      return
    }

    loading.value = true
    try {
      const res = await fetch(`https://secure.geonames.net/searchJSON?name=${encodeURIComponent(query.value)}&featureClass=P&maxRows=10&fuzzy=0.6&lang=fr&username=labos1point5`)
      const data = await res.json()
      results.value = data.geonames.map((item) => ({
        name: `${item.name}, ${item.countryName}`,
        lat: item.lat,
        lng: item.lng,
        countryCode: item.countryCode
      }))
    } catch (error) {
      console.error('GeoNames error:', error)
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)

  watch(query, () => search())

  return reactive({
    query,
    results,
    loading
  })
}