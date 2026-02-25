<script setup>
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'

const { user } = useAuth()
const loginModal = useState('loginModalOpen', () => false)
const { t } = useI18n()

function openLogin() {
  loginModal.value = true
}

const { data: globalStats, pending } = useAsyncData('global-stats', () => $fetch('/api/travels/global-stats'))
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-10 space-y-10">
    <section class="space-y-4">
      <h1 class="text-3xl font-bold flex items-center gap-2">{{ t('home.title') }}</h1>
      <p class="text-gray-700 leading-relaxed text-sm">
        {{ t('home.description') }} 
      </p>
    </section>

    <section class="grid md:grid-cols-4 gap-6">
      <!-- Connexion Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between">
        <div>
          <h2 class="font-semibold text-lg mb-2">{{ t('home.cards.loginTitle') }}</h2>
          <p class="text-xs text-gray-600">{{ t('home.cards.loginBody') }}</p>
        </div>
        <div class="mt-4">
          <button v-if="!user" @click="openLogin"
            class="w-full px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
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
          <NuxtLink to="/calculator"
            class="block w-full text-center px-4 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            {{ t('home.cards.openCalculator') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Dashboard Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between"
        :class="!user ? 'opacity-50' : ''">
        <div>
          <h2 class="font-semibold text-lg mb-2">{{ t('home.cards.dashboardTitle') }}</h2>
          <p class="text-xs text-gray-600">{{ t('home.cards.dashboardBody') }}</p>
        </div>
        <div class="mt-4">
          <NuxtLink v-if="user" to="/dashboard"
            class="block w-full text-center px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
            {{ t('home.cards.dashboardButton') }}
          </NuxtLink>
          <div v-else class="text-xs text-gray-500 text-center">{{ t('home.cards.dashboardGuard') }}</div>
        </div>
      </div>
      
      <!-- Reparations Card -->
      <div class="border rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between"
        :class="!user ? 'opacity-50' : ''">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-lucide-wrench" class="text-blue-600 w-5 h-5" />
            <h2 class="font-semibold text-lg">{{ t('home.cards.reparationsTitle') }}</h2>
          </div>
          <p class="text-xs text-gray-600">{{ t('home.cards.reparationsBody') }}</p>
        </div>
        <div class="mt-4">
          <NuxtLink v-if="user" to="/reparations"
            class="block w-full text-center px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
            {{ t('home.cards.reparationsButton') }}
          </NuxtLink>
          <div v-else class="text-xs text-gray-500 text-center">{{ t('home.cards.reparationsGuard') }}</div>
        </div>
      </div>
    </section>

    <section v-if="globalStats" class="pt-10 border-t border-gray-100 space-y-8">
      <!-- Section 1: CO2 Contributions -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 md:p-12 text-white shadow-xl">
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

        <div class="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div class="space-y-4">
            <h2 class="text-2xl font-bold tracking-tight">{{ t('home.collective.title') }}</h2>
            <p class="text-indigo-100/80 leading-relaxed text-sm">
              {{ t('home.collective.description') }}
            </p>
            <div class="flex items-center gap-4 pt-2">
              <div class="h-12 w-1 bg-indigo-400 rounded-full"></div>
              <p class="text-sm font-medium text-indigo-200">
                <span class="block text-white text-lg">{{ globalStats?.count }}</span>
                {{ t('home.collective.tripsLabel') }}
              </p>
            </div>
          </div>

          <div class="flex justify-center md:justify-end">
            <div
              class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl flex flex-col items-center justify-center min-w-[240px]">
              <span class="text-xs uppercase tracking-widest text-indigo-300 font-bold mb-2">{{
                t('home.collective.contributionLabel') }}</span>
              <div class="flex items-baseline gap-1">
                <span class="text-5xl font-black text-white">€{{ globalStats?.totalContribution?.toLocaleString()
                  }}</span>
              </div>
              <div
                class="mt-4 px-3 py-1 bg-white/10 rounded-full text-[10px] text-indigo-200 uppercase tracking-tighter">
                Calculé selon les paliers CO2
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 2: Train Subsidy -->
      <div
        class="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-8 md:p-12 text-white shadow-xl">
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div class="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div class="space-y-4">
            <h2 class="text-2xl font-bold tracking-tight flex items-center gap-2 text-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="text-emerald-400">
                <rect width="16" height="16" x="4" y="4" rx="2" />
                <path d="M9 20v2" />
                <path d="M15 20v2" />
                <path d="M12 4v16" />
              </svg>
              Soutien au train
            </h2>
            <p class="text-emerald-100/80 leading-relaxed text-sm">
              Les contributions prélevées sur les trajets aériens sont directement réutilisées pour financer les
              surcoûts
              liés aux déplacements en train.
            </p>
          </div>

          <div class="flex justify-center md:justify-end">
            <div
              class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl flex flex-col items-center justify-center min-w-[240px]">
              <span class="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-2">{{
                t('home.collective.trainCostLabel') }}</span>
              <div class="flex items-baseline gap-1">
                <span class="text-5xl font-black text-white">€{{ globalStats?.totalTrainCost?.toLocaleString()
                  }}</span>
              </div>
              <div
                class="mt-4 px-3 py-1 bg-emerald-300/20 rounded-full text-[10px] text-emerald-100 uppercase tracking-tighter border border-emerald-400/30">
                Total dépensé pour le train
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
