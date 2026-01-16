```markdown
# 📚 TODO - Projet Gestion de Bibliothèque

## 📋 Vue d'ensemble du projet

- **Nom** : Library Tracker
- **Stack** : Django REST Framework + React + PostgreSQL
- **Fonctionnalités** : Gestion de bibliothèque personnelle, suivi de lecture, objectifs, tableau de bord



## 🎯 Légende

- [ ] À faire
- [x] Terminé
- 🔴 Priorité haute
- 🟡 Priorité moyenne
- 🟢 Priorité basse



# PHASE 1 : CONFIGURATION INITIALE 🔴

## 1.1 Environnement de développement

- [X] Créer la structure des dossiers du projet
- [x] Créer et activer l'environnement virtuel Python
- [x] Installer les dépendances backend (requirements.txt)
- [x] Créer le projet Django
- [x] Créer l'application `api`
- [x] Configurer `.gitignore`
- [x] Créer `.env` avec les variables d'environnement
- [X] Créer `.env.example` (template sans secrets)

## 1.2 Base de données

- [x] Installer PostgreSQL (si pas déjà fait)
- [x] Créer la base de données `library_db`
- [X] Configurer la connexion dans `settings.py`
- [X] Tester la connexion à la base de données

## 1.3 Configuration Django

- [X] Configurer `settings.py` :
  - [X] INSTALLED_APPS
  - [X] MIDDLEWARE (CORS)
  - [X] DATABASE
  - [X] REST_FRAMEWORK
  - [X] SIMPLE_JWT
  - [X] CORS_ALLOWED_ORIGINS
- [X] Configurer `urls.py` principal


# PHASE 2 : MODÈLES DE DONNÉES 🔴

## 2.1 Modèle Author (Auteur)

- [X] Créer le modèle `Author`
  - [X] Champ `name` (CharField)
- [X] Ajouter `__str__` method

## 2.2 Modèle Book (Livre - Catalogue)

- [X] Créer le modèle `Book`
  - [X] Champ `title` (CharField)
  - [X] Champ `author` (ForeignKey vers Author)
  - [X] Champ `total_pages` (PositiveIntegerField)
- [X] Ajouter `__str__` method

## 2.3 Modèle UserBook (Bibliothèque personnelle)

- [X] Créer le modèle `UserBook`
  - [X] Champ `user` (ForeignKey vers User)
  - [X] Champ `book` (ForeignKey vers Book)
  - [X] Champ `status` (CharField avec choices: non_lu, en_cours, lu)
  - [X] Champ `pages_read` (PositiveIntegerField, default=0)
  - [X] Champ `comment` (TextField, blank=True)
  - [X] Champ `date_added` (DateTimeField, auto_now_add)
- [X] Ajouter contrainte `unique_together = ['user', 'book']`
- [X] Implémenter la méthode `save()` pour mise à jour automatique du statut
- [X] Ajouter propriété `progress` (pourcentage de lecture)

## 2.4 Modèle ReadingGoal (Objectifs)

- [X] Créer le modèle `ReadingGoal`
  - [X] Champ `user` (ForeignKey vers User)
  - [X] Champ `goal_type` (CharField: pages ou books)
  - [X] Champ `period` (CharField: daily, weekly, monthly, yearly)
  - [X] Champ `target` (PositiveIntegerField)
  - [X] Champ `start_date` (DateField)
  - [X] Champ `end_date` (DateField)
- [X] Ajouter `__str__` method

## 2.5 Modèle ReadingList (Listes de lecture)

- [X] Créer le modèle `ReadingList`
  - [X] Champ `user` (ForeignKey vers User)
  - [X] Champ `name` (CharField)
  - [X] Champ `books` (ManyToManyField vers UserBook)
  - [X] Champ `created_at` (DateTimeField, auto_now_add)
- [X] Ajouter `__str__` method

## 2.6 Migrations

- [X] Générer les migrations : `python manage.py makemigrations`
- [X] Appliquer les migrations : `python manage.py migrate`
- [X] Vérifier les tables créées dans PostgreSQL

## 2.7 Admin Django

- [X] Enregistrer tous les modèles dans `admin.py`
- [X] Créer un superutilisateur : `python manage.py createsuperuser`
- [X] Tester l'accès admin : http://localhost:8000/admin



# PHASE 3 : API REST - SERIALIZERS 🔴

## 3.1 UserSerializer

- [X] Créer `UserSerializer`
  - [X] Champs : id, username, email, password
  - [X] password en write_only
  - [X] Méthode `create()` pour hacher le mot de passe

## 3.2 AuthorSerializer

- [X] Créer `AuthorSerializer`
  - [X] Champs : id, name

## 3.3 BookSerializer

- [X] Créer `BookSerializer`
  - [X] Champs : id, title, author, author_id, total_pages
  - [X] author en read_only (nested)
  - [X] author_id en write_only

## 3.4 UserBookSerializer

- [X] Créer `UserBookSerializer`
  - [X] Champs : id, book, book_id, status, pages_read, comment, progress, date_added
  - [X] book en read_only (nested)
  - [X] book_id en write_only
  - [X] status en read_only (calculé automatiquement)
  - [X] progress en read_only

## 3.5 ReadingGoalSerializer

- [X] Créer `ReadingGoalSerializer`
  - [X] Champs : id, goal_type, period, target, start_date, end_date

## 3.6 ReadingListSerializer

- [X] Créer `ReadingListSerializer`
  - [X] Champs : id, name, books, created_at
  - [X] books en read_only (nested)



# PHASE 4 : API REST - VIEWS 🔴

## 4.1 Authentification

- [X] Créer `RegisterView` (CreateAPIView)
  - [X] Permission : AllowAny
  - [X] Serializer : UserSerializer

## 4.2 AuthorViewSet

- [X] Créer `AuthorViewSet` (ModelViewSet)
  - [X] queryset : tous les auteurs
  - [X] serializer : AuthorSerializer

## 4.3 BookViewSet

- [X] Créer `BookViewSet` (ModelViewSet)
  - [x] queryset : tous les livres avec select_related('author')
  - [X] serializer : BookSerializer

## 4.4 UserBookViewSet

- [X] Créer `UserBookViewSet` (ModelViewSet)
  - [X] queryset : filtré par utilisateur connecté
  - [X] serializer : UserBookSerializer
  - [X] Méthode `perform_create()` : assigner l'utilisateur
- [X] Action `update_progress` :
  - [X] Endpoint POST pour mettre à jour pages_read
  - [X] Retourner le livre mis à jour
- [X] Action `stats` :
  - [X] Endpoint GET pour les statistiques
  - [X] Retourner : total, lu, en_cours, non_lu, pages_lues

## 4.5 ReadingGoalViewSet

- [X] Créer `ReadingGoalViewSet` (ModelViewSet)
  - [X] queryset : filtré par utilisateur connecté
  - [X] serializer : ReadingGoalSerializer
  - [X] Méthode `perform_create()` : assigner l'utilisateur

## 4.6 ReadingListViewSet

- [X] Créer `ReadingListViewSet` (ModelViewSet)
  - [X] queryset : filtré par utilisateur connecté
  - [X] serializer : ReadingListSerializer
  - [X] Méthode `perform_create()` : assigner l'utilisateur
- [X] Action `add_book` :
  - [X] Endpoint POST pour ajouter un livre à la liste
- [X] Action `remove_book` :
  - [X] Endpoint POST pour retirer un livre de la liste



# PHASE 5 : API REST - URLS 🔴

## 5.1 Configuration des URLs

- [X] Créer le routeur DefaultRouter
- [X] Enregistrer les ViewSets :
  - [X] `authors` → AuthorViewSet
  - [X] `books` → BookViewSet
  - [X] `my-books` → UserBookViewSet
  - [X] `goals` → ReadingGoalViewSet
  - [X] `lists` → ReadingListViewSet
- [X] Ajouter les URLs d'authentification :
  - [X] `/api/register/` → RegisterView
  - [X] `/api/login/` → TokenObtainPairView
  - [X] `/api/token/refresh/` → TokenRefreshView

## 5.2 Tests API

- [X] Tester avec Postman ou curl :
  - [X] POST `/api/register/` - Inscription
  - [X] POST `/api/login/` - Connexion (récupérer token)
  - [X] GET `/api/authors/` - Liste auteurs
  - [X] POST `/api/authors/` - Créer auteur
  - [X] GET `/api/books/` - Liste livres
  - [X] POST `/api/books/` - Créer livre
  - [X] GET `/api/my-books/` - Ma bibliothèque
  - [X] POST `/api/my-books/` - Ajouter livre à ma bibliothèque
  - [X] POST `/api/my-books/{id}/update_progress/` - Mettre à jour progression
  - [X] GET `/api/my-books/stats/` - Statistiques
  - [X] GET `/api/goals/` - Mes objectifs
  - [X] POST `/api/goals/` - Créer objectif
  - [X] GET `/api/lists/` - Mes listes
  - [X] POST `/api/lists/` - Créer liste



# PHASE 6 : FRONTEND - CONFIGURATION 🔴

## 6.1 Initialisation React

- [X] Créer le projet React : `npx create-react-app frontend`
- [X] Installer les dépendances :
  - [X] `axios` - Requêtes HTTP
  - [X] `react-router-dom` - Navigation

## 6.2 Structure des dossiers

- [X] Créer la structure :
  
  src/
  ├── components/
  ├── pages/
  ├── services/
  ├── context/
  └── App.jsx
  

## 6.3 Service API

- [X] Créer `src/services/api.js`
  - [X] Configurer axios avec baseURL
  - [X] Intercepteur pour ajouter le token JWT
  - [X] Intercepteur pour gérer les erreurs 401



# PHASE 7 : FRONTEND - AUTHENTIFICATION 🔴

## 7.1 Context d'authentification

- [X] Créer `src/context/AuthContext.js`
  - [X] State : user (boolean ou objet)
  - [X] Fonction `login(username, password)`
  - [X] Fonction `logout()`
  - [X] Stocker le token dans localStorage

## 7.2 Page de connexion

- [X] Créer `src/pages/Login.jsx`
  - [X] Formulaire : username, password
  - [X] Appel API `/api/login/`
  - [X] Redirection vers Dashboard après connexion
  - [X] Gestion des erreurs

## 7.3 Page d'inscription

- [X] Créer `src/pages/Register.jsx`
  - [X] Formulaire : username, email, password
  - [X] Appel API `/api/register/`
  - [X] Redirection vers Login après inscription
  - [X] Gestion des erreurs

## 7.4 Route protégée

- [X] Créer composant `PrivateRoute`
  - [X] Vérifier si utilisateur connecté
  - [X] Rediriger vers /login si non connecté



# PHASE 8 : FRONTEND - PAGES PRINCIPALES 🟡

## 8.1 Layout principal

- [ ] Créer `src/components/Navbar.jsx`
  - [ ] Logo/Titre
  - [ ] Liens de navigation
  - [ ] Bouton déconnexion
- [ ] Créer `src/components/Layout.jsx`
  - [ ] Navbar + contenu principal

## 8.2 Page Dashboard

- [ ] Créer `src/pages/Dashboard.jsx`
  - [ ] Afficher les statistiques (appel `/api/my-books/stats/`)
  - [ ] Cards : Total livres, Lus, En cours, Non lus, Pages lues
  - [ ] Section : Livres en cours de lecture
  - [ ] Section : Objectifs actifs

## 8.3 Page Bibliothèque

- [ ] Créer `src/pages/Library.jsx`
  - [ ] Liste des livres de l'utilisateur
  - [ ] Filtres par statut (tous, lu, en_cours, non_lu)
  - [ ] Pour chaque livre afficher :
    - [ ] Titre, Auteur
    - [ ] Statut
    - [ ] Barre de progression
    - [ ] Pages lues / Total pages
  - [ ] Bouton pour mettre à jour les pages lues
  - [ ] Bouton pour supprimer de la bibliothèque

## 8.4 Page Ajouter un livre

- [ ] Créer `src/pages/AddBook.jsx`
  - [ ] Rechercher dans le catalogue existant
  - [ ] OU créer un nouveau livre :
    - [ ] Formulaire : Titre, Auteur, Nombre de pages
    - [ ] Si auteur n'existe pas, le créer
  - [ ] Ajouter à la bibliothèque personnelle

## 8.5 Page Détail d'un livre

- [ ] Créer `src/pages/BookDetail.jsx`
  - [ ] Afficher toutes les infos du livre
  - [ ] Formulaire pour mettre à jour :
    - [ ] Pages lues (input number)
    - [ ] Commentaire (textarea)
  - [ ] Afficher le statut actuel
  - [ ] Barre de progression visuelle



# PHASE 9 : FRONTEND - OBJECTIFS 🟡

## 9.1 Page Objectifs

- [ ] Créer `src/pages/Goals.jsx`
  - [ ] Liste des objectifs actuels
  - [ ] Pour chaque objectif :
    - [ ] Type (pages/livres)
    - [ ] Période (jour/semaine/mois/année)
    - [ ] Cible vs Actuel
    - [ ] Barre de progression
  - [ ] Bouton créer nouvel objectif
  - [ ] Bouton supprimer objectif

## 9.2 Formulaire création objectif

- [ ] Créer `src/components/GoalForm.jsx`
  - [ ] Select : Type (pages ou livres)
  - [ ] Select : Période (quotidien, hebdo, mensuel, annuel)
  - [ ] Input : Objectif (nombre)
  - [ ] Date début / Date fin
  - [ ] Bouton soumettre

## 9.3 Calcul de progression des objectifs

- [ ] Implémenter le calcul côté backend :
  - [ ] Pour type "pages" : somme des pages lues dans la période
  - [ ] Pour type "books" : nombre de livres avec status="lu" dans la période
- [ ] Ajouter endpoint `/api/goals/{id}/progress/`



# PHASE 10 : FRONTEND - LISTES DE LECTURE 🟡

## 10.1 Page Listes de lecture

- [ ] Créer `src/pages/ReadingLists.jsx`
  - [ ] Liste des listes créées par l'utilisateur
  - [ ] Pour chaque liste :
    - [ ] Nom
    - [ ] Nombre de livres
    - [ ] Aperçu des livres
  - [ ] Bouton créer nouvelle liste
  - [ ] Bouton supprimer liste

## 10.2 Page Détail d'une liste

- [ ] Créer `src/pages/ListDetail.jsx`
  - [ ] Afficher tous les livres de la liste
  - [ ] Bouton retirer un livre
  - [ ] Bouton ajouter un livre (depuis ma bibliothèque)

## 10.3 Formulaire création liste

- [ ] Créer `src/components/ListForm.jsx`
  - [ ] Input : Nom de la liste
  - [ ] Bouton soumettre



# PHASE 11 : AMÉLIORATIONS BACKEND 🟡

## 11.1 Filtres et recherche

- [ ] Ajouter filtres sur UserBookViewSet :
  - [ ] Filtrer par statut
  - [ ] Recherche par titre
- [ ] Ajouter filtres sur BookViewSet :
  - [ ] Recherche par titre
  - [ ] Filtrer par auteur
- [ ] Ajouter filtres sur ReadingGoalViewSet :
  - [ ] Filtrer par période
  - [ ] Filtrer par type

## 11.2 Pagination

- [ ] Configurer la pagination dans settings.py
- [ ] Tester la pagination sur les listes

## 11.3 Validation

- [ ] Valider que pages_read <= total_pages
- [ ] Valider les dates des objectifs (start_date < end_date)
- [ ] Valider l'unicité user + book dans UserBook



# PHASE 12 : AMÉLIORATIONS FRONTEND 🟢

## 12.1 Styles CSS

- [ ] Installer Tailwind CSS OU créer fichiers CSS
- [ ] Styliser la Navbar
- [ ] Styliser les Cards
- [ ] Styliser les formulaires
- [ ] Styliser les barres de progression
- [ ] Responsive design (mobile-first)

## 12.2 UX Améliorations

- [ ] Ajouter loading spinners
- [ ] Ajouter messages de succès/erreur (toasts)
- [ ] Ajouter confirmations de suppression
- [ ] Ajouter animations de transition

## 12.3 Composants réutilisables

- [ ] Créer `src/components/BookCard.jsx`
- [ ] Créer `src/components/ProgressBar.jsx`
- [ ] Créer `src/components/StatCard.jsx`
- [ ] Créer `src/components/Modal.jsx`
- [ ] Créer `src/components/Button.jsx`
- [ ] Créer `src/components/Input.jsx`



# PHASE 13 : FONCTIONNALITÉS AVANCÉES 🟢

## 13.1 Profil utilisateur

- [ ] Créer modèle `Profile` (optionnel, extension de User)
  - [ ] Avatar
  - [ ] Bio
  - [ ] Genre favori
- [ ] Créer page `src/pages/Profile.jsx`
- [ ] Permettre la modification du profil

## 13.2 Sessions de lecture (optionnel)

- [ ] Créer modèle `ReadingSession`
  - [ ] user_book (FK)
  - [ ] date
  - [ ] pages_read (dans cette session)
  - [ ] duration_minutes
  - [ ] notes
- [ ] Historique détaillé de lecture
- [ ] Graphiques de progression

## 13.3 Favoris

- [ ] Ajouter champ `is_favorite` sur UserBook
- [ ] Filtrer les favoris
- [ ] Bouton toggle favori

## 13.4 Notes/Ratings

- [ ] Ajouter champ `rating` (1-5) sur UserBook
- [ ] Afficher les étoiles
- [ ] Permettre de noter un livre



# PHASE 14 : TESTS 🟢

## 14.1 Tests Backend

- [ ] Tests unitaires des modèles
  - [ ] Test création Author
  - [ ] Test création Book
  - [ ] Test création UserBook
  - [ ] Test mise à jour automatique du statut
  - [ ] Test calcul du pourcentage de progression
- [ ] Tests des serializers
- [ ] Tests des views/endpoints
  - [ ] Test inscription
  - [ ] Test connexion
  - [ ] Test CRUD livres
  - [ ] Test mise à jour progression

## 14.2 Tests Frontend

- [ ] Tests des composants avec React Testing Library
- [ ] Tests des pages principales
- [ ] Tests du context d'authentification



# PHASE 15 : DÉPLOIEMENT 🟢

## 15.1 Préparation production

- [ ] Configurer DEBUG=False
- [ ] Configurer ALLOWED_HOSTS
- [ ] Configurer les fichiers statiques
- [ ] Configurer CORS pour le domaine de production
- [ ] Sécuriser les headers HTTP

## 15.2 Base de données production

- [ ] Créer base PostgreSQL de production
- [ ] Configurer les variables d'environnement

## 15.3 Déploiement Backend

- [ ] Option : Railway / Render / Heroku / VPS
- [ ] Configurer Gunicorn
- [ ] Configurer les variables d'environnement

## 15.4 Déploiement Frontend

- [ ] Build : `npm run build`
- [ ] Option : Vercel / Netlify / GitHub Pages
- [ ] Configurer l'URL de l'API

## 15.5 Domaine et HTTPS

- [ ] Configurer un nom de domaine (optionnel)
- [ ] Configurer HTTPS



# 📊 RÉCAPITULATIF DES PHASES

| Phase | Description | Priorité | Statut |
|-------|-------------|----------|--------|
| 1     | Configuration initiale | 🔴     | [ ] |
| 2 | Modèles de données         | 🔴 | [ ] |
| 3 | API - Serializers | 🔴 | [ ] |
| 4 | API - Views | 🔴 | [ ] |
| 5 | API - URLs | 🔴 | [ ] |
| 6 | Frontend - Config | 🔴 | [ ] |
| 7 | Frontend - Auth | 🔴 | [ ] |
| 8 | Frontend - Pages | 🟡 | [ ] |
| 9 | Frontend - Objectifs | 🟡 | [ ] |
| 10 | Frontend - Listes | 🟡 | [ ] |
| 11 | Améliorations Backend | 🟡 | [ ] |
| 12 | Améliorations Frontend | 🟢 | [ ] |
| 13 | Fonctionnalités avancées | 🟢 | [ ] |
| 14 | Tests | 🟢 | [ ] |
| 15 | Déploiement | 🟢 | [ ] |



# 📝 NOTES

- Commencer par les phases 🔴 (priorité haute)
- Ne pas passer à la phase suivante avant d'avoir terminé la précédente
- Tester chaque fonctionnalité avant de passer à la suivante
- Commiter régulièrement sur Git
- Documenter le code au fur et à mesure



# 🐛 BUGS À CORRIGER

<!-- Ajouter ici les bugs découverts pendant le développement -->



# 💡 IDÉES FUTURES

- [ ] Mode sombre
- [ ] Export des données (PDF, CSV)
- [ ] Partage de listes publiques
- [ ] Recommandations de livres
- [ ] Intégration API Google Books pour récupérer les infos des livres
- [ ] Notifications pour les objectifs
- [ ] Application mobile (React Native)
- [ ] Statistiques avancées avec graphiques
- [ ] Badges/Achievements de lecture
```



## 📥 Comment utiliser ce fichier

1. **Copie** ce contenu dans un fichier `TODO.md` à la racine de ton projet
2. **Coche** les cases au fur et à mesure avec `[x]`
3. **Ajoute** des notes dans les sections appropriées
4. **Commit** régulièrement les mises à jour du TODO

```bash
# Créer le fichier
touch TODO.md
# ou sur Windows PowerShell
New-Item -Path TODO.md -ItemType File
```

Tu veux que je t'accompagne sur une phase spécifique ?