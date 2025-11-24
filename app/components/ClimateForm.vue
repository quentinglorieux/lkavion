<script setup>
import CityAutocomplete from '@/components/CityAutocomplete.vue'
import { useTravelSaver } from '@/composables/useTravelSaver'
import { geodesicDistance } from '@/composables/useDistanceCalculator'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'

const { user } = useAuth()
const { saveTravel } = useTravelSaver()
const { t } = useI18n()

// Default city object for Paris (pre-filled to allow immediate calculations)
const defaultParis = { name: 'Paris, France', lat: '48.8566', lng: '2.3522', countryCode: 'FR' }

// Array of legs: each leg has from, to, mode
const legs = ref([
  { id: 1, from: defaultParis, to: null, mode: 'Avion', price: null }
])

// Global Aller-Retour toggle (applies to all computations)
const globalRoundTrip = ref(false)

// Distance + CO2 computation helpers (replicates logic from useTravelCalculator)
function computeRawDistance(leg) {
  const from = leg.from
  const to = leg.to
  if (!from || !to || typeof from !== 'object' || typeof to !== 'object') return null
  // Support both lng and lon just in case search source changes
  const fromLon = parseFloat(from.lng ?? from.lon)
  const toLon = parseFloat(to.lng ?? to.lon)
  let dist = geodesicDistance(
    parseFloat(from.lat),
    fromLon,
    parseFloat(to.lat),
    toLon
  )
  if (leg.mode === 'Avion') {
    dist += 95
  } else if (leg.mode === 'Train' || leg.mode === 'RER') {
    dist *= 1.2
  } else if (leg.mode === 'Métro') {
    dist *= 1.7
  } else if (leg.mode === 'Voiture') {
    dist *= 1.3
  } else if (leg.mode === 'Bus' || leg.mode === 'Tramway') {
    dist *= 1.5
  } else if (leg.mode === 'Taxi') {
    dist *= 2
  }
  return Math.round(dist)
}

function computeCO2(leg, distance) {
  if (!distance) return null
  if (leg.mode === 'Avion') {
    if (distance <= 1000) return Math.round(distance * 0.2586)
    if (distance <= 3500) return Math.round(distance * 0.1875)
    return Math.round(distance * 0.152)
  }
  const factors = {
    Train: 0.012,
    RER: 0.012,
    Métro: 0.012,
    Voiture: 0.170,
    Taxi: 0.170,
    Bus: 0.012,
    Tramway: 0.012
  }
  const factor = factors[leg.mode] || 0
  return Math.round(distance * factor)
}

