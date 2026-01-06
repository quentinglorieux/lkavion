export function useTravelSummary() {
  const { token } = useAuth()

  const travels = ref([])
  const pending = ref(true)
  const error = ref(null)

  const totals = reactive({
    totalDistance: 0,
    totalCO2: 0,
    byMode: {}
  })

  const visitorTotals = reactive({
    totalDistance: 0,
    totalCO2: 0,
    byMode: {}
  })

  const summaryTableData = ref([])
  const visitorSummaryTableData = ref([])

  async function fetchSummary() {
    pending.value = true
    error.value = null
    try {
      const res = await $fetch('/api/travels/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      travels.value = res

      // Reset totals
      totals.totalDistance = 0
      totals.totalCO2 = 0
      totals.byMode = {}

      visitorTotals.totalDistance = 0
      visitorTotals.totalCO2 = 0
      visitorTotals.byMode = {}

      summaryTableData.value = []
      visitorSummaryTableData.value = []

      for (const trip of res) {
        const d = trip.distance || 0
        const c = trip.co2 || 0
        const m = trip.transport_mode || 'Autre'
        const pRaw = trip.price
        const p = (pRaw !== null && pRaw !== undefined && !Number.isNaN(Number(pRaw))) ? Number(pRaw) : 0
        const isVisitor = trip.visitor === true

        // Target correct accumulation object
        const targetTotals = isVisitor ? visitorTotals : totals

        targetTotals.totalDistance += d
        targetTotals.totalCO2 += c

        if (!targetTotals.byMode[m]) {
          targetTotals.byMode[m] = { distance: 0, co2: 0, count: 0, price: 0 }
        }

        targetTotals.byMode[m].distance += d
        targetTotals.byMode[m].co2 += c
        targetTotals.byMode[m].count++

        if (p > 0) {
          targetTotals.byMode[m].price += p
        }
      }

      summaryTableData.value = Object.entries(totals.byMode).map(([mode, info]) => ({
        transport_mode: mode,
        distance: info.distance,
        co2: info.co2,
        count: info.count,
        price: info.price
      }))

      visitorSummaryTableData.value = Object.entries(visitorTotals.byMode).map(([mode, info]) => ({
        transport_mode: mode,
        distance: info.distance,
        co2: info.co2,
        count: info.count,
        price: info.price
      }))

    } catch (err) {
      console.error('Error loading travel summary:', err)
      error.value = err
    } finally {
      pending.value = false
    }
  }

  return {
    travels,
    totals,
    visitorTotals,
    summaryTableData,
    visitorSummaryTableData,
    fetchSummary,
    pending,
    error
  }
}