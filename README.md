# DASTAAN — Heritage Dining Restaurant Application
> **Full-Stack Restaurant Management MVP** (Assignment 1 & Assignment 2)  
> **Theme 2:** Royal Burgundy (`#4B1420`), Warm Gold (`#D4AF37`), and Cream (`#F8F1E5`)

---

## 1. Project Overview & Architecture

DASTAAN is a production-grade restaurant application built with a **React Native (Expo Go compatible)** client-side architecture and a **Node.js + Express + MongoDB Atlas** backend service.

```
restaurant-app-mvp/
├── server/                    # Express REST API (A2)
│   ├── config/db.js          # Mongoose connection with resilient readyState check
│   ├── models/               # User, MenuItem, Table, Reservation, Order
│   ├── controllers/          # authController, menuController, orderController, reservationController
│   ├── routes/               # authRoutes, menuRoutes, orderRoutes, reservationRoutes
│   ├── middleware/auth.js    # protect (Bearer JWT) and managerOnly (403 check)
│   ├── seed.js               # Database seeding (1 customer, 1 manager, 15 dishes, 6 tables)
│   └── server.js             # Express app (0.0.0.0:5000 for local Wi-Fi connectivity)
├── src/                       # React Native Frontend (A1 & A2)
│   ├── api/client.js         # Centralized API client with configurable BASE_URL & token injection
│   ├── components/           # MenuItemCard (React.memo), QuantityStepper, etc.
│   ├── context/              # AuthContext, ThemeContext, CartContext
│   ├── data/                 # brand.js, menu.js
│   ├── hooks/                # useApi, useAuth, useTheme, useCart, useDebounce, useForm, useReservation
│   ├── navigation/           # RootNavigator (Role-based Bottom Tabs: Customer vs Manager)
│   ├── screens/              # Login, Menu, Cart, OrderSummary, Reservation, OrderTracking, Profile, Dashboard
│   └── theme/colors.js       # Official Royal Burgundy, Gold, Cream palettes (Light & Dark)
├── A2/
│   └── restaurant-api.postman_collection.json # 15+ Postman tests with failing & passing cases
├── architecture.md           # Architecture specification
├── design.md                 # Design system & tokens
├── phases.md                 # Step-by-step progress tracking
└── rules.md                  # Strict engineering guidelines
```

---

## 2. Quick Start & Installation

### Prerequisites
- **Node.js:** LTS version (v18+ or v20+)
- **MongoDB Atlas:** Free cluster or local MongoDB instance

### Step 1: Backend Setup
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB Atlas MONGO_URI and JWT_SECRET

# Seed the database (creates 2 users, 15 dishes, 6 tables)
npm run seed

# Start Express server (runs on port 5000)
npm run dev
```
Health Check: Verify at `http://localhost:5000/api/health`

### Step 2: Frontend Setup
```bash
# In the root project directory:
npm install

# Start development server
npm run dev

# Or start with Expo for mobile testing:
npx expo start
```

> **Expo Go on Mobile Devices:**  
> When testing on physical mobile phones via Expo Go over local Wi-Fi, update `BASE_URL` in `src/api/client.js` with your computer's local IP address (e.g., `http://192.168.1.15:5000`).

---

## 3. Demo Credentials

