# A1 Self-Interview & System Planning Notes
**Project:** DASTAAN — Heritage Dining Restaurant Application  
**Author:** Muhammad Anas (muhammadanus1239@gmail.com)  
**Date:** 2026-10-21  

---

## 1. Context & Business Domain

### What is DASTAAN?
DASTAAN is a premium royal heritage dining restaurant serving authentic South Asian culinary delicacies (dum pukht, handi, charcoal kebabs, slow-simmered nihari, and traditional desserts). 

### Who is the Primary Customer?
- **Persona:** Working professionals, families, and culinary connoisseurs who value heritage taste and seamless hospitality.
- **Pain Point:** Long waiting queues at the restaurant, lack of table clarity during peak evening dinner hours, misplaced custom cooking requests (e.g., "extra ginger", "mild spice"), and lack of transparency during order preparation.

---

## 2. Customer Feature Set & Requirements

1. **Authentication & Session:**
   - Email and password registration with client-side validation (Pakistani phone format, 8+ character password, email regex).
   - Fast login with persistent session restoration.
   - Distinct roles: **Customer** (ordering & reservations) and **Manager** (kitchen queue, table approvals, menu editing).

2. **Interactive Menu Experience:**
   - Comprehensive categorised catalog: *Starters*, *Mains*, *Desserts*, *Drinks*.
   - Chef's Daily Special badge highlighting signature delicacies.
   - Live search with a 400ms debounce to prevent input lagging.
   - Filter chips and price/name sorting.
   - Availability toggle: dishes marked as "Sold Out" remain visible but are visually greyed out and cannot be added to cart.

3. **Cart & Customization:**
   - Multi-item cart with quantity stepper (`+` / `-`).
   - Pure reducer actions: decrementing an item at quantity 1 down to 0 automatically purges it from the cart.
   - Item-specific cooking notes (e.g., "extra crispy naan", "raita on the side").
   - Voucher promo code redemption (`WELCOME10` 10%, `DASTAAN20` 20%, `FESTIVE50` flat 50 PKR).

4. **Order Summary & Financial Breakdown:**
   - Choice between **Dine-in** (with table selection) and **Takeaway** (with estimated pickup time).
   - Dynamic financial calculation computed via `useMemo`:
     - Subtotal
     - 5% Service Charge
     - 15% Sales Tax
     - Promo Discount
     - Grand Total Payable

5. **Table Reservation System:**
   - Select dining date (up to 30 days in advance).
   - Time slots in 1-hour increments from **12:00 to 22:00**.
   - Disabled booked slots: tables already reserved for a given date and time slot appear visually disabled to prevent double-booking.
   - Party size selector (1 to 12 guests) with auto-assigned tables.
   - Confirmation modal displaying booking details before dispatch.

6. **Live Order Tracking:**
   - Multi-step progress timeline: `Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`.
   - Real-time elapsed timer tracking seconds since order placement.
   - 10-second polling mechanism to sync order status live without requiring manual app reloads.
   - Ability for customer to cancel their order *only while it is still in Pending status*.

---

## 3. Analysis of Assignment 1 Data-Loss Problems & Technical Solutions

In Assignment 1, the client application operated purely with React client-side state. The self-interview identified critical operational vulnerabilities in this approach:

| Vulnerability / Problem Scenario | Root Cause in Client-Only Architecture | Real-World Restaurant Impact | Backend / Architectural Solution (A2) |
|---|---|---|---|
| **App Refresh / Crash Data Loss** | Volatile React memory (`useState`, `useReducer`) is completely wiped whenever the browser tab reloads or the app process restarts. | A customer who spent 10 minutes customising an order loses their cart and active order progress. | Persist auth tokens in storage; persist all orders, carts, and reservations in MongoDB Atlas via Mongoose ODM. |
| **Double-Booking Race Condition** | Two different customers booking the same table simultaneously only check local client state, unaware of concurrent users. | Two families arrive for Table 3 at 20:00 on Saturday evening; restaurant suffers embarrassing operational failure. | Server-side transactional validation: `POST /api/reservations` checks database for existing active bookings and returns **409 Conflict**. |
| **Price Tampering Vulnerability** | If the client sends only the grand total to the checkout, a malicious customer could modify prices in memory. | A customer orders a 2,450 PKR Mutton Karahi for 10 PKR by altering client state. | **Server-authoritative calculation:** The client submits item IDs and quantities; the server looks up true prices from the database, calculates subtotal, 5% service, 15% tax, and discount, strictly rejecting client totals. |
| **Kitchen Asynchrony** | Without a server, the kitchen staff has no way to notify the customer that their meal is "Ready" or "Served". | Customer repeatedly walks to the kitchen counter to ask if their food is ready. | The server provides `PATCH /api/orders/:id/status` for management; the customer app polls `GET /api/orders/:id` every 10 seconds to update the UI live. |
