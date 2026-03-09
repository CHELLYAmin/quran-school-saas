# Quran School SaaS — Application de Gestion d'École de Coran

Application SaaS complète pour la gestion d'écoles de Coran (Hifdh / Tajwid / Lecture).
Multi-tenant, responsive, multilingue (AR/FR/EN).

## 🏗️ Architecture

```
quran-school-saas/
├── backend/                     # .NET 8 — Clean Architecture
│   ├── src/
│   │   ├── QuranSchool.Domain/         # Entités, enums, interfaces
│   │   ├── QuranSchool.Application/    # DTOs, services, validation
│   │   ├── QuranSchool.Infrastructure/ # EF Core, JWT, repos
│   │   └── QuranSchool.API/            # Controllers, middleware
│   ├── tests/QuranSchool.Tests/        # xUnit tests
│   └── Dockerfile
├── frontend/                    # Next.js 14 — App Router
│   ├── src/
│   │   ├── app/                        # Pages & layouts
│   │   ├── lib/                        # API, store, i18n
│   │   └── types/                      # TypeScript interfaces
│   └── Dockerfile
├── mobile/                      # React Native — Expo
│   ├── src/
│   │   ├── screens/                    # Login, Dashboard, etc.
│   │   ├── store/                      # Zustand + AsyncStorage
│   │   └── api/                        # Axios client
│   └── App.tsx
└── docker-compose.yml
```

## 🛠️ Stack Technique

| Couche    | Technologie                                    |
|-----------|------------------------------------------------|
| Frontend  | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Mobile    | React Native, Expo, TypeScript                 |
| Backend   | .NET 8, ASP.NET Core, EF Core                  |
| BDD       | PostgreSQL 16                                  |
| Auth      | JWT + Refresh Token, RBAC                      |
| State     | Zustand                                        |
| i18n      | Arabe, Français, Anglais                       |
| DevOps    | Docker, Docker Compose                         |

## 👤 Rôles

1. **SuperAdmin** — Gestion multi-école
2. **Admin** — Gestion d'une école
3. **Enseignant** — Suivi pédagogique, présences
4. **Examinateur** — Examens et notation
5. **Parent** — Suivi enfant, paiements
6. **Élève** — Progression personnelle
7. **Comptable** — Finances

## 📦 Modules

| Module          | Fonctionnalités clés                                  |
|-----------------|-------------------------------------------------------|
| Auth            | Login, Register, JWT, Refresh, RBAC                   |
| École           | Info école, années académiques, paramètres             |
| Élèves          | Fiches, historique, affectation groupe, liaison parent |
| Suivi           | Par Sourate/Juz/Hizb, score qualité, notes enseignant |
| Examens         | Hifdh/Tajwid/Révision, notation, certificats           |
| Planning        | Calendrier, groupes, salles, vacances                  |
| Groupes         | Niveaux, capacité, assignation                         |
| Présences       | Marquage, historique, taux, notification               |
| Finance         | Paiements, réductions fratrie, factures, dashboard     |
| Communication   | Messagerie interne, notifications                      |
| Dashboard       | Stats par rôle, graphiques, progression                |

## 🚀 Démarrage Rapide

### Prérequis
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16](https://www.postgresql.org/) ou Docker
- [Expo CLI](https://docs.expo.dev/) (pour le mobile)

### Option 1 : Docker Compose (Recommandé)

```bash
# Clone et démarrage
docker-compose up -d

# L'API sera sur http://localhost:5000
# Le frontend sera sur http://localhost:3000
# Swagger: http://localhost:5000/swagger
```

### Option 2 : Démarrage Manuel

#### Backend
```bash
cd backend
dotnet restore
dotnet ef database update --project src/QuranSchool.Infrastructure --startup-project src/QuranSchool.API
dotnet run --project src/QuranSchool.API
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

#### Mobile
```bash
cd mobile
npm install
npx expo start
# Scannez le QR code avec Expo Go
```

### Comptes Démo

| Rôle       | Email                    | Mot de passe |
|------------|--------------------------|--------------|
| SuperAdmin | superadmin@quranschool.com | Admin@123   |
| Admin      | admin@alnoor-quran.fr    | Admin@123    |
| Enseignant | teacher@alnoor-quran.fr  | Teacher@123  |
| Parent     | parent@example.com       | Parent@123   |

## 📡 API Endpoints

| Méthode | Endpoint                  | Description             | Auth  |
|---------|---------------------------|-------------------------|-------|
| POST    | /api/Auth/login           | Connexion               | ❌    |
| POST    | /api/Auth/register        | Inscription             | ❌    |
| POST    | /api/Auth/refresh         | Rafraîchir token        | ❌    |
| GET     | /api/Student              | Liste élèves            | ✅    |
| POST    | /api/Student              | Créer élève             | Admin |
| GET     | /api/Group                | Liste groupes           | ✅    |
| POST    | /api/Exam                 | Créer examen            | Teacher |
| POST    | /api/Attendance           | Marquer présence        | Teacher |
| POST    | /api/Attendance/bulk      | Marquage en masse       | Teacher |
| GET     | /api/Payment              | Liste paiements         | Admin |
| GET     | /api/Progress/student/{id}| Progression élève       | ✅    |
| GET     | /api/Dashboard/admin      | Dashboard admin         | Admin |
| GET     | /api/Dashboard/teacher/{id}| Dashboard enseignant   | Teacher |
| GET     | /api/Dashboard/parent/{id}| Dashboard parent        | Parent |

> Voir Swagger (`/swagger`) pour la documentation complète.

## 🧪 Tests

```bash
cd backend
dotnet test
```

## 🗂️ Configuration

### Variables d'environnement

```env
# Base de données
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=quranschool;Username=postgres;Password=postgres

# JWT
Jwt__Key=QuranSchoolSuperSecretKeyAtLeast32Characters!
Jwt__Issuer=QuranSchool
Jwt__Audience=QuranSchoolApp

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📄 Licence

MIT License — Usage libre.
