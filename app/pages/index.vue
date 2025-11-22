<script setup>
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'

const { user } = useAuth()
const loginModal = useState('loginModalOpen', () => false)
const { t } = useI18n()

function openLogin() {
  loginModal.value = true
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-10 space-y-10">
    <section class="space-y-4">
      <h1 class="text-3xl font-bold flex items-center gap-2">{{ t('home.title') }}</h1>
      <p class="text-gray-700 leading-relaxed text-sm">
        {{ t('home.description') }}
      </p>
    </section>

    <section class="grid md:grid-cols-3 gap-6">
      <!-- Connexion Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="font-semibold text-lg mb-2">{{ t('home.cards.loginTitle') }}</h2>
          <p class="text-xs text-gray-600">{{ t('home.cards.loginBody') }}</p>
        </div>
        <div class="mt-4">
          <button v-if="!user" @click="openLogin" class="w-full px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
            {{ t('home.cards.loginButton') }}
          </button>
          <div v-else class="text-green-600 text-sm font-medium">{{ t('home.cards.loggedIn') }}</div>
        </div>
      </div>

      <!-- Calculateur Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="font-semibold text-lg mb-2">{{ t('home.cards.calculatorTitle') }}</h2>
          <p class="text-xs text-gray-600">{{ t('home.cards.calculatorBody') }}</p>
        </div>
        <div class="mt-4">
          <NuxtLink to="/calculator" class="block w-full text-center px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            {{ t('home.cards.openCalculator') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Dashboard Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between" :class="!user ? 'opacity-50' : ''">
        <div>
          <h2 class="font-semibold text-lg mb-2">{{ t('home.cards.dashboardTitle') }}</h2>
          <p class="text-xs text-gray-600">{{ t('home.cards.dashboardBody') }}</p>
        </div>
        <div class="mt-4">
          <NuxtLink v-if="user" to="/dashboard" class="block w-full text-center px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            {{ t('home.cards.dashboardButton') }}
          </NuxtLink>
          <div v-else class="text-xs text-gray-500 text-center">{{ t('home.cards.dashboardGuard') }}</div>
        </div>
      </div>
    </section>
  </div>
</template>
