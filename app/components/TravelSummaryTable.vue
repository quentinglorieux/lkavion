<script setup>
import { h } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const columns = [
  {
    accessorKey: 'transport_mode',
    header: 'Mode de transport',
    cell: ({ row }) => {
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

      return `${icons[row.getValue('transport_mode')] || '🚙'} ${row.getValue('transport_mode')}`
    }
  },
  {
    accessorKey: 'distance',
    header: 'Distance (km)',
    cell: ({ row }) => `${row.getValue('distance')} km`
  },
  {
    accessorKey: 'co2',
    header: 'CO₂ (kg)',
    cell: ({ row }) => `${row.getValue('co2')} kg`
  },
  {
    accessorKey: 'count',
    header: 'Nombre de trajets',
    cell: ({ row }) => `${row.original.count ?? 'nan'}`

  },
  {
    id: 'cost',
    header: 'Coût estimé (€)',
    cell: ({ row }) => {
      const co2 = row.getValue('co2') || 0
      const tons = co2 / 1000
      let cost = 0
      if (tons > 2) {
        cost = 1000 * 1 + (tons - 2) * 1000 * 2
      } else if (tons > 1) {
        cost = 1000 * 1
      }
      return h('span', { class: 'font-medium text-right' }, `${cost.toFixed(0)} €`)
    }
  }
]
</script>

<template>
  <UTable :data="data" :columns="columns" sticky class="max-w-2xl w-full" />
</template>