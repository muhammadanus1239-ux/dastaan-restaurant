import { validatePromoCode } from '../data/promoCodes';

/**
 * Initial State for Cart (A1 Q7 Requirement 2)
 */
export const initialCartState = {
  items: [],              // Array of { item: MenuItem, qty: number, note: string }
  appliedPromo: null,     // { code, type, value, description } or null
  promoError: null        // string or null
};

/**
 * Pure cartReducer Function (A1 Q7 Requirement 1)
 * Handles 8 actions without ever mutating the state.
 */
export function cartReducer(state, action) {
  switch (action.type) {
    // 1. ADD_ITEM: If item already exists, increment qty; otherwise add with qty 1 and empty note
    case 'ADD_ITEM': {
      const { item, note = '' } = action.payload;
      const targetId = item.id || item._id;
      const existingIndex = state.items.findIndex(i => (i.item.id || i.item._id) === targetId);

      if (existingIndex > -1) {
        const updatedItems = state.items.map((cartItem, idx) => {
          if (idx === existingIndex) {
            return {
              ...cartItem,
              qty: cartItem.qty + 1,
              note: note || cartItem.note
            };
          }
          return cartItem;
        });
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, { item, qty: 1, note }]
      };
    }

    // 2. REMOVE_ITEM: Removes item matching item ID
    case 'REMOVE_ITEM': {
      const { id } = action.payload;
      return {
        ...state,
        items: state.items.filter(i => (i.item.id || i.item._id) !== id)
      };
    }

    // 3. INCREMENT_QTY: Increases quantity by 1
    case 'INCREMENT_QTY': {
      const { id } = action.payload;
      const updatedItems = state.items.map(cartItem => {
        if ((cartItem.item.id || cartItem.item._id) === id) {
          return { ...cartItem, qty: cartItem.qty + 1 };
        }
        return cartItem;
      });
      return { ...state, items: updatedItems };
    }

    // 4. DECREMENT_QTY: Decreases quantity by 1; if quantity reaches 0, removes the item (A1 Q7 Requirement 1)
    case 'DECREMENT_QTY': {
      const { id } = action.payload;
      const targetItem = state.items.find(i => (i.item.id || i.item._id) === id);

      if (!targetItem) {
        return state;
      }

      if (targetItem.qty <= 1) {
        // Drop to 0 -> Remove item
        return {
          ...state,
          items: state.items.filter(i => (i.item.id || i.item._id) !== id)
        };
      }

      // Quantity > 1 -> Decrement
      const updatedItems = state.items.map(cartItem => {
        if ((cartItem.item.id || cartItem.item._id) === id) {
          return { ...cartItem, qty: cartItem.qty - 1 };
        }
        return cartItem;
      });
      return { ...state, items: updatedItems };
    }

    // 5. UPDATE_NOTE: Updates special cooking instructions for a specific item
    case 'UPDATE_NOTE': {
      const { id, note } = action.payload;
      const updatedItems = state.items.map(cartItem => {
        if ((cartItem.item.id || cartItem.item._id) === id) {
          return { ...cartItem, note };
        }
        return cartItem;
      });
      return { ...state, items: updatedItems };
    }

    // 6. APPLY_PROMO: Validates and applies promo code, or sets error if invalid
    case 'APPLY_PROMO': {
      const { code } = action.payload;
      const validation = validatePromoCode(code);

      if (validation.valid) {
        return {
          ...state,
          appliedPromo: validation.promo,
          promoError: null
        };
      }

      return {
        ...state,
        appliedPromo: null,
        promoError: validation.error
      };
    }

    // 7. REMOVE_PROMO: Clears applied promo and promo error
    case 'REMOVE_PROMO': {
      return {
        ...state,
        appliedPromo: null,
        promoError: null
      };
    }

    // 8. CLEAR_CART: Empties cart items and resets promo state
    case 'CLEAR_CART': {
      return {
        items: [],
        appliedPromo: null,
        promoError: null
      };
    }

    // 9. RESTORE_CART: Restores persisted cart state from AsyncStorage
    case 'RESTORE_CART': {
      return {
        ...state,
        items: action.payload.items || [],
        appliedPromo: action.payload.appliedPromo || null,
        promoError: null
      };
    }

    default:
      return state;
  }
}
