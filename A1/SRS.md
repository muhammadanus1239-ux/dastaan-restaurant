# Software Requirements Specification (SRS) — v1.0
**Project Title:** DASTAAN Restaurant Application (Client System)  
**Standard:** IEEE Std 830-1998  
**Author:** Muhammad Anas (muhammadanus1239@gmail.com)  
**Status:** Approved  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the client application of DASTAAN, an authentic royal heritage restaurant application. It defines functional requirements, user stories, interface interactions, and performance constraints.

### 1.2 Scope
DASTAAN provides a mobile/web dining application enabling patrons to authenticate, explore a categorized culinary menu, customize items, manage carts, book table reservations, place dine-in/takeaway orders, and track order fulfillment progression in real time.

### 1.3 Definitions, Acronyms, and Abbreviations
- **DASTAAN:** The restaurant brand and software system.
- **FR:** Functional Requirement.
- **NFR:** Non-Functional Requirement.
- **JWT:** JSON Web Token used for stateful/stateless authentication.
- **PKR:** Pakistani Rupee (official currency: Rs. / PKR).
- **RBAC:** Role-Based Access Control (Customer vs. Manager).

---

## 2. Overall Description

### 2.1 Product Perspective
DASTAAN operates as a high-performance React Native (Expo Go compatible) mobile/web application designed around the **Theme 2 (Royal Burgundy, Gold & Cream)** visual design language.

### 2.2 User Classes and Characteristics
1. **Patron / Customer:** Individuals browsing the menu, placing orders, making reservations, applying promotional codes, and tracking orders.
2. **Restaurant Manager:** Kitchen supervisor monitoring the order queue, updating dish status, accepting table bookings, and modifying dish pricing.

### 2.3 Operating Environment
- Operating Systems: Android 10+, iOS 14+, Modern Web Browsers (Chrome, Safari, Edge, Firefox).
- Framework: React Native with Expo Go / React 19 SPA.

---

## 3. User Stories (10+ Stories with Acceptance Criteria)

### US-01: User Registration
**As a** new customer,  
**I want to** register an account using my name, email, phone number, and password,  
**So that** I can place orders and track my reservations.  
- *Acceptance Criteria:* Passwords must contain at least 8 characters with at least one number; phone numbers must match `03XX-XXXXXXX`; duplicate emails must be rejected with an appropriate error message.

### US-02: User Authentication & Role Detection
**As a** registered user,  
**I want to** log in with my credentials,  
**So that** the app directs me to my role-specific interface (Customer tabs vs. Manager Dashboard).  
- *Acceptance Criteria:* Valid login stores the token securely; managers see the Dashboard tab; customers do not.

### US-03: Menu Catalog Exploration
**As a** customer,  
**I want to** view food items grouped by Starters, Mains, Desserts, and Drinks,  
**So that** I can easily discover signature heritage recipes.  
- *Acceptance Criteria:* Dishes must show high-resolution photos, names, descriptions, prices, and special badges.

### US-04: Real-time Debounced Search
**As a** customer,  
**I want to** type a dish name into a search bar without UI stutter,  
**So that** the list narrows down seamlessly to my desired dish.  
- *Acceptance Criteria:* Search execution must be debounced by 400ms; recent searches must be remembered.

### US-05: Cart Item Customization & Notes
**As a** customer,  
**I want to** add dishes to my cart and include special cooking instructions,  
**So that** the chefs prepare my dish according to my dietary preferences.  
- *Acceptance Criteria:* Items in the cart can have custom notes; duplicate additions aggregate item quantities.

### US-06: Pure Cart Quantity Management
**As a** customer,  
**I want to** increment and decrement quantities in my cart,  
**So that** decrementing an item at quantity 1 removes it from the cart.  
- *Acceptance Criteria:* Decrementing to 0 triggers automatic removal with zero state mutations.

### US-07: Voucher Discount Application
**As a** customer,  
**I want to** enter a valid promo code (`WELCOME10`, `DASTAAN20`, `FESTIVE50`),  
**So that** my bill reflects an immediate discount.  
- *Acceptance Criteria:* Invalid promo codes show clear error feedback; valid codes calculate discounts accurately.

### US-08: Dine-in vs. Takeaway Selection
**As a** customer,  
**I want to** choose between dining in at a selected table or ordering for takeaway,  
**So that** the kitchen knows how to package and dispatch my order.  
- *Acceptance Criteria:* Dine-in requires table selection; Takeaway requires estimated pickup time selection.

### US-09: Conflict-Free Table Reservation
**As a** customer,  
**I want to** select an available dining date and time slot (12:00–22:00),  
**So that** I am guaranteed a table upon arrival.  
- *Acceptance Criteria:* Slots already booked by other patrons appear disabled; booking confirmation shows summary modal.

