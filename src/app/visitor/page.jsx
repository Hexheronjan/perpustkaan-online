"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function VisitorDashboardPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books and genres in parallel
        const [booksRes, genresRes] = await Promise.all([
          fetch("/api/visitor/books", { cache: "no-store" }),
          fetch("/api/visitor/genre", { cache: "no-store" })
        ]);

        if (!booksRes.ok) throw new Error("Gagal memuat data buku");
        if (!genresRes.ok) throw new Error("Gagal memuat data genre");

        const booksData = await booksRes.json();
        const genresData = await genresRes.json();

        setBooks(Array.isArray(booksData) ? booksData : []);
        setGenres(Array.isArray(genresData) ? genresData : []);
      } catch (err) {
        console.error("Error:", err);
        setError("Gagal memuat data. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase();
    const matchesSearch = 
      book.title?.toLowerCase().includes(keyword) ||
      book.author?.toLowerCase().includes(keyword) ||
      book.description?.toLowerCase().includes(keyword);
    
    const matchesGenre = 
      selectedGenre === "all" || 
      book.genreId === parseInt(selectedGenre);
    
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">📚 Katalog Perpustakaan</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Login
        </button>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Jelajahi Koleksi Buku Kami
            </h2>
            <p className="text-gray-600">
              Lihat katalog lengkap buku perpustakaan. Login untuk meminjam buku.
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Cari Buku
                </label>
                <input
                  type="text"
                  placeholder="Cari judul, penulis, atau deskripsi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📖 Filter Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Genre</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{filteredBooks.length}</span> dari {books.length} buku
            </div>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-500">Memuat data buku...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tidak Ada Buku Ditemukan
              </h3>
              <p className="text-gray-600">
                Coba ubah kata kunci pencarian atau filter genre Anda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Book Cover */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-100 to-purple-100">
                    {book.cover ? (
                      <img
                        src={book.cover.startsWith('http') ? book.cover : `/book-covers/${book.cover}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center">
                              <div class="text-center">
                                <div class="text-5xl mb-2">📖</div>
                                <p class="text-gray-500 text-sm">No Cover</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl mb-2">📖</div>
                          <p className="text-gray-500 text-sm">No Cover</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        book.stock > 0 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {book.stock > 0 ? `${book.stock} tersedia` : 'Habis'}
                      </span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {book.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Penulis:</span>
                        <span className="line-clamp-1">{book.author}</span>
                      </p>

                      {book.genre_name && (
                        <p className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Genre:</span>
                          <span className="line-clamp-1">{book.genre_name}</span>
                        </p>
                      )}

                      {book.year && (
                        <p className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Tahun:</span>
                          <span>{book.year}</span>
                        </p>
                      )}

                      {book.publisher && (
                        <p className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Penerbit:</span>
                          <span className="line-clamp-1">{book.publisher}</span>
                        </p>
                      )}
                    </div>

                    {/* Description Preview */}
                    {book.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {book.description}
                      </p>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Login untuk Pinjam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t text-center text-gray-500 py-6 mt-12">
        <p className="text-sm">© 2025 Perpustakaan Digital. Hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}