'use client';

import { useState } from 'react';

export default function TestCRUD() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, method, url, body = null, headers = {}) => {
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
      
      let data;
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        } else {
          data = { message: 'Empty response' };
        }
      } catch (parseError) {
        data = { 
          error: 'Failed to parse JSON response',
          rawResponse: await response.text().catch(() => 'Could not read response')
        };
      }
      
      // Consider 405 as success for "Should Fail" tests
      const isExpectedFailure = name.includes('Should Fail') && response.status === 405;
      const isSuccess = response.ok || isExpectedFailure;
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          success: isSuccess,
          data: data,
          method: method,
          statusText: response.statusText,
          isExpectedFailure: isExpectedFailure
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          success: false,
          error: error.message,
          method: method
        }
      }));
    }
    setLoading(false);
  };

  const testAll = async () => {
    setResults({});
    
    // Test Visitor (should only work for GET)
    await testEndpoint('Visitor GET Books', 'GET', 'http://localhost:3000/api/visitor/buku');
    await testEndpoint('Visitor POST Books (Should Fail)', 'POST', 'http://localhost:3000/api/visitor/buku', { judul: 'Test' });
    
    // Test Admin (Full access) - Create book first
    await testEndpoint('Admin GET Books', 'GET', 'http://localhost:3000/api/admin/buku', null, { 'x-role': 'admin' });
    await testEndpoint('Admin POST Book', 'POST', 'http://localhost:3000/api/admin/buku', {
      judul: 'Test Book for Member',
      penulis: 'Test Author',
      penerbit: 'Test Publisher',
      tahun_terbit: 2024,
      genre_id: 1,
      is_approved: true,
      stok_tersedia: 1,
      stok_total: 1
    }, { 'x-role': 'admin' });
    
    // Test Member (GET + POST peminjaman) - Use the newly created book
    await testEndpoint('Member GET Books', 'GET', 'http://localhost:3000/api/member/buku', null, { 'x-role': 'member' });
    await testEndpoint('Member POST Peminjaman', 'POST', 'http://localhost:3000/api/member/peminjaman', {
      user_id: 3, // member1 user ID
      buku_id: 17, // Use the newly created book (ID 17)
      tanggal_kembali_target: '2024-02-15'
    }, { 'x-role': 'member' });
    await testEndpoint('Member POST Books (Should Fail)', 'POST', 'http://localhost:3000/api/member/buku', { judul: 'Test' }, { 'x-role': 'member' });
    
    // Test Staf (GET, PUT, DELETE - but POST needs approval)
    await testEndpoint('Staf GET Books', 'GET', 'http://localhost:3000/api/staf/buku', null, { 'x-role': 'staf' });
    await testEndpoint('Staf PUT Book', 'PUT', 'http://localhost:3000/api/staf/buku', {
      id: 1,
      judul: 'Updated Book Title',
      penulis: 'Updated Author'
    }, { 'x-role': 'staf' });
    await testEndpoint('Staf POST Book (Pending)', 'POST', 'http://localhost:3000/api/staf/buku', {
      judul: 'New Book by Staf',
      penulis: 'Staf Author',
      penerbit: 'Test Publisher',
      tahun_terbit: 2024,
      genre_id: 1
    }, { 'x-role': 'staf' });
    await testEndpoint('Admin PUT Book', 'PUT', 'http://localhost:3000/api/admin/buku', {
      id: 1,
      judul: 'Updated by Admin',
      penulis: 'Admin Updated Author'
    }, { 'x-role': 'admin' });
    
    // Test DELETE operations - use books that exist
    await testEndpoint('Staf DELETE Book', 'DELETE', 'http://localhost:3000/api/staf/buku?id=11', null, { 'x-role': 'staf' });
    await testEndpoint('Admin DELETE Book', 'DELETE', 'http://localhost:3000/api/admin/buku?id=12', null, { 'x-role': 'admin' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Test CRUD Operations by Role</h1>
      
      <button 
        onClick={testAll} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test All CRUD Operations'}
      </button>

      <div style={{ display: 'grid', gap: '15px' }}>
        {Object.entries(results).map(([name, result]) => (
          <div 
            key={name}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              backgroundColor: result.success ? '#d4edda' : '#f8d7da'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: result.success ? '#155724' : '#721c24' }}>
              {name} - {result.method} 
              <span style={{ 
                color: result.success ? 'green' : 'red',
                marginLeft: '10px'
              }}>
                {result.success ? '✅' : '❌'}
              </span>
              {result.isExpectedFailure && (
                <span style={{ 
                  color: 'orange',
                  marginLeft: '10px',
                  fontSize: '12px'
                }}>
                  (Expected Failure)
                </span>
              )}
            </h3>
            <p><strong>Status:</strong> {result.status}</p>
            {result.error ? (
              <p><strong>Error:</strong> {result.error}</p>
            ) : (
              <div>
                <p><strong>Response:</strong></p>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '3px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
