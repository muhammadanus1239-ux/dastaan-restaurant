# UML Diagram 2: Class Diagram
**System:** DASTAAN Domain Entities & Relationships

---

```mermaid
classDiagram
    class User {
        +ObjectId id
        +String name
        +String email
        +String password
        +String role
        +Date createdAt
        +login(email, password)
        +register(name, email, password, role)
    }

    class MenuItem {
        +ObjectId id
        +String name
        +String description
        +Number price
        +String category
        +String image
        +Boolean isSpecial
        +Boolean isAvailable
        +updatePrice(newPrice)
        +toggleAvailability()
    }

    class Table {
        +ObjectId id
        +Number tableNumber
        +Number capacity
        +String location
        +Boolean isOccupied
    }

    class OrderItem {
        +ObjectId menuItemId
        +String name
        +Number price
        +Number quantity
        +String note
    }

    class Order {
        +ObjectId id
        +ObjectId userId
        +OrderItem[] items
        +Number subtotal
        +Number serviceCharge
        +Number tax
        +Number discount
        +Number total
        +String orderType
        +String table
        +String pickupTime
        +String status
        +Date createdAt
        +advanceStatus(newStatus)
        +cancelOrder()
    }

    class Reservation {
        +ObjectId id
        +ObjectId userId
        +ObjectId tableId
        +String date
        +String timeSlot
        +Number partySize
        +String guestName
        +String phone
        +String status
        +Date createdAt
        +confirm()
        +decline()
        +cancel()
    }

    User "1" --> "0..*" Order : places
    User "1" --> "0..*" Reservation : books
    Order "1" *-- "1..*" OrderItem : contains
    OrderItem "1" --> "1" MenuItem : references
    Reservation "1" --> "1" Table : assigns
    Order "0..1" --> "0..1" Table : for dine-in
```

### Relationship Multiplicities:
- A `User` can place 0 to many `Orders`.
- An `Order` compositionally owns 1 to many `OrderItems`.
- Each `OrderItem` references a distinct `MenuItem`.
- A `Reservation` maps exactly one `User` to one `Table` for a specific date and time slot.
