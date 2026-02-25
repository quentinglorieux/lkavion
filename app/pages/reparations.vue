<script setup>
import { useAuth } from '@/composables/useAuth'
import { useReparations } from '@/composables/useReparations'
import { useDirectus } from '@/composables/useDirectus'
import { useI18n } from '@/composables/useI18n'

const { user } = useAuth()
const { base } = useDirectus()
const { fetchMyReparations, saveReparation, removeReparation, uploadQuote } = useReparations()
const { t } = useI18n()

const myReparations = ref([])
const isSubmitting = ref(false)
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

// Form state
const state = reactive({
  instrument: '',
  company: '',
  team: '',
  justification: '',
  price: undefined
})
const quoteFile = shallowRef(null)

const columns = computed(() => [
  { accessorKey: 'instrument', header: t('reparations.history.columns.instrument') },
  { accessorKey: 'company', header: t('reparations.history.columns.company') },
  { accessorKey: 'team', header: t('reparations.history.columns.team') },
  { accessorKey: 'price', header: t('reparations.history.columns.price') },
  { id: 'quote', header: t('reparations.history.columns.quote') },
  { accessorKey: 'date_created', header: t('reparations.history.columns.date') },
  { id: 'actions' }
])

const loadReparations = async () => {
  if (user.value) {
    myReparations.value = await fetchMyReparations()
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    quoteFile.value = file
  }
}

const submitForm = async () => {
  if (!state.instrument || !state.justification || state.price <= 0) return
  
  isSubmitting.value = true
  
  let quoteId = null
  if (quoteFile.value) {
    const uploadRes = await uploadQuote(quoteFile.value)
    if (uploadRes.ok) {
      quoteId = uploadRes.data.id
    }
  }

  const { ok } = await saveReparation({
    instrument: state.instrument,
    company: state.company,
    team: state.team,
    justification: state.justification,
    price: state.price,
    quote: quoteId
  })
  
  isSubmitting.value = false

  if (ok) {
    // Reset form
    state.instrument = ''
    state.company = ''
    state.team = ''
    state.justification = ''
    state.price = undefined
    quoteFile.value = null
    // Reset file input explicitly
    const fileInput = document.getElementById('quote-upload')
    if (fileInput) fileInput.value = ''
    await loadReparations()
  }
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`
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
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
         {{ t('reparations.title') }}
        </h1>
        <p class="text-gray-600 mt-2">
          {{ t('reparations.description') }}
        </p>
      </div>
      <UButton 
        to="/"
        color="neutral" 
        variant="soft" 
        icon="i-lucide-arrow-left"
        :label="t('nav.home')"
      />
    </div>
    <div class="mb-6">
      <UAlert :title="t('reparations.alert.title')" :description="t('reparations.alert.description')" color="error" variant="soft" />
    </div>


    <!-- Formular section -->
    <UCard class="mb-12 border border-blue-100 shadow-lg shadow-blue-500/5">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="bg-blue-100 p-2 text-blue-700 rounded-lg">
            <UIcon name="i-lucide-wrench" class="w-5 h-5 flex-shrink-0" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ t('reparations.form.title') }}</h2>
            <p class="text-sm text-gray-500">
              {{ t('reparations.form.subtitle') }}
            </p>
           
          </div>
        </div>
        
      </template>








      <UForm :state="state" @submit="submitForm" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('reparations.form.instrument.label')" required>
            <UInput v-model="state.instrument" :placeholder="t('reparations.form.instrument.placeholder')" icon="i-lucide-monitor" 
            class="w-full sm:w-2/3"/>
          </UFormField>
          
          <UFormField :label="t('reparations.form.team.label')">
            <UInput v-model="state.team" :placeholder="t('reparations.form.team.placeholder')" icon="i-lucide-users" 
            class="w-full sm:w-2/3" />
          </UFormField>

          <UFormField :label="t('reparations.form.company.label')">
            <UInput v-model="state.company" :placeholder="t('reparations.form.company.placeholder')" icon="i-lucide-building"
            class="w-full sm:w-2/3" />
          </UFormField>

          <UFormField :label="t('reparations.form.price.label')" required>
            <UInput v-model="state.price" type="number" min="0" :placeholder="t('reparations.form.price.placeholder')" icon="i-lucide-coins" 
            class="w-full sm:w-2/3"/>
          </UFormField>     
          <UFormField :label="t('reparations.form.justification.label')" required>
          <UTextarea 
            v-model="state.justification" 
            :placeholder="t('reparations.form.justification.placeholder')" 
            :rows="4" 
            class="w-full sm:w-2/3"
          />
        </UFormField>

          
          <UFormField :label="t('reparations.form.quote.label')">
            <input 
              id="quote-upload"
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              @change="handleFileChange"
              class=" w-full sm:w-2/3 text-gray-500 rounded-md border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 p-2 cursor-pointer"
            />
          </UFormField>
        </div>



        <div class="flex justify-end pt-4 border-t border-gray-100">
          <UButton
            type="submit"
            :loading="isSubmitting"
            :disabled="!state.instrument || !state.justification || !state.price"
            color="primary"
            size="lg"
            icon="i-lucide-send"
            :label="t('reparations.form.submit')"
          />
        </div>
      </UForm>
    </UCard>

    <!-- History section -->
    <UCard class="border border-gray-100 shadow-sm">
      <template #header>
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <UIcon name="i-lucide-history" class="w-5 h-5 text-gray-500" />
          {{ t('reparations.history.title') }}
        </h2>
      </template>

      <div v-if="myReparations.length === 0" class="py-12 text-center text-gray-500">
        <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>{{ t('reparations.history.empty') }}</p>
      </div>

      <UTable v-else :data="myReparations" :columns="columns" class="w-full">
        <!-- Custom Price Cell -->
        <template #price-cell="{ row }">
          <span class="font-semibold text-emerald-600">
            €{{ Number(row.original.price).toFixed(2) }}
          </span>
        </template>
        
        <!-- Custom Date Cell -->
        <template #date_created-cell="{ row }">
          {{ formatDate(row.original.date_created) }}
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
            :title="t('reparations.history.viewQuote')"
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
              size="sm"
              class="rounded-full"
              @click="openConfirmDelete(row.original)"
              :title="t('reparations.history.delete')"
            />
          </div>
        </template>
      </UTable>
    </UCard>
    
    <!-- Custom Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-6 text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-alert-triangle" class="w-8 h-8 text-red-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('reparations.deleteModal.title') }}</h3>
          <p class="text-gray-500 mb-6">
            {{ t('reparations.deleteModal.description') }}
          </p>
          <div class="flex gap-3 justify-center">
            <UButton
              color="gray"
              variant="ghost"
              :label="t('reparations.deleteModal.cancel')"
              @click="isDeleteModalOpen = false"
              class="px-6"
            />
            <UButton
              color="error"
              :label="t('reparations.deleteModal.confirm')"
              @click="handleRemove"
              class="px-6 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
