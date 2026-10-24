# architecture.md — DASTAAN Restaurant App (A1 + A2)

## 1. Database decision: MongoDB (Firebase nahi)

A2 PDF mein clearly likha ha: **Node.js + Express + MongoDB (Mongoose)**, JWT, bcrypt, Postman collection, viva mein server chalana. Firebase use karoge to:
- Express/Mongoose/middleware/seed.js wale marks zero ho jayen ge
- Viva mein "add a field/endpoint" ka sawal server code par aye ga
- Server-side business rules (409 double booking, status forward-only) Firebase rules mein alag tarah likhne parte hain

**Final: React Native (Expo) -> Express API -> MongoDB Atlas.** Firebase is project mein use nahi hoga. Teeno layers ek hi chain mein hain, koi layer direct database se baat nahi karti.

## 2. Big picture

```
 PHONE (Expo Go)                    LAPTOP                         CLOUD
┌──────────────────┐   HTTP/JSON   ┌─────────────────────┐  Mongoose  ┌──────────────┐
│ React Native app │ ───────────>  │ Node + Express API  │ ─────────> │ MongoDB Atlas│
│ screens, context │ <───────────  │ routes > middleware │ <───────── │ restaurant_  │
│ reducers, hooks  │  token (JWT)  │ > controllers>models│            │ app database │
└──────────────────┘               └─────────────────────┘            └──────────────┘
   BASE_URL = http://<laptop-IP>:5000   (emulator: 10.0.2.2:5000)
```

Rule: **App kabhi MongoDB se direct connect nahi karti.** Sirf Express se.

## 3. Folder structure

```
restaurant-app-mvp/
├── A1/
│   ├── SRS.pdf
│   └── UML/                (usecase, class, sequence, state, component PNG)
├── A2/
│   ├── SRS_v2.pdf
│   ├── diagrams/           (sequence 3-lifeline, deployment)
│   └── restaurant-api.postman_collection.json
├── server/
│   ├── config/db.js
│   ├── models/             User, MenuItem, Table, Reservation, Order
│   ├── routes/             authRoutes, menuRoutes, orderRoutes, reservationRoutes, tableRoutes
│   ├── controllers/        authController, menuController, orderController, reservationController
│   ├── middleware/auth.js  protect, managerOnly (+ errorHandler)
│   ├── seed.js
│   ├── server.js
│   ├── .env                (git mein NAHI)
│   └── .env.example
├── src/
│   ├── api/client.js       BASE_URL + request helper (token auto-attach)
│   ├── components/         MenuItemCard (React.memo), CategoryChips, QuantityStepper, StatusStepper, Loader, ErrorView, EmptyState
│   ├── screens/            Splash (optional), Login, Home (optional), Menu, Cart, OrderSummary, Reservation, MyReservations, OrderTracking, Profile, Dashboard (3 tabs)
│   ├── context/            AuthContext, ThemeContext, CartContext, OrdersContext, MenuContext
│   ├── reducers/           cartReducer, ordersReducer
│   ├── hooks/              useAuth, useTheme, useCart, useForm, useDebounce, useReservation, useApi
│   ├── navigation/         RootNavigator, AuthStack, CustomerTabs, ManagerTabs
│   ├── theme/colors.js     burgundy-gold-cream light + dark palette, radius, spacing
│   └── data/promoCodes.js  (sirf promo; users.js aur menu.js A2 mein delete)
├── App.js
├── README.md
├── rules.md  design.md  memory.md  phases.md  architecture.md
└── .gitignore              (.env, node_modules)
```

## 4. Layers ka kaam

| Layer | Zimmedari | Kya nahi karna |
|---|---|---|
| Screen | Sirf UI | Business logic, fetch directly |
| Custom hook | Form, debounce, reservation logic, useApi | JSX return |
| Context + Reducer | Global state (auth, theme, cart, orders) | Network calls reducer ke andar |
| api/client.js | Saari HTTP calls, token header, error throw | UI code |
| Route | URL ko controller se map | DB code |
| Controller | Validation, business rules, DB queries | Password plain save |
| Model | Schema, required/unique/enum/min | Logic |

## 5. Data kaise fetch aur store hota ha

**Login:** LoginScreen -> `client.post('/api/auth/login')` -> controller email dhoondta ha -> `bcrypt.compare` -> JWT (1 day) + {name,email,role} wapis -> AuthContext mein save + AsyncStorage mein save -> role dekh kar navigate (customer: Menu, manager: Dashboard).

**Menu:** MenuScreen `useApi('/api/menu')` -> `MenuItem.find()` -> JSON list -> `useMemo` category/search/sort -> FlatList.

