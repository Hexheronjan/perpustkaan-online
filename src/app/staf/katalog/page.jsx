// src/app/staf/katalog/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Calendar,
  User,
  Tag,
  Grid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { apiFetch } from '@/lib/api-client';

export default function KatalogBuku() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Simulasi data - ganti dengan API call sebenarnya
      setBooks([
        {
          id: 1,
          judul: 'Laskar Pelangi',
          penulis: 'Andrea Hirata',
          penerbit: 'Bentang Pustaka',
          tahun_terbit: 2005,
          isbn: '9789793062792',
          jumlah_halaman: 529,
          deskripsi: 'Novel tentang perjuangan anak-anak di Belitung untuk mendapatkan pendidikan yang layak.',
          stok_tersedia: 5,
          stok_total: 5,
          sampul_buku: '/images/books/laskar-pelangi.jpg',
          genre_id: 1,
          is_approved: true,
        },
        {
          id: 2,
          judul: 'Bumi Manusia',
          penulis: 'Pramoedya Ananta Toer',
          penerbit: 'Hasta Mitra',
          tahun_terbit: 1980,
          isbn: '9789799731234',
          jumlah_halaman: 535,
          deskripsi: 'Novel sejarah yang menceritakan kehidupan di Indonesia pada masa kolonial Belanda.',
          stok_tersedia: 3,
          stok_total: 3,
          sampul_buku: '/images/books/bumi-manusia.jpg',
          genre_id: 1,
          is_approved: true,
        },
        {
          id: 3,
          judul: 'Sapiens',
          penulis: 'Yuval Noah Harari',
          penerbit: 'Gramedia',
          tahun_terbit: 2015,
          isbn: '9786020331447',
          jumlah_halaman: 512,
          deskripsi: 'Sejarah singkat tentang evolusi manusia dari zaman purba hingga modern.',
          stok_tersedia: 4,
          stok_total: 4,
          sampul_buku: '/images/books/sapiens.jpg',
          genre_id: 2,
          is_approved: true,
        },
      ]);

      setGenres([
        { id: 1, nama_genre: 'Fiksi' },
        { id: 2, nama_genre: 'Non-Fiksi' },
        { id: 3, nama_genre: 'Sains' },
        { id: 4, nama_genre: 'Sejarah' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getGenreName = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.nama_genre : '-';
  };

  const getYearOptions = () => {
    const years = [...new Set(books.map(book => book.tahun_terbit))].sort((a, b) => b - a);
    return years;
  };

  const filteredBooks = books.filter(book => {
    const matchSearch = book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       book.penulis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = !selectedGenre || book.genre_id === parseInt(selectedGenre);
    const matchYear = !selectedYear || book.tahun_terbit === parseInt(selectedYear);
    return matchSearch && matchGenre && matchYear && book.is_approved;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  const openDetailModal = (book) => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

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

          {/* View Mode Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Menampilkan {paginatedBooks.length} dari {filteredBooks.length} buku
        </div>
      </div>

      {/* Books Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {paginatedBooks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada buku yang ditemukan</p>
            </div>
          ) : (
            paginatedBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => openDetailModal(book)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Book Cover */}
                <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
                  📚
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {getGenreName(book.genre_id)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {paginatedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Tidak ada buku yang ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => openDetailModal(book)}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    {/* Book Cover */}
                    <div className="w-20 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-3xl flex-shrink-0">
                      📚
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{book.judul}</h3>
                          <p className="text-sm text-gray-600 mb-2 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {book.penulis}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {book.deskripsi}
                          </p>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {getGenreName(book.genre_id)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {book.tahun_terbit}
                            </span>
                            <span className="text-xs text-gray-500">
                              ISBN: {book.isbn}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <p className={`font-bold ${
                            book.stok_tersedia > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {book.stok_tersedia}/{book.stok_total}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {book.stok_tersedia > 0 ? 'Tersedia' : 'Habis'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* Detail Modal */}
      {showDetailModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="float-right p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover */}
                <div className="w-full md:w-48 flex-shrink-0">
                  <div className="h-64 md:h-72 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-6xl">
                    📚
                  </div>
                </div>

                {/* Book Details */}
                <div className="flex-1">
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {getGenreName(selectedBook.genre_id)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedBook.judul}
                  </h2>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <strong className="mr-2">Penulis:</strong> {selectedBook.penulis}
                    </p>
                    <p className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <strong className="mr-2">Penerbit:</strong> {selectedBook.penerbit}
                    </p>
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <strong className="mr-2">Tahun Terbit:</strong> {selectedBook.tahun_terbit}
                    </p>
                    <p className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      <strong className="mr-2">ISBN:</strong> {selectedBook.isbn}
                    </p>
                    <p>
                      <strong>Jumlah Halaman:</strong> {selectedBook.jumlah_halaman} halaman
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 mb-2">Deskripsi:</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedBook.deskripsi}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Ketersediaan</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedBook.stok_tersedia}/{selectedBook.stok_total}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-medium ${
                      selectedBook.stok_tersedia > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedBook.stok_tersedia > 0 ? 'Tersedia' : 'Tidak Tersedia'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}