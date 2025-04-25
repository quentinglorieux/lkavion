<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button @click="close" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl">×</button>
  
        <h2 class="text-xl font-semibold mb-4">Connexion</h2>
  
        <div class="space-y-4">
          <input
            v-model="identifier"
            type="identifier"
            placeholder="Identifiant"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Mot de passe"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
          />
          <button
            @click="handleLogin"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
          >
            Se connecter
          </button>
        </div>
  
        <p v-if="errorMessage" class="text-red-600 mt-4 text-sm">{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuth } from '@/composables/useAuth'
  
  const props = defineProps({
    show: Boolean
  })
  const emit = defineEmits(['close'])
  
  const identifier = ref('')
  const password = ref('')
  const errorMessage = ref('')
  
  const { login } = useAuth()
  
  async function handleLogin() {
    const { success, message } = await login(identifier.value, password.value)
    if (!success) {
      errorMessage.value = message
    } else {
      errorMessage.value = ''
      emit('close')
    }
  }
  
  function close() {
    emit('close')
  }
  </script>