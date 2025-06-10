export type User = {
  id: number,
  name: string,
  email: string
  role: string,
  status: "en ligne" | "hors-ligne",
  lastConnection: string,
  service: string,
  poste: string,
  dateCreation: string
}

export const users: User[] = [
  {
    name: "Jean-Jacque Atangana",
    email: "jeanjacque@creap.com",
    role: "Comptable niv1",
    status: "en ligne",
    lastConnection: "Maintenant",
    service: "Architecture",
    poste: "Comptable",
    dateCreation: "01/06/2025",
    id: 0
  },
  {
    name: "Marie Claire Biloa",
    email: "marieclaire@creap.com",
    role: "Ingénieure réseaux niv1",
    status: "en ligne",
    lastConnection: "Il y a 2 heures",
    service: "Informatique",
    poste: "Informaticien",
    dateCreation: "01/06/2025",
    id: 1
  },
  {
    name: "Julien Essomba",
    email: "julienessomba@creap.com",
    role: "Chef de projet niv1",
    status: "hors-ligne",
    lastConnection: "Hier",
    service: "Gestion de projet",
    poste: "Chef de projet",
    dateCreation: "01/06/2025",
    id: 2
  },
  {
    name: "Sandrine Ewane",
    email: "sandrineewane@creap.com",
    role: "Secrétaire niv1",
    status: "en ligne",
    lastConnection: "Il y a 5 minutes",
    service: "Administration",
    poste: "Secrétaire",
    dateCreation: "01/06/2025",
    id: 3
  },
  {
    name: "David Mbarga",
    email: "davidmbarga@creap.com",
    role: "Développeur backend niv1",
    status: "en ligne",
    lastConnection: "Il y a 3 jours",
    service: "Développement",
    poste: "Informaticien",
    dateCreation: "01/06/2025",
    id: 4
  },
  {
    name: "Patricia Mvondo",
    email: "patriciamvondo@creap.com",
    role: "Responsable RH niv1",
    status: "en ligne",
    lastConnection: "Maintenant",
    service: "Ressources humaines",
    poste: "Responsable RH",
    dateCreation: "01/06/2025",
    id: 5
  },
  {
    name: "Fabrice Nkoulou",
    email: "fabricenkoulou@creap.com",
    role: "Technicien de maintenance niv1",
    status: "en ligne",
    lastConnection: "Il y a 1 semaine",
    service: "Support technique",
    poste: "Informaticien",
    dateCreation: "01/06/2025",
    id: 6
  },
  {
    name: "Céline Abena",
    email: "celineabena@creap.com",
    role: "Designer UI/UX niv1",
    status: "en ligne",
    lastConnection: "Il y a 10 minutes",
    service: "Design",
    poste: "Informaticien",
    dateCreation: "01/06/2025",
    id: 7
  },
  {
    name: "Marc Tchatchoua",
    email: "marctchatchoua@creap.com",
    role: "Analyste financier niv1",
    status: "hors-ligne",
    lastConnection: "Il y a 4 heures",
    service: "Finance",
    poste: "Comptable",
    dateCreation: "01/06/2025",
    id: 8
  },
];

export type Service = {
  id: number
  name: string,
  manager: string,
  department: string,
  createdAt: string,
  updateAt: string,
  description: string
  member: string[],
}

export const services: Service[] = [
  {
    id: 0,
    name: "Etudes des sols",
    manager: "1",
    department: "Etudes Techniques",
    createdAt: "01/06/2025",
    updateAt: "01/06/2025",
    description: "la description",
    member: [
      "1", "2", "3"
    ]
  },
  {
    id: 1,
    name: "DAO & Plans",
    manager: "2",
    department: "Etudes Techniques",
    createdAt: "01/06/2025",
    updateAt: "01/06/2025",
    description: "la description",
    member: [
      "1", "2", "3"
    ]
  },
  {
    id: 2,
    name: "Topographie",
    manager: "3",
    department: "Etudes Techniques",
    createdAt: "01/06/2025",
    updateAt: "01/06/2025",
    description: "la description",
    member: [
      "1", "2", "3"
    ]
  }
]

export type Department = {
  id: number,
  name: string,
  manager: string,
  service: string[],
  createdAt: string,
  updateAt: string,
  description: string
}

export const department: Department[] = [
  {
    id: 1,
    name: "Etudes techniques",
    manager: "1",
    service: ["0"],
    createdAt: "01/06/2025",
    updateAt: "01/06/2025",
    description: "La description"
  },
  {
    id: 1,
    name: "Finances",
    manager: "2",
    service: ["1", "2"],
    createdAt: "01/06/2025",
    updateAt: "01/06/2025",
    description: "La description"
  },
  {
    id: 1,
    name: "QHSE",
    manager: "3",
    service: ["2", "1"],
    createdAt: "01/06/2025",
    updateAt: "01/06/2025",
    description: "La description"
  },
  {
    id: 1,
    name: "Direction Generale",
    manager: "4",
    service: ["2", "1", "0"],
    createdAt: "01/06/2025",
    updateAt: "01/06/2025",
    description: ""
  },
]