function generateTripUuid() {
  const cryptoApi = globalThis?.crypto
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return template.replace(/[xy]/g, (char) => {
    const r = Math.floor(Math.random() * 16)
    const v = char === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Reactive maps for metrics
const legMetrics = computed(() => {
  return legs.value.map(l => {
    const rawDist = computeRawDistance(l)
    const rawCO2 = computeCO2(l, rawDist)
    const distance = rawDist ? (globalRoundTrip.value ? rawDist * 2 : rawDist) : null
    const co2 = rawCO2 ? (globalRoundTrip.value ? rawCO2 * 2 : rawCO2) : null
    const rawPrice = (l.price !== null && l.price !== '' && !Number.isNaN(Number(l.price))) ? Number(l.price) : null
    const price = rawPrice != null ? (globalRoundTrip.value ? Math.round((rawPrice * 2) * 100) / 100 : Math.round(rawPrice * 100) / 100) : null
    return { id: l.id, distance, co2, rawDist, rawCO2, price, rawPrice }
  })
})

const totalPrice = computed(() => legMetrics.value.reduce((sum, m) => sum + (m.price || 0), 0))

const totalDistance = computed(() => legMetrics.value.reduce((sum, m) => sum + (m.distance || 0), 0))
const totalCO2 = computed(() => legMetrics.value.reduce((sum, m) => sum + (m.co2 || 0), 0))

// Can save if logged in and at least one leg has valid metrics
const canSave = computed(() => {
  if (!user.value) return false
  return legMetrics.value.some(m => m.distance && m.co2)
})

function addLeg() {
  const last = legs.value[legs.value.length - 1]
  legs.value.push({
    id: legs.value.length + 1,
    from: (typeof last.to === 'object' && last.to) ? last.to : defaultParis,
    to: null,
    mode: last.mode
    , price: null
  })
}

function removeLeg(id) {
  if (legs.value.length === 1) return
  legs.value = legs.value.filter(l => l.id !== id)
}

const canAddLeg = computed(() => {
  const last = legs.value[legs.value.length - 1]
  return typeof last.from === 'object' && typeof last.to === 'object'
})

const saving = ref(false)

async function saveAll() {
  if (!user.value || saving.value) return
  saving.value = true
  let successCount = 0
  let failCount = 0
  const tripUuid = generateTripUuid()
  for (const leg of legs.value) {
    const metrics = legMetrics.value.find(m => m.id === leg.id)
    if (!metrics?.distance || !metrics?.co2) continue
    const rawPrice = (leg.price !== null && leg.price !== '' && !Number.isNaN(Number(leg.price))) ? Number(leg.price) : null
    const priceToSave = rawPrice != null ? (globalRoundTrip.value ? Math.round((rawPrice * 2) * 100) / 100 : Math.round(rawPrice * 100) / 100) : null
    const result = await saveTravel({
      traveler: user.value?.data.id || '',
      departure: leg.from?.name || '',
      final: leg.to?.name || '',
      distanceKm: metrics.distance,
      co2EmissionKg: metrics.co2,
      price: priceToSave,
      transport_mode: leg.mode + (globalRoundTrip.value ? ' (Aller-Retour)' : ''),
      tripUuid,
      allerRetour: globalRoundTrip.value
    }, { silent: true })
    if (result.ok) successCount++
    else failCount++
  }
  saving.value = false
  if (successCount && !failCount) {
    alert(`${successCount} liaison(s) sauvegardée(s) avec succès 🚀`)
  } else if (successCount && failCount) {
    alert(`${successCount} sauvegardée(s), ${failCount} échec(s) ⚠️`)
  } else if (!successCount && failCount) {
    alert(`Aucune liaison sauvegardée. ${failCount} échec(s) 😢`)
  } else {
    alert('Rien à sauvegarder.')
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-8 space-y-10">

    <!-- Info Box -->
    <div class="bg-gray-100 border border-gray-300 p-4 rounded-md flex items-start gap-4">
      <div class="text-blue-500 text-xl">ℹ️</div>
      <div class="text-sm">
        <p class="font-semibold">{{ t('climateForm.infoTitle') }}</p>
        <p>{{ t('climateForm.infoBody') }}</p>
      </div>
    </div>

    <!-- Totals Panel -->
    <div class="grid md:grid-cols-4 gap-6 items-stretch">
      <div class="bg-white shadow-md rounded-lg p-4 border text-center flex flex-col justify-center">
        <div class="text-sm text-gray-600 uppercase">{{ t('climateForm.totals.distanceTitle') }}</div>
        <div class="text-3xl mt-1 text-gray-700 italic">{{ totalDistance }} km</div>
        <div v-if="globalRoundTrip && totalDistance" class="text-[11px] text-gray-400 mt-1">{{ t('climateForm.totals.oneWayPrefixDistance') }} {{ Math.round(totalDistance/2) }} km</div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border text-center flex flex-col justify-center">
        <div class="text-sm text-gray-600 uppercase">{{ t('climateForm.totals.co2Title') }}</div>
        <div class="text-3xl mt-1 text-gray-700 italic">{{ totalCO2 }} kg</div>
        <div v-if="globalRoundTrip && totalCO2" class="text-[11px] text-gray-400 mt-1">{{ t('climateForm.totals.oneWayPrefixCO2') }} {{ Math.round(totalCO2/2) }} kg</div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border flex flex-col justify-center items-center gap-2">
        <label class="text-sm font-medium text-gray-700">{{ t('climateForm.roundTrip.label') }}</label>
        <button type="button" @click="globalRoundTrip = !globalRoundTrip"
          class="px-4 py-2 rounded-md text-sm font-medium border transition"
          :class="globalRoundTrip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'">
          {{ globalRoundTrip ? t('climateForm.roundTrip.yes') : t('climateForm.roundTrip.no') }}
        </button>
        <p class="text-[11px] text-gray-500 text-center">{{ t('climateForm.roundTrip.hint') }}</p>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border flex flex-col justify-center items-center gap-2 relative">
        <p class="text-xs text-gray-500 text-center">{{ t('climateForm.actions.addLegLabel') }}</p>
        <button type="button" @click="addLeg" :disabled="!canAddLeg"
          class="px-4 py-2 rounded-md text-sm font-medium border transition"
          :class="canAddLeg ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'">
          {{ t('climateForm.actions.addLegButton') }}
        </button>
      </div>
    </div>

    <!-- Legs -->
    <div class="space-y-10">
      <div v-for="leg in legs" :key="leg.id" class="bg-white border border-blue-300 rounded-md shadow-sm p-6 relative">
        <div class="absolute -top-4 left-4 bg-white text-blue-600 px-2 font-semibold border border-blue-300 rounded-full shadow text-sm">
          {{ leg.id }}
        </div>
        <div class="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <h3 class="text-lg font-semibold">{{ t('climateForm.legLabel') }} {{ leg.id }}</h3>
          <div class="flex items-center gap-3">
            <button v-if="legs.length > 1" @click="removeLeg(leg.id)" class="text-xs text-red-600 hover:underline">{{ t('climateForm.history.remove') }}</button>
            <button v-if="leg.id === legs.length" @click="addLeg" :disabled="!canAddLeg"
              class="text-xs px-3 py-1 rounded-md border transition relative"
              :class="canAddLeg ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'">
              {{ t('climateForm.actions.addLegButton') }}
            </button>
          </div>
        </div>
        <div class="grid md:grid-cols-5 gap-6 mb-4">
          <div class="md:col-span-1">
            <label class="block mb-1 text-sm font-medium text-gray-700">{{ t('climateForm.history.modeLabel') }}</label>
            <select v-model="leg.mode" class="w-full border border-gray-300 rounded-md px-3 py-4.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Avion</option>
              <option>Train</option>
           <!--  <option>RER</option>
              <option>Métro</option>
              <option>Voiture</option>
              <option>Taxi</option>
              <option>Bus</option>
              <option>Tramway</option>--> 
            </select>
          </div>
          <div class="md:col-span-2">
            <CityAutocomplete size="lg" label="Départ *" v-model="leg.from" />
          </div>
          <div class="md:col-span-2">
            <CityAutocomplete size="lg" label="Arrivée *" v-model="leg.to" />
          </div>
          
        </div>
        <div class="grid md:grid-cols-3 gap-6 mt-2">
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">{{ t('climateForm.actions.distanceTitle') }}</div>
            <div class="text-base font-semibold">{{ (legMetrics.find(m=>m.id===leg.id)?.distance) ?? '...' }} km</div>
            <div v-if="globalRoundTrip && legMetrics.find(m=>m.id===leg.id)?.rawDist" class="text-[10px] text-gray-400">{{ t('climateForm.actions.oneWayLegend') }} {{ legMetrics.find(m=>m.id===leg.id)?.rawDist }} km</div>
          </div>
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">{{ t('climateForm.actions.co2Title') }}</div>
            <div class="text-base font-semibold">{{ (legMetrics.find(m=>m.id===leg.id)?.co2) ?? '...' }} kg</div>
            <div v-if="globalRoundTrip && legMetrics.find(m=>m.id===leg.id)?.rawCO2" class="text-[10px] text-gray-400">{{ t('climateForm.actions.oneWayLegend') }} {{ legMetrics.find(m=>m.id===leg.id)?.rawCO2 }} kg</div>
          </div>
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">{{ t('climateForm.actions.priceTitle') || 'Prix' }}</div>
            <div class="text-base font-semibold">
              <div v-if="leg.mode === 'Train'">
                <input v-model.number="leg.price" type="number" min="0" step="0.01" placeholder="€" class="w-full border rounded px-2 py-1" />
                <div v-if="leg.price" class="text-sm text-gray-600 mt-1">€{{ leg.price }}</div>
              </div>
              <div v-else class="text-sm text-gray-600">{{ leg.price ? '€' + leg.price : '—' }}</div>
              <div v-if="globalRoundTrip && legMetrics.find(m=>m.id===leg.id)?.rawPrice" class="text-[10px] text-gray-400">{{ t('climateForm.actions.oneWayLegend') }} {{ legMetrics.find(m=>m.id===leg.id)?.rawPrice }} €</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save All Button -->
    <div class="flex justify-end mt-8" v-if="user">
      <button
        :disabled="!canSave || saving"
        @click="saveAll"
        class="px-6 py-3 rounded-md shadow font-medium transition flex items-center gap-2"
        :class="(canSave && !saving) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
      >
        <span v-if="!saving">{{ t('climateForm.actions.saveButton') }} ({{ legs.length }})</span>
        <span v-else class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
          Sauvegarde...
        </span>
      </button>
    </div>
    <div v-else class="text-right text-sm text-gray-500">Connectez-vous pour enregistrer vos liaisons.</div>
  </div>
</template>