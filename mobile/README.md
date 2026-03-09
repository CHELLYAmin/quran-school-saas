# Quran School Mobile App 📱

Application mobile premium pour la gestion d'école de Coran, synchronisée avec le SaaS Al-Noor.

## 🚀 Installation & Démarrage

1.  **Dépendances** : `npm install`
2.  **Lancement (Dév)** : `npm start`
3.  **Générer un build (APK/IPA)** : 
    - Installer EAS CLI : `npm install -g eas-cli`
    - Se connecter : `eas login`
    - Build Android : `eas build --platform android`

## 🛠 Configuration (apiUrl)

L'URL de l'API est gérée dynamiquement dans `app.json` via le champ `extra.apiUrl`.
Pour le développement local, nous utilisons Localtunnel.

## 🎨 Design System

Le thème premium est défini dans `src/theme.ts`. Pour toute modification visuelle globale (couleurs, espacements), éditez ce fichier.

## 📏 Fonctionnalités Clés

- **Dashboard** : Hub de Vie (News CMS) & Gamification (XP, Streaks).
- **Cockpit Live** : File d'attente intelligente (Smart Queue) pour les enseignants.
- **Suivi** : Progression détaillée par Sourate et Juz.
- **Examens** : (Nouveau) Module d'évaluation mobile.
