'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, BookOpen, Calendar, Tag } from 'lucide-react';

const BookCard = ({ book, onViewDetail }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
    {book.sampul_buku ? (
      <img
        src={book.sampul_buku}
        alt={book.judul}
        className="w-full h-56 object-cover"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280"%3E%3Crect fill="%23e5e7eb" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="16"%3ENo Cover%3C/text%3E%3C/svg%3E';
        }}
      />
    ) : (
      <div className="w-full h-56 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <BookOpen size={48} className="text-indigo-400" />
      </div>
    )}
    
    <div className="p-4">
      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 h-12">{book.judul}</h3>
      <p className="text-sm text-gray-600 mb-3">{book.penulis}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {book.tahun_terbit || 'N/A'}
        </span>
        <span className={`px-2 py-1 rounded-full font-medium ${
          book.stok_tersedia > 0 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {book.stok_tersedia > 0 ? `Stok: ${book.stok_tersedia}` : 'Habis'}
        </span>
      </div>

      <button
        onClick={() => onViewDetail(book)}
        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
      >
        Lihat Detail
      </button>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const BookDetail = ({ book }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        {book.sampul_buku ? (
          <img
            src={book.sampul_buku}
            alt={book.judul}
            className="w-full h-80 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="320" viewBox="0 0 200 320"%3E%3Crect fill="%23e5e7eb" width="200" height="320"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="18"%3ENo Cover%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-80 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
            <BookOpen size={64} className="text-indigo-400" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-3xl font-bold text-gray-800 mb-2">{book.judul}</h3>
          <p className="text-lg text-gray-600">{book.penulis}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 block mb-1">Penerbit</span>
            <p className="font-medium text-gray-800">{book.penerbit || '-'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 block mb-1">Tahun Terbit</span>
            <p className="font-medium text-gray-800">{book.tahun_terbit || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 block mb-1">ISBN</span>
            <p className="font-medium text-gray-800 text-sm">{book.isbn || '-'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 block mb-1">Jumlah Halaman</span>
            <p className="font-medium text-gray-800">{book.jumlah_halaman || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 block mb-1">Genre</span>
            <p className="font-medium text-gray-800">{book.genre_id || '-'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 block mb-1">Ketersediaan</span>
            <p className="font-medium text-gray-800">
              {book.stok_tersedia}/{book.stok_total}
            </p>
          </div>
        </div>
      </div>
    </div>

    {book.deskripsi && (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <Tag size={18} />
          Deskripsi
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed">{book.deskripsi}</p>
      </div>
    )}
  </div>
);

export default function KatalogBuku() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, genresRes] = await Promise.all([
        fetch('/api/admin/buku'),
        fetch('/api/admin/genre')
      ]);

      const booksData = await booksRes.json();
      const genresData = await genresRes.json();

      setBooks(booksData.filter(book => book.is_approved));
      setGenres(genresData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const years = [...new Set(books.map(book => book.tahun_terbit).filter(Boolean))].sort((a, b) => b - a);

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penulis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.penerbit?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === 'all' || book.genre_id === Number(selectedGenre);
    const matchesYear = selectedYear === 'all' || book.tahun_terbit === Number(selectedYear);
    
    return matchesSearch && matchesGenre && matchesYear;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('all');
    setSelectedYear('all');
  };

  const activeFilterCount = [
    selectedGenre !== 'all',
    selectedYear !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Katalog Buku</h1>
        <p className="text-gray-600">Telusuri koleksi lengkap perpustakaan</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari judul, penulis, atau penerbit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-col md:flex-row gap-3 pt-3 border-t">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Genre</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>{genre.nama_genre}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Tahun</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-4">
        <p className="text-gray-600">
          Menampilkan <span className="font-semibold">{filteredBooks.length}</span> dari {books.length} buku
        </p>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Tidak Ada Buku Ditemukan</h3>
          <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onViewDetail={(book) => {
                setSelectedBook(book);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBook(null);
        }}
        title="Detail Buku"
      >
        {selectedBook && <BookDetail book={selectedBook} />}
      </Modal>
    </div>
  );
}