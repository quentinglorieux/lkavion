import { useAuth } from '@/composables/useAuth'

export const useReparations = () => {
  const { token } = useAuth()
  const toast = useToast()

  const fetchMyReparations = async () => {
    try {
      // Calls local Nuxt API proxy
      const data = await $fetch('/api/reparations', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      return data || []
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
      // Calls local Nuxt API proxy (admin)
      const data = await $fetch('/api/reparations/all', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      return data || []
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
      const data = await $fetch('/api/reparations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: reparationData
      })
      toast.add({
        title: 'Succès',
        description: 'Demande de réparation envoyée avec succès.',
        color: 'success'
      })
      return { ok: true, data }
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
      await $fetch(`/api/reparations/${reparationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token.value}` }
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name)
      
      const data = await $fetch('/api/reparations/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: formData
      })

      return { ok: true, data }
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
