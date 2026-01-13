# Library Tracker - Personal Book Management System

## Project Description

Library Tracker is a full‑stack web application for managing your personal library, tracking reading progress, setting reading goals, and organizing books into customizable reading lists.

- Backend: Django + Django REST Framework (DRF), JWT authentication  
- Frontend: React (with Tailwind CSS)  
- Designed to provide a clean, well‑structured REST API that can be consumed by web or mobile clients.

---

## Project Objective

The objective of this project is to enable a user to:

- Manage their **own personal library** of books
- Track **reading progress** per book (pages read, status)
- Set **reading goals** (number of pages or books over a given period)
- Create **custom reading lists** (book playlists)
- Use a **clean backend API** to power a frontend (React, mobile, etc.)

---

## Key Features

### Personal Library Management

- Add books to your personal library from a global catalog (`UserBook`)
- Store book details: title, author, total pages (and optionally cover image/cover color)
- Track reading status:
  - Conceptually: Not Started / In Progress / Completed
  - Backend enum values: `non_lu`, `en_cours`, `lu`
- Update pages read:
  - `0` pages → status `non_lu`
  - `> 0` and `< total_pages` → status `en_cours`
  - `>= total_pages` → status `lu` (capped at `total_pages`)
- Automatic calculation of reading progress (%) per book

### Reading Analytics

- Global statistics on the personal library:
  - Total number of books
  - Books read / in progress / not started
  - Total pages read
- Progress percentage per book

### Reading Goals

- Create reading goals (`ReadingGoal`):
  - Goal type: `pages` or `books`
  - Period: `daily`, `weekly`, `monthly`, `yearly`
  - Target amount (`target`)
  - Start date / end date
- Track completion and progress towards goals over time

### Reading Lists

- Create reading lists (`ReadingList`) per user:
  - Example lists: “To Read”, “Favorites”, “2024 Reading Challenge”
  - Associate books from the user’s library (`UserBook`)
- Actions:
  - Add a book to a list
  - Remove a book from a list
- Future feature: share lists with other users

### Authentication & Users

- User registration
- Login via JWT (access + refresh tokens)
- Each user has:
  - Their own library
  - Their own reading goals
  - Their own reading lists
- Secure access to API endpoints via JWT

---

## Technology Stack

### Backend

- Python
- Django
- Django REST Framework
- djangorestframework-simplejwt (JWT authentication)
- django-cors-headers
- python-decouple (environment variables)
- PostgreSQL
- drf-spectacular (API schema / Swagger UI, if configured)

### Frontend

- React
- Tailwind CSS
- Axios (HTTP client)
- React Router

---

## Project Structure

```bash
library-tracker/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py       # Django configuration
│   │   ├── urls.py           # Main project URLs
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── admin.py          # Register models in Django admin
│   │   ├── apps.py
│   │   ├── models.py         # Author, Book, UserBook, ReadingGoal, ReadingList
│   │   ├── serializers.py    # DRF serializers
│   │   ├── views.py          # DRF views / viewsets
│   │   └── urls.py           # API URLs
│   │
│   ├── manage.py
│   ├── requirements.txt      # Backend dependencies
│   ├── .env                  # Environment variables (not versioned)
│   └── .env.example          # Example env file (versioned)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/         # Axios calls to the API
│   │   ├── context/          # AuthContext, etc.
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── TODO.md
├── .gitignore
└── README.md
```

---

## Main Models

### Author

```python
class Author(models.Model):
    name = models.CharField(max_length=200)
```

### Book

```python
class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    total_pages = models.PositiveIntegerField()
```

### UserBook (Personal Library)

```python
class UserBook(models.Model):
    class Status(models.TextChoices):
        NON_LU = 'non_lu', 'Non lu'
        EN_COURS = 'en_cours', 'En cours'
        LU = 'lu', 'Lu'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_books')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NON_LU)
    pages_read = models.PositiveIntegerField(default=0)
    comment = models.TextField(blank=True)
    date_added = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'book']

    def save(self, *args, **kwargs):
        # Automatic status update
        if self.pages_read >= self.book.total_pages:
            self.status = self.Status.LU
            self.pages_read = self.book.total_pages
        elif self.pages_read > 0:
            self.status = self.Status.EN_COURS
        super().save(*args, **kwargs)

    @property
    def progress(self):
        if self.book.total_pages > 0:
            return round((self.pages_read / self.book.total_pages) * 100)
        return 0
```

### ReadingGoal

```python
class ReadingGoal(models.Model):
    class Period(models.TextChoices):
        DAILY = 'daily', 'Jour'
        WEEKLY = 'weekly', 'Semaine'
        MONTHLY = 'monthly', 'Mois'
        YEARLY = 'yearly', 'Année'

    class GoalType(models.TextChoices):
        PAGES = 'pages', 'Pages'
        BOOKS = 'books', 'Livres'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    goal_type = models.CharField(max_length=10, choices=GoalType.choices)
    period = models.CharField(max_length=10, choices=Period.choices)
    target = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
```

### ReadingList

```python
class ReadingList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reading_lists')
    name = models.CharField(max_length=100)
    books = models.ManyToManyField(UserBook, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## API

### Base URL

- Local development base URL: `http://127.0.0.1:8000/api/`

### Authentication

- `POST /api/register/`  
  Register a new user

- `POST /api/login/`  
  Obtain `access` and `refresh` JWT tokens

- `POST /api/token/refresh/`  
  Refresh access token

### Authors

- `GET /api/authors/` – List authors  
- `POST /api/authors/` – Create an author  
- `GET /api/authors/{id}/` – Author detail  
- `PUT/PATCH /api/authors/{id}/` – Update an author  
- `DELETE /api/authors/{id}/` – Delete an author  

### Books (Global Catalog)

