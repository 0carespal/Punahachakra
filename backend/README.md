# Punahachakrana B2B Recycling Marketplace Backend

Production-ready FastAPI backend for **Punahachakrana**, a B2B recycling marketplace connecting **Kabadiwalas (sellers)** with **Companies (buyers)**.

---

## 🛠️ Tech Stack

- **Framework:** FastAPI (0.110+)
- **Language:** Python 3.12+
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy 2.0 (Async Engine & Session with `asyncpg`)
- **Migrations:** Alembic
- **Validation:** Pydantic v2 & Pydantic-Settings
- **Security & Auth:** JWT (JSON Web Tokens) with `pyjwt` & Password Hashing via `passlib[bcrypt]`

---

## 🏛️ Architecture & Design Patterns

The project follows **Clean Architecture** with clear separation of concerns:

- **Modular Routers (`app/api/`):** API versioning (`/api/v1`) with feature-specific endpoints.
- **Service Layer (`app/services/`):** Business logic encapsulation and transaction orchestration.
- **Repository Pattern (`app/repositories/`):** Abstracted data layer for database interactions and CRUD queries.
- **SQLAlchemy ORM Models (`app/models/`):** Async-compatible declarative models with foreign key constraints and relationships.
- **Pydantic Schemas (`app/schemas/`):** Strict data validation, request/response models, and pagination wrappers.
- **Centralized Core Configuration (`app/core/`):** Environment management, JWT tokens, security, structured logging, and unified exception handling.
- **Dependency Injection (`app/api/deps.py`):** FastAPI `Depends()` for database sessions, authentication, role-based authorization (RBAC), repositories, and services.

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py               # Dependency Injection (DB, Auth, Repos, Services)
│   │   └── v1/
│   │       ├── router.py         # Main v1 API Router
│   │       └── endpoints/        # Modular API route controllers
│   │           ├── auth.py       # User registration, login, refresh token
│   │           ├── users.py      # Current user profile & management
│   │           ├── categories.py # Scrap material categories
│   │           ├── listings.py   # Scrap listings posted by Kabadiwalas
│   │           ├── bids.py       # Bids & offers submitted by Companies
│   │           └── orders.py     # Completed deals & transaction orders
│   ├── core/
│   │   ├── config.py             # Pydantic v2 Settings (.env loader)
│   │   ├── security.py           # JWT token generation/decoding & bcrypt hashing
│   │   ├── logging.py            # Centralized logger setup
│   │   └── exceptions.py         # Custom application exception handlers
│   ├── db/
│   │   ├── session.py            # Async SQLAlchemy engine & session factory
│   │   ├── base.py               # Base metadata registry for Alembic
│   │   └── init_db.py            # Database seed script for initial categories/admin
│   ├── middleware/
│   │   └── logging_middleware.py # HTTP request logging & timing middleware
│   ├── models/                   # SQLAlchemy ORM Models
│   │   ├── base.py
│   │   ├── user.py               # User & UserProfile models (Enum: KABADIWALA, COMPANY, ADMIN)
│   │   ├── category.py           # Scrap categories (PET, HDPE, Metals, E-Waste, etc.)
│   │   ├── listing.py            # Scrap listings (Status: DRAFT, ACTIVE, PENDING_DEAL, SOLD)
│   │   ├── bid.py                # Company bids (Status: PENDING, ACCEPTED, REJECTED)
│   │   └── order.py              # Market transactions (Status: INITIATED, IN_TRANSIT, COMPLETED)
│   ├── repositories/             # Data access repository layer
│   │   ├── base.py               # Generic async CRUD repository
│   │   ├── user_repository.py
│   │   ├── category_repository.py
│   │   ├── listing_repository.py
│   │   ├── bid_repository.py
│   │   └── order_repository.py
│   ├── schemas/                  # Pydantic v2 Data Transfer Objects
│   │   ├── common.py             # APIResponse & PaginatedResponse wrappers
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── listing.py
│   │   ├── bid.py
│   │   └── order.py
│   ├── services/                 # Business logic service layer
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── category_service.py
│   │   ├── listing_service.py
│   │   ├── bid_service.py
│   │   └── order_service.py
│   ├── utils/
│   │   └── pagination.py         # Pagination helper functions
│   └── main.py                   # FastAPI Application Factory & Lifespan
├── alembic/                      # Database migration scripts
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── alembic.ini                   # Alembic configuration
├── .env.example                  # Environment template
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Python:** 3.12+
- **PostgreSQL Database:** Installed and running locally or on a server.

### 2. Environment Configuration

Copy `.env.example` to `.env` and adjust your PostgreSQL credentials:

```bash
cp .env.example .env
```

Update `.env`:
```ini
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=punahachakrana_db

SECRET_KEY=change_this_super_secret_key_in_production_min_32_chars_long
```

### 3. Install Dependencies

Create a virtual environment and install packages:

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Database Setup & Alembic Migrations

Create the PostgreSQL database `punahachakrana_db` in PostgreSQL, then run migrations:

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial schema migration"

# Apply migrations to database
alembic upgrade head
```

### 5. Seed Initial Data (Optional)

Populate default categories (Plastics, Metals, E-Waste, Paper) and initial admin user:

```bash
python -m app.db.init_db
```

### 6. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The application will be live at `http://localhost:8000`.

---

## 📖 API Documentation (Swagger & ReDoc)

Interactive API documentation is automatically generated by FastAPI:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Specification JSON:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 🔑 Key API Endpoints Overview

| Module | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | Server status check | No |
| **Auth** | `POST` | `/api/v1/auth/register` | Register Kabadiwala or Company | No |
| **Auth** | `POST` | `/api/v1/auth/login` | Obtain JWT tokens (OAuth2 Form) | No |
| **Auth** | `POST` | `/api/v1/auth/login/json` | Obtain JWT tokens (JSON Payload) | No |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Refresh access token | No |
| **Users** | `GET` | `/api/v1/users/me` | Fetch active user profile | Yes |
| **Users** | `PUT` | `/api/v1/users/me/profile` | Update profile / company details | Yes |
| **Categories** | `GET` | `/api/v1/categories` | List scrap categories | No |
| **Categories** | `POST` | `/api/v1/categories` | Create category | Yes (Admin) |
| **Listings** | `POST` | `/api/v1/listings` | Create scrap listing | Yes (Kabadiwala/Admin) |
| **Listings** | `GET` | `/api/v1/listings` | Filter & search listings | No |
| **Listings** | `GET` | `/api/v1/listings/my-listings` | Get user's active listings | Yes |
| **Bids** | `POST` | `/api/v1/bids` | Submit bid for scrap listing | Yes (Company/Admin) |
| **Bids** | `GET` | `/api/v1/bids/listing/{id}` | View bids for listing | Yes (Seller/Admin) |
| **Bids** | `PATCH` | `/api/v1/bids/{id}/status` | Accept / Reject bid | Yes (Seller/Admin) |
| **Orders** | `GET` | `/api/v1/orders/my-orders` | View user transactions | Yes |
| **Orders** | `PATCH` | `/api/v1/orders/{id}/status` | Update delivery/fulfillment status | Yes |

---

## 🔒 Security & Roles

- Roles: `KABADIWALA`, `COMPANY`, `ADMIN`
- Password hashing with **Bcrypt**.
- **Role-based Access Control (RBAC)** enforced dynamically using FastAPI dependencies.
