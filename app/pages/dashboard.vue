<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTravelSummary } from '@/composables/useTravelSummary'
import TravelSummaryTable from '@/components/TravelSummaryTable.vue'
import MyTravelHistoryTable from '@/components/MyTravelHistoryTable.vue'
import { useI18n } from '@/composables/useI18n'

const { fetchSummary, travels, totals, visitorTotals, summaryTableData, visitorSummaryTableData, pending, error } = useTravelSummary()
const { token, user } = useAuth()
const { t } = useI18n()

if (token.value) {
  await useAsyncData('travelSummary', () => fetchSummary())
}

const myTripCount = computed(() => summaryTableData.value.reduce((sum, item) => sum + item.count, 0))
const totalTripCount = computed(() => travels.value.length)

const averageDistance = computed(() => myTripCount.value ? Math.round(totals.totalDistance / myTripCount.value) : 0)
const averageCO2 = computed(() => myTripCount.value ? Math.round(totals.totalCO2 / myTripCount.value) : 0)
const totalTrainCost = computed(() => {
  const train = summaryTableData.value.find(r => r.transport_mode === 'Train')
  return train?.price ? Number(train.price) : 0
})

const visitorTripCount = computed(() => visitorSummaryTableData.value.reduce((sum, item) => sum + item.count, 0))
const visitorAverageDistance = computed(() => visitorTripCount.value ? Math.round(visitorTotals.totalDistance / visitorTripCount.value) : 0)
const visitorAverageCO2 = computed(() => visitorTripCount.value ? Math.round(visitorTotals.totalCO2 / visitorTripCount.value) : 0)

const recentTravels = computed(() => {
  if (!travels.value) return []
  return [...travels.value]
    .sort((a, b) => {
      const dateA = new Date(a.date_travel || a.date_created).getTime()
      const dateB = new Date(b.date_travel || b.date_created).getTime()
      return dateB - dateA
    })
    .slice(0, 10)
})

const co2Cost = computed(() => {
  const tons = totals.totalCO2 / 1000
  if (tons <= 1) return 0
  if (tons <= 2) return (tons - 1) * 150
  return 150 + (tons - 2) * 300
})

const visitorCo2Cost = computed(() => {
  const tons = visitorTotals.totalCO2 / 1000
  if (tons <= 1) return 0
  if (tons <= 2) return (tons - 1) * 150
  return 150 + (tons - 2) * 300
})

</script>