- `GET /api/books/` – List books  
- `POST /api/books/` – Create a book  
- `GET /api/books/{id}/` – Book detail  
- `PUT/PATCH /api/books/{id}/` – Update a book  
- `DELETE /api/books/{id}/` – Delete a book  

### My Library (`UserBook`)

- `GET /api/my-books/` – List the authenticated user’s books  
- `POST /api/my-books/` – Add a catalog book to the user’s library (`book_id`)  
- `GET /api/my-books/{id}/` – Detail of a book in the user’s library  
- `PUT/PATCH /api/my-books/{id}/` – Update comment, `pages_read`, etc.  
- `DELETE /api/my-books/{id}/` – Remove from the user’s library  

Custom actions:

- `POST /api/my-books/{id}/update_progress/`  
  Update `pages_read` for this book

- `GET /api/my-books/stats/`  
  Get reading statistics (total, read, in progress, not started, pages read)

### Reading Goals

- `GET /api/goals/` – List user’s goals  
- `POST /api/goals/` – Create a goal  
- `GET /api/goals/{id}/` – Goal detail  
- `PUT/PATCH /api/goals/{id}/` – Update a goal  
- `DELETE /api/goals/{id}/` – Delete a goal  

### Reading Lists

- `GET /api/lists/` – List user’s reading lists  
- `POST /api/lists/` – Create a list  
- `GET /api/lists/{id}/` – List detail  
- `PUT/PATCH /api/lists/{id}/` – Update a list  
- `DELETE /api/lists/{id}/` – Delete a list  

Custom actions:

- `POST /api/lists/{id}/add_book/`  
  Add a `UserBook` to the list (`book_id` in the request body)

- `POST /api/lists/{id}/remove_book/`  
  Remove a `UserBook` from the list  

### API Documentation

If configured with drf-spectacular:

- OpenAPI schema / Swagger UI:  
  `http://localhost:8000/api/schema` (or the corresponding Swagger UI URL)

**Summary of key endpoints:**

| Endpoint                                  | Method | Description                          |
|-------------------------------------------|--------|--------------------------------------|
| `/api/register/`                          | POST   | Register a new user                  |
| `/api/login/`                             | POST   | Get JWT tokens                       |
| `/api/my-books/`                          | GET    | List books in user’s library         |
| `/api/my-books/{id}/update_progress/`     | POST   | Update pages read for a book         |
| `/api/my-books/stats/`                    | GET    | Get reading statistics               |
| `/api/goals/`                             | POST   | Create a new reading goal            |
| `/api/lists/`                             | GET    | List all reading lists               |
| `/api/lists/{id}/add_book/`               | POST   | Add book to a reading list           |

---

## Installation & Configuration

### Prerequisites

- Python 3.8+
- Node.js (v18+ recommended)
- PostgreSQL
- `pip` and `venv` (Python virtual environments)

### 1. Clone the Project

```bash
git clone <repo-url>
cd library-tracker
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2.1 Configure Environment Variables

1. Copy the example file:

   ```bash
   cp .env.example .env
   # On Windows PowerShell:
   # copy .env.example .env
   ```

2. Edit `backend/.env`:

   ```env
   SECRET_KEY=your_generated_secret_key
   DEBUG=True

   DB_NAME=library_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

#### 2.2 Create the Database

Create the PostgreSQL database (e.g. via `psql`):

```sql
CREATE DATABASE library_db;
```

#### 2.3 Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 2.4 Create a Superuser (optional)

```bash
python manage.py createsuperuser
```

### 3. Frontend Setup

From the project root:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Running the Application

1. Start the backend server (from `backend/`, with venv activated):

   ```bash
   python manage.py runserver
   ```

   - API base: `http://127.0.0.1:8000/api/`
   - Django admin: `http://127.0.0.1:8000/admin/`

2. Start the frontend (from `frontend/`):

   ```bash
   npm run dev
   ```

   - Frontend: `http://localhost:3000`

---

## API Testing

You can test the API using:

- DRF’s browsable API (`/api/` in the browser)
- Postman / Insomnia (recommended)
- Swagger UI via drf-spectacular (if configured) at `/api/schema`

Example Postman workflow:

1. `POST /api/register/` – create a user  
2. `POST /api/login/` – obtain `access` and `refresh` tokens  
3. Add header `Authorization: Bearer <access_token>` to subsequent requests  
4. Create an author, a book, add it to your library, update progress, etc.

---

## Development Notes

- Ensure PostgreSQL is running and credentials match those in `backend/.env`.
- Backend settings (including `DATABASES` and CORS) are managed in `backend/config/settings.py`.
- Styling is managed by Tailwind CSS (configure in `frontend/tailwind.config.js`).
- Recommended to use `pytest` / DRF test utilities for backend tests (to be added).

---

## Roadmap / Possible Improvements

- Extended user profiles
- Detailed reading sessions (time spent, timestamps)
- Advanced statistics (charts, history)
- Favorites, ratings, and reviews
- Public / shareable reading lists
- Complete React frontend with more views and UX polish
- Backend unit and integration tests (pytest, DRF APITestCase)
- Deployment:
  - Backend on services like Railway / Render / VPS
  - Frontend on Vercel / Netlify

---

## License

This project is licensed under the --- License. See the `LICENSE` file for details.

---

## Contact & Contribution

- Issues: use the GitHub Issues page:  `https://github.com/E3pA82/library-tracker/issues`
- Contributions: fork the repository, create a feature branch, and open a pull request
- Questions: contact via email `harilalaopatricia@gmail.com`

---

## Screenshots

```text
screenshots/
├── dashboard.png     # Library Tracker dashboard
└── progress.png      # Reading progress view
```

(Place my actual screenshots in a `screenshots/` directory and update paths as needed.)