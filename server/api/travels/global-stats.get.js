export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const base = config.directusUrl
    const serviceToken = config.directusApiToken || process.env.DIRECTUS_API_TOKEN

    if (!serviceToken) {
        console.error('Missing DIRECTUS_API_TOKEN environment variable')
        return createError({
            statusCode: 500,
            statusMessage: 'Service token missing'
        })
    }

    try {
        // Fetch all travels with relevant fields
        // We need 'co2', 'traveler' (for grouping), and 'visitor' (for individual check if needed)
        const res = await $fetch(`${base}/items/travels`, {
            headers: {
                Authorization: `Bearer ${serviceToken}`
            },
            params: {
                fields: 'co2,traveler,visitor,transport_mode,price',
                limit: -1 // Fetch all
            }
        })

        const data = res.data || []

        // Grouping by traveler to apply the tiered rule per person
        // Visitors might not have a 'traveler' ID if they are guest entries, 
        // or they might be attached to the user who invited them.
        // Based on dashboard.vue, visitor travel is identified by trip.visitor === true.

        const userEmissions = {} // traveler_id -> totalCo2
        let totalTrainCost = 0

        for (const trip of data) {
            const co2 = Number(trip.co2) || 0
            const price = Number(trip.price) || 0

            if (trip.transport_mode === 'Train') {
                totalTrainCost += price
            }

            if (trip.visitor === true) {
                // Individual visitor trips are usually handled in aggregate in the dashboard logic,
                // but the rule is applied to the SUM of all visitor CO2 for a user?
                // Actually, dashboard.vue applies it to `visitorTotals.totalCO2`.
                // For a global view, we should probably group by the creator (user_created) 
                // but the 'travels' table seems to use 'traveler' for users.
                // If trip.visitor is true, it doesn't always have a 'traveler' link?
                // Let's assume for global simplicity:
                // 1. One "bucket" per registered user (traveler field)
                // 2. One "bucket" per visitor entry? No, usually visitors are tied to the host.
                // If traveler is null and visitor is true, it might be an unlinked guest.

                // Let's check traveler field
                const travelerId = trip.traveler || 'visitors_global'
                userEmissions[travelerId] = (userEmissions[travelerId] || 0) + co2
            } else if (trip.traveler) {
                userEmissions[trip.traveler] = (userEmissions[trip.traveler] || 0) + co2
            } else {
                // Fallback for trips with neither
                userEmissions['other'] = (userEmissions['other'] || 0) + co2
            }
        }

        let totalContribution = 0

        const calculateCost = (co2Kg) => {
            const tons = co2Kg / 1000
            if (tons <= 1) return 0
            if (tons <= 2) return (tons - 1) * 150
            return 150 + (tons - 2) * 300
        }

        for (const travelerId in userEmissions) {
            totalContribution += calculateCost(userEmissions[travelerId])
        }

        return {
            totalContribution: Math.round(totalContribution),
            totalTrainCost: Math.round(totalTrainCost),
            totalCO2: data.reduce((sum, t) => sum + (Number(t.co2) || 0), 0),
            count: data.length
        }

    } catch (err) {
        console.error('Error calculating global stats:', err)
        return createError({
            statusCode: 500,
            statusMessage: 'Failed to calculate global stats'
        })
    }
})
