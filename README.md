# ♻️ Punahachakrana (पुनःचक्रण) — B2B Recycling Marketplace

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Punahachakrana (पुनःचक्रण)** is a B2B circular economy marketplace designed to bridge the gap between local scrap collectors (**Kabadiwalas / Sellers**) and industrial recycling enterprises (**Companies / Buyers**).

By digitizing scrap procurement, material listings, price negotiations, and transaction logs, Punahachakrana creates a transparent, efficient, and traceable supply chain for recyclable materials.

---

## ✨ Key Features

### 🏢 Company Portal (Recycling Buyers)
- **Material Requirement Posting:** Post specific scrap requirements (PET Plastic, HDPE, Aluminum, Copper, E-Waste, Paper) with budget ranges, target quantities, and fulfillment locations.
- **Dynamic Requirement Dashboard:** Real-time metrics for total requests, active demands, and status progression (`ACTIVE`, `MATCHED`, `NEGOTIATING`, `COMPLETED`, `CANCELLED`).
- **Live Request Logs:** Sortable, paginated history of submitted company requirements directly connected to live backend persistence.
- **Kabadiwala Discovery & Match Engine:** View ranked, verified scrap merchants by proximity, capacity, and average user rating.
- **Payment & Order Settlement:** Integrated offer presentation, commission breakdown, and order fulfillment workflows.

### ♻️ Kabadiwala Portal (Scrap Sellers)
- **Inventory & Scrap Listing Management:** Digital cataloging of collected materials with quantities, unit pricing, and quality grading.
- **Assigned Request Tracking:** View direct requirement matches posted by verified companies.
- **Offer & Negotiation System:** Submit price offers, counter-offers, and manage deal negotiations in real-time.
- **Role Profile & Verification Badge:** Business profile customization showcasing verification status, location, and rating metrics.

### 🔐 Security & Role Isolation
- **Role-Based Access Control (RBAC):** Strict role enforcement across `KABADIWALA`, `COMPANY`, and `ADMIN` user types.
- **JWT Authentication:** Dual access/refresh token mechanism with `HS256` signature verification.
- **Isolated Component Views:** Dedicated UI routing preventing cross-role data leakage.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite 8 |
| **Styling & UI** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **State & API Client** | Custom Hooks + Axios REST Client + Context API |
| **Backend Framework** | FastAPI (Python 3.12+) |
| **Database & ORM** | Async SQLAlchemy 2.0 + SQLite (Async Engine) / AsyncPG PostgreSQL |
| **Database Migrations**| Alembic |
| **Data Validation** | Pydantic v2 & Pydantic-Settings |
| **Security & Auth** | JWT (`pyjwt`) + Bcrypt Password Hashing |

---

## 📂 Project Architecture

```text
kabadiwaala/
├── backend/                        # FastAPI REST API Backend
│   ├── app/
│   │   ├── api/                    # API Routers & Dependencies
│   │   │   ├── deps.py             # Dependency Injection (Auth, DB, RBAC)
│   │   │   └── v1/
│   │   │       └── endpoints/      # Auth, Users, Requirements, Listings, Bids, Orders
│   │   ├── core/                   # Security, Config, Logging, Exception Handlers
│   │   ├── db/                     # Async Engine, Session Factory, Seed Scripts
│   │   ├── models/                 # SQLAlchemy Async Declarative ORM Models
│   │   ├── repositories/           # Generic & Feature Async Data Repositories
│   │   ├── schemas/                # Pydantic v2 Schemas & Data DTOs
│   │   └── main.py                 # FastAPI Application Lifespan & Middleware
│   ├── alembic/                    # Database Migrations
│   ├── requirements.txt            # Python Dependencies
│   └── README.md
├── frontend/                       # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/             # Navigation Shell, Protected Routes, UI Components
│   │   ├── context/                # Auth & Global Store Contexts
│   │   ├── hooks/                  # API Custom Hooks (`useApi`)
│   │   ├── pages/                  # CompanyPortal, KabadiwalaPortal, Auth Pages
│   │   ├── services/               # Modular API Services (Auth, Requirement, User)
│   │   └── main.tsx                # App Entrypoint
│   ├── package.json
│   └── vite.config.ts
├── REQUEST_DATA_AUDIT.md           # Data Audit & System Trace Document
└── README.md                       # Master Repository README
```

---

## 🚀 Quick Start Guide

### 1. Clone Repository

```bash
git clone https://github.com/0carespal/Punahachakra.git
cd Punahachakra
```

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (or auto-initialize on start)
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The FastAPI backend will be live at:
- **API Base Endpoint:** `http://localhost:8000/api/v1`
- **Swagger Documentation:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

### 2. Frontend Setup (React + Vite)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend application will be running at `http://localhost:5173` (or port configured in Vite).

---

## 📖 Key API Endpoints

| Category | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new Kabadiwala or Company account | Public |
| **Auth** | `POST` | `/api/v1/auth/login/json` | Authenticate user & receive JWT access/refresh tokens | Public |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Obtain fresh access token using refresh token | Public |
| **Users** | `GET` | `/api/v1/users/me` | Retrieve authenticated user profile & role data | Required |
| **Users** | `PUT` | `/api/v1/users/me/profile` | Update profile information | Required |
| **Requirements** | `POST` | `/api/v1/requirements` | Post a new company scrap material requirement | Company |
| **Requirements** | `GET` | `/api/v1/requirements/me` | Fetch active company requirements with order history | Company |
| **Categories** | `GET` | `/api/v1/categories` | Fetch scrap categories (Plastic, Metals, E-Waste) | Public |
| **Listings** | `GET` | `/api/v1/listings` | Search and filter scrap listings | Public |
| **Bids** | `POST` | `/api/v1/bids` | Submit price offer/bid on listings | Required |
| **Orders** | `GET` | `/api/v1/orders/my-orders` | Track active transactions and payouts | Required |

---

## 🧪 Testing & Verification

The project includes unit and end-to-end integration test suites:

- **End-to-End API Integration Suite:** Python test runner executing full registration, authentication, RBAC profile isolation, requirement posting, and database record verification against the live server.
- **Frontend Type Safety:** Clean TypeScript compilation with 0 lint or build errors.

To run backend integration tests:
```bash
python -m pytest # or python e2e_regression_test.py
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
