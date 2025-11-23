// src/lib/client-auth.js
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function setToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('✅ Token saved to localStorage');
    console.log('Token preview:', token.substring(0, 50) + '...');
  }
}

export function getToken() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log('🎫 Token retrieved from localStorage');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return token;
  }
  return null;
}

export function setUser(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('✅ User saved to localStorage:', user);
  }
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('🗑️ Auth cleared from localStorage');
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export function getAuthHeaders() {
  const token = getToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
}