export function useTravelSaver() {
  const { token } = useAuth()

  // Save a single travel; optional options.silent to suppress alerts (batch mode)
  async function saveTravel({ traveler, departure, final, transport_mode, distanceKm, co2EmissionKg, tripUuid, allerRetour }, options = {}) {
    const silent = options.silent === true
    try {
      const body = {
        traveler,
        departure,
        final,
        transport_mode: transport_mode,
        distance: distanceKm,
        co2: co2EmissionKg
      }
      if (tripUuid) {
        body.trip_uuid = tripUuid
      }
      if (typeof allerRetour === 'boolean') {
        body.aller_retour = allerRetour
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
        if (!silent) alert('Erreur lors de la sauvegarde 😢')
        return { ok: false, error: error.value }
      } else {
        if (!silent) alert('Déplacement sauvegardé avec succès 🚀')
        return { ok: true }
      }
    } catch (err) {
      console.error('Erreur réseau ou fetch:', err)
      if (!silent) alert('Échec de la requête 😢')
      return { ok: false, error: err }
    }
  }

  return { saveTravel }
}