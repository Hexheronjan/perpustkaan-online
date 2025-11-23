"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function VisitorDashboardPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/visitor/books", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal memuat data buku");
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Error:", err);
        setError("Gagal memuat daftar buku.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase();
    return (
      book.title?.toLowerCase().includes(keyword) ||
      book.author?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">📚 Visitor Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Katalog Buku</h2>
            <p className="text-gray-600">
              Sebagai <b>visitor</b>, Anda hanya dapat melihat daftar buku yang tersedia.
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Cari buku atau penulis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Memuat data buku...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center text-gray-500">Tidak ada buku yang cocok.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-100 overflow-hidden"
              >
                {/* Gambar Buku */}
<img
  src={`/book-covers/${book.sampul_buku}`}
  alt={book.title}
  className="w-full h-48 object-cover rounded-t-lg"
/>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    📘 {book.title}
                  </h3>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium text-gray-800">Penulis:</span>{" "}
                      {book.author}
                    </p>

                    <p>
                      <span className="font-medium text-gray-800">Genre ID:</span>{" "}
                      {book.genreId || book.genre_id}
                    </p>

                    <p>
                      <span className="font-medium text-gray-800">Stok:</span>{" "}
                      {book.stock}
                    </p>

                    <p>
                      <span className="font-medium text-gray-800">Dibuat pada:</span>{" "}
                      {book.createdAt
                        ? new Date(book.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t text-center text-gray-500 py-4">
        © 2025 Perpustakaan Digital. Hak cipta dilindungi.
      </footer>
    </div>
  );
}
