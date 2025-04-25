export function useTravelSaver() {
  const { token } = useAuth()

  async function saveTravel({ traveler, departure, final, transport_mode, distanceKm, co2EmissionKg }) {
    try {
      
      const body = {
        traveler,
        departure,
        final,
        transport_mode: transport_mode,
        distance: distanceKm,
        co2: co2EmissionKg
      }

      const { error } = await useFetch('/api/v1/flights', {
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (error.value) {
        console.error('Erreur de sauvegarde:', error.value)
        alert('Erreur lors de la sauvegarde 😢')
      } else {
        alert('Déplacement sauvegardé avec succès 🚀')
      }
    } catch (err) {
      console.error('Erreur réseau ou fetch:', err)
      alert('Échec de la requête 😢')
    }
  }

  return { saveTravel }
}