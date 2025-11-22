<script setup lang="ts">
import { computed } from 'vue'
import LoginModal from '@/components/LoginModal.vue'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from '@/composables/useI18n'

const { user, logout } = useAuth()
const showLogin = useState('loginModalOpen', () => false)
const { t, locale, switchLocale, availableLocales } = useI18n()

const localeModel = computed({
  get: () => locale.value,
  set: (val: string) => switchLocale(val)
})
</script>

<template>
  <div>
    <header class="flex flex-wrap gap-4 justify-between items-center p-4 border-b">
      <div class="font-bold text-lg">🌍 {{ t('home.title') }} - {{ t('home.version') }}</div>
      <nav class="flex items-center gap-4 flex-wrap text-sm text-gray-600">
        <NuxtLink to="/" class="hover:text-blue-600">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink to="/calculator" class="hover:text-blue-600">{{ t('nav.calculator') }}</NuxtLink>
        <NuxtLink v-if="user" to="/dashboard" class="hover:text-blue-600">{{ t('nav.dashboard') }}</NuxtLink>
      </nav>
      <div class="flex items-center gap-4">
        <select v-model="localeModel" class="text-sm border rounded-md px-2 py-1">
          <option v-for="code in availableLocales" :key="code" :value="code">
            {{ code.toUpperCase() }}
          </option>
        </select>
        <template v-if="user">
          <span class="text-sm text-gray-700">{{ t('auth.greeting') }} {{ user.data.first_name }}</span>
          <button @click="logout" class="ml-2 text-sm text-red-600">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <button @click="showLogin = true" class="text-sm text-blue-600 hover:underline">{{ t('nav.login') }}</button>
        </template>
      </div>
    </header>

    <LoginModal :show="showLogin" @close="showLogin = false" />
    <slot />
  </div>
</template>