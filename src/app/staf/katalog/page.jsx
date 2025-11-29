// src/app/staf/katalog/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export default function KatalogBuku() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const FALLBACK_COVER =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial" font-size="20">No Cover</text></svg>';

  const formatImageUrl = (url) => {
    if (!url) return null;

    let normalized = String(url).trim();

    // Replace Windows-style backslashes
    normalized = normalized.replace(/\\/g, '/');

    // Remove leading public/ or ./ segments
    normalized = normalized.replace(/^public\//i, '');
    normalized = normalized.replace(/^\.?\//, '');

    if (/^https?:\/\//i.test(normalized) || normalized.startsWith('data:')) {
      return normalized;
    }

    if (normalized.startsWith('//')) {
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      return `${protocol}${normalized}`;
    }

    if (normalized.startsWith('/')) {
      return normalized;
    }

    if (normalized.toLowerCase().startsWith('uploads/')) {
      return `/${normalized}`;
    }

    return `/uploads/${normalized}`;
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_COVER;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [booksRes, genresRes] = await Promise.all([
        apiFetch('/api/staf/buku?status=approved'),
        apiFetch('/api/staf/genre')
      ]);

      const approvedBooks = Array.isArray(booksRes)
        ? booksRes.filter(book => book.status === 'approved')
        : [];

      setBooks(approvedBooks);
      setGenres(Array.isArray(genresRes) ? genresRes : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Gagal memuat katalog buku');
      setBooks([]);
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  const getGenreName = (genreId, fallback = '') => {
    const genre = genres.find(g => g.id === genreId);
    if (genre) return genre.nama_genre;
    if (fallback) return fallback;
    return '-';
  };

  const getYearOptions = () => {
    const years = [...new Set(books
      .map(book => book.tahun_terbit)
      .filter(year => !!year))].sort((a, b) => b - a);
    return years;
  };

  const filteredBooks = books.filter(book => {
    const matchSearch = book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       book.penulis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = !selectedGenre || book.genre_id === parseInt(selectedGenre);
    const matchYear = !selectedYear || book.tahun_terbit === parseInt(selectedYear);
    return matchSearch && matchGenre && matchYear && book.status === 'approved';
  });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Katalog Buku</h1>
        <p className="text-gray-600 mt-2">Jelajahi koleksi buku perpustakaan</p>
        {error && (
          <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button
              className="ml-3 underline"
              onClick={fetchData}
            >
              Coba lagi
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari judul atau penulis buku..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <div className="w-full lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">Semua Genre</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.nama_genre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Filter */}
          <div className="w-full lg:w-48">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">Semua Tahun</option>
                {getYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Menampilkan {paginatedBooks.length} dari {filteredBooks.length} buku
        </div>
      </div>

      {/* Books Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {paginatedBooks.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada buku yang ditemukan</p>
          </div>
        ) : (
          paginatedBooks.map((book) => {
            const coverUrl = formatImageUrl(book.sampul_buku) || FALLBACK_COVER;
            return (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Book Cover */}
                <div className="h-64 bg-gray-100 flex items-center justify-center text-white text-6xl relative overflow-hidden">
                  <img
                    src={coverUrl}
                    alt={book.judul}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {getGenreName(book.genre_id, book.nama_genre)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                    {book.judul}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{book.penulis}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {book.tahun_terbit}
                    </span>
                    <span className={`font-medium ${
                      book.stok_tersedia > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {book.stok_tersedia > 0 ? `${book.stok_tersedia} tersedia` : 'Habis'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}