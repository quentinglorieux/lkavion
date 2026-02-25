export function useTravelSaver() {
  const { token } = useAuth()
  const toast = useToast()

  // Save a single travel
  async function saveTravel({ traveler, departure, final, transport_mode, distanceKm, co2EmissionKg, tripUuid, price, date_travel, visitor, visitor_name }, options = {}) {
    const silent = options.silent === true
    try {
      const body = {
        traveler,
        departure,
        final,
        transport_mode: transport_mode,
        distance: distanceKm,
        co2: co2EmissionKg,
        date_travel,
        visitor: !!visitor
      }
      if (visitor && visitor_name) {
        body.visitor_name = visitor_name
      }

      if (price != null && price !== '' && !Number.isNaN(Number(price))) {
        body.price = Number(price)
      }
      if (tripUuid) {
        body.trip_uuid = tripUuid
      }

      const res = await $fetch('/api/v1/travels', {
        method: 'POST',
        body,
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (!silent) {
        toast.add({ title: 'Trajet enregistré', color: 'success' })
      }
      return { ok: true, data: res }
    } catch (err) {
      console.error('Erreur de sauvegarde:', err)
      if (!silent) {
        toast.add({ 
          title: 'Erreur lors de la sauvegarde', 
          description: err.data?.message || err.message || 'Erreur inconnue',
          color: 'error'
        })
      }
      return { ok: false, error: err }
    }
  }

  // Update an existing travel
  async function updateTravel(id, data) {
    try {
      const res = await $fetch(`/api/v1/travels/${id}`, {
        method: 'PATCH',
        body: data,
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      toast.add({ title: 'Trajet mis à jour', color: 'success' })
      return { ok: true, data: res }
    } catch (err) {
      toast.add({ 
        title: 'Erreur mise à jour', 
        description: err.data?.message || err.message,
        color: 'error' 
      })
      return { ok: false, error: err }
    }
  }

  // Delete a travel
  async function deleteTravel(id) {
    try {
      await $fetch(`/api/v1/travels/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      toast.add({ title: 'Trajet supprimé', color: 'success' })
      return { ok: true }
    } catch (err) {
      toast.add({ 
        title: 'Erreur suppression', 
        description: err.data?.message || err.message,
        color: 'error' 
      })
      return { ok: false, error: err }
    }
  }

  return { saveTravel, updateTravel, deleteTravel }
}