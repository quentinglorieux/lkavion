<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
      {{ t('calculator.title') }}
    </h1>
    <p class="text-sm text-gray-600 mb-8">
      {{ t('calculator.subtitle') }}
    </p>
    <ClimateForm />
  </div>
</template>

<script setup>
import ClimateForm from '@/components/ClimateForm.vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
