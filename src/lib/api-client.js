// src/lib/api-client.js
import { getToken } from './client-auth';

export async function apiFetch(url, options = {}) {
  console.log('🌐 apiFetch called for:', url);
  
  // Get token from localStorage
  const token = getToken();
  
  if (!token) {
    console.error('❌ NO TOKEN FOUND! Cannot make authenticated request.');
    console.log('Please login first or check localStorage.');
  } else {
    console.log('✅ Token found, adding to Authorization header');
    console.log('Token preview:', token.substring(0, 30) + '...');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization header added: Bearer', token.substring(0, 20) + '...');
  }

  console.log('📤 Request headers:', Object.keys(headers));

  const config = {
    ...options,
    headers,
  };

  try {
    console.log('📡 Making request...');
    const response = await fetch(url, config);
    console.log('📥 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      let error;
      
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error('❌ Request failed:', error);
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Request successful, data received');
    return data;
    
  } catch (error) {
    console.error('💥 apiFetch error:', error);
    throw error;
  }
}