<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-bold mb-6 flex items-center gap-2">
      Calculateur de Déplacements
    </h1>
    <p class="text-sm text-gray-600 mb-8">
      Saisissez vos liaisons pour estimer distances et émissions GES. Utilisez l'onglet Aller-Retour global si nécessaire.
    </p>
    <ClimateForm />
  </div>
</template>

<script setup>
import ClimateForm from '@/components/ClimateForm.vue'
</script>
