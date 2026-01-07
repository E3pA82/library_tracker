# Structure du projet
library-tracker/
│
├── backend/                          # Django Backend
│   ├── config/                       # Configuration Django
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/
│   │   ├── users/                    # Gestion utilisateurs
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   │
│   │   ├── books/                    # Gestion livres
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   │
│   │   ├── library/                  # Bibliothèque personnelle
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── signals.py
│   │   │   └── admin.py
│   │   │
│   │   └── goals/                    # Objectifs de lecture
│   │       ├── __init__.py
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       └── admin.py
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                         # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── books/
│   │   │   ├── library/
│   │   │   ├── dashboard/
│   │   │   └── goals/
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Library.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── ReadingLists.jsx
│   │   │   ├── Goals.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookService.js
│   │   │   └── libraryService.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.js
│   │
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml
└── README.md

# Structure minimale du projet
library-tracker/
│
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
└── README.md

#  Endpoints API
Méthode	URL	Description
POST	/api/register/	Inscription
POST	/api/login/	Connexion (JWT)
GET/POST	/api/authors/	Auteurs
GET/POST	/api/books/	Livres
GET/POST	/api/my-books/	Ma bibliothèque
POST	/api/my-books/{id}/update_progress/	Mettre à jour pages
GET	/api/my-books/stats/	Statistiques
GET/POST	/api/goals/	Objectifs
GET/POST	/api/lists/	Listes de lecture

Composant	Fichiers clés
Backend	models.py, serializers.py, views.py, urls.py
Frontend	api.js, AuthContext.js, App.jsx, pages
Base	PostgreSQL avec 5 tables