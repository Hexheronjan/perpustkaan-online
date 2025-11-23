"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { getUser, getToken } from "@/lib/client-auth";

export default function TestApiPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const user = getUser();
  const token = getToken();

  async function testGetBooks() {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("🔍 Testing GET /api/staf/buku");
      console.log("Token:", token ? "✅ Available" : "❌ Missing");
      console.log("User:", user);
      
      const data = await apiFetch(`/api/staf/buku?user_id=${user?.id || ''}`);
      
      console.log("✅ Response:", data);
      setBooks(Array.isArray(data) ? data : []);
      setSuccess(`Berhasil fetch ${data.length} buku`);
    } catch (e) {
      console.error("❌ Error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function testCreateBook() {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("➕ Testing POST /api/staf/buku");
      
      const newBook = {
        judul: `Test Buku ${Date.now()}`,
        penulis: "Test Author",
        penerbit: "Test Publisher",
        tahun_terbit: 2024,
        stok_total: 5,
        stok_tersedia: 5,
        user_id: user?.id,
        genre_id: 1,
      };
      
      const result = await apiFetch("/api/staf/buku", {
        method: "POST",
        body: JSON.stringify(newBook),
      });
      
      console.log("✅ Book created:", result);
      setSuccess(`Berhasil tambah buku: ${result.judul}`);
      
      // Refresh list
      testGetBooks();
    } catch (e) {
      console.error("❌ Error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function testPublicApi() {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("🌐 Testing GET /api/public/buku");
      
      const response = await fetch("/api/public/buku");
      const data = await response.json();
      
      console.log("✅ Public API Response:", data);
      setBooks(data.data || []);
      setSuccess(`Public API: ${data.count} buku`);
    } catch (e) {
      console.error("❌ Error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Testing Dashboard</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-semibold">Logged In</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p className="text-xs text-gray-600 mt-2 break-all">
                  <strong>Token:</strong> {token?.substring(0, 50)}...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Not logged in - <a href="/login" className="text-blue-600 underline">Go to Login</a></span>
            </div>
          )}
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testPublicApi}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Loading..." : "Test Public API"}
            </button>
            
            <button
              onClick={testGetBooks}
              disabled={loading || !user}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Loading..." : "Test GET Books (Auth)"}
            </button>
            
            <button
              onClick={testCreateBook}
              disabled={loading || !user}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "Loading..." : "Test CREATE Book (Auth)"}
            </button>
          </div>
          
          {!user && (
            <p className="text-sm text-gray-600 mt-4">
              ⚠️ You must be logged in to test authenticated endpoints
            </p>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700"><strong>Error:</strong> {error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
            <p className="text-green-700"><strong>Success:</strong> {success}</p>
          </div>
        )}

        {/* Books List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Books ({books.length})
          </h2>
          
          {books.length === 0 ? (
            <p className="text-gray-500">No books found. Click a test button above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Judul</th>
                    <th className="p-3">Penulis</th>
                    <th className="p-3">Genre</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{book.id}</td>
                      <td className="p-3 font-semibold">{book.judul}</td>
                      <td className="p-3">{book.penulis}</td>
                      <td className="p-3">{book.nama_genre || "-"}</td>
                      <td className="p-3">{book.stok_tersedia}/{book.stok_total}</td>
                      <td className="p-3">
                        {book.is_approved === true ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            Approved
                          </span>
                        ) : book.is_approved === false ? (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                            Pending
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            N/A
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* API Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 API Endpoints</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <code>/api/public/buku</code> - No auth required</li>
            <li>• <code>/api/staf/buku</code> - Requires JWT token (STAF/ADMIN)</li>
            <li>• <code>/api/admin/buku</code> - Requires JWT token (ADMIN only)</li>
            <li>• <code>/api/admin/buku/approve</code> - Requires JWT token (ADMIN only)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}