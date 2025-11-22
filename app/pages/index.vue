<script setup>
import { useAuth } from '@/composables/useAuth'
const { user } = useAuth()
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-10 space-y-10">
    <section class="space-y-4">
      <h1 class="text-3xl font-bold flex items-center gap-2">🌍 LKB Flights Calculator</h1>
      <p class="text-gray-700 leading-relaxed text-sm">
        Bienvenue sur l'outil interne de calcul des distances et émissions carbone liées à vos déplacements professionnels.
        Utilisez le calculateur pour saisir chaque liaison et obtenir une estimation selon la méthodologie GES 1point5. Les données
        enregistrées alimentent ensuite votre tableau de bord personnel.
      </p>
    </section>

    <section class="grid md:grid-cols-3 gap-6">
      <!-- Connexion Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="font-semibold text-lg mb-2">Se connecter</h2>
          <p class="text-xs text-gray-600">Authentifiez-vous pour enregistrer vos liaisons et accéder à votre tableau de bord.</p>
        </div>
        <div class="mt-4">
          <button v-if="!user" @click="$emit('open-login')" class="w-full px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
            Log in
          </button>
          <div v-else class="text-green-600 text-sm font-medium">Connecté ✔</div>
        </div>
      </div>

      <!-- Calculateur Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="font-semibold text-lg mb-2">Calculateur</h2>
          <p class="text-xs text-gray-600">Accédez au module pour saisir vos déplacements multi-segments.</p>
        </div>
        <div class="mt-4">
          <NuxtLink to="/calculator" class="block w-full text-center px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            Ouvrir le calculateur
          </NuxtLink>
        </div>
      </div>

      <!-- Dashboard Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between" :class="!user ? 'opacity-50' : ''">
        <div>
          <h2 class="font-semibold text-lg mb-2">Tableau de Bord</h2>
          <p class="text-xs text-gray-600">Visualisez l'historique de vos déplacements et vos métriques agrégées.</p>
        </div>
        <div class="mt-4">
          <NuxtLink v-if="user" to="/dashboard" class="block w-full text-center px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            Voir le tableau de bord
          </NuxtLink>
          <div v-else class="text-xs text-gray-500 text-center">Connectez-vous pour accéder.</div>
        </div>
      </div>
    </section>
  </div>
</template>