<template>
  <div class="max-w-7xl mx-auto py-10 space-y-8 px-3  ">
    <header class="flex justify-between items-start">
      <div class="space-y-2">
        <p class="text-sm text-gray-500 uppercase tracking-wide">{{ t('dashboard.hero.label') }}</p>
        <h1 class="text-3xl font-bold">{{ t('dashboard.hero.title') }}</h1>
        <p class="text-gray-600 text-sm">{{ t('dashboard.hero.subtitle') }}</p>
      </div>
      <div v-if="['35e06b60-fb46-4893-b19d-38c768a0b41c', 'd29315b3-f1bd-4c57-ba83-ee463ce8433d'].some(id => id === (typeof user?.data?.role === 'object' ? user?.data?.role?.id : user?.data?.role))">
        <UButton to="/admin" color="indigo" variant="solid" icon="i-heroicons-shield-check">
          Admin
        </UButton>
      </div>
    </header>

    <section v-if="pending"
      class="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">{{
        t('dashboard.loading') }}</section>

    <section v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">{{ t('dashboard.cards.totalTripsTitle') }}</span>
        <strong class="mt-2 text-3xl">{{ myTripCount }}</strong>
        <span class="text-xs text-gray-500 mt-1">{{ user?.data.first_name || t('dashboard.cards.selfFallback') }}</span>
      </div>
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">{{ t('dashboard.cards.totalDistanceTitle')
          }}</span>
        <strong class="mt-2 text-3xl">{{ totals.totalDistance }} km</strong>
        <span class="text-xs text-gray-500 mt-1">{{ t('dashboard.cards.avgDistancePrefix') }} {{ averageDistance }} {{
          t('dashboard.cards.kmPerTrip') }}</span>
      </div>
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">{{ t('dashboard.cards.totalCO2Title') }}</span>
        <strong class="mt-2 text-3xl text-red-600">{{ totals.totalCO2 }} kg</strong>
        <span class="text-xs text-gray-500 mt-1">{{ t('dashboard.cards.avgCO2Prefix') }} {{ averageCO2 }} {{
          t('dashboard.cards.kgPerTrip') }}</span>
      </div>
      <div class="bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-indigo-400">{{ t('dashboard.cards.co2ContributionTitle') }}</span>
        <strong class="mt-2 text-3xl text-indigo-900">€{{ co2Cost.toFixed(2) }}</strong>
        <span class="text-xs text-indigo-500 mt-1">{{ t('dashboard.cards.co2ContributionRules') }}</span>
      </div>
      <div class="bg-white rounded-lg border shadow-sm p-5 flex flex-col">
        <span class="text-xs uppercase tracking-widest text-gray-400">Coût total Train</span>
        <strong class="mt-2 text-3xl">€{{ totalTrainCost.toFixed(2) }}</strong>
        <span class="text-xs text-gray-500 mt-1">Somme des prix saisis</span>
      </div>
    </section>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 bg-white border rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{{ t('dashboard.sections.byModeTitle') }}</h2>
          <span class="text-xs text-gray-400">{{ summaryTableData.length }} {{ t('dashboard.sections.modeCountSuffix')
            }}</span>
        </div>
        <TravelSummaryTable :data="summaryTableData" />
      </div>


      <div class="lg:col-span-2 bg-white border rounded-lg shadow-sm p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{{ t('dashboard.sections.historyTitle') }}</h2>
          <span class="text-xs text-gray-400">{{ totalTripCount }} {{ t('dashboard.sections.historySuffix') }}</span>
        </div>
        <MyTravelHistoryTable :data="recentTravels" @refresh="fetchSummary" />
      </div>
    </section>

    <!-- Visitor Section -->
    <section v-if="visitorSummaryTableData.length > 0" class="space-y-6 pt-10 border-t">
      <header>
        <h2 class="text-2xl font-bold">Visiteurs</h2>
        <p class="text-gray-600 text-sm">Récapitulatif des déplacements pour les visiteurs invités.</p>
      </header>

      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm p-5 flex flex-col">
          <span class="text-xs uppercase tracking-widest text-indigo-400">Trajets Visiteurs</span>
          <strong class="mt-2 text-3xl text-indigo-900">{{ visitorTripCount }}</strong>
        </div>
        <div class="bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm p-5 flex flex-col">
          <span class="text-xs uppercase tracking-widest text-indigo-400">{{ t('dashboard.cards.totalDistanceTitle') }}</span>
          <strong class="mt-2 text-3xl text-indigo-900">{{ visitorTotals.totalDistance }} km</strong>
          <span class="text-xs text-indigo-500 mt-1">Moy. {{ visitorAverageDistance }} km/trajet</span>
        </div>
        <div class="bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm p-5 flex flex-col">
          <span class="text-xs uppercase tracking-widest text-indigo-400">{{ t('dashboard.cards.totalCO2Title') }}</span>
          <strong class="mt-2 text-3xl text-indigo-900">{{ visitorTotals.totalCO2 }} kg</strong>
          <span class="text-xs text-indigo-500 mt-1">Moy. {{ visitorAverageCO2 }} kg/trajet</span>
        </div>
        <div class="bg-indigo-900 rounded-lg border shadow-sm p-5 flex flex-col">
          <span class="text-xs uppercase tracking-widest text-indigo-300">{{ t('dashboard.cards.co2ContributionTitle') }} (Visiteurs)</span>
          <strong class="mt-2 text-3xl text-white">€{{ visitorCo2Cost.toFixed(2) }}</strong>
          <span class="text-xs text-indigo-200 mt-1">{{ t('dashboard.cards.co2ContributionRules') }}</span>
        </div>
      </section>

      <div class="bg-white border rounded-lg shadow-sm p-6 space-y-4 max-w-xl">
        <h3 class="text-lg font-semibold">{{ t('dashboard.sections.byModeTitle') }} (Visiteurs)</h3>
        <TravelSummaryTable :data="visitorSummaryTableData" />
      </div>
    </section>

    <p v-if="error" class="text-sm text-red-600">{{ t('dashboard.error') }} : {{ error.message || '...' }}</p>
  </div>
</template>