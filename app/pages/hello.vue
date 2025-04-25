<script setup lang="ts">
const { data, pending, error } = useFetch('/api/hello')
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      A: <pre>{{ data }}</pre>
    </div>
  </div>
</template>