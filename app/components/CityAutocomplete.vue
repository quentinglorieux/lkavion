<script setup>
import { useCitySearch } from '@/composables/useCitySearch'
const props = defineProps({
  label: String,
  modelValue: Object
})
const emit = defineEmits(['update:modelValue'])

const inputValue = ref('') // <— UI field value
const search = useCitySearch()

// Watch user typing
watch(inputValue, (val) => {
  if (!val || (props.modelValue && val === props.modelValue.name)) {
    // If user clears or selects a value
    search.results = []
  } else {
    search.query = val
  }
})

function selectCity(city) {
  emit('update:modelValue', city)
  inputValue.value = city.name
  search.results = []
}
</script>

<template>
  <div class="relative w-full">
    <label class="block mb-1 text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="relative">
      <input
        v-model="inputValue"
        type="text"
        placeholder="Rechercher une ville"
        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Autocomplete Dropdown -->
    <ul
      v-if="search.results.length"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto"
    >
      <li
        v-for="city in search.results"
        :key="`${city.name}-${city.lat}-${city.lng}`"
        @click="selectCity(city)"
        class="px-3 py-2 cursor-pointer hover:bg-blue-100 flex justify-between"
      >
        <span>{{ city.name }}</span>
        <span class="text-gray-500 text-sm">{{ city.countryCode }}</span>
      </li>
    </ul>
  </div>
</template>