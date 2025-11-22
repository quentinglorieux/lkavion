<script setup>
import LoginModal from '@/components/LoginModal.vue'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
const showLogin = ref(false)
</script>

<template>
  <div>
    <header class="flex justify-between items-center p-4 border-b">
      <div class="font-bold text-lg">🌍 LKB Flights Calculator</div>
      <nav class="space-x-4">
         <router-link to="/" class="text-sm text-gray-600 hover:text-blue-600">Home</router-link>
        <router-link to="/calculator" class="text-sm text-gray-600 hover:text-blue-600">Calculator</router-link>
        <router-link v-if="user" to="/dashboard" class="text-sm text-gray-600 hover:text-blue-600">Dashboard</router-link>
      </nav>
      <div>
        
  
        <template v-if="user">
          Bonjour {{ user.data.first_name }}
          <button @click="logout" class="ml-2 text-sm text-red-600">Log out</button>
        </template>
        <template v-else>
          <button @click="showLogin = true" class="text-sm text-blue-600 hover:underline">Log in</button>
        </template>
      </div>
    </header>

    <LoginModal :show="showLogin" @close="showLogin = false" />
    <slot />
  </div>
</template>