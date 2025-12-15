export const translations = {
  // Login Page
  login: {
    title: "Explorateur de Tunisie",
    welcomeBack: "Bon retour",
    signInDescription: "Connectez-vous pour explorer les meilleurs endroits en Tunisie",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "Entrez votre e-mail",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    rememberMe: "Se souvenir de moi pendant 30 jours",
    signInButton: "Se connecter",
    signingIn: "Connexion en cours...",
    orContinueWith: "Ou continuer avec",
    google: "Google",
    github: "GitHub",
    noAccount: "Vous n'avez pas de compte ?",
    signUpFree: "Inscrivez-vous gratuitement",
    discoverPlaces: "Découvrez plus de 1000 endroits incroyables à travers la Tunisie",
    exploreTitle: "Explorer la Tunisie",
    discoverBeauty: "Découvrez la beauté de la Tunisie",
    discoverDescription: "De l'antique Carthage au désert du Sahara, explorez les trésors cachés et les destinations populaires de la Tunisie.",
    statsPlaces: "Endroits",
    statsGovernorates: "Gouvernorats",
    statsReviews: "Avis",
    invalidCredentials: "E-mail ou mot de passe incorrect",
    loginSuccess: "Connexion réussie !",
  },

  // Dashboard Header
  header: {
    title: "Endroits en Tunisie",
    placesCount: "{count} endroits",
    placesFiltered: "{filtered} sur {total} endroits",
    tableView: "Vue tableau",
    gridView: "Vue grille",
    export: "Exporter",
    exportCSV: "Exporter en CSV",
    exportJSON: "Exporter en JSON",
    logout: "Déconnexion",
    exportSuccess: "Données exportées avec succès",
  },

  // Filters
  filters: {
    title: "Filtres",
    clearAll: "Tout effacer",
    search: "Rechercher",
    searchPlaceholder: "Rechercher des endroits...",
    categories: "Catégories",
    governorates: "Gouvernorats",
    rating: "Note",
    ratingMin: "{min} étoiles",
    ratingMax: "{max} étoiles",
    reviews: "Avis",
    reviewsMin: "Min : {min}",
    reviewsMax: "Max : {max}",
    options: "Options",
    hasPhone: "A un numéro de téléphone",
    hasWebsite: "A un site web",
  },

  // Table
  table: {
    title: "Titre",
    category: "Catégorie",
    governorate: "Gouvernorat",
    rating: "Note",
    reviews: "Avis",
    contact: "Contact",
    actions: "Actions",
    noResults: "Aucun endroit trouvé",
    noResultsDescription: "Essayez d'ajuster vos filtres ou vos termes de recherche pour trouver ce que vous cherchez.",
    showingResults: "Affichage de {count} sur {total} résultats",
    viewDetails: "Voir les détails",
  },

  // Grid
  grid: {
    noResults: "Aucun endroit trouvé",
    noResultsDescription: "Essayez d'ajuster vos filtres ou vos termes de recherche pour trouver ce que vous cherchez.",
    showingResults: "Affichage de {count} sur {total} résultats",
  },

  // Place Details Modal
  placeDetails: {
    nearby: "À proximité dans {governorate}",
    reviewsCount: "{count} avis",
    phone: "Téléphone",
    website: "Site web",
    visitSite: "Visiter le site",
    openingHours: "Heures d'ouverture",
    priceRange: "Gamme de prix :",
    placeId: "ID du lieu :",
    cid: "CID :",
    openInMaps: "Ouvrir dans Google Maps",
    addressCopied: "Adresse copiée dans le presse-papiers",
    close: "Fermer",
  },

  // Categories
  categories: {
    "Café": "Café",
    "Restaurant": "Restaurant",
    "Restauration rapide": "Restauration rapide",
    "Hotel": "Hôtel",
    "Boucherie": "Boucherie",
  },

  // Common
  common: {
    loading: "Chargement...",
    loadMore: "Charger plus",
    showMore: "Afficher plus",
    showLess: "Afficher moins",
    previous: "Précédent",
    next: "Suivant",
    of: "de",
    results: "résultats",
  },
}

// Helper function to replace placeholders
export function t(key: string, replacements?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  if (typeof value !== 'string') {
    return key
  }
  
  if (replacements) {
    return Object.entries(replacements).reduce(
      (text, [placeholder, replacement]) =>
        text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(replacement)),
      value
    )
  }
  
  return value
}
