// D:\Projek Coding\projek_pkl\src\app\test-api\page.jsx
'use client';

import { useState } from 'react';

export default function TestAPI() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url, method = 'GET', body = null, headers = {}) => {
    setLoading(true);
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      // Check if response is ok
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        setResults(prev => ({
          ...prev,
          [name]: {
            status: response.status,
            success: false,
            data: null,
            error: errorData.message || `HTTP ${response.status}`
          }
        }));
        return;
      }
      
      // Try to parse JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setResults(prev => ({
          ...prev,
          [name]: {
            status: response.status,
            success: false,
            data: null,
            error: 'Invalid JSON response'
          }
        }));
        return;
      }
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          success: true,
          data: data,
          error: null
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 0,
          success: false,
          data: null,
          error: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    setLoading(true);
    setResults({});
    
    // Test basic connection
    await testEndpoint('Database Connection', '/api/test-db');
    await testEndpoint('Database Debug', '/api/debug/database');
    await testEndpoint('Schema Debug', '/api/debug/schema');
    
    // Test visitor endpoints (no auth required)
    await testEndpoint('Visitor Books', '/api/visitor/buku');
    await testEndpoint('Visitor Genres', '/api/visitor/genre');
    await testEndpoint('Visitor Tags', '/api/visitor/tags');
    
    // Test member endpoints (require auth)
    await testEndpoint('Member Books', '/api/member/buku', 'GET', null, { 'x-role': 'member' });
    await testEndpoint('Member Genres', '/api/member/genre', 'GET', null, { 'x-role': 'member' });
    await testEndpoint('Member Tags', '/api/member/tags', 'GET', null, { 'x-role': 'member' });
    
    // Test staf endpoints (require auth)
    await testEndpoint('Staf Books', '/api/staf/buku', 'GET', null, { 'x-role': 'staf' });
    await testEndpoint('Staf Genres', '/api/staf/genre', 'GET', null, { 'x-role': 'staf' });
    await testEndpoint('Staf Tags', '/api/staf/tags', 'GET', null, { 'x-role': 'staf' });
    
    // Test admin endpoints (require auth)
    await testEndpoint('Admin Books', '/api/admin/buku', 'GET', null, { 'x-role': 'admin' });
    await testEndpoint('Admin Genres', '/api/admin/genre', 'GET', null, { 'x-role': 'admin' });
    await testEndpoint('Admin Tags', '/api/admin/tags', 'GET', null, { 'x-role': 'admin' });
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Testing Dashboard</h1>
      
      <div className="mb-6">
        <button
          onClick={testAll}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(results).map(([name, result]) => (
          <div
            key={name}
            className={`p-4 rounded-lg border-2 ${
              result.success 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
            }`}
          >
            <h3 className="font-bold text-lg mb-2">{name}</h3>
            <div className="text-sm">
              <p className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                Status: {result.status} {result.success ? '✅' : '❌'}
              </p>
              {result.error && (
                <p className="text-red-600 mt-2">Error: {result.error}</p>
              )}
              {result.data && (
                <div className="mt-2">
                  <p className="text-gray-600">
                    Data: {Array.isArray(result.data) ? `${result.data.length} items` : 'Object'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(results).length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          Click "Test All Endpoints" to start testing
        </div>
      )}
    </div>
  );
}
