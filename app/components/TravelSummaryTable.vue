<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const icons = {
  Avion: '✈️',
  Train: '🚆',
  Voiture: '🚗',
  Métro: '🚇',
  Bus: '🚌',
  Taxi: '🚕',
  Tramway: '🚊',
  RER: '🚈'
}

function getIcon(mode) {
  return icons[mode] || '🚙'
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in data" :key="item.transport_mode"
      class="rounded-lg border shadow-sm p-5 bg-white flex flex-col gap-2">
      <div class="flex items-center gap-2 font-semibold text-lg border-b pb-2 mb-1">
        <span>{{ getIcon(item.transport_mode) }}</span>
        <span>{{ item.transport_mode }}</span>
        <span class="ml-auto text-xs font-normal text-gray-500 bg-white border px-2 py-0.5 rounded-full">{{ item.count
        }} trajet{{ item.count > 1 ? 's' : '' }}</span>
      </div>

      <div class="grid grid-cols-2 gap-y-2 text-sm">
        <div class="text-gray-600">Distance</div>
        <div class="text-right font-medium">{{ item.distance }} km</div>

        <div class="text-gray-600">CO₂</div>
        <div class="text-right font-medium">{{ item.co2 }} kg</div>

        <template v-if="item.transport_mode === 'Train' && item.price > 0">
          <div class="text-gray-600">Coût</div>
          <div class="text-right font-medium">{{ item.price.toFixed(2) }} €</div>
        </template>
      </div>
    </div>

    <div v-if="data.length === 0" class="text-sm text-gray-500 italic text-center py-4">
      Aucune donnée disponible.
    </div>
  </div>
</template>