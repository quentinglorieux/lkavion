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
      greeting: 'Bonjour',
      ldapInstructions: 'Connexion via LDAP, utilisez votre email @lkb.upmc.fr ou @lkb.ens.fr'
    },
    home: {
      title: 'LKB Calculateur de CO2',
      version: 'v1.7',
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
        dashboardGuard: 'Connectez-vous pour accéder.',
        reparationsTitle: 'Réparations',
        reparationsBody: 'Déclarez vos réparations d\'équipement pour accumuler des crédits d\'équipe.',
        reparationsButton: 'Gérer les réparations',
        reparationsGuard: 'Connectez-vous pour accéder.'
      },
      collective: {
        title: 'Impact Collectif LKB',
        contributionLabel: 'Contribution CO2 globale',
        trainCostLabel: 'Coût total du train',
        tripsLabel: 'trajets enregistrés',
        description: 'Voici le montant total des contributions CO2 prélevées pour l\'ensemble des déplacements'
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
        saveButton: '💾 Enregistrer toutes les liaisons',
        priceTitle: 'Coût (€)',
      },
      legLabel: 'Liaison',
      history: {
        remove: 'Retirer',
        modeLabel: 'Mode *'
      },
      successModal: {
        titleSuccess: 'Sauvegarde réussie !',
        titleError: 'Échec de la sauvegarde',
        savedLabel: 'liaison(s) enregistrée(s).',
        codeInstruction: 'Veuillez noter ce(s) code(s) pour votre formulaire administratif :',
        legLabel: 'Liaison',
        errorLabel: 'erreur(s) rencontrée(s).',
        closeButton: 'Fermer'
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
        modesHint: 'diversité de modes',
        co2ContributionTitle: 'Contribution CO2',
        co2ContributionRules: 'Paliers : 1-2t : 150€, >2t : 300€'
      },
      sections: {
        byModeTitle: 'Répartition par mode',
        modeCountSuffix: 'modes',
        historyTitle: 'Historique récent',
        historySuffix: 'entrées'
      }
    },
    reparations: {
      title: 'Crédits Réparations',
      description: 'Demande de prise en charge partielle des réparations. Déclarez les équipements que vous avez réparés et suivez vos demandes de crédit.',
      backToDashboard: 'Retour au tableau de bord',
      alert: {
        title: 'Attention',
        description: 'Une demande de remplacement de pièce d\'usure (diode de pompe, filtre de hotte, etc.) ne sera pas financée.'
      },
      form: {
        title: 'Nouvelle demande de réparation',
        subtitle: 'Remplissez ce formulaire pour chaque équipement réparé.',
        instrument: {
          label: 'Instrument/Equipement réparé',
          placeholder: 'Ex: Oscilloscope Tektronix'
        },
        team: {
          label: 'Équipe / Projet',
          placeholder: 'Acronyme équipe ? (ex : 15B)'
        },
        company: {
          label: 'Fournisseur d\'origine (Optionnel)',
          placeholder: 'Ex: Thorlabs, Newport...'
        },
        price: {
          label: 'Prix de la réparation (€)',
          placeholder: 'Ex: 1500'
        },
        justification: {
          label: 'Justification de la réparation',
          placeholder: 'Décrivez la panne initiale et l\'action de réparation effectuée (composants changés, soudure refaite, etc.)'
        },
        quote: {
          label: 'Devis ou facture (Optionnel)'
        },
        submit: 'Envoyer la demande'
      },
      history: {
        title: 'Historique de vos demandes',
        empty: 'Vous n\'avez pas encore soumis de demande de réparation.',
        columns: {
          instrument: 'Instrument',
          company: 'Fournisseur',
          team: 'Équipe',
          price: 'Prix de la réparation (€)',
          quote: 'Devis',
          date: 'Date de demande',
          actions: 'Actions'
        },
        viewQuote: 'Voir le devis/facture',
        delete: 'Supprimer'
      },
      deleteModal: {
        title: 'Confirmer la suppression',
        description: 'Êtes-vous sûr de vouloir supprimer cette demande ?',
        cancel: 'Annuler',
        confirm: 'Supprimer'
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
      greeting: 'Hello',
      ldapInstructions: 'Login via LDAP, use your email @lkb.upmc.fr or @lkb.ens.fr'
    },
    home: {
      title: 'LKB CO2 Calculator',
      version: 'v1.7',
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
        dashboardGuard: 'Log in to access it.',
        reparationsTitle: 'Repairs',
        reparationsBody: 'Declare your equipment repairs to accumulate team credits.',
        reparationsButton: 'Manage repairs',
        reparationsGuard: 'Log in to access it.'
      },
      collective: {
        title: 'LKB Collective Impact',
        contributionLabel: 'Global CO2 contribution',
        trainCostLabel: 'Total train cost',
        tripsLabel: 'recorded trips',
        description: 'Total CO2 contributions generated by all trips within the unit.'
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
        saveButton: '💾 Save all legs',
        priceTitle: 'Cost (€)',
      },
      legLabel: 'Leg',
      history: {
        remove: 'Remove',
        modeLabel: 'Mode *'
      },
      successModal: {
        titleSuccess: 'Save successful!',
        titleError: 'Save failed',
        savedLabel: 'leg(s) saved.',
        codeInstruction: 'Please note these code(s) for your administrative form:',
        legLabel: 'Leg',
        errorLabel: 'error(s) encountered.',
        closeButton: 'Close'
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
        modesHint: 'mode variety',
        co2ContributionTitle: 'CO2 Contribution',
        co2ContributionRules: 'Slices: 1-2t: 150€, >2t: 300€'
      },
      sections: {
        byModeTitle: 'Breakdown by mode',
        modeCountSuffix: 'modes',
        historyTitle: 'Recent history',
        historySuffix: 'entries'
      }
    },
    reparations: {
      title: 'Repairs Credits',
      description: 'Request partial funding for repairs. Declare equipment you have repaired and track your funding requests.',
      backToDashboard: 'Back to dashboard',
      alert: {
        title: 'Warning',
        description: 'A request for the replacement of a wear part (pump diode, hood filter, etc.) will not be funded.'
      },
      form: {
        title: 'New repair request',
        subtitle: 'Fill out this form for each repaired equipment.',
        instrument: {
          label: 'Repaired Instrument/Equipment',
          placeholder: 'Ex: Tektronix Oscilloscope'
        },
        team: {
          label: 'Team / Project',
          placeholder: 'Team acronym (e.g., 15B)'
        },
        company: {
          label: 'Original supplier (Optional)',
          placeholder: 'Ex: Thorlabs, Newport...'
        },
        price: {
          label: 'Repair cost (€)',
          placeholder: 'Ex: 1500'
        },
        justification: {
          label: 'Repair justification',
          placeholder: 'Describe the initial breakdown and the repair action performed (changed components, redone soldering, etc.)'
        },
        quote: {
          label: 'Quote or invoice (Optional)'
        },
        submit: 'Submit request'
      },
      history: {
        title: 'History of your requests',
        empty: 'You have not submitted a repair request yet.',
        columns: {
          instrument: 'Instrument',
          company: 'Supplier',
          team: 'Team',
          price: 'Repair cost (€)',
          quote: 'Quote',
          date: 'Request date',
          actions: 'Actions'
        },
        viewQuote: 'View quote/invoice',
        delete: 'Delete'
      },
      deleteModal: {
        title: 'Confirm deletion',
        description: 'Are you sure you want to delete this request?',
        cancel: 'Cancel',
        confirm: 'Delete'
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