| Role | Email | Password | Allowed Capabilities |
|---|---|---|---|
| **Customer** | `customer@dastaan.pk` | `Customer123` | Browse menu, search, filter, add to cart, apply promo codes, place dine-in/takeaway orders, live track order with 10s polling, cancel pending order, reserve tables, view profile, toggle light/dark theme |
| **Manager** | `manager@dastaan.pk` | `Manager123` | Access restricted **Manager Dashboard** tab, view incoming kitchen queue, advance order status forward (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`), accept/decline table bookings, add new dishes, inline price editing, toggle dish availability (`Available` / `Sold Out`), delete dishes |

---

## 4. Hooks-per-Screen Matrix (Assignment 1 Requirement)

| Screen | Built-in React Hooks | Custom Hooks | Purpose & Viva Justification |
|---|---|---|---|
| **LoginScreen** | `useState`, `useEffect` | `useAuth`, `useTheme` | Controlled input states, input validation, role selection, authentication dispatch, and theme token styling. |
| **MenuScreen** | `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` | `useTheme`, `useAuth`, `useCart`, `useDebounce` | `useRef` for search focus and scroll-to-top; `useDebounce` (400ms) to throttle search; `useMemo` for combined filter/search/sort; `useCallback` for stable item card handler; `React.memo` on cards for zero redundant re-renders. |
| **CartScreen** | `useState` | `useCart`, `useTheme` | Connects directly to `cartReducer` via `useCart`; renders quantity stepper, item removal, special cooking instructions, and promo input. |
| **OrderSummaryScreen** | `useState`, `useMemo` | `useCart`, `useTheme`, `useAuth` | `useMemo` strictly calculates financial bill (subtotal, 5% service charge, 15% sales tax, promo discount, grand total); posts order to server. |
| **ReservationScreen** | `useState`, `useMemo`, `useCallback` | `useForm`, `useReservation`, `useDebounce`, `useTheme`, `useAuth` | `useForm` for controlled booking form; `useReservation` for 12:00-22:00 slot availability, auto table allocation, and pre-seeded booked slot disabling; confirmation modal. |
| **OrderTrackingScreen** | `useState`, `useEffect`, `useRef` | `useTheme`, `useAuth` | `useRef` stores polling timer and elapsed counter; `useEffect` runs 10-second `setInterval` polling with clean unmount `clearInterval`; multi-step indicator. |
| **OrderHistoryScreen** | `useState`, `useEffect`, `useMemo`, `useCallback` | `useAuth`, `useTheme`, `useCart` | Fetches patron's past restaurant orders via `apiClient.get('/api/orders')` using Bearer JWT; provides multi-category filtering, instant dish search, receipt expansion, one-click reordering, and pending cancellation. |
| **ProfileScreen** | `useState` | `useAuth`, `useTheme` | Displays user details, theme switch (light/dark palette toggle), order history shortcut, and logout action with stack reset. |
| **DashboardScreen** | `useState`, `useEffect` | `useTheme`, `useAuth` | Restricted to manager role; manages 3 tabs (Orders Queue, Table Bookings, Menu Management); executes status advancement and menu mutations. |

---

## 5. REST API Specification (Assignment 2 Requirement)

| Method | Endpoint | Access | Request Body | Status Codes | Description |
|---|---|---|---|---|---|
| `GET` | `/api/health` | Public | None | `200` | Server health check and UTC timestamp |
| `POST` | `/api/auth/register` | Public | `{ name, email, password, role }` | `201`, `400`, `409` | Register new user. Hashes password with bcrypt. Returns JWT (expires in 1 day). |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | `200`, `400`, `401` | Authenticates user credentials. Returns JWT and user object (no password). |
| `GET` | `/api/auth/me` | Protected | None (Bearer Token) | `200`, `401` | Returns current authenticated user profile. |
| `GET` | `/api/menu` | Public | Query: `?category=&search=` | `200` | Returns all menu dishes filtered by category and/or search query. |
| `GET` | `/api/menu/:id` | Public | None | `200`, `400`, `404` | Returns single menu item by ID. Returns 400 for invalid ID format. |
| `POST` | `/api/menu` | Manager | `{ name, description, price, category, image, isSpecial }` | `201`, `400`, `401`, `403` | Creates a new dish. Enforces positive price and valid category. |
| `PUT` | `/api/menu/:id` | Manager | `{ price, isAvailable, ... }` | `200`, `400`, `401`, `403`, `404` | Updates price or availability. Reject negative price with 400. |
| `DELETE` | `/api/menu/:id` | Manager | None | `200`, `401`, `403`, `404` | Deletes menu item from database. |
| `POST` | `/api/orders` | Protected | `{ items, orderType, table, pickupTime, promoCode }` | `201`, `400`, `401` | Creates order. Server calculates subtotal, 5% service, 15% tax, and discount. |
| `GET` | `/api/orders` | Protected | None | `200`, `401` | Customer sees own orders; Manager sees all restaurant orders. |
| `GET` | `/api/orders/:id` | Protected | None | `200`, `401`, `403`, `404` | Retrieves order details. Customer restricted to own order. |
| `PATCH` | `/api/orders/:id/status` | Manager | `{ status }` | `200`, `400`, `401`, `403`, `404` | Advances order status forward only (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`). Backward moves return 400. |
| `PATCH` | `/api/orders/:id/cancel` | Customer | None | `200`, `400`, `401`, `404` | Customer cancels order only if still Pending. Returns 400 if already Preparing/Ready. |
| `POST` | `/api/reservations` | Protected | `{ table, date, timeSlot, partySize, name, phone }` | `201`, `400`, `401`, `409` | Books table reservation. Returns 409 Conflict if table already booked for that date & slot. |
| `GET` | `/api/reservations` | Protected | None | `200`, `401` | Customer sees own reservations; Manager sees all reservations. |
| `PATCH` | `/api/reservations/:id/status` | Manager | `{ status }` | `200`, `400`, `401`, `403`, `404` | Manager accepts (`Confirmed`) or declines (`Declined`) booking. |
| `DELETE` | `/api/reservations/:id` | Customer | None | `200`, `401`, `404` | Customer cancels their reservation. |