### US-10: Live Multi-Step Order Tracking
**As a** customer,  
**I want to** observe the live progression of my order (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`),  
**So that** I know exactly when my food is ready without having to ask the staff.  
- *Acceptance Criteria:* Status updates every 10 seconds via background polling; an elapsed timer counts seconds live.

### US-11: Customer Order Cancellation
**As a** customer,  
**I want to** cancel my order if my plans change,  
**So that** I am not charged for meals I cannot consume.  
- *Acceptance Criteria:* Cancellation is permitted *only while the status is Pending*; once status moves to `Preparing`, cancellation is rejected.

### US-12: Light & Dark Theme Customization
**As a** user,  
**I want to** toggle between Royal Cream (Light) and Burgundy-Black (Dark) modes,  
**So that** the app is comfortable to view in any ambient lighting condition.  
- *Acceptance Criteria:* Theme toggle immediately updates backgrounds, surfaces, text, cards, and navigation bars.

---

## 4. Functional Requirements (20+ Specifications)

| ID | Category | Functional Requirement Specification | Priority |
|---|---|---|---|
| **FR-01** | Auth | The system shall provide controlled inputs for user registration (Name, Email, Password, Role). | High |
| **FR-02** | Auth | The system shall validate passwords against an 8-character minimum with at least one numeric digit. | High |
| **FR-03** | Auth | The system shall validate email syntax against RFC 5322 standard regular expression. | High |
| **FR-04** | Auth | The system shall validate contact numbers against Pakistani telecommunication format `03XX-XXXXXXX`. | High |
| **FR-05** | Auth | The system shall persist authenticated credentials in client storage to prevent session loss on restart. | High |
| **FR-06** | Navigation | The system shall dynamically generate bottom navigation tabs according to authenticated user role. | High |
| **FR-07** | Menu | The system shall present dishes organized across 4 categories: Starters, Mains, Desserts, and Drinks. | High |
| **FR-08** | Menu | The system shall visually highlight signature items with a Chef's Special badge. | Medium |
| **FR-09** | Menu | The system shall grey out items marked as `isAvailable: false` and disable their add-to-cart button. | High |
| **FR-10** | Search | The system shall debounce user search keystrokes by 400 milliseconds before applying filtering logic. | Medium |
| **FR-11** | Search | The system shall maintain a history of the last 5 distinct search queries executed by the user. | Low |
| **FR-12** | Filter | The system shall support sorting dishes by price ascending, price descending, and alphabetical order. | Medium |
| **FR-13** | Cart | The system shall implement a pure `cartReducer` managing 8 actions with zero state mutations. | High |
| **FR-14** | Cart | The system shall remove an item from the cart whenever its quantity is decremented to zero. | High |
| **FR-15** | Cart | The system shall allow patrons to attach cooking instructions to any cart item. | Medium |
| **FR-16** | Cart | The system shall validate and compute percentage (`WELCOME10`, `DASTAAN20`) and flat (`FESTIVE50`) vouchers. | High |
| **FR-17** | Summary | The system shall compute financial bills via `useMemo` (Subtotal, 5% Service Charge, 15% Sales Tax, Discount, Total). | High |
| **FR-18** | Reservation | The system shall provide table booking slots between 12:00 and 22:00 at 1-hour increments. | High |
| **FR-19** | Reservation | The system shall disable and render unselectable any time slots that are already booked for a selected date. | High |
| **FR-20** | Reservation | The system shall display a confirmation modal before finalizing table reservation creation. | Medium |
| **FR-21** | Tracking | The system shall display a 4-stage visual timeline (`Pending`, `Preparing`, `Ready`, `Served`). | High |
| **FR-22** | Tracking | The system shall poll order status from the server every 10 seconds and clean up intervals on unmount. | High |
| **FR-23** | Tracking | The system shall display a live elapsed time counter counting upward in MM:SS format since order placement. | Medium |
| **FR-24** | Theme | The system shall toggle between Theme 2 Light (Cream `#F8F1E5`) and Dark (`#1A1114`) palettes. | High |

---

## 5. Non-Functional Requirements (NFR)

1. **Performance:** UI interactions must maintain 60 FPS; debounced search filter latency must remain under 50ms.
2. **Reliability:** App must gracefully handle server disconnects with resilient in-memory local state fallback.
3. **Usability:** High typographic contrast meeting WCAG 2.1 AA standards (Espresso text `#2B2118` on Cream surface `#FFFFFF`).
4. **Security:** Passwords must never be displayed in plain text or returned in API responses; all protected endpoints require Bearer JWT.

---

## 6. System Interfaces & Architectural Constraints
- **State Management:** Strict reliance on built-in React hooks (`useContext`, `useReducer`, `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`). Redux and MobX are strictly forbidden.
- **Styling Architecture:** Tailwind CSS paired with centralized color tokens in `src/theme/colors.js`.
