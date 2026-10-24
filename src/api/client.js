/**
 * Centralized API Client (A2 Q6 Requirement 1 & 2)
 * All backend API communications go through this helper.
 * Manages BASE_URL configuration, JWT token injection, and unified error handling.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PORT = 5000;

// Agar auto-detect na chale to yahan laptop ka IPv4 likh de, e.g. 'http://192.168.1.15:5000'
const MANUAL_URL = 'http://192.168.18.81:5000';

const getBaseUrl = () => {
  if (MANUAL_URL) return MANUAL_URL;
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Expo Go: Metro ka host (laptop ka IP) automatically milta hai
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) return `http://${hostUri.split(':')[0]}:${PORT}`;

  if (Platform.OS === 'android') return `http://10.0.2.2:${PORT}`;
  return `http://localhost:${PORT}`;
};

export const BASE_URL = getBaseUrl();
console.log('API BASE_URL:', BASE_URL);

// Storage keys for JWT token and user
const TOKEN_STORAGE_KEY = 'dastaan_token';
const USER_STORAGE_KEY = 'dastaan_user';
const inMemoryStore = {};

// Initialize from AsyncStorage
(async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) inMemoryStore[TOKEN_STORAGE_KEY] = token;
    const user = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (user) inMemoryStore[USER_STORAGE_KEY] = user;
  } catch (e) {}
})();

export const getStoredToken = () => {
  return inMemoryStore[TOKEN_STORAGE_KEY] || null;
};

export const getStoredTokenAsync = async () => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) inMemoryStore[TOKEN_STORAGE_KEY] = token;
  return token;
};

export const setStoredToken = (token) => {
  if (token) {
    inMemoryStore[TOKEN_STORAGE_KEY] = token;
    AsyncStorage.setItem(TOKEN_STORAGE_KEY, token).catch(() => {});
  } else {
    delete inMemoryStore[TOKEN_STORAGE_KEY];
    AsyncStorage.removeItem(TOKEN_STORAGE_KEY).catch(() => {});
  }
};

export const getStoredUser = () => {
  const inMem = inMemoryStore[USER_STORAGE_KEY];
  try {
    return inMem ? JSON.parse(inMem) : null;
  } catch (e) {
    return null;
  }
};

export const getStoredUserAsync = async () => {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (raw) inMemoryStore[USER_STORAGE_KEY] = raw;
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    const serialized = JSON.stringify(user);
    inMemoryStore[USER_STORAGE_KEY] = serialized;
    AsyncStorage.setItem(USER_STORAGE_KEY, serialized).catch(() => {});
  } else {
    delete inMemoryStore[USER_STORAGE_KEY];
    AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => {});
  }
};

export const clearStoredAuth = () => {
  delete inMemoryStore[TOKEN_STORAGE_KEY];
  delete inMemoryStore[USER_STORAGE_KEY];
  AsyncStorage.removeItem(TOKEN_STORAGE_KEY).catch(() => {});
  AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => {});
};

/**
 * Core HTTP Request Wrapper (injects JWT Bearer token on every authenticated request)
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Convenience REST methods
export const apiClient = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;
