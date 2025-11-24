
<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTravelSummary } from '@/composables/useTravelSummary'
import TravelSummaryTable from '@/components/TravelSummaryTable.vue'
import MyTravelHistoryTable from '@/components/MyTravelHistoryTable.vue'
import { useI18n } from '@/composables/useI18n'

const { fetchSummary, travels, totals, summaryTableData, pending, error } = useTravelSummary()
const { token, user } = useAuth()
const { t } = useI18n()

if (token.value) {
  await useAsyncData('travelSummary', () => fetchSummary())
}

const tripCount = computed(() => travels.value.length)
const averageDistance = computed(() => tripCount.value ? Math.round(totals.totalDistance / tripCount.value) : 0)
const averageCO2 = computed(() => tripCount.value ? Math.round(totals.totalCO2 / tripCount.value) : 0)
const totalTrainCost = computed(() => {
  const train = summaryTableData.value.find(r => r.transport_mode === 'Train')
  return train?.price ? Number(train.price) : 0
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-10 space-y-8 px-3  ">
    <header class="space-y-2">
      <p class="text-sm text-gray-500 uppercase tracking-wide">{{ t('dashboard.hero.label') }}</p>
      <h1 class="text-3xl font-bold">{{ t('dashboard.hero.title') }}</h1>
      <p class="text-gray-600 text-sm">{{ t('dashboard.hero.subtitle') }}</p>
    </header>

    <section v-if="pending" class="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">{{ t('dashboard.loading') }}</section>

    <section v-else class="grid md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">{{ t('dashboard.cards.totalTripsTitle') }}</span>
        <strong class="mt-2 text-3xl">{{ tripCount }}</strong>
        <span class="text-xs text-gray-500 mt-1">{{ user?.data.first_name || t('dashboard.cards.selfFallback') }}</span>
      </div>
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">{{ t('dashboard.cards.totalDistanceTitle') }}</span>
        <strong class="mt-2 text-3xl">{{ totals.totalDistance }} km</strong>
        <span class="text-xs text-gray-500 mt-1">{{ t('dashboard.cards.avgDistancePrefix') }} {{ averageDistance }} {{ t('dashboard.cards.kmPerTrip') }}</span>
      </div>
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">{{ t('dashboard.cards.totalCO2Title') }}</span>
        <strong class="mt-2 text-3xl">{{ totals.totalCO2 }} kg</strong>
        <span class="text-xs text-gray-500 mt-1">{{ t('dashboard.cards.avgCO2Prefix') }} {{ averageCO2 }} {{ t('dashboard.cards.kgPerTrip') }}</span>
      </div>
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">Coût total Train</span>
        <strong class="mt-2 text-3xl">€{{ totalTrainCost.toFixed(2) }}</strong>
        <span class="text-xs text-gray-500 mt-1">Somme des prix saisis</span>
      </div>
    </section>

    <section class="grid lg:grid-cols-2 gap-6">
      <div class="bg-white border rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{{ t('dashboard.sections.byModeTitle') }}</h2>
          <span class="text-xs text-gray-400">{{ summaryTableData.length }} {{ t('dashboard.sections.modeCountSuffix') }}</span>
        </div>
        <TravelSummaryTable :data="summaryTableData" />
      </div>

      <div class="bg-white border rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{{ t('dashboard.sections.historyTitle') }}</h2>
          <span class="text-xs text-gray-400">{{ tripCount }} {{ t('dashboard.sections.historySuffix') }}</span>
        </div>
        <MyTravelHistoryTable :data="travels" />
      </div>
    </section>

    <p v-if="error" class="text-sm text-red-600">{{ t('dashboard.error') }} : {{ error.message || '...' }}</p>
  </div>
</template>