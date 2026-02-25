import { useDirectus } from '@/composables/useDirectus'
import { useAuth } from '@/composables/useAuth'

export const useReparations = () => {
  const { directusFetch } = useDirectus()
  const { token } = useAuth()
  const toast = useToast()

  const fetchMyReparations = async (userId) => {
    try {
      const response = await directusFetch(`/items/reparations?filter[user_created][_eq]=${userId}&sort=-date_created`, {
        method: 'GET',
        token: token.value
      })
      return response.data || []
    } catch (error) {
      console.error('Error fetching my reparations:', error)
      toast.add({
        title: 'Erreur',
        description: 'Impossible de récupérer vos réparations.',
        color: 'error'
      })
      return []
    }
  }

  const fetchAllReparations = async () => {
    try {
      const response = await directusFetch('/items/reparations?sort=-date_created&fields=*,user_created.first_name,user_created.last_name', {
        method: 'GET',
        token: token.value
      })
      return response.data || []
    } catch (error) {
      console.error('Error fetching all reparations:', error)
      toast.add({
        title: 'Erreur',
        description: 'Impossible de récupérer les réparations.',
        color: 'error'
      })
      return []
    }
  }

  const saveReparation = async (reparationData) => {
    try {
      const response = await directusFetch('/items/reparations', {
        method: 'POST',
        body: reparationData,
        token: token.value
      })
      toast.add({
        title: 'Succès',
        description: 'Demande de réparation envoyée avec succès.',
        color: 'success'
      })
      return { ok: true, data: response.data }
    } catch (error) {
      console.error('Error saving reparation:', error)
      toast.add({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande de réparation.',
        color: 'error'
      })
      return { ok: false, error }
    }
  }

  const removeReparation = async (reparationId) => {
    try {
      await directusFetch(`/items/reparations/${reparationId}`, {
        method: 'DELETE',
        token: token.value
      })
      toast.add({
        title: 'Succès',
        description: 'Demande de réparation supprimée.',
        color: 'success'
      })
      return { ok: true }
    } catch (error) {
      console.error('Error deleting reparation:', error)
      toast.add({
        title: 'Erreur',
        description: 'Impossible de supprimer la demande.',
        color: 'error'
      })
      return { ok: false, error }
    }
  }

  const uploadQuote = async (file) => {
    try {
      const { base } = useDirectus()
      const formData = new FormData()
      formData.append('title', file.name)
      // Provide explicit filename for the blob
      formData.append('file', file, file.name)
      
      const res = await window.fetch(`${base}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
          // Intentional: Do not set Content-Type header so browser generates it with boundary natively
        },
        body: formData
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(`Directus returned ${res.status}: ${JSON.stringify(json)}`)
      }
      
      // If Directus returned an array (batch) somehow, take the first element
      const fileRecord = Array.isArray(json.data) ? json.data[0] : json.data

      return { ok: true, data: fileRecord }
    } catch (error) {
      console.error('Error uploading quote:', error)
      toast.add({
        title: 'Erreur',
        description: 'Impossible de télécharger le devis/facture.',
        color: 'error'
      })
      return { ok: false, error }
    }
  }

  return {
    fetchMyReparations,
    fetchAllReparations,
    saveReparation,
    removeReparation,
    uploadQuote
  }
}
