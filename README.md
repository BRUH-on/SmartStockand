# StockSmart: Optimizing Stock Levels for Retailers

[![Django](https://img.shields.io/badge/Django-6.1-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-Hosted%20Backend-46E3B7.svg)](https://render.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Hosted%20Frontend-222222.svg)](https://pages.github.com/)

**Project Code**: P04  
**Track**: Retail Inventory & Supply Chain Management  
**Stack**: Python 3.13, Django 6.x, Django REST Framework, Supabase PostgreSQL, React 18 (Vite), Bootstrap 5

---

## 1. Project Overview

**StockSmart** is an enterprise-grade retail inventory optimization and supply chain management system. It provides real-time visibility across multi-echelon retail environments (central fulfillment warehouses, regional distribution depots, and urban retail stores).

### Key Objectives
- **Stock Optimization**: Minimize stockouts while preventing excess holding costs via dynamic reorder thresholds and safety buffers.
- **Velocity in Fulfillment**: Streamline picking, packing, shipping, and automated physical stock deductions.
- **Supplier Collaboration**: Track vendor lead times, ratings, and automate goods receipt into warehouse inventory.
- **Actionable KPIs**: Live calculations for Inventory Turnover Ratio, stock valuations in INR, and replenishment recommendations.
- **Multi-Facility Logistics**: Manage inter-facility stock transfers and physical stock audit adjustments.

---

## 2. System Architecture & Folder Layout

```
smartstock/
├── backend/                       # Django project & DRF apps
│   ├── venv/                      # Python virtual environment
│   ├── stocksmart/                # Project configuration, settings, urls, services
│   ├── users/                     # User management, roles, JWT auth
│   ├── products/                  # Catalog, categories, SKUs, pricing
│   ├── inventory/                 # Facilities, multi-location stock, transfers, adjustments
│   ├── orders/                    # Omnichannel sales orders & fulfillment
│   ├── suppliers/                 # Vendors, purchase orders, goods receipt
│   ├── analytics/                 # KPIs, turnover ratio, trends, recommendations
│   ├── tests/                     # Automated Pytest suite
│   ├── staticfiles/               # WhiteNoise static directory
│   ├── build.sh                   # Render automated build script
│   ├── pytest.ini                 # Pytest configuration
│   └── requirements.txt           # Python dependencies
├── frontend/                      # React SPA with Vite & Bootstrap
│   ├── src/
│   │   ├── api/                   # Axios client with JWT interceptor
│   │   ├── context/               # Authentication context & demo logins
│   │   ├── components/            # Navbar, Footer, StatCards, Badges
│   │   ├── pages/                 # Dashboard, Catalog, Inventory, Orders, Suppliers, Analytics, Users
│   │   ├── App.jsx                # HashRouter navigation
│   │   └── main.jsx               # Bootstrap & root render
│   ├── package.json
│   └── vite.config.js             # Base configuration for GitHub Pages
├── database/                      # Database scripts & ER diagrams
│   ├── schema.sql                 # 3NF Supabase PostgreSQL DDL
│   ├── seed_data.sql              # Legacy SQL fixture; use the Django seed command instead
│   ├── ER_DIAGRAM.md              # Mermaid diagram & relationship summary
│   └── csv/                       # Seed CSV files for manual import
├── docs/                          # Documentation
│   ├── requirements.md            # Software Requirements Specification (SRS)
│   ├── wireframes.md              # UI layouts & wireframes
│   ├── api_docs.md                # Complete REST API reference
│   ├── test_report.md             # Pytest & build verification report
│   └── deployment_guide.md        # Supabase, Render & GitHub Pages deployment
├── .github/workflows/
│   └── deploy.yml                 # Automated GitHub Pages CI/CD workflow
├── render.yaml                    # Render Web Service Blueprint
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
└── README.md                      # Project documentation
```

---

## 3. Quick Start: Local Development

### Prerequisites
- Python 3.10+ (Python 3.13 supported)
- Node.js 18+ LTS and npm
- Git

### 3.1 Backend Setup (Inside Virtual Environment)

1. **Activate the Virtual Environment**:
   - **Windows (PowerShell)**:
     ```powershell
     cd backend
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     cd backend
     source venv/bin/activate
     ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Apply Database Migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Seed Sample Data**:
   ```bash
   python manage.py seed_data
   ```

5. **Run the Backend Server**:
   ```bash
   python manage.py runserver
   ```
   Backend will be active at `http://127.0.0.1:8000/api/` (Health check: `http://127.0.0.1:8000/api/health/`).

---

### 3.2 Frontend Setup

1. **Navigate to `frontend/`**:
   ```bash
   cd frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Frontend will open at `http://localhost:5173/`.

---

## 4. Default Demo Accounts

All seeded accounts share the password: `StockSmart@2026`

| Username | Role | Full Name | Primary Focus |
|---|---|---|---|
| `admin` | **Admin** | Rajesh Sharma | Full system access, users, settings, and audits |
| `warehouse_mgr` | **Warehouse Manager** | Priya Deshmukh | Stock transfers, receiving POs, facility inventory |
| `store_associate` | **Store Associate** | Vikram Mehta | Retail store sales, customer orders, stock requests |
| `auditor_sunil` | **Inventory Auditor** | Sunil Joshi | Discrepancy reporting and stock audits |

---

## 5. Running Automated Tests

Run the automated Pytest test suite inside `backend/`:
```bash
cd backend
.\venv\Scripts\pytest
```
*Current test suite: 7 passed in ~6 seconds (100% pass rate).*

---

## 6. Cloud Deployment Instructions

### Database (Supabase PostgreSQL)
1. Create a project at [supabase.com](https://supabase.com).
2. Configure `DATABASE_URL` with the project connection URI from **Settings -> Database**.
3. From the `backend` directory, apply migrations and seed the coffee shop demo data:
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```
   To intentionally clear existing application records before reseeding, use
   `python manage.py seed_data --replace`.
   Seeded prices, order totals, and purchase totals are in INR. The seed command
   also adds repeatable sales records across the last ten calendar months. To
   add that history without reseeding other data, run
   `python manage.py seed_historical_sales`.

### Backend (Render Web Service)
1. Create a new **Web Service** on [render.com](https://render.com) pointing to your repo.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `./build.sh` and **Start Command** to:
   ```bash
   gunicorn stocksmart.wsgi:application --bind 0.0.0.0:$PORT
   ```
4. Set environment variables:
   - `DATABASE_URL`: Your Supabase connection string.
   - `DJANGO_SECRET_KEY`: Secure secret key.
   - `DJANGO_DEBUG`: `False`.
   - `CORS_ALLOW_ALL`: `True`.

### Frontend (GitHub Pages)
1. Add `VITE_API_BASE_URL` to GitHub Repository Secrets (pointing to your Render URL: `https://your-service.onrender.com/api`).
2. Go to **Settings -> Pages** and choose **GitHub Actions** as the source.
3. Push to `main` or `develop`. The automated workflow `.github/workflows/deploy.yml` builds and publishes the site live!

For detailed instructions, refer to [docs/deployment_guide.md](docs/deployment_guide.md).

---

## 7. License
Developed under light Agile standards for academic and enterprise evaluation.
