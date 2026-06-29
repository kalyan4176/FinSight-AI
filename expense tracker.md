# Project Overview: FinSight AI

A highly polished, responsive web application for managing personal budgets, tracking real-time financial investments, and gaining AI-driven intelligence. The application focuses on clean design heuristics, visual simplicity, and direct live integrations.

---

## 1. What is the Project?
**FinSight AI** is an intelligent financial platform designed to help individuals monitor their financial health, scan bills using AI, forecast expenses, and manage active portfolios in a single unified dashboard.
*   **Dual-purpose tracking**: Tracks both short-term daily liabilities (Expenses) and long-term asset portfolios (Investments).
*   **AI & Forecasting**: Integrates Python analytics for predictive forecasting and health scoring, alongside the Gemini API for invoice scanning and tailored recommendations.
*   **Design aesthetic**: Features a bespoke Light Mode user interface focusing on white surfaces, slate typography, minimal borders, and custom micro-animations.

---

## 2. Technical Stack

| Tier | Technology | Purpose | Key Packages / Tools |
| :--- | :--- | :--- | :--- |
| **Frontend** | React (v19) & Vite | Fast, component-driven client-side application | `framer-motion`, `recharts`, `chart.js`, `react-chartjs-2`, `react-icons`, `axios` |
| **Backend** | Node.js & Express | REST API and business logic handlers | `express`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `yahoo-finance2`, `@google/generative-ai` |
| **Database** | PostgreSQL & SQLite | Relational data persistence (Sequelize ORM with SQLite local fallback) | `sequelize`, `sqlite3`, `pg` |
| **AI Layer** | Gemini API | Multimodal invoice scanning and personalized recommendations | `@google/generative-ai` |
| **Analytics** | Python subprocess | Financial health scoring & linear regression forecasting | `pandas`, `numpy`, `scikit-learn` |

---

## 3. Unique Selling Propositions (USPs)

1.  **Live Financial Portfolio Tracking**:
    Unlike simple budget apps, it tracks asset classes (Stocks, Crypto, Gold, Mutual Funds) and automatically fetches real-time market data from the **Yahoo Finance API** to report cost basis, current valuations, and gains/losses (+/- %).
2.  **Client-Side OCR Receipt Scanner**:
    Users can upload an invoice or receipt image, and the system extracts transaction details (amounts, descriptions, dates) directly in the browser using **Tesseract.js** to pre-fill the expense entry form.
3.  **Clean, SaaS-Grade Aesthetic**:
    A light theme UI inspired by Stripe and Vercel. It rejects flashy and artificial neons, focusing instead on slate fonts (`#0f172a`), subtle dividers (`#e2e8f0`), soft shadows, and clean indigo accents (`#4f46e5`).
4.  **Flexible Base Currency Support**:
    Includes multi-currency formatting formatting numbers on-the-fly according to locale:
    *   **INR** (₹), **USD** ($), **EUR** (€), **GBP** (£), **JPY** (¥), **AUD** (A$), **CAD** (C$), **CNY** (¥).
    *   Currency preference is persisted to the database and applies app-wide.

---

## 4. API Documentation

All routes are authenticated using standard JWT Bearer validation via the custom header `x-auth-token`.

### Authentication Endpoints (`/api/auth`)
*   `POST /signup`: Creates a new user after enforcing strict validation.
*   `POST /login`: Validates credentials and returns a JWT token.

### User Endpoints (`/api/user`)
*   `GET /profile`: Retrieves the user name, mobile, income, and base currency preference.
*   `PUT /profile`: Updates user profile fields, including base currency.

### Expense Endpoints (`/api/expenses`)
*   `GET /`: Returns all logged user expenses sorted chronologically.
*   `POST /`: Creates a new expense entry (with title, category, date, amount).
*   `DELETE /:id`: Removes a specific expense log after verifying ownership.

### Investment Endpoints (`/api/investments`)
*   `GET /`: Pulls investments and fetches active quotes from Yahoo Finance.
*   `POST /`: Adds an investment (symbol, quantity, buy price, category).
*   `DELETE /:id`: Removes a specific holding from the database.

### Financial Quote Helper (`/api/finance`)
*   `GET /quote/:symbol`: Queries Yahoo Finance for a specific stock/crypto ticker (e.g. `TSLA`, `BTC-USD`, `GC=F`) to retrieve market price, asset name, and price percent change.

---

## 5. Security Rules

### Password Enforcement
The application enforces strict credential policies during registration to protect user accounts:
*   Must contain a minimum of **8 characters**.
*   Must contain at least **one uppercase letter** (`A-Z`).
*   Must contain at least **one lowercase letter** (`a-z`).
*   Must contain at least **one digit** (`0-9`).
*   Must contain at least **one special character** (e.g. `!@#$%^&*`).
