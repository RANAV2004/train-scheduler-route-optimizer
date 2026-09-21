# Train Ticket Scheduler and Route Optimizer

A web-based train ticket booking and route-optimization system with **role-based
access** (User / Admin), Dijkstra shortest-path optimization, and animated
green-on-black distance/time charts.

Rebuilt from the project manual with a **FastAPI backend** and a **React frontend**.

> **Note on the framework:** the project report text mentions *Flask*, but the
> surviving code screenshots (`APIRouter()`, `@router.get(...)`,
> `@router.post("/shortest-route/")`, type-hinted route params) are **FastAPI**.
> This rebuild uses FastAPI to match the real code, and pairs cleanly with the
> React single-page frontend over a JSON API. If your report must say "Flask",
> mention FastAPI as the implementation framework (a modern Python web framework
> in the same family).

---

## 1. Tech stack

| Layer     | Technology                                             |
|-----------|--------------------------------------------------------|
| Backend   | FastAPI, SQLAlchemy, SQLite, JWT (python-jose), bcrypt |
| Frontend  | React 18, Vite, React Router, Axios, Recharts          |
| Optimizer | Dijkstra's algorithm (`backend/dijkstra.py`)           |
| Data      | SQLite (`test.db`) + in-code sample graph / CSV export |

---

## 2. Project structure

```
train-scheduler/
├── backend/
│   ├── main.py             # FastAPI app, CORS, startup seeding
│   ├── database.py         # SQLite engine + session
│   ├── models.py           # User, Train, Ticket, Route (from the class diagram)
│   ├── schemas.py          # Pydantic request/response models
│   ├── auth.py             # bcrypt hashing + JWT + role guards
│   ├── crud.py             # DatabaseHandler: insert/update/delete/fetch
│   ├── dijkstra.py         # Route Optimization Module
│   ├── sample_data.py      # city graph + sample trains + CSV export
│   ├── dependencies.py     # shared FastAPI dependencies
│   └── routers/
│       ├── auth_routes.py  # register, login, me
│       ├── user_routes.py  # trains, book/reschedule/cancel, history
│       └── admin_routes.py # users, all tickets, shortest-route, charts
├── frontend/
│   ├── src/
│   │   ├── pages/          # Login, Register, dashboards, BookTicket, ...
│   │   ├── components/     # Navbar, ProtectedRoute
│   │   ├── auth.jsx        # auth context (JWT in localStorage)
│   │   ├── api.js          # axios instance
│   │   └── styles.css      # IRCTC blue/white + green-on-black charts
│   ├── package.json
│   └── vite.config.js
├── requirements.txt
└── README.md
```

---

## 3. Running the backend

```bash
cd train-scheduler
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --reload
```

- API runs at **http://localhost:8000**
- Interactive API docs (Swagger): **http://localhost:8000/docs**
- On first launch it creates `test.db`, seeds trains/routes, and creates a
  default admin.

**Default admin login:** `admin` / `admin123`

---

## 4. Running the frontend

In a second terminal:

```bash
cd train-scheduler/frontend
npm install
npm run dev
```

- App runs at **http://localhost:5173**
- It talks to the backend at `http://localhost:8000` (already allowed by CORS).
- To change the backend URL, edit `API_BASE` in `frontend/src/api.js`.

---

## 5. Features (mapped to the manual)

### User Module
- Register / login (role-based) — Use Cases 1, 2
- View running trains and schedules — Use Case 3
- Book tickets (source, destination, date, class) — Use Case 4
- View ticket history — booking list
- Reschedule tickets — Use Case 5
- Cancel tickets (frees the seat) — Use Case 6

### Admin Module
- Admin dashboard with live stats
- View all registered users **with timestamps** — Use Case 7
- View all bookings across users
- Optimize train routes with Dijkstra — Use Case 9
- **Green-on-black** scatter (distance vs time) and line charts — Route
  Optimization Module

### Route Optimization Module
- `POST /admin/shortest-route` → `{ path, total_distance, estimated_time, hops }`
- `GET  /admin/optimization-chart?source=City` → distance/time to every city
- Graph of major Indian cities with inter-city distances (`sample_data.py`)

---

## 6. Class model (report parity)

| Class            | Fields / methods                                                             |
|------------------|------------------------------------------------------------------------------|
| `User`           | user_id, username, password, email, role, registration_time                  |
| `Admin`          | role="admin" + access_level; view_users, optimize_route, view_all_tickets    |
| `Train`          | train_number, source, destination, train_name, seats, fare                   |
| `Ticket`         | ticket_id, user_id, train_number, source, destination, booking_date, class_type, status |
| `Route`          | source, destination, distance, estimated_time; calculate_optimized_route     |
| `DatabaseHandler`| `crud.py`: insert / update / delete / fetch                                  |

Relationships: **User 1—* Ticket**, **Admin — Route** (optimizes).

---

## 7. Notes
- Passwords are hashed with **bcrypt**; auth uses **JWT** bearer tokens.
- `sample_data.export_routes_csv()` writes `routes.csv` for the "CSV data" story
  in the report.
- SQLite keeps the prototype dependency-free (Economical Feasibility section).