---

## 6. Cart Reducer Specification (Assignment 1 Q7 Requirement)

The cart state is managed entirely through pure actions in `src/context/CartContext.jsx` with 0 mutations:

| Action Type | Payload | State Result |
|---|---|---|
| `ADD_ITEM` | `{ item, note }` | If item exists in cart, increments quantity; otherwise appends item with `qty: 1`. |
| `REMOVE_ITEM` | `itemId` | Completely filters out the item from the cart array. |
| `INCREMENT` | `itemId` | Increases quantity of the specified item by 1. |
| `DECREMENT` | `itemId` | Decreases quantity by 1. If quantity reaches 0, automatically removes the item from the cart. |
| `UPDATE_NOTE` | `{ itemId, note }` | Modifies the special cooking instruction note for the specific item. |
| `APPLY_PROMO` | `promoCode` | Validates code (`WELCOME10` 10%, `DASTAAN20` 20%, `FESTIVE50` flat 50 PKR). Rejects invalid codes. |
| `REMOVE_PROMO` | None | Clears active promo code and resets discount to 0. |
| `CLEAR_CART` | None | Empties the items array and resets promo upon successful order placement. |

---

## 7. Design System & Theme 2 Palettes

DASTAAN implements **Theme 2 (Royal Burgundy, Gold & Cream)**:
- **Primary Burgundy (`#4B1420` light / `#8A2A3F` dark):** Main buttons, active tabs, headers, prominent badges.
- **Warm Gold (`#D4AF37`):** Accent lines, star ratings, active step indicators, VIP badges.
- **Cream (`#F8F1E5` light):** Background canvas for an inviting heritage dining aesthetic.
- **Deep Burgundy-Black (`#1A1114` dark):** Background canvas in dark mode for opulent evening ambiance.
- **Surface (`#FFFFFF` light / `#2A1B20` dark):** Card containers and dialog boxes.
- **Text Espresso (`#2B2118` light / `#F8F1E5` dark):** High contrast typography.

---

## 8. License & Academic Integrity
Built for educational submission in accordance with Assignment 1 & Assignment 2 specifications.
All code and architectures strictly avoid third-party state libraries (Redux/MobX) and forbidden cloud backends (Firebase/Supabase), utilizing standard Node.js Express, MongoDB Atlas, and React Native hooks.
