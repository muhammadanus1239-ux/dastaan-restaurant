/**
 * DASTAAN Restaurant App MVP
 * Root Entry Point with Global Theme and Auth Providers
 * (Assignment 1 Q3 & Q6 + design.md Theme 2: Royal Burgundy, Gold & Cream)
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import RootNavigator from './navigation/RootNavigator';
import { AlertHost } from './react-native';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <RootNavigator />
          <AlertHost />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
