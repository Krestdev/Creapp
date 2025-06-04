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


