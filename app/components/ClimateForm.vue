<script setup>
import CityAutocomplete from '@/components/CityAutocomplete.vue'
import SuccessModal from '@/components/SuccessModal.vue'
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
  { id: 1, from: defaultParis, to: null, mode: 'Avion', price: null, date_travel: new Date().toISOString().split('T')[0] }
])

// Global Aller-Retour toggle (applies to all computations)
const globalRoundTrip = ref(false)
const visitor = ref(false)
const visitorName = ref('')

watch(visitor, (isVisitor) => {
  // Update first leg defaults if they match standard defaults
  if (legs.value.length > 0) {
    const firstLeg = legs.value[0]
    if (isVisitor) {
      // Force reset: From = ?, To = Paris
      firstLeg.from = undefined
      firstLeg.to = defaultParis
    } else {
      // Force reset: From = Paris, To = ?
      firstLeg.from = defaultParis
      firstLeg.to = undefined
    }
  }
})


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

// Reactive maps for metrics - always calculate one-way values
const legMetrics = computed(() => {
  return legs.value.map(l => {
    const distance = computeRawDistance(l)
    const co2 = computeCO2(l, distance)
    const rawPrice = (l.price !== null && l.price !== '' && !Number.isNaN(Number(l.price))) ? Number(l.price) : null
    const price = rawPrice != null ? Math.round(rawPrice * 100) / 100 : null
    return { id: l.id, distance, co2, price }
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
    mode: last.mode,
    price: null,
    date_travel: last.date_travel || new Date().toISOString().split('T')[0]
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
const showSuccess = ref(false)
const saveSuccessCount = ref(0)
const saveFailCount = ref(0)
const successCodes = ref([])

async function saveAll() {
  if (!user.value || saving.value) return
  saving.value = true
  saveSuccessCount.value = 0
  saveFailCount.value = 0
  successCodes.value = []

  const tripUuid = generateTripUuid()

  for (const leg of legs.value) {
    const metrics = legMetrics.value.find(m => m.id === leg.id)
    if (!metrics?.distance || !metrics?.co2) continue

    // Generate random 6-digit code for this leg
    const legCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Price handling: if round trip, split the entered price in half for each direction
    const pricePerDirection = metrics.price != null && globalRoundTrip.value
      ? Math.round((metrics.price / 2) * 100) / 100
      : metrics.price

    // Save outbound trip (A → B)
    const outboundResult = await saveTravel({
      traveler: user.value?.data.id || '',
      departure: leg.from?.name || '',
      final: leg.to?.name || '',
      distanceKm: metrics.distance,
      co2EmissionKg: metrics.co2,
      price: pricePerDirection,
      transport_mode: leg.mode,
      tripUuid,
      date_travel: leg.date_travel,
      visitor: visitor.value,
      visitor_name: visitor.value ? visitorName.value : null
    }, { silent: true })

    if (outboundResult.ok) saveSuccessCount.value++
    else saveFailCount.value++

    // If round trip, save return trip (B → A)
    // Only save if both cities are present
    if (globalRoundTrip.value && leg.from && leg.to) {
      const returnResult = await saveTravel({
        traveler: user.value?.data.id || '',
        departure: leg.to?.name || '',  // Swapped: destination becomes departure
        final: leg.from?.name || '',    // Swapped: departure becomes destination
        distanceKm: metrics.distance,   // Same one-way distance
        co2EmissionKg: metrics.co2,     // Same one-way CO2
        price: pricePerDirection,       // Same split price
        transport_mode: leg.mode,
        tripUuid,                       // Same trip UUID to group them
        date_travel: leg.date_travel,
        visitor: visitor.value,
        visitor_name: visitor.value ? visitorName.value : null
      }, { silent: true })

      if (returnResult.ok) saveSuccessCount.value++
      else saveFailCount.value++
    }

    // Capture code if at least one part saved successfully
    if (outboundResult.ok || (globalRoundTrip.value && returnResult?.ok)) {
      successCodes.value.push({ legId: leg.id, code: legCode })
    }
  }

  saving.value = false
  if (saveSuccessCount.value > 0 || saveFailCount.value > 0) {
    showSuccess.value = true
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-8 space-y-10">
    <SuccessModal :show="showSuccess" :success-count="saveSuccessCount" :fail-count="saveFailCount"
      :codes="successCodes" @close="showSuccess = false" />

    <!-- Info Box -->
    <div class="bg-gray-100 border border-gray-300 p-4 rounded-md flex items-start gap-4">
      <div class="text-blue-500 text-xl">ℹ️</div>
      <div class="text-sm">
        <p class="font-semibold">{{ t('climateForm.infoTitle') }}</p>
        <p>{{ t('climateForm.infoBody') }}</p>
      </div>
    </div>

    <!-- Totals Panel -->
    <div class="grid md:grid-cols-5 gap-6 items-stretch">
      <div class="bg-white shadow-md rounded-lg p-4 border text-center flex flex-col justify-center">
        <div class="text-sm text-gray-600 uppercase">{{ t('climateForm.totals.distanceTitle') }}</div>
        <div class="text-3xl mt-1 text-gray-700 italic">{{ totalDistance }} km</div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border text-center flex flex-col justify-center">
        <div class="text-sm text-gray-600 uppercase">{{ t('climateForm.totals.co2Title') }}</div>
        <div class="text-3xl mt-1 text-gray-700 italic">{{ totalCO2 }} kg</div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border flex flex-col justify-center items-center gap-2">
        <label class="text-sm font-medium text-gray-700">{{ t('climateForm.roundTrip.label') }}</label>
        <button type="button" @click="globalRoundTrip = !globalRoundTrip"
          class="px-4 py-2 rounded-md text-sm font-medium border transition"
          :class="globalRoundTrip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'">
          {{ globalRoundTrip ? t('climateForm.roundTrip.yes') : t('climateForm.roundTrip.no') }}
        </button>
        <p class="text-[11px] text-gray-500 text-center">{{ t('climateForm.roundTrip.hint') }}</p>
        <p v-if="globalRoundTrip" class="text-[10px] text-indigo-600 text-center font-semibold">💡 Saisir le prix TOTAL
          aller-retour</p>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border flex flex-col justify-center items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Visiteur</label>
        <button type="button" @click="visitor = !visitor"
          class="px-4 py-2 rounded-md text-sm font-medium border transition"
          :class="visitor ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'">
          {{ visitor ? 'Oui' : 'Non' }}
        </button>
        <p class="text-[11px] text-gray-500 text-center">Invité par le labo ?</p>
      </div>

      <div v-if="visitor"
        class="bg-indigo-50 shadow-md rounded-lg p-4 border border-indigo-200 flex flex-col justify-center gap-2">
        <label class="text-xs font-semibold uppercase text-indigo-700">Nom du visiteur</label>
        <input type="text" v-model="visitorName" placeholder="ex: Jean Dupont"
          class="w-full text-sm border-gray-300 rounded-md p-1.5" />
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
        <div
          class="absolute -top-4 left-4 bg-white text-blue-600 px-2 font-semibold border border-blue-300 rounded-full shadow text-sm">
          {{ leg.id }}
        </div>
        <div class="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <h3 class="text-lg font-semibold">{{ t('climateForm.legLabel') }} {{ leg.id }}</h3>
          <div class="flex items-center gap-3">
            <button v-if="legs.length > 1" @click="removeLeg(leg.id)" class="text-xs text-red-600 hover:underline">{{
              t('climateForm.history.remove') }}</button>
            <button v-if="leg.id === legs.length" @click="addLeg" :disabled="!canAddLeg"
              class="text-xs px-3 py-1 rounded-md border transition relative"
              :class="canAddLeg ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'">
              {{ t('climateForm.actions.addLegButton') }}
            </button>
          </div>
        </div>
        <div class="grid md:grid-cols-9 gap-6 mb-4">
          <div class="md:col-span-2">
            <label class="block mb-1 text-sm font-medium text-gray-700">Date</label>
            <input type="date" v-model="leg.date_travel"
              class="w-full border border-gray-300 rounded-md px-3 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="md:col-span-1">
            <label class="block mb-1 text-sm font-medium text-gray-700">{{ t('climateForm.history.modeLabel') }}</label>
            <select v-model="leg.mode"
              class="w-full border border-gray-300 rounded-md px-3 py-4.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
          <div class="md:col-span-3">
            <CityAutocomplete size="lg" label="Départ *" v-model="leg.from" />
          </div>
          <div class="md:col-span-3">
            <CityAutocomplete size="lg" label="Arrivée *" v-model="leg.to" />
          </div>

        </div>
        <div class="grid md:grid-cols-3 gap-6 mt-2">
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">{{ t('climateForm.actions.distanceTitle') }}</div>
            <div class="text-base font-semibold">{{(legMetrics.find(m => m.id === leg.id)?.distance) ?? '...'}} km</div>
          </div>
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">{{ t('climateForm.actions.co2Title') }}</div>
            <div class="text-base font-semibold">{{(legMetrics.find(m => m.id === leg.id)?.co2) ?? '...'}} kg</div>
          </div>
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">{{ t('climateForm.actions.priceTitle') || 'Prix' }}</div>
            <div class="text-base font-semibold">
              <div v-if="leg.mode === 'Train'">
                <input v-model.number="leg.price" type="number" min="0" step="0.1"
                  :placeholder="globalRoundTrip ? '€ TOTAL Price A/R' : '€'" class="w-full border rounded px-2 py-1" />
                <div v-if="leg.price" class="text-sm text-gray-600 mt-1">€{{ leg.price }}</div>
              </div>
              <div v-else class="text-sm text-gray-600">{{ leg.price ? '€' + leg.price : '—' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save All Button -->
    <div class="flex justify-end mt-8" v-if="user">
      <button :disabled="!canSave || saving" @click="saveAll"
        class="px-6 py-3 rounded-md shadow font-medium transition flex items-center gap-2"
        :class="(canSave && !saving) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
        <span v-if="!saving">{{ t('climateForm.actions.saveButton') }} ({{ globalRoundTrip ? legs.length * 2 :
          legs.length }})</span>
        <span v-else class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Sauvegarde...
        </span>
      </button>
    </div>
    <div v-else class="text-right text-sm text-gray-500">Connectez-vous pour enregistrer vos liaisons.</div>
  </div>
</template>