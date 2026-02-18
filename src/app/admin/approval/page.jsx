// D:\Projek Coding\projek_pkl\src\app\Admin\approval\page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';

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

const BookDetailView = ({ book, onApprove, onReject, onClose }) => {
  const [catatan, setCatatan] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove(book.id, catatan);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!catatan.trim()) {
      alert('Mohon berikan catatan alasan penolakan');
      return;
    }
    setProcessing(true);
    await onReject(book.id, catatan);
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {book.sampul_buku ? (
            <img
              src={book.sampul_buku}
              alt={book.judul}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"%3E%3Crect fill="%23ddd" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Tidak ada sampul</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{book.judul}</h3>
            <p className="text-gray-600 mt-1">{book.penulis}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Penerbit</span>
              <p className="font-medium text-gray-800">{book.penerbit || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Tahun Terbit</span>
              <p className="font-medium text-gray-800">{book.tahun_terbit || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">ISBN</span>
              <p className="font-medium text-gray-800">{book.isbn || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Halaman</span>
              <p className="font-medium text-gray-800">{book.jumlah_halaman || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Genre</span>
              <p className="font-medium text-gray-800">{book.nama_genre || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Stok</span>
              <p className="font-medium text-gray-800">{book.stok_total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {book.deskripsi && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2">Deskripsi</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{book.deskripsi}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catatan Admin (opsional untuk approval, wajib untuk reject)
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
          placeholder="Tambahkan catatan atau alasan..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleApprove}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          <CheckCircle size={20} />
          Approve & Tambahkan ke Katalog
        </button>
        <button
          onClick={handleReject}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
        >
          <XCircle size={20} />
          Reject
        </button>
      </div>
    </div>
  );
};

export default function ApprovalBukuPage() {
  const [pendingBooks, setPendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingBooks();
  }, []);

  const fetchPendingBooks = async () => {
    try {
      const response = await fetch('/api/admin/buku-pending?status=pending');
      const data = await response.json();
      console.log('Pending books data:', data); // Debug log
      setPendingBooks(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending books:', error);
      setPendingBooks([]);
      setLoading(false);
    }
  };

  const handleApprove = async (bookId, catatan) => {
    try {
      const response = await fetch('/api/admin/buku-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookId,
          action: 'approve',
          catatan_admin: catatan
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setSelectedBook(null);
        fetchPendingBooks();
      }
    } catch (error) {
      console.error('Error approving book:', error);
    }
  };

  const handleReject = async (bookId, catatan) => {
    try {
      const response = await fetch('/api/admin/buku-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookId,
          action: 'reject',
          catatan_admin: catatan
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setSelectedBook(null);
        fetchPendingBooks();
      }
    } catch (error) {
      console.error('Error rejecting book:', error);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Approval Buku</h1>
        <p className="text-gray-600">Review dan setujui penambahan buku dari staf</p>
      </div>

      {pendingBooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Tidak Ada Buku Menunggu Approval</h3>
          <p className="text-gray-600">Semua pengajuan buku telah diproses</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(pendingBooks) && pendingBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {book.sampul_buku ? (
                <img
                  src={book.sampul_buku}
                  alt={book.judul}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Tidak ada sampul</span>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{book.judul}</h3>
                <p className="text-sm text-gray-600 mb-2">{book.penulis}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {book.penerbit} • {book.tahun_terbit || 'N/A'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(book.created_at).toLocaleDateString('id-ID')}
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                    Pending
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedBook(book);
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Eye size={16} />
                  Review Buku
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBook(null);
        }}
        title="Review Buku"
      >
        {selectedBook && (
          <BookDetailView
            book={selectedBook}
            onApprove={handleApprove}
            onReject={handleReject}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedBook(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}