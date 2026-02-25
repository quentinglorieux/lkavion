<script setup>
import { useAuth } from '@/composables/useAuth'
import { useReparations } from '@/composables/useReparations'
import { useDirectus } from '@/composables/useDirectus'

const { user, token } = useAuth()
const { base } = useDirectus()
// Optional: Ensure only specific roles (e.g., admin) can access this page
// if (user.value?.data?.role?.name !== 'Administrator') {
//   navigateTo('/dashboard')
// }

const { fetchAllReparations, removeReparation } = useReparations()

const allReparations = ref([])
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const columns = [
  { accessorKey: 'instrument', header: 'Instrument' },
  { accessorKey: 'user_created', header: 'Demandeur' },
  { accessorKey: 'team', header: 'Équipe' },
  { accessorKey: 'company', header: 'Fournisseur' },
  { accessorKey: 'justification', header: 'Justification' },
  { accessorKey: 'price', header: 'Prix économisé (€)' },
  { id: 'quote', header: 'Devis' },
  { accessorKey: 'date_created', header: 'Date' },
  { id: 'actions' }
]

const loadReparations = async () => {
  allReparations.value = await fetchAllReparations()
}

const openConfirmDelete = (item) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const doDelete = async () => {
  if (!itemToDelete.value) return
  const { ok } = await removeReparation(itemToDelete.value.id)
  if (ok) {
    await loadReparations()
  }
  isDeleteModalOpen.value = false
  itemToDelete.value = null
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}

const router = useRouter()
onMounted(() => {
  if (!user.value) {
    router.push('/')
  } else {
    loadReparations()
  }
})
</script>

<template>
  <div class="px-6 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Admin - Module Réparations
        </h1>
        <p class="text-gray-600 mt-2">
          Vue d'ensemble de toutes les demandes de réparations pour les remboursements de fin d'année.
        </p>
      </div>
      <UButton 
        to="/dashboard"
        color="neutral" 
        variant="ghost" 
        icon="i-lucide-arrow-left"
        label="Retour au tableau de bord"
      />
    </div>

    <UCard class="border border-gray-100 shadow-sm">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UIcon name="i-lucide-database" class="w-5 h-5 text-gray-500" />
            Toutes les demandes
          </h2>
          <UButton 
            color="primary" 
            variant="ghost" 
            icon="i-lucide-download" 
            label="Exporter CSV"
            class="hidden sm:flex"
            disabled
            title="Fonctionnalité à venir"
          />
        </div>
      </template>

      <div v-if="allReparations.length === 0" class="py-12 text-center text-gray-500">
        <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Aucune demande de réparation n'a été soumise pour le moment.</p>
      </div>

      <UTable v-else :data="allReparations" :columns="columns" class="w-full">
        <!-- Demandeur Cell -->
        <template #user_created-cell="{ row }">
          <span class="font-medium text-gray-900">
            {{ row.original.user_created?.first_name }} {{ row.original.user_created?.last_name }}
          </span>
        </template>
        
        <!-- Price Cell -->
        <template #price-cell="{ row }">
          <span class="font-semibold text-emerald-600">
            €{{ Number(row.original.price).toFixed(2) }}
          </span>
        </template>
        
        <!-- Date Cell -->
        <template #date_created-cell="{ row }">
          {{ formatDate(row.original.date_created) }}
        </template>

        <!-- Justification Tooltip -->
        <template #justification-cell="{ row }">
          <UTooltip :text="row.original.justification" class="max-w-xs cursor-help">
            <span class="truncate block max-w-[150px] text-gray-600">
              {{ row.original.justification }}
            </span>
          </UTooltip>
        </template>
        
        <!-- Quote Cell -->
        <template #quote-cell="{ row }">
          <UButton 
            v-if="row.original.quote"
            :to="`/api/assets/${row.original.quote?.id || row.original.quote}`"
            target="_blank"
            icon="i-lucide-paperclip"
            color="gray"
            variant="ghost"
            size="sm"
            class="rounded-full"
            title="Voir le devis/facture"
          />
          <span v-else class="text-gray-400 text-sm">—</span>
        </template>

        <!-- Actions Cell -->
        <template #actions-cell="{ row }">
          <div class="flex justify-end pr-2">
            <UButton 
              icon="i-lucide-trash"
              color="error"
              variant="ghost"
              @click="openConfirmDelete(row.original)" 
              class="rounded-full"
              title="Supprimer cette demande (Admin)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 space-y-6">
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
              🗑️
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Supprimer la demande</h3>
              <p class="text-sm text-gray-600 mt-2">
                Supprimer la déclaration de <strong>{{ itemToDelete?.instrument }}</strong> par <strong>{{ itemToDelete?.user_created?.first_name }} {{ itemToDelete?.user_created?.last_name }}</strong> ?
              </p>
            </div>
          </div>
          
          <div class="flex flex-col gap-3 pt-4 border-t border-gray-100">
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
