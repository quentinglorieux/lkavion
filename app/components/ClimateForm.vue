<script setup>
import CityAutocomplete from '@/components/CityAutocomplete.vue'
import { useTravelCalculator } from '@/composables/useTravelCalculator'
import { useTravelSaver } from '@/composables/useTravelSaver'
const { user } = useAuth()
const fromCity = ref('Paris, France')
const toCity = ref(null)
const mode = ref('Avion')

const { distanceKm, co2EmissionKg } = useTravelCalculator(fromCity, toCity, mode)
const { saveTravel } = useTravelSaver()

async function handleSave() {
  await saveTravel({
    traveler: user.value?.data.id || '', // Optional for now
    departure: fromCity.value?.name || '',
    final: toCity.value?.name || '',
    distanceKm: distanceKm.value,
    co2EmissionKg: co2EmissionKg.value,
    transport_mode: mode.value,
  })
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

    <!-- KPI Panels -->
    <div class="grid grid-cols-2 gap-6 text-center">
      <div class="bg-white shadow-md rounded-lg p-4 border">
        <div class="text-sm text-gray-600 uppercase">Distance Totale <span class="text-blue-600 text-xs">(km corrigés)</span></div>
        <div class="text-3xl mt-2 text-gray-700 italic">
          {{ distanceKm ? `${distanceKm} km` : '...' }}
        </div>
      </div>
      <div class="bg-white shadow-md rounded-lg p-4 border">
        <div class="text-sm text-gray-600 uppercase">Empreinte Carbone <span class="text-blue-600 text-xs">(kg eCO₂)</span></div>
        <div class="text-3xl mt-2 text-gray-700 italic">
          {{ co2EmissionKg ? `${co2EmissionKg} kg eCO₂` : '...' }}
        </div>
      </div>
    </div>

    <!-- Liaison Step Panel -->
    <div class="bg-white border border-blue-300 rounded-md shadow-sm p-6 relative">
      <!-- Step Number -->
      <div class="absolute -top-4 left-4 bg-white text-blue-600 px-2 font-semibold border border-blue-300 rounded-full shadow text-sm">
        1
      </div>

      <h3 class="text-lg font-semibold mb-4 border-b pb-2">Liaison 1</h3>

      <!-- Transport Mode -->
      <div class="mb-4">
        <label class="block mb-1 text-sm font-medium text-gray-700">Mode de transport *</label>
        <select v-model="mode" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
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

      <!-- City Inputs -->
      <div class="grid grid-cols-2 gap-6">
        <CityAutocomplete label="Ville de départ *" v-model="fromCity" />
        <CityAutocomplete label="Ville d’arrivée *" v-model="toCity" />
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end mt-8">
      <button v-if="distanceKm && co2EmissionKg && user"
        @click="handleSave"
        class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow"
      >
        💾 Enregistrer ce déplacement !
      </button>
    </div>
  </div>
</template>