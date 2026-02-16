<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { token, user, checkUser } = useAuth()
const router = useRouter()

const isAuthorized = ref(false)

onMounted(() => {
  checkUser()
})

// Access control check
watchEffect(() => {
  if (user.value) {
    const userRole = user.value?.data?.role
    const roleId = typeof userRole === 'object' ? userRole?.id : userRole
    const adminRoles = ['35e06b60-fb46-4893-b19d-38c768a0b41c', 'd29315b3-f1bd-4c57-ba83-ee463ce8433d']
    isAuthorized.value = adminRoles.includes(roleId)
  }
})

const { data: allTravels, pending, error } = await useFetch('/api/v1/admin/travels', {
  headers: {
    Authorization: `Bearer ${token.value}`
  }
})

// Global Filter
const q = ref('')

const filteredTravels = computed(() => {
  if (!allTravels.value) return []
  if (!q.value) return allTravels.value
  
  const search = q.value.toLowerCase()
  
  return allTravels.value.filter(travel => {
    const travelerName = travel.traveler ? `${travel.traveler.first_name} ${travel.traveler.last_name}` : ''
    const visitorName = travel.visitor_name || ''
    const departure = travel.departure || ''
    const arrival = travel.final || ''
    const mode = travel.transport_mode || ''
    
    return travelerName.toLowerCase().includes(search) || 
           visitorName.toLowerCase().includes(search) ||
           departure.toLowerCase().includes(search) ||
           arrival.toLowerCase().includes(search) ||
           mode.toLowerCase().includes(search)
  })
})


const columns = [
  {
    id: 'index',
    accessorKey: 'index',
    header: '#',
    cell: ({ row }) => row.index + 1,
    meta: {
      class: {
        th: 'min-w-[50px] text-center',
        td: 'text-center text-gray-400'
      }
    }
  },
  {
    id: 'date_travel',
    accessorKey: 'date_travel',
    header: 'Date',
    cell: ({ row }) => {
      const d = row.original.date_travel
      if (!d) return '—'
      const date = new Date(d)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },
    meta: {
      class: {
        th: 'min-w-[120px]'
      }
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Voyageur',
    cell: ({ row }) => {
      const travel = row.original
      if (travel.visitor) return `[V] ${travel.visitor_name || 'Inconnu'}`
      const firstName = travel.traveler?.first_name || travel.first_name
      const lastName = travel.traveler?.last_name || travel.last_name
      if (firstName || lastName) return `${firstName || ''} ${lastName || ''}`.trim()
      return '—'
    },
    meta: {
      class: {
        th: 'min-w-[200px]'
      }
    }
  },
  {
    id: 'transport_mode',
    accessorKey: 'transport_mode',
    header: 'Mode',
    cell: ({ row }) => {
      const mode = row.original.transport_mode || row.original.type || '?'
      const icons = {
        Avion: '✈️', Train: '🚆', Voiture: '🚗', Métro: '🚇',
        Bus: '🚌', Taxi: '🚕', Tramway: '🚊', RER: '🚈'
      }
      return `${icons[mode] || '🚙'} ${mode}`
    },
    meta: {
      class: {
        th: 'min-w-[140px]'
      }
    }
  },
  {
    id: 'itinerary',
    accessorKey: 'itinerary',
    header: 'Itinéraire',
    cell: ({ row }) => {
      const dep = row.original.departure || '?'
      const arr = row.original.final || '?'
      return `${dep} → ${arr}`
    },
    meta: {
      class: {
        th: 'min-w-[200px] w-full'
      }
    }
  },
  {
    id: 'date_created',
    accessorKey: 'date_created',
    header: 'Ajouté le',
    cell: ({ row }) => {
      const d = row.original.date_created
      if (!d) return '—'
      const date = new Date(d)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    },
    meta: {
      class: {
        th: 'text-right min-w-[100px]',
        td: 'text-right text-gray-400 font-mono text-xs'
      }
    }
  }
]
</script>

<template>
  <UContainer class="max-w-7xl mx-auto px-6 py-10 space-y-8"> 
    <!-- Clean Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 font-display">Administration</h1>
      <UButton to="/dashboard" color="gray" variant="ghost" icon="i-heroicons-arrow-left">
        Retour
      </UButton>
    </div>

    <!-- Error state -->
    <UAlert v-if="error" color="red" variant="soft" icon="i-heroicons-exclamation-triangle"
            :title="`Erreur : ${error.statusMessage}`" :description="error.data" />

    <!-- Table Card -->
    <UCard v-else class="overflow-hidden shadow-none border-gray-200" :ui="{ body: 'p-0', header: 'p-0' }">
      <!-- Search Bar Row -->
      <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <UInput v-model="q" 
                placeholder="Rechercher..." 
                class="w-72"
                :ui="{ 
                  base: 'pl-10 h-9',
                  leading: 'flex items-center pl-3'
                }">
          <template #leading>
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400" />
          </template>
        </UInput>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {{ filteredTravels.length }} entrées
          </span>
        </div>
      </div>

      <!-- Table Content Section -->
      <div v-if="pending" class="p-20 flex flex-col items-center justify-center space-y-4">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary" />
        <span class="text-gray-400">Chargement...</span>
      </div>

      <div v-else class="relative overflow-x-auto">
        <UTable :data="filteredTravels"
                :columns="columns"
                sticky
                class="w-full min-w-full"
                :ui="{ 
                  th: 'bg-gray-400/70 px-4 py-2 text-xs font-bold uppercase text-gray-900 tracking-wider border-b border-gray-200 text-left whitespace-nowrap',
                  td: 'px-4 py-1.5 text-sm text-gray-700 border-b border-gray-200 last:border-0',
                  tr: 'odd:bg-white even:bg-gray-300/40 hover:bg-blue-300/40 transition-colors'
                }" />
                
        <!-- Empty State -->
        <div v-if="filteredTravels.length === 0" 
             class="text-center py-20 bg-gray-50/10">
          <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 text-gray-300 mx-auto" />
          <h3 class="mt-4 font-medium text-gray-900 text-sm">Aucun résultat trouvé</h3>
          <p class="text-xs text-gray-500 mt-1">Essayez de modifier votre recherche.</p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<style scoped>
@reference "tailwindcss";
</style>
