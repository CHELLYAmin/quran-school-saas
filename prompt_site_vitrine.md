# PROMPT FINAL : Site Vitrine Premium (Coran & Culture Islamique)

Ce prompt est optimisé pour les outils de génération UI de haute fidélité (Stitch, v0, Bolt). Il décrit une plateforme publique responsive intégrant dynamiquement les données du SaaS (Communications, Calendriers).

---

## 🎨 DESIGN SYSTEM (OBLIGATOIRE)
- **Vibe :** Spirituelle, majestueuse et technologique (type "Apple-meets-Islamic-Art").
- **Palette de Couleurs :**
    - **Émeraude Sacré (#064E3B) :** Couleur institutionnelle dominante.
    - **Or de Médine (#D4AF37) :** Pour les CTA primaires, bordures de cartes et accents.
    - **Sable Clair (#FDFBF7) :** Fond principal pour la sérénité visuelle.
    - **Nuit Azur (#1E293B) :** Pour une typographie profonde et lisible.
- **Typographie :** **Cinzel** (Titres - élégance classique) + **Inter** (Corps - lisibilité moderne).
- **Style Visuel :**
    - **Radius :** 32px sur toutes les sections et composants ("Soft UI").
    - **Motifs :** Filigranes géométriques islamiques à 2% d'opacité.
    - **Animations :** Transitions fluides (Fade-in-up) et effets "Glassmorphism" pour les widgets.

---

## 🌐 STRUCTURE & INTÉGRATION SAAS

### 1. HEADER DYNAMIQUE (RESPONSIVE)
- **Barre Info :** Affichage de la prochaine prière (sync avec SaaS) + Sélecteur de langue.
- **Navigation :** Accueil, Programmes, Vie du Centre (Actualités/Events), Ramadan (Saisonnier), Dons.
- **CTA :** Bouton "Espace Membre" (Contour Or) et "Donner" (Plein Or).

### 2. SECTION HERO (IMPACT)
- Titre cinématique : "Apprenez, Grandissez et Transmettez".
- Calligraphie arabe stylisée en arrière-plan dynamique.
- **Bannière d'alerte SaaS :** Une zone élégante en haut du hero pour les messages d'urgence ou annonces importantes (ex: "Inscriptions ouvertes").

### 3. HUB DE COMMUNICATION (ACTUALITÉS & ÉVÉNEMENTS)
*Cette section doit refléter dynamiquement les types de communications créées dans le SaaS :*
- **Grid d'Actualités :** Cartes verticales avec image (AspectRatio 4:3), tag de catégorie (École, Spiritualité, Vie Sociale), date et résumé.
- **Calendrier des Événements :** Liste horizontale de "Tuiles" indiquant la date, le titre de l'événement et un bouton "S'inscrire" ou "En savoir plus".
- **Filtres :** Possibilité de filtrer par type (News vs Événements) directement sur la page vitrine.

### 4. MODULE "SOUROUR RAMADAN" (CALENDRIER)
*Module activable via le SaaS pour affichage prioritaire sur la vitrine :*
- **Calendrier Imsakiye :** Tableau design ultra-lisible avec horaires (Imsak, Iftar, Tarawih).
- **Design :** Fond Nuit Azur avec dégradés dorés et icônes lunaires.
- **Responsive :** Sur mobile, affiche une vue "Aujourd'hui" simplifiée avec les chronos restants jusqu'à l'Iftar.
- **Bouton de téléchargement :** "Télécharger le Calendrier PDF" (Généré par le SaaS).

### 5. SECTION PROGRAMMES (ÉCOLE)
- Grille des niveaux (Membres vs Public).
- Affichage des places restantes (Synchronisé avec la base de données SaaS).

### 6. FOOTER INSTITUTIONNEL
- Coordonnées, réseaux sociaux, et une barre d'inscription à la Newsletter "Al-Hikmah".
- Citation coranique hebdomadaire synchronisée avec le dashboard admin.

---

## 📱 DIRECTIVES MOBILE-FIRST
- Toute la navigation doit se transformer en un menu Drawer (tiroir) luxueux sur mobile.
- Les horaires de prière doivent rester accessibles via un bouton flottant ou une barre collante en bas de l'écran (Bottom Dock).
- Optimisation du poids des images calligraphiées pour un chargement instantané.

---
💡 **Instruction Finale pour l'IA :** Ne génère pas seulement du code, génère une expérience. Chaque élément doit respirer la confiance, la tradition et la modernité.
