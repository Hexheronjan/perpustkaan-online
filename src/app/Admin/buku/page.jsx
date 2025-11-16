// D:\Projek Coding\projek_pkl\src\app\Admin\buku\page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

const BookForm = ({ book, genres, tags, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(book || {
    judul: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    isbn: '',
    jumlah_halaman: '',
    deskripsi: '',
    stok_tersedia: 0,
    stok_total: 0,
    sampul_buku: '',
    genre_id: '',
    tag_ids: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Judul Buku *</label>
          <input
            type="text"
            value={formData.judul}
            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Penulis *</label>
          <input
            type="text"
            value={formData.penulis}
            onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Penerbit</label>
          <input
            type="text"
            value={formData.penerbit || ''}
            onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Terbit</label>
          <input
            type="number"
            value={formData.tahun_terbit || ''}
            onChange={(e) => setFormData({ ...formData, tahun_terbit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
          <input
            type="text"
            value={formData.isbn || ''}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Halaman</label>
          <input
            type="number"
            value={formData.jumlah_halaman || ''}
            onChange={(e) => setFormData({ ...formData, jumlah_halaman: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
        <select
          value={formData.genre_id || ''}
          onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Pilih Genre</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>{genre.nama_genre}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stok Tersedia</label>
          <input
            type="number"
            value={formData.stok_tersedia}
            onChange={(e) => setFormData({ ...formData, stok_tersedia: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stok Total</label>
          <input
            type="number"
            value={formData.stok_total}
            onChange={(e) => setFormData({ ...formData, stok_total: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
        <textarea
          value={formData.deskripsi || ''}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL Sampul Buku</label>
        <input
          type="text"
          value={formData.sampul_buku || ''}
          onChange={(e) => setFormData({ ...formData, sampul_buku: e.target.value })}
          placeholder="https://example.com/cover.jpg"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          {book ? 'Update Buku' : 'Tambah Buku'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Batal
        </button>
      </div>
    </div>
  );
};

export default function ManajemenBukuPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, genresRes, tagsRes] = await Promise.all([
        fetch('/api/admin/buku'),
        fetch('/api/admin/genre'),
        fetch('/api/admin/tags')
      ]);

      const booksData = await booksRes.json();
      const genresData = await genresRes.json();
      const tagsData = await tagsRes.json();

      console.log('Books data:', booksData); // Debug log

      setBooks(Array.isArray(booksData) ? booksData : []);
      setGenres(Array.isArray(genresData) ? genresData : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setBooks([]);
      setGenres([]);
      setTags([]);
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = '/api/admin/buku';
      const method = editingBook ? 'PUT' : 'POST';
      const body = editingBook ? { ...formData, id: editingBook.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingBook(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus buku ini?')) return;

    try {
      const response = await fetch(`/api/admin/buku?id=${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const filteredBooks = Array.isArray(books) ? books.filter(book =>
    book.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.penulis?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Buku</h1>
        <p className="text-gray-600">Kelola koleksi buku perpustakaan</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari buku atau penulis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setEditingBook(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Tambah Buku
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penulis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{book.judul}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{book.penulis}</td>
                  <td className="px-6 py-4 text-gray-600">{book.tahun_terbit || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{book.stok_tersedia}/{book.stok_total}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      book.is_approved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {book.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingBook(book);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        title={editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}
      >
        <BookForm
          book={editingBook}
          genres={genres}
          tags={tags}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBook(null);
          }}
        />
      </Modal>
    </div>
  );
}