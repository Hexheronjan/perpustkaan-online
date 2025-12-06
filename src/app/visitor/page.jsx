"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Filter, BookOpen, Sparkles, TrendingUp, Clock, User } from "lucide-react";

export default function ModernVisitorPage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, genresRes] = await Promise.all([
          fetch("/api/visitor/books", { cache: "no-store" }),
          fetch("/api/visitor/genres", { cache: "no-store" })
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

  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      book.title?.toLowerCase().includes(keyword) ||
      book.author?.toLowerCase().includes(keyword) ||
      book.description?.toLowerCase().includes(keyword);

    // Perbaikan: Cek berbagai kemungkinan nama field untuk genre ID
    const bookGenreId = book.genreId || book.genre_id || book.GenreId;
    const matchesGenre =
      selectedGenre === "all" ||
      bookGenreId === parseInt(selectedGenre) ||
      String(bookGenreId) === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/visitor')}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl transform group-hover:scale-110 transition-transform">
                  <BookOpen className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Perpustakaan Digital
                </h1>
                <p className="text-xs text-gray-500 font-medium">Temukan Buku Favoritmu</p>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={() => router.push('/login')}
              className="relative group overflow-hidden px-6 py-3 rounded-xl font-semibold text-white shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-transform group-hover:scale-110"></div>
              <div className="relative flex items-center gap-2">
                <User size={18} />
                <span>Masuk / Daftar</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6 animate-bounce-slow">
            <Sparkles className="text-yellow-500" size={20} />
            <span className="text-sm font-semibold text-gray-700">Koleksi Terbaru & Terlengkap</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Jelajahi Dunia Literasi
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ribuan buku menanti untuk dibaca. Login atau Register untuk meminjam dan mulai petualangan bacamu! 📚
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-8 border border-white/20 animate-fade-in-up animation-delay-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Cari judul, penulis, atau deskripsi buku..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all shadow-lg ${showFilters
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Filter size={20} />
              <span>Filter</span>
              {selectedGenre !== "all" && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">1</span>
              )}
            </button>
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl animate-slide-down">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📖 Filter berdasarkan Genre
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGenre("all")}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedGenre === "all"
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Semua Genre
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(String(genre.id))}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedGenre === String(genre.id)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="text-indigo-600" size={16} />
            <span className="text-gray-600">
              Menampilkan <span className="font-bold text-indigo-600">{filteredBooks.length}</span> dari {books.length} buku
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium mt-6">Memuat koleksi buku...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center animate-fade-in">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-red-600 font-semibold text-lg">{error}</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center animate-fade-in">
            <div className="text-8xl mb-6 animate-bounce-slow">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Tidak Ada Buku Ditemukan
            </h3>
            <p className="text-gray-600">
              Coba ubah kata kunci pencarian atau filter genre
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map((book, index) => (
              <div
                key={book.id}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedBook(book)}
              >
                {/* Book Cover */}
                <div className="relative h-80 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="absolute bottom-4 left-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/login');
                        }}
                        className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg transform hover:scale-105"
                      >
                        Login untuk Pinjam
                      </button>
                    </div>
                  </div>

                  {/* Book Image */}
                  {book.cover ? (
                    <img
                      src={
                        book.cover.startsWith('http') || book.cover.startsWith('/')
                          ? book.cover
                          : `/uploads/covers/${book.cover}`
                      }
                      alt={book.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML += `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
                            <div class="text-center text-white">
                              <div class="text-7xl mb-4">📖</div>
                              <p class="text-sm font-semibold opacity-80">No Cover Available</p>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
                      <div className="text-center text-white">
                        <div className="text-7xl mb-4 animate-bounce-slow">📖</div>
                        <p className="text-sm font-semibold opacity-80">No Cover Available</p>
                      </div>
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-lg backdrop-blur-sm ${book.stock > 0
                      ? 'bg-green-500/90 text-white'
                      : 'bg-red-500/90 text-white'
                      } transform group-hover:scale-110 transition-transform`}>
                      {book.stock > 0 ? `✓ ${book.stock} tersedia` : '✗ Habis'}
                    </div>
                  </div>

                  {/* New Badge (if recently added) */}
                  {index < 3 && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full font-bold text-xs shadow-lg animate-pulse">
                        <Sparkles size={12} />
                        <span>NEW</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-600 transition-colors">
                    {book.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} className="text-indigo-500" />
                      <span className="font-medium line-clamp-1">{book.author}</span>
                    </div>

                    {book.genre_name && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                          {book.genre_name}
                        </span>
                      </div>
                    )}

                    {book.year && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{book.year}</span>
                      </div>
                    )}
                  </div>

                  {/* Description Preview */}
                  {book.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {book.description}
                    </p>
                  )}

                  {/* Action Hint */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center group-hover:text-indigo-600 transition-colors">
                      Klik untuk melihat detail
                    </p>
                  </div>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Modal Image Section */}
              <div className="w-full md:w-1/3 bg-gray-100 relative h-64 md:h-auto min-h-[300px]">
                {selectedBook.cover ? (
                  <img
                    src={
                      selectedBook.cover.startsWith('http') || selectedBook.cover.startsWith('/')
                        ? selectedBook.cover
                        : `/uploads/covers/${selectedBook.cover}`
                    }
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                    <BookOpen size={64} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${selectedBook.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {selectedBook.stock > 0 ? 'Tersedia' : 'Habis'}
                  </span>
                </div>
              </div>

              {/* Modal Content Section */}
              <div className="w-full md:w-2/3 p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                    {selectedBook.genre_name || 'Umum'}
                  </span>
                  {selectedBook.year && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                      <Clock size={12} /> {selectedBook.year}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2 leading-tight">
                  {selectedBook.title}
                </h2>
                <p className="text-lg text-indigo-600 font-medium mb-6">
                  {selectedBook.author}
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Deskripsi</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedBook.description || 'Tidak ada deskripsi tersedia.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Penerbit</p>
                      <p className="font-semibold text-gray-800">{selectedBook.publisher || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">ISBN</p>
                      <p className="font-semibold text-gray-800">{selectedBook.isbn || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Halaman</p>
                      <p className="font-semibold text-gray-800">{selectedBook.pages || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Stok Total</p>
                      <p className="font-semibold text-gray-800">{selectedBook.total_stock || '-'}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <User size={20} />
                      Login untuk Meminjam
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                      Anda harus login sebagai member untuk meminjam buku ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative mt-20 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={24} />
                <h3 className="text-xl font-bold">Perpustakaan Digital</h3>
              </div>
              <p className="text-indigo-200 text-sm">
                Akses ribuan buku dari berbagai genre. Mulai perjalanan literasimu hari ini!
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Statistik</h4>
              <div className="space-y-2 text-sm text-indigo-200">
                <p>📚 {books.length}+ Koleksi Buku</p>
                <p>🏷️ {genres.length}+ Genre</p>
                <p>⭐ Gratis untuk Semua</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Mulai Sekarang</h4>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg transform hover:scale-105"
              >
                Daftar / Masuk
              </button>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-sm text-indigo-200">
            <p>© 2025 Perpustakaan Digital. Made with ❤️ for book lovers.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}