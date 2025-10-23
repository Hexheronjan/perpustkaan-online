'use client';

import { useState } from 'react';

export default function PortCheck() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testPort = async (port, name) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:${port}/api/test-db`);
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [name]: {
          port: port,
          status: response.status,
          success: response.ok,
          data: data,
          error: response.ok ? null : data.message || 'Unknown error'
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          port: port,
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

  const testAllPorts = async () => {
    setLoading(true);
    setResults({});
    
    // Test common ports
    await testPort(3000, 'Port 3000');
    await testPort(3001, 'Port 3001');
    await testPort(3002, 'Port 3002');
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Port Checker</h1>
      
      <div className="mb-6">
        <button
          onClick={testAllPorts}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check All Ports'}
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
                    Database: {result.data.success ? 'Connected' : 'Failed'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(results).length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          Click "Check All Ports" to start checking
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Quick Links:</h3>
        <div className="space-y-2">
          <a href="http://localhost:3000/test-api" className="block text-blue-600 hover:underline">
            Test API (Port 3000)
          </a>
          <a href="http://localhost:3001/test-api" className="block text-blue-600 hover:underline">
            Test API (Port 3001)
          </a>
          <a href="http://localhost:3000/api/test-db" className="block text-blue-600 hover:underline">
            Test DB (Port 3000)
          </a>
          <a href="http://localhost:3001/api/test-db" className="block text-blue-600 hover:underline">
            Test DB (Port 3001)
          </a>
        </div>
      </div>
    </div>
  );
}