**Order place:** Cart (useReducer) -> `POST /api/orders` {items:[{menuItem,qty,note}], type, tableId/pickupTime, promoCode} -> server khud DB se price nikal kar total banata ha, unavailable item reject (400) -> Order save status Pending -> app OrderTracking par jata ha -> `setInterval` har 10s `GET /api/orders/my`.

**Manager status change:** Dashboard -> `PATCH /api/orders/:id/status` {status} -> server forward-only rule check -> save -> customer ka next poll naya status dikha deta ha.

**Persistence:** Token + user AsyncStorage mein (login rahe). Menu/orders/reservations sirf server (MongoDB) mein. Cart local reducer mein (A1 jaisa).

## 6. Database collections (restaurant_app)

| Collection | Fields | Rules |
|---|---|---|
| users | name, email, password(hash), role (customer/manager), createdAt | email required+unique+lowercase; password min 8 hash; role enum default customer |
| menuitems | name, description, price, category, image, isSpecial, isAvailable | price >= 0; category enum Starters/Mains/Desserts/Drinks |
| tables | number, seats, isActive | number unique; seats 1-12 |
| reservations | user(ref User), table(ref Table), date, timeSlot, partySize, phone, status (Pending/Accepted/Declined/Cancelled), timestamps | phone 03XX-XXXXXXX; same table+date+slot dobara nahi (409) |
| orders | user(ref User), items[{menuItem ref, name, price, qty, note}], subtotal, serviceCharge, tax, discount, total, type (Dine-in/Takeaway), table, pickupTime, promoCode, status, timestamps | status enum Pending/Preparing/Ready/Served/Cancelled; item price snapshot |

## 7. API endpoints (18)

| # | Method | Endpoint | Access | Body | Response |
|---|---|---|---|---|---|
| 1 | GET | /api/health | Public | - | status, time |
| 2 | POST | /api/auth/register | Public | name,email,password,role | 201 token,user (409 duplicate) |
| 3 | POST | /api/auth/login | Public | email,password | token,user |
| 4 | GET | /api/auth/me | Auth | - | user |
| 5 | GET | /api/menu?category=&search= | Public | - | items |
| 6 | GET | /api/menu/:id | Public | - | item / 404 |
| 7 | POST | /api/menu | Manager | item fields | 201 item |
| 8 | PUT | /api/menu/:id | Manager | fields | item |
| 9 | DELETE | /api/menu/:id | Manager | - | message |
| 10 | GET | /api/tables | Auth | - | tables |
| 11 | POST | /api/orders | Customer | items,type,table/pickupTime,promoCode | 201 order |
| 12 | GET | /api/orders/my | Customer | - | own orders |
| 13 | GET | /api/orders | Manager | - | all orders |
| 14 | PATCH | /api/orders/:id/status | Manager (customer: sirf Pending cancel) | status | order / 400 |
| 15 | POST | /api/reservations | Customer | table,date,timeSlot,partySize,phone | 201 / 409 |
| 16 | GET | /api/reservations/my | Customer | - | own bookings |
| 17 | GET | /api/reservations | Manager | - | all bookings |
| 18 | PATCH | /api/reservations/:id | Manager accept/decline, Customer cancel | status | reservation |

## 8. Security flow

1. `register` -> `bcrypt.hash(password, 10)` -> save
2. `login` -> `jwt.sign({id, role}, JWT_SECRET, {expiresIn:'1d'})`
3. App har request mein `Authorization: Bearer <token>`
4. `protect` token verify -> `req.user`; `managerOnly` role check -> 403
5. Password kisi response mein nahi (`select('-password')`)

## 9. Navigation

```
RootNavigator
├── (no user)  AuthStack: Login/Signup
└── (user)
    ├── customer -> BottomTabs: Menu | Cart(badge) | Reservations | Orders | Profile
    └── manager  -> BottomTabs: Dashboard(Orders | Reservations | Menu Mgmt) | Menu | Profile
```
Logout: AuthContext clear + `navigation.reset` to Login. Startup par AsyncStorage se token load hone tak Loading screen.

## 10. Brand
Restaurant ka naam **DASTAAN**. App ka display name (`app.json` ke `name`/`expo.name`), splash, login header aur profile par yehi naam. Naam ek constant mein rakho: `src/data/brand.js` (`export const APP_NAME = "DASTAAN"`).

## 10b. Theme
Theme 2: Royal Burgundy, Gold & Cream (details design.md). Sab colours `src/theme/colors.js` se `useTheme()` ke zariye. Theme sirf look badalti ha, logic/navigation/API same.

## 11. Environment

- Server `.env`: `PORT=5000`, `MONGO_URI=...`, `JWT_SECRET=...` (real values git mein nahi, `.env.example` mein khali keys)
- App: `BASE_URL` sirf `src/api/client.js` mein. Laptop IP badle to sirf yahan change.
- Phone aur laptop same Wi-Fi, firewall mein port 5000 allow, Atlas Network Access mein IP add.
