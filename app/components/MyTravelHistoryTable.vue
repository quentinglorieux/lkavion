<script setup>
import { useTravelSaver } from '@/composables/useTravelSaver'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['refresh'])

const { deleteTravel } = useTravelSaver()
const { t } = useI18n()

// For hydration stability
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

// Delete modal state
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

// Helper to format dates consistently
function formatTravelDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
}

// Logic for modifiable check
const isModifiable = (item) => {
  if (!item.date_created) return true
  const now = new Date()
  const created = new Date(item.date_created)
  const diff = now.getTime() - created.getTime()
  return diff < 1000 * 60 * 60 * 24 // 24 hours
}

function openConfirmDelete(item) {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

async function doDelete() {
  if (!itemToDelete.value) return
  const { ok } = await deleteTravel(itemToDelete.value.id)
  isDeleteModalOpen.value = false
  if (ok) {
    emit('refresh')
  }
  itemToDelete.value = null
}

const transportIcons = {
  Avion: '✈️', Train: '🚆', Voiture: '🚗', Métro: '🚇',
  Bus: '🚌', Taxi: '🚕', Tramway: '🚊', RER: '🚈'
}

const columns = [
  { accessorKey: 'date_travel', header: 'Date' },
  { accessorKey: 'departure', header: 'Départ' },
  { accessorKey: 'final', header: 'Arrivée' },
  { accessorKey: 'transport_mode', header: 'Mode' },
  { accessorKey: 'distance', header: 'Dist (km)' },
  { accessorKey: 'co2', header: 'CO₂ (kg)' },
  { accessorKey: 'price', header: 'Prix (€)' },
  { accessorKey: 'visitor', header: 'Visiteur' },
  { id: 'actions', header: '' }
]
</script>

<template>
  <div class="w-full overflow-x-auto">
    <UTable :data="data" :columns="columns" class="max-w-5xl w-full">
      <!-- Custom Date Cell -->
      <template #date_travel-cell="{ row }">
        {{ formatTravelDate(row.original.date_travel) }}
      </template>

      <!-- Custom Mode Cell -->
      <template #transport_mode-cell="{ row }">
        {{ transportIcons[row.original.transport_mode] || '🚙' }} {{ row.original.transport_mode }}
      </template>

      <!-- Custom Distance Cell -->
      <template #distance-cell="{ row }">
        {{ row.original.distance }} km
      </template>

      <!-- Custom CO2 Cell -->
      <template #co2-cell="{ row }">
        {{ row.original.co2 }} kg
      </template>

      <!-- Custom Price Cell -->
      <template #price-cell="{ row }">
        <span v-if="row.original.transport_mode === 'Train' && row.original.price">
          €{{ Number(row.original.price).toFixed(2) }}
        </span>
        <span v-else>—</span>
      </template>

      <!-- Custom Visitor Cell -->
      <template #visitor-cell="{ row }">
        <template v-if="row.original.visitor">
          {{ row.original.visitor_name || '👤' }}
        </template>
        <template v-else>—</template>
      </template>

      <!-- Custom Actions Cell -->
      <template #actions-cell="{ row }">
        <div class="flex justify-end pr-2">
          <!-- ClientOnly wrapper around the logic button to prevent hydration mismatch -->
          <ClientOnly>
            <UButton 
              v-if="isModifiable(row.original)"
              icon="i-lucide-trash"
              color="error"
              variant="ghost"
              @click="openConfirmDelete(row.original)" 
              class="rounded-full h-8 w-8 flex items-center justify-center p-0"
              title="Supprimer ce trajet"
            />
            <template #placeholder>
              <div class="w-8 h-8"></div>
            </template>
          </ClientOnly>
        </div>
      </template>
    </UTable>

    <!-- Delete Confirmation Modal (Custom centered implementation to ensure correct positioning) -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 space-y-6">
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
              🗑️
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Supprimer le trajet</h3>
              <p class="text-sm text-gray-600 mt-2">
                Voulez-vous vraiment supprimer ce trajet de <strong>{{ itemToDelete?.departure }}</strong> vers <strong>{{ itemToDelete?.final }}</strong> ?
              </p>
            </div>
          </div>
          
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 shadow-sm">
            <span class="text-amber-500 text-lg">💡</span>
            <div class="space-y-1">
              <p class="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Rappel de sécurité</p>
              <p class="text-[11px] text-amber-800 leading-normal">
                Les trajets ne peuvent être supprimés que durant <strong>24 heures</strong>. Passé ce délai, ils sont définitivement archivés.
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3 pt-2">
            <UButton 
              label="Supprimer définitivement" 
              color="error" 
              icon="i-lucide-trash"
              size="lg"
              block
              @click="doDelete" 
            />
            <UButton 
              label="Annuler" 
              color="neutral" 
              variant="ghost" 
              size="lg"
              block
              @click="isDeleteModalOpen = false" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>