import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartReducer, initialCartState } from '../reducers/cartReducer';
import { apiClient } from '../api/client';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id || auth?.user?._id;
  const isFirstRun = useRef(true);

  // Restore saved cart from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('dastaan_cart')
      .then(saved => {
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.items)) {
              dispatch({ type: 'RESTORE_CART', payload: parsed });
            }
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Persist cart changes to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('dastaan_cart', JSON.stringify(state)).catch(() => {});
  }, [state]);

  // Sync cart to MongoDB through the server (POST /api/cart)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!userId) return;

    const timer = setTimeout(() => {
      apiClient
        .post('/api/cart', {
          userId: String(userId),
          items: state.items.map(ci => ({
            itemId: String(ci.id),
            name: ci.name,
            price: ci.price,
            qty: ci.qty,
          })),
        })
        .then(() => console.log('Cart synced to MongoDB'))
        .catch(e => console.log('cart sync error:', e.message));
    }, 500);

    return () => clearTimeout(timer);
  }, [state.items, userId]);

  // Derived total item count across all quantities (A1 Q7 Requirement 5)
  const itemCount = state.items.reduce((total, cartItem) => total + cartItem.qty, 0);

  // Helper action creators
  const addToCart = (item, note = '') => dispatch({ type: 'ADD_ITEM', payload: { item, note } });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const incrementQty = (id) => dispatch({ type: 'INCREMENT_QTY', payload: { id } });
  const decrementQty = (id) => dispatch({ type: 'DECREMENT_QTY', payload: { id } });
  const updateNote = (id, note) => dispatch({ type: 'UPDATE_NOTE', payload: { id, note } });
  const applyPromo = (code) => dispatch({ type: 'APPLY_PROMO', payload: { code } });
  const removePromo = () => dispatch({ type: 'REMOVE_PROMO' });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const value = {
    state,
    items: state.items,
    appliedPromo: state.appliedPromo,
    promoError: state.promoError,
    itemCount,
    dispatch,
    addToCart,
    removeFromCart,
    incrementQty,
    decrementQty,
    updateNote,
    applyPromo,
    removePromo,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom consumer hook with descriptive error guard
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default useCart;