// composables/useTravelCalculator.js
import { computed } from 'vue'
import { geodesicDistance } from '@/composables/useDistanceCalculator'

export function useTravelCalculator(fromCity, toCity, mode) {
  const distanceKm = computed(() => {
    if (fromCity.value && toCity.value) {
      let dist = geodesicDistance(
        parseFloat(fromCity.value.lat),
        parseFloat(fromCity.value.lng),
        parseFloat(toCity.value.lat),
        parseFloat(toCity.value.lng)
      )

      if (mode.value === 'Avion') {
        dist += 95
      } else if (mode.value === 'Train' || mode.value === 'RER') {
        dist *= 1.2
      } else if (mode.value === 'Métro') {
        dist *= 1.7
      } else if (mode.value === 'Voiture') {
        dist *= 1.3
      } else if (mode.value === 'Bus' || mode.value === 'Tramway') {
        dist *= 1.5
      } else if (mode.value === 'Taxi') {
        dist *= 2
      }
      return Math.round(dist)
    }
    return null
  })

  const co2EmissionKg = computed(() => {
    if (!distanceKm.value) return null

    const distance = distanceKm.value

    if (mode.value === 'Avion') {
      if (distance <= 1000) {
        return Math.round(distance * 0.2586)
      } else if (distance <= 3500) {
        return Math.round(distance * 0.1875)
      } else {
        return Math.round(distance * 0.152)
      }
    }

    const factors = {
      Train: 0.012,
      RER: 0.012,
      Métro: 0.012,
      Voiture: 0.170,
      Taxi: 0.170,
      Bus: 0.012,
      Tramway: 0.012
    }
    const factor = factors[mode.value] || 0
    return Math.round(distance * factor)
  })

  return {
    distanceKm,
    co2EmissionKg
  }
}