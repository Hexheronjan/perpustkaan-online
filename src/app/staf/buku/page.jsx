// src/app/staf/buku/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, AlertCircle, Check, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export default function ManajemenBuku() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentBook, setCurrentBook] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    isbn: '',
    jumlah_halaman: '',
    deskripsi: '',
    stok_tersedia: 0,
    stok_total: 0,
    genre_id: '',
    tag_ids: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching data with apiFetch...');
      
      const [booksData, genresData, tagsData] = await Promise.all([
        apiFetch('/api/staf/buku'),
        apiFetch('/api/staf/genre'),
        apiFetch('/api/staf/tags'),
      ]);

      console.log('✅ Books data:', booksData);
      setBooks(booksData);
      setGenres(genresData);
      setTags(tagsData);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = '/api/staf/buku';
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const body = modalMode === 'edit' 
        ? { ...formData, id: currentBook.id }
        : formData;

      await apiFetch(url, {
        method,
        body: JSON.stringify(body),
      });

      fetchData();
      setShowModal(false);
      resetForm();
      
      if (modalMode === 'add') {
        alert('Buku berhasil ditambahkan! Menunggu approval admin.');
      } else {
        alert('Buku berhasil diupdate!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) return;
    
    try {
      await apiFetch(`/api/staf/buku?id=${id}`, {
        method: 'DELETE',
      });

      fetchData();
      alert('Buku berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error: ' + error.message);
    }
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setCurrentBook(book);
    setFormData({
      judul: book.judul,
      penulis: book.penulis,
      penerbit: book.penerbit || '',
      tahun_terbit: book.tahun_terbit || '',
      isbn: book.isbn || '',
      jumlah_halaman: book.jumlah_halaman || '',
      deskripsi: book.deskripsi || '',
      stok_tersedia: book.stok_tersedia,
      stok_total: book.stok_total,
      genre_id: book.genre_id || '',
      tag_ids: [],
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      penulis: '',
      penerbit: '',
      tahun_terbit: '',
      isbn: '',
      jumlah_halaman: '',
      deskripsi: '',
      stok_tersedia: 0,
      stok_total: 0,
      genre_id: '',
      tag_ids: [],
    });
    setCurrentBook(null);
  };

  const filteredBooks = books.filter(book => {
    const matchSearch = book.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       book.penulis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = !selectedGenre || book.genre_id === parseInt(selectedGenre);
    return matchSearch && matchGenre;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Buku</h1>
        <p className="text-gray-600">Kelola koleksi buku perpustakaan</p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Informasi Penting:</p>
          <p className="mt-1">Penambahan buku baru memerlukan approval dari Admin sebelum dapat ditampilkan di katalog.</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari judul atau penulis buku..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white"
              >
                <option value="">Semua Genre</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.nama_genre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>Tambah Buku</span>
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buku</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerbit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada buku yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center text-white font-bold text-xs">
                          📚
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{book.judul}</p>
                          <p className="text-sm text-gray-500">{book.isbn || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{book.penulis}</td>
                    <td className="px-6 py-4 text-gray-700">{book.penerbit || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{book.tahun_terbit || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 font-medium">{book.stok_tersedia}/{book.stok_total}</span>
                    </td>
                    <td className="px-6 py-4">
                      {book.is_approved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Check size={14} />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          <AlertCircle size={14} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Tambah Buku Baru' : 'Edit Buku'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Buku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.judul}
                    onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Masukkan judul buku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penulis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.penulis}
                    onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Masukkan nama penulis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={formData.penerbit}
                    onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Masukkan nama penerbit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
                  <input
                    type="number"
                    value={formData.tahun_terbit}
                    onChange={(e) => setFormData({ ...formData, tahun_terbit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="978-xxx-xxx-xxx-x"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Halaman</label>
                  <input
                    type="number"
                    value={formData.jumlah_halaman}
                    onChange={(e) => setFormData({ ...formData, jumlah_halaman: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select
                    value={formData.genre_id}
                    onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="">Pilih Genre</option>
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.nama_genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Tersedia</label>
                  <input
                    type="number"
                    value={formData.stok_tersedia}
                    onChange={(e) => setFormData({ ...formData, stok_tersedia: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok Total</label>
                  <input
                    type="number"
                    value={formData.stok_total}
                    onChange={(e) => setFormData({ ...formData, stok_total: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows="4"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Deskripsi singkat tentang buku..."
                ></textarea>
              </div>

              {modalMode === 'add' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Catatan:</strong> Buku yang ditambahkan akan masuk ke status pending dan memerlukan approval dari Admin sebelum dapat ditampilkan di katalog.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {modalMode === 'add' ? 'Tambah Buku' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}