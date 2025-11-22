
<script setup>
import { useTravelSummary } from '@/composables/useTravelSummary'
import TravelSummaryTable from '@/components/TravelSummaryTable.vue'

const { fetchSummary, travels, totals, summaryTableData, pending } = useTravelSummary()
const { token } = useAuth()
if (token.value) {
  await useAsyncData('travelSummary', () => fetchSummary())
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h1 class="text-xl font-bold mb-4">Summary</h1>

    <div v-if="pending">Chargement...</div>

    <div v-else>
      <p>Total distance : <strong>{{ totals.totalDistance }} km</strong></p>
      <p>Total emissions : <strong>{{ totals.totalCO2 }} kg CO₂</strong></p>

    </div>

    <div class="pt-8">
    <h2 class="text-lg font-semibold mb-4">Cost summary</h2>
    <TravelSummaryTable :data="summaryTableData" />
  </div>

  <div class="max-w-5xl mx-auto py-8">
    <h2 class="text-xl font-bold mb-4">Traject history</h2>

    <div v-if="pending">Chargement...</div>
    <div v-else>
      <MyTravelHistoryTable :data="travels" />
    </div>
  </div>

  </div>
</template>