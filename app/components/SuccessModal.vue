<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button @click="close" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl">×</button>

            <div class="text-center mb-6">
                <div v-if="successCount > 0"
                    class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div v-else class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ successCount > 0 ? $i18n.t('climateForm.successModal.titleSuccess') :
                        $i18n.t('climateForm.successModal.titleError') }}
                </h3>

                <div class="mt-2" v-if="successCount > 0">
                    <p class="text-sm text-gray-500">
                        {{ successCount }} {{ $i18n.t('climateForm.successModal.savedLabel') }}
                    </p>
                    <div v-if="codes.length" class="mt-4 bg-gray-50 rounded-md p-4 text-left">
                        <p class="text-xs text-gray-500 mb-2">
                            {{ $i18n.t('climateForm.successModal.codeInstruction') }}
                        </p>
                        <ul class="space-y-2">
                            <li v-for="item in codes" :key="item.legId"
                                class="flex justify-between items-center text-sm">
                                <span class="text-gray-600 font-medium">{{ $i18n.t('climateForm.successModal.legLabel')
                                    }} {{ item.legId }} :</span>
                                <span
                                    class="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded select-all">{{
                                    item.code }}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <p v-if="failCount > 0" class="mt-2 text-sm text-red-600">
                    {{ failCount }} {{ $i18n.t('climateForm.successModal.errorLabel') }}
                </p>

                <!-- 24h Warning Note -->
                <div v-if="successCount > 0" class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-left shadow-sm">
                  <div class="text-amber-500 text-lg mt-0.5">💡</div>
                  <div class="space-y-1">
                    <p class="text-xs font-bold text-amber-900 uppercase tracking-tight">Rappel important</p>
                    <p class="text-[11px] text-amber-800 leading-normal">
                      Vous avez <strong>24 heures</strong> pour supprimer ce trajet depuis votre 
                      <NuxtLink to="/dashboard" class="text-indigo-600 underline font-bold hover:text-indigo-800 transition-colors">espace personnel</NuxtLink> 
                      en cas d'erreur. Passé ce délai, il sera définitivement enregistré.
                    </p>
                  </div>
                </div>
            </div>

            <div class="mt-5 sm:mt-6">
                <button type="button" @click="close"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                    {{ $i18n.t('climateForm.successModal.closeButton') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
    show: Boolean,
    successCount: Number,
    failCount: Number,
    codes: {
        type: Array,
        default: () => []
    }
})

const { t } = useI18n()
const emit = defineEmits(['close'])

function close() {
    emit('close')
}
</script>
