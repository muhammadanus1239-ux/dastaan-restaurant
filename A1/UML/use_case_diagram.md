# UML Diagram 1: Use Case Diagram
**System:** DASTAAN Restaurant Application  
**Actors:**
- **Customer / Patron** (Primary Actor)
- **Restaurant Manager** (Secondary / Administrative Actor)
- **Kitchen Display System (KDS)** (Internal Processing Actor)

---

```mermaid
usecaseDiagram
    actor Customer as "Customer / Patron"
    actor Manager as "Restaurant Manager"

    package "DASTAAN Restaurant System" {
        usecase UC1 as "Register / Login Account"
        usecase UC2 as "Browse & Search Menu"
        usecase UC3 as "Filter by Category & Diet"
        usecase UC4 as "Customize Dish (Quantity & Notes)"
        usecase UC5 as "Apply Promo Voucher"
        usecase UC6 as "Place Dine-in / Takeaway Order"
        usecase UC7 as "Track Live Order Progress"
        usecase UC8 as "Cancel Pending Order"
        usecase UC9 as "Book Table Reservation"
        usecase UC10 as "Cancel Table Reservation"
        usecase UC11 as "Toggle Light / Dark Theme"
        
        usecase UC12 as "View Live Kitchen Queue"
        usecase UC13 as "Advance Order Status (Forward Only)"
        usecase UC14 as "Accept / Decline Table Bookings"
        usecase UC15 as "Add New Dish to Menu"
        usecase UC16 as "Update Dish Price & Availability"
        usecase UC17 as "Delete Dish from Catalog"
    }

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    Customer --> UC10
    Customer --> UC11

    Manager --> UC1
    Manager --> UC11
    Manager --> UC12
    Manager --> UC13
    Manager --> UC14
    Manager --> UC15
    Manager --> UC16
    Manager --> UC17

    UC6 ..> UC5 : <<includes>>
    UC4 ..> UC2 : <<extends>>
    UC8 ..> UC7 : <<extends>>
```

### Use Case Descriptions:
- **UC6 (Place Order):** Includes financial calculation, promo code validation, and table or pickup time allocation.
- **UC13 (Advance Status):** Strictly forward-only transitions (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`).
- **UC8 (Cancel Order):** Guarded business rule: strictly executable while status remains `Pending`.