export type Fournisseur = {
  id: number,
  name: string,
  activities: string[],
  type: string,
  proprietaire: string,
  tel: string,
  adresse: string,
  mail?: string,
  nui?: string,
  registreFiscal?: string
  registreCommerce?: string,
  banque?: string,
  nuCompte?: string,
  codeBanque?: string,
  note?: string
  pieceJointe?: string[],
  lastOrder: string,
  requirement: number,
}

export const fournisseurs: Fournisseur[] = [
  {
    id: 0,
    name: "MAC Computer",
    type: "Distributeur",
    activities: ["Informatique", "Electronique"],
    lastOrder: "23/04/2025",
    requirement: 12,
    proprietaire: "John DOe",
    tel: "+237658854558",
    adresse: "Bonamoussadi, Rue des cocotiers"
  },
  {
    id: 1,
    name: "MAC Computer",
    type: "Grossiste",
    activities: ["Informatique", "Electronique"],
    lastOrder: "23/04/2025",
    requirement: 9,
    proprietaire: "Janne Smith",
    tel: "+237658854558",
    adresse: "Bonamoussadi, Rue des cocotiers"
  },
  {
    id: 2,
    name: "MAC Computer",
    type: "Distributeur",
    activities: ["Informatique", "Electronique"],
    lastOrder: "23/04/2025",
    requirement: 21,
    proprietaire: "Laura Miller",
    tel: "+237658854558",
    adresse: "Bonamoussadi, Rue des cocotiers"
  },
]

export type Besoins = {
  id: number,
  name: string,
  projet: string,
  cout: number,
  dateEcheance: string,
  dateEmission: string,
  statut: "En attente" | "Validé" | "Terminé" | "Refusé",
  nbValidation: number,
  nbTotalVali: number,
  description: string,
  justificatifs: string[]
}

export const besoins: Besoins[] = [
  {
    id: 0,
    name: "Achat pain pour les ouvriers",
    projet: "Voies sur le port de Douala",
    cout: 255000,
    dateEcheance: "12/06/2025",
    dateEmission: "01/06/2025",
    statut: "En attente",
    nbValidation: 2,
    nbTotalVali: 5,
    description: "",
    justificatifs: ["Facture Proformat", "Ordre de service"]
  },
  {
    name: "Fourniture de ciment Portland",
    projet: "Construction pont Wouri",
    cout: 1250000,
    dateEcheance: "15/06/2025",
    dateEmission: "03/06/2025",
    statut: "Validé",
    nbValidation: 5,
    nbTotalVali: 5,
    id: 1,
    description: "",
    justificatifs: ["Facture Proformat", "Ordre de service"]
  },
  {
    name: "Location engins de terrassement",
    projet: "Route Yaoundé-Bafoussam",
    cout: 3500000,
    dateEcheance: "20/06/2025",
    dateEmission: "05/06/2025",
    statut: "En attente",
    nbValidation: 3,
    nbTotalVali: 4,
    id: 2,
    description: "",
    justificatifs: ["Facture Proformat", "Ordre de service"]
  },
  {
    name: "Achat carburant pour véhicules",
    projet: "Maintenance réseau électrique",
    cout: 780000,
    dateEcheance: "18/06/2025",
    dateEmission: "08/06/2025",
    statut: "En attente",
    nbValidation: 1,
    nbTotalVali: 3,
    id: 3,
    description: "",
    justificatifs: ["Facture Proformat", "Ordre de service"]
  },
  {
    name: "Fourniture matériaux électriques",
    projet: "Extension réseau Garoua",
    cout: 2100000,
    dateEcheance: "25/06/2025",
    dateEmission: "02/06/2025",
    statut: "Refusé",
    nbValidation: 0,
    nbTotalVali: 4,
    id: 4,
    description: "",
    justificatifs: ["Facture Proformat", "Ordre de service"]
  },
  {
    name: "Service de gardiennage",
    projet: "Sécurisation chantier Limbé",
    cout: 450000,
    dateEcheance: "30/06/2025",
    dateEmission: "07/06/2025",
    statut: "En attente",
    nbValidation: 2,
    nbTotalVali: 3,
    id: 5,
    description: "",
    justificatifs: ["Facture Proformat", "Ordre de service"]
  },
  {
    name: "Achat équipements de protection",
    projet: "Rénovation stade Ahmadou Ahidjo",
    cout: 320000,
    dateEcheance: "14/06/2025",
    dateEmission: "04/06/2025",
    statut: "Terminé",
    nbValidation: 4,
    nbTotalVali: 4,
    id: 5,
    description: "",
    justificatifs: ["Facture Proformat", "Ordre de service"]
  }
]


