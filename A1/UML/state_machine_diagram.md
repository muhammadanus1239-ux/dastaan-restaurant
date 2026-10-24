# UML Diagram 4: State Machine Diagram
**Subject:** Order Lifecycle & Status Transitions

---

```mermaid
stateDiagram-v2
    [*] --> Pending: Customer places order via POST /api/orders

    state Pending {
        [*] --> InKitchenQueue
        InKitchenQueue: Waiting for chef acknowledgment
    }

    Pending --> Preparing: Manager clicks "Advance to Preparing"
    Pending --> Cancelled: Customer clicks "Cancel Order" (Permitted)

    state Preparing {
        [*] --> Cooking
        Cooking: Marination, charcoal grilling & baking
    }

    Preparing --> Ready: Manager clicks "Advance to Ready"
    Preparing --> Cancelled: Customer attempts cancel -> REJECTED [400 Bad Request]

    state Ready {
        [*] --> PlatedAndGarnished
        PlatedAndGarnished: Hot & packaged for table or pickup
    }

    Ready --> Served: Manager / Waitstaff serves customer
    Ready --> Cancelled: Customer attempts cancel -> REJECTED [400 Bad Request]

    state Served {
        [*] --> Completed
        Completed: Dining experience fulfilled
    }

    Served --> [*]
    Cancelled --> [*]
```

### Transition Invariants & Guard Conditions:
1. **Forward-only Rule:** `Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`. Any backward transition (e.g. `Ready` ➔ `Preparing`) is strictly rejected with HTTP status **400 Bad Request**.
2. **Cancellation Guard:** `order.status === 'Pending'`. Once the kitchen moves the order into `Preparing`, cancellation requests are firmly blocked with **400 Bad Request**.
