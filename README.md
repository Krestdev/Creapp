# 🏗️ CREAPP

Application web de gestion centralisée pour les projets, besoins, fournisseurs, utilisateurs, et validations internes d’un bureau d’études techniques. Ce système ERP modulaire vise à digitaliser, structurer et fluidifier le cycle de vie complet des projets techniques.

---

## 🚀 Stack Technique

- **Next.js 14**
- **TypeScript**
- **Zustand** – Gestion d’état global
- **React Hook Form** – Formulaires et validation
- **Zod** – Validation schématique
- **@tanstack/react-query** – Requêtes API, cache et gestion d'état distant
- **Tailwind CSS** – Design système
- **Shadcn/ui** – Composants UI réutilisables

---

## 🧩 Modules fonctionnels

| Module              | Description |
|---------------------|-------------|
| 🧱 Projets           | Création, suivi, gestion des équipes et budgets |
| 📦 Besoins           | Demande, validation multi-niveaux, suivi d'exécution |
| 👨‍💼 Utilisateurs      | Rôles, permissions, affectation des membres |
| 🏢 Services          | Organisation interne des équipes |
| 🧾 Fournisseurs       | Référencement, fiche fournisseur, documents associés |
| 📊 Tableau de bord   | Vue dynamique adaptée au rôle utilisateur |
| 🧮 Tâches             | Attribution, suivi de tâches liées à un projet |
| 📁 Documents         | Upload et gestion centralisée (devis, contrats, etc.) |
| 📑 Notifications     | Alertes de validation, approbations, tâches à faire |

---

## 🧪 Installation locale

### 1. Cloner le repo

```bash
git clone https://github.com/url-du-projet
cd creapp
npm i
touch .env
#Initialiser les variables d'environnement NEXT_PUBLIC_API (url du backend)
npm run dev
```
