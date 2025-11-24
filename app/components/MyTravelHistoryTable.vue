<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const columns = [
  {
    accessorKey: 'departure',
    header: 'Départ'
  },
  {
    accessorKey: 'final',
    header: 'Arrivée'
  },
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
    accessorKey: 'price',
    header: 'Prix (€)',
    cell: ({ row }) => {
      const mode = row.getValue('transport_mode')
      const price = row.getValue('price')
      if (mode === 'Train' && price != null && price !== '' && !Number.isNaN(Number(price))) {
        return `€${Number(price).toFixed(2)}`
      }
      return '—'
    }
  }
]
</script>

<template>
  <UTable
    :data="data"
    :columns="columns"
    class="max-w-5xl w-full"
  />
</template>