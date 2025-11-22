<script setup>
import CityAutocomplete from '@/components/CityAutocomplete.vue'
import { useTravelSaver } from '@/composables/useTravelSaver'
import { geodesicDistance } from '@/composables/useDistanceCalculator'

const { user } = useAuth()
const { saveTravel } = useTravelSaver()

// Default city object for Paris (pre-filled to allow immediate calculations)
const defaultParis = { name: 'Paris, France', lat: '48.8566', lng: '2.3522', countryCode: 'FR' }

// Array of legs: each leg has from, to, mode
const legs = ref([
  { id: 1, from: defaultParis, to: null, mode: 'Avion' }
])

// Global Aller-Retour toggle (applies to all computations)
const globalRoundTrip = ref(false)

// Distance + CO2 computation helpers (replicates logic from useTravelCalculator)
function computeRawDistance(leg) {
  const from = leg.from
  const to = leg.to
  if (!from || !to || typeof from !== 'object' || typeof to !== 'object') return null
  let dist = geodesicDistance(
    parseFloat(from.lat),
    parseFloat(from.lng),
    parseFloat(to.lat),
    parseFloat(to.lng)
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

// Reactive maps for metrics
const legMetrics = computed(() => {
  return legs.value.map(l => {
    const rawDist = computeRawDistance(l)
    const rawCO2 = computeCO2(l, rawDist)
    const distance = rawDist ? (globalRoundTrip.value ? rawDist * 2 : rawDist) : null
    const co2 = rawCO2 ? (globalRoundTrip.value ? rawCO2 * 2 : rawCO2) : null
    return { id: l.id, distance, co2, rawDist, rawCO2 }
  })
})

const totalDistance = computed(() => legMetrics.value.reduce((sum, m) => sum + (m.distance || 0), 0))
const totalCO2 = computed(() => legMetrics.value.reduce((sum, m) => sum + (m.co2 || 0), 0))

function addLeg() {
  const last = legs.value[legs.value.length - 1]
  legs.value.push({
    id: legs.value.length + 1,
    from: (typeof last.to === 'object' && last.to) ? last.to : defaultParis,
    to: null,
    mode: last.mode
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

async function saveAll() {
  if (!user.value) return
  for (const leg of legs.value) {
    const metrics = legMetrics.value.find(m => m.id === leg.id)
    if (!metrics?.distance || !metrics?.co2) continue
    await saveTravel({
      traveler: user.value?.data.id || '',
      departure: leg.from?.name || '',
      final: leg.to?.name || '',
      distanceKm: metrics.distance,
      co2EmissionKg: metrics.co2,
      transport_mode: leg.mode + (globalRoundTrip.value ? ' (Aller-Retour)' : ''),
    })
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-8 space-y-10">

    <!-- Info Box -->
    <div class="bg-gray-100 border border-gray-300 p-4 rounded-md flex items-start gap-4">
      <div class="text-blue-500 text-xl">ℹ️</div>
      <div class="text-sm">
        <p class="font-semibold">Simulateur de vos déplacements professionnels</p>
        <p>
          Veuillez saisir la ville de départ, de destination ainsi que le mode de déplacement pour chaque étape de votre voyage, l'une après l'autre.
          Les calculs sont réalisés avec la méthode GES 1point5.
        </p>
      </div>
    </div>

    <!-- Totals Panel -->
    <div class="grid md:grid-cols-4 gap-6 items-stretch">
      <div class="bg-white shadow-md rounded-lg p-4 border text-center flex flex-col justify-center">
        <div class="text-sm text-gray-600 uppercase">Distance Totale</div>
        <div class="text-3xl mt-1 text-gray-700 italic">{{ totalDistance }} km</div>
        <div v-if="globalRoundTrip && totalDistance" class="text-[11px] text-gray-400 mt-1">(Aller simple total ≈ {{ Math.round(totalDistance/2) }} km)</div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border text-center flex flex-col justify-center">
        <div class="text-sm text-gray-600 uppercase">CO₂ Total</div>
        <div class="text-3xl mt-1 text-gray-700 italic">{{ totalCO2 }} kg</div>
        <div v-if="globalRoundTrip && totalCO2" class="text-[11px] text-gray-400 mt-1">(Aller simple total ≈ {{ Math.round(totalCO2/2) }} kg)</div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border flex flex-col justify-center items-center gap-2">
        <label class="text-sm font-medium text-gray-700">Aller-Retour Global</label>
        <button type="button" @click="globalRoundTrip = !globalRoundTrip"
          class="px-4 py-2 rounded-md text-sm font-medium border transition"
          :class="globalRoundTrip ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'">
          {{ globalRoundTrip ? 'Oui' : 'Non' }}
        </button>
        <p class="text-[11px] text-gray-500 text-center">Double toutes les distances & CO₂.</p>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border flex flex-col justify-center items-center gap-2 relative">
        <p class="text-xs text-gray-500 text-center">Ajouter des liaisons.</p>
        <button type="button" @click="addLeg" :disabled="!canAddLeg"
          class="px-4 py-2 rounded-md text-sm font-medium border transition"
          :class="canAddLeg ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'">
          ➕ Ajouter
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
          <h3 class="text-lg font-semibold">Liaison {{ leg.id }}</h3>
          <div class="flex items-center gap-3">
            <button v-if="legs.length > 1" @click="removeLeg(leg.id)" class="text-xs text-red-600 hover:underline">Retirer</button>
            <button v-if="leg.id === legs.length" @click="addLeg" :disabled="!canAddLeg"
              class="text-xs px-3 py-1 rounded-md border transition relative"
              :class="canAddLeg ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'">
              ➕ Ajouter
            </button>
          </div>
        </div>
        <div class="grid md:grid-cols-5 gap-6 mb-4">
          <div class="md:col-span-1">
            <label class="block mb-1 text-sm font-medium text-gray-700">Mode *</label>
            <select v-model="leg.mode" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Avion</option>
              <option>Train</option>
              <option>RER</option>
              <option>Métro</option>
              <option>Voiture</option>
              <option>Taxi</option>
              <option>Bus</option>
              <option>Tramway</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <CityAutocomplete size="lg" label="Départ *" v-model="leg.from" />
          </div>
          <div class="md:col-span-2">
            <CityAutocomplete size="lg" label="Arrivée *" v-model="leg.to" />
          </div>
          
        </div>
        <div class="grid md:grid-cols-2 gap-6 mt-2">
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">Distance</div>
            <div class="text-base font-semibold">{{ (legMetrics.find(m=>m.id===leg.id)?.distance) ?? '...' }} km</div>
            <div v-if="globalRoundTrip && legMetrics.find(m=>m.id===leg.id)?.rawDist" class="text-[10px] text-gray-400">Aller simple: {{ legMetrics.find(m=>m.id===leg.id)?.rawDist }} km</div>
          </div>
          <div class="border rounded-md p-3 bg-gray-50">
            <div class="text-[11px] uppercase text-gray-500">CO₂</div>
            <div class="text-base font-semibold">{{ (legMetrics.find(m=>m.id===leg.id)?.co2) ?? '...' }} kg</div>
            <div v-if="globalRoundTrip && legMetrics.find(m=>m.id===leg.id)?.rawCO2" class="text-[10px] text-gray-400">Aller simple: {{ legMetrics.find(m=>m.id===leg.id)?.rawCO2 }} kg</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save All Button -->
    <div class="flex justify-end mt-8">
      <button
        :disabled="!user || totalDistance === 0"
        @click="saveAll"
        class="px-6 py-3 rounded-md shadow font-medium transition"
        :class="(user && totalDistance>0) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
      >
        💾 Enregistrer toutes les liaisons ({{ legs.length }})
      </button>
    </div>
  </div>
</template>