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
    header: 'Trajet',
    cell: ({ row }) => `${row.original.count ?? 'nan'}`

  },
  {
    accessorKey: 'price',
    header: 'Coût (€)',
    cell: ({ row }) => {
      const mode = row.getValue('transport_mode')
      const price = row.getValue('price') || 0
      // Show actual aggregated price for Train, otherwise em dash.
      return h('span', { class: 'font-medium text-right' }, mode === 'Train' && price > 0 ? `${price.toFixed(2)} €` : '—')
    }
  }
]
</script>

<template>
  <UTable :data="data" :columns="columns" sticky class="max-w-3xl w-full" />
</template>