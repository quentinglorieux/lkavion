const messages = {
  fr: {
    nav: {
      home: 'Accueil',
      calculator: 'Calculateur',
      dashboard: 'Tableau de bord',
      login: 'Se connecter',
      logout: 'Se déconnecter'
    },
    auth: {
      greeting: 'Bonjour'
    },
    home: {
      title: '🌍 LKB Flights Calculator',
      description: "Bienvenue sur l'outil interne de calcul des distances et émissions carbone liées à vos déplacements professionnels. Utilisez le calculateur pour saisir chaque liaison et obtenir une estimation selon la méthodologie GES 1point5. Les données enregistrées alimentent ensuite votre tableau de bord personnel.",
      cards: {
        loginTitle: 'Se connecter',
        loginBody: 'Authentifiez-vous pour enregistrer vos liaisons et accéder à votre tableau de bord.',
        loginButton: 'Se connecter',
        loggedIn: 'Connecté ✔',
        calculatorTitle: 'Calculateur',
        calculatorBody: 'Accédez au module pour saisir vos déplacements multi-segments.',
        openCalculator: 'Ouvrir le calculateur',
        dashboardTitle: 'Tableau de bord',
        dashboardBody: 'Visualisez l\'historique de vos déplacements et vos métriques agrégées.',
        dashboardButton: 'Voir le tableau de bord',
        dashboardGuard: 'Connectez-vous pour accéder.'
      }
    },
    calculator: {
      title: 'Calculateur de Déplacements',
      subtitle: 'Saisissez vos liaisons pour estimer distances et émissions GES. Utilisez l\'onglet Aller-Retour global si nécessaire.'
    },
    climateForm: {
      infoTitle: 'Simulateur de vos déplacements professionnels',
      infoBody: 'Veuillez saisir la ville de départ, de destination ainsi que le mode de déplacement pour chaque étape de votre voyage, l\'une après l\'autre. Les calculs sont réalisés avec la méthode GES 1point5.',
      totals: {
        distanceTitle: 'Distance Totale',
        co2Title: 'CO₂ Total',
        oneWayPrefixDistance: 'Aller simple total ≈',
        oneWayPrefixCO2: 'Aller simple total ≈'
      },
      roundTrip: {
        label: 'Aller-Retour Global',
        hint: 'Double toutes les distances & CO₂.',
        yes: 'Oui',
        no: 'Non'
      },
      actions: {
        addLegLabel: 'Ajouter des liaisons.',
        addLegButton: '➕ Ajouter',
        distanceTitle: 'Distance',
        co2Title: 'CO₂',
        oneWayLegend: 'Aller simple:',
        saveButton: '💾 Enregistrer toutes les liaisons'
      },
      legLabel: 'Liaison',
      history: {
        remove: 'Retirer',
        modeLabel: 'Mode *'
      }
    },
    dashboard: {
      hero: {
        label: 'Tableau de bord',
        title: 'Vos trajets enregistrés',
        subtitle: 'Suivez vos distances totales, vos émissions et l’évolution de vos déplacements professionnels.'
      },
      loading: 'Chargement des données…',
      error: 'Impossible de charger les données',
      cards: {
        totalTripsTitle: 'Total liaisons',
        selfFallback: 'Vous',
        totalDistanceTitle: 'Distance totale',
        avgDistancePrefix: 'moyenne',
        kmPerTrip: 'km / liaison',
        totalCO2Title: 'Émissions totales',
        avgCO2Prefix: 'moyenne',
        kgPerTrip: 'kg / liaison',
        modesTitle: 'Modes enregistrés',
        modesHint: 'diversité de modes'
      },
      sections: {
        byModeTitle: 'Répartition par mode',
        modeCountSuffix: 'modes',
        historyTitle: 'Historique récent',
        historySuffix: 'entrées'
      }
    }
  },
  en: {
    nav: {
      home: 'Home',
      calculator: 'Calculator',
      dashboard: 'Dashboard',
      login: 'Log in',
      logout: 'Log out'
    },
    auth: {
      greeting: 'Hello'
    },
    home: {
      title: '🌍 LKB Flights Calculator',
      description: 'Welcome to the internal tool used to estimate distances and carbon emissions for your business trips. Use the calculator to input each leg and get an estimate based on the GES 1point5 methodology. Saved data powers your personal dashboard.',
      cards: {
        loginTitle: 'Log in',
        loginBody: 'Authenticate to save your trips and access your dashboard.',
        loginButton: 'Log in',
        loggedIn: 'Connected ✔',
        calculatorTitle: 'Calculator',
        calculatorBody: 'Open the module to enter multi-segment journeys.',
        openCalculator: 'Open the calculator',
        dashboardTitle: 'Dashboard',
        dashboardBody: 'Review the history of your trips and aggregated metrics.',
        dashboardButton: 'View the dashboard',
        dashboardGuard: 'Log in to access it.'
      }
    },
    calculator: {
      title: 'Trip Calculator',
      subtitle: 'Enter your trip legs to estimate distances and CO₂. Use the global round-trip toggle when needed.'
    },
    climateForm: {
      infoTitle: 'Business travel simulator',
      infoBody: 'Enter your departure, arrival city, and transportation mode for each step of your journey. Calculations follow the GES 1point5 methodology.',
      totals: {
        distanceTitle: 'Total distance',
        co2Title: 'Total CO₂',
        oneWayPrefixDistance: 'One-way total ≈',
        oneWayPrefixCO2: 'One-way total ≈'
      },
      roundTrip: {
        label: 'Global round-trip',
        hint: 'Doubles all distances & CO₂.',
        yes: 'Yes',
        no: 'No'
      },
      actions: {
        addLegLabel: 'Add legs',
        addLegButton: '➕ Add leg',
        distanceTitle: 'Distance',
        co2Title: 'CO₂',
        oneWayLegend: 'One-way:',
        saveButton: '💾 Save all legs'
      },
      legLabel: 'Leg',
      history: {
        remove: 'Remove',
        modeLabel: 'Mode *'
      }
    },
    dashboard: {
      hero: {
        label: 'Dashboard',
        title: 'Your recorded trips',
        subtitle: 'Track your total distance, emissions, and how your travel footprint evolves over time.'
      },
      loading: 'Loading data…',
      error: 'Unable to load data',
      cards: {
        totalTripsTitle: 'Total trips',
        selfFallback: 'You',
        totalDistanceTitle: 'Total distance',
        avgDistancePrefix: 'average',
        kmPerTrip: 'km / trip',
        totalCO2Title: 'Total emissions',
        avgCO2Prefix: 'average',
        kgPerTrip: 'kg / trip',
        modesTitle: 'Recorded modes',
        modesHint: 'mode variety'
      },
      sections: {
        byModeTitle: 'Breakdown by mode',
        modeCountSuffix: 'modes',
        historyTitle: 'Recent history',
        historySuffix: 'entries'
      }
    }
  }
}

type Messages = typeof messages

type LocaleKey = keyof Messages

function resolvePath(object: Record<string, any>, path: string) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object)
}

export default defineNuxtPlugin(() => {
  const locale = useState<LocaleKey>('locale', () => 'fr')
  const availableLocales = Object.keys(messages) as LocaleKey[]

  function t(path: string): string {
    const value = resolvePath(messages[locale.value], path)
    return (typeof value === 'string' && value) ? value : path
  }

  function switchLocale(next: string) {
    if (availableLocales.includes(next as LocaleKey)) {
      locale.value = next as LocaleKey
    }
  }

  return {
    provide: {
      i18n: {
        locale,
        availableLocales,
        t,
        switchLocale
      }
    }
  }
})
