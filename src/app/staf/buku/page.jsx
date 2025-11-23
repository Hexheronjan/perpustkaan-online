'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getToken, getUser } from '@/lib/client-auth';
import Image from 'next/image';

export default function ManajemenBukuPage() {
  const [activeTab, setActiveTab] = useState('approved');
  const [books, setBooks] = useState([]);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentBook, setCurrentBook] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
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
    sampul_buku: '',
    genre_id: null,
  });

  const user = getUser();

  useEffect(() => {
    fetchBooks(); // Ini sudah fetch approved + pending sekaligus
  }, []);

  async function fetchBooks() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch(`/api/staf/buku?user_id=${user?.id || ''}`);
      
      console.log('📚 API Response:', data);
      
      // Handle berbagai format response
      if (data && data.success === true) {
        // Format baru dengan success flag
        if (data.approved && data.pending) {
          setBooks(data.approved);
          setPendingBooks(data.pending);
          console.log('✅ Format baru - Approved:', data.approved.length, 'Pending:', data.pending.length);
        } else if (data.all && Array.isArray(data.all)) {
          // Jika ada property 'all'
          const approved = data.all.filter(b => b.is_approved === true);
          const pending = data.all.filter(b => b.is_approved === false);
          setBooks(approved);
          setPendingBooks(pending);
          console.log('✅ Format all - Approved:', approved.length, 'Pending:', pending.length);
        }
      } else if (Array.isArray(data)) {
        // Format lama: array langsung
        // Pisahkan berdasarkan is_approved dan source_table
        const approved = data.filter(b => 
          b.is_approved === true || 
          b.source_table === 'approved'
        );
        const pending = data.filter(b => 
          b.is_approved === false || 
          b.source_table === 'pending' ||
          b.status === 'pending'
        );
        setBooks(approved);
        setPendingBooks(pending);
        console.log('✅ Format array - Approved:', approved.length, 'Pending:', pending.length);
      } else {
        console.warn('⚠️ Unexpected response format:', data);
        setBooks([]);
        setPendingBooks([]);
      }
    } catch (err) {
      console.error('❌ Error fetching books:', err);
      setError(err.message || 'Failed to fetch books');
      setBooks([]);
      setPendingBooks([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPendingBooks() {
    // Tidak perlu fetch terpisah lagi karena sudah include di fetchBooks()
    console.log('ℹ️ Pending books sudah di-fetch bersamaan dengan approved books');
  }

  function openAddModal() {
    setModalMode('add');
    setCurrentBook(null);
    setImagePreview(null);
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
      sampul_buku: '',
      genre_id: null,
    });
    setShowModal(true);
  }

  function openEditModal(book) {
    setModalMode('edit');
    setCurrentBook(book);
    setImagePreview(book.sampul_buku || null);
    setFormData({
      judul: book.judul || '',
      penulis: book.penulis || '',
      penerbit: book.penerbit || '',
      tahun_terbit: book.tahun_terbit || '',
      isbn: book.isbn || '',
      jumlah_halaman: book.jumlah_halaman || '',
      deskripsi: book.deskripsi || '',
      stok_tersedia: book.stok_tersedia || 0,
      stok_total: book.stok_total || 0,
      sampul_buku: book.sampul_buku || '',
      genre_id: book.genre_id || null,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setCurrentBook(null);
    setImagePreview(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ File harus berupa gambar!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Ukuran file maksimal 5MB!');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      const token = getToken();
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      // Set image URL to form
      setFormData(prev => ({
        ...prev,
        sampul_buku: data.url
      }));

      console.log('✅ Image uploaded:', data.url);
      alert('✅ Gambar berhasil diupload!');

    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('❌ Gagal upload gambar: ' + error.message);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      sampul_buku: ''
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        user_id: user?.id
      };

      if (modalMode === 'add') {
        await apiFetch('/api/staf/buku', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        alert('✅ Pengajuan buku berhasil dikirim!\n\nBuku Anda akan direview oleh Admin dan akan muncul di katalog setelah disetujui.');
        fetchBooks(); // Refresh untuk update tabs
      } else {
        const confirmEdit = confirm(
          '⚠️ PERHATIAN!\n\n' +
          'Setelah Anda mengedit buku ini, status approval akan kembali menjadi PENDING.\n\n' +
          'Admin harus menyetujui perubahan Anda sebelum buku tampil kembali di katalog.\n\n' +
          'Lanjutkan edit?'
        );
        
        if (!confirmEdit) return;
        
        await apiFetch('/api/staf/buku', {
          method: 'PUT',
          body: JSON.stringify({
            id: currentBook.id,
            ...payload
          })
        });
        alert('✅ Buku berhasil diupdate!\n\n⏳ Status buku sekarang: PENDING APPROVAL\nAdmin akan mereview perubahan Anda.');
        fetchBooks(); // Refresh
      }
      
      closeModal();
      fetchBooks(); // Refresh semua data (approved + pending)
    } catch (err) {
      console.error('❌ Error saving book:', err);
      alert('❌ Gagal menyimpan buku: ' + err.message);
    }
  }

  async function handleDelete(bookId) {
    if (!confirm('Yakin ingin menghapus buku ini?')) return;
    
    try {
      await apiFetch(`/api/staf/buku?id=${bookId}&user_id=${user?.id}`, {
        method: 'DELETE'
      });
      alert('✅ Buku berhasil dihapus!');
      fetchBooks(); // Refresh all data
    } catch (err) {
      console.error('❌ Error deleting book:', err);
      alert('❌ Gagal menghapus buku: ' + err.message);
    }
  }

  async function handleCancelPending(bookId) {
    if (!confirm('Yakin ingin membatalkan/hapus buku ini?')) return;
    
    try {
      // Hapus langsung dari tabel buku (bukan buku_pending)
      await apiFetch(`/api/staf/buku?id=${bookId}&user_id=${user?.id}`, {
        method: 'DELETE'
      });
      alert('✅ Buku berhasil dihapus');
      fetchBooks(); // Refresh
    } catch (err) {
      console.error('❌ Error deleting book:', err);
      alert('❌ Gagal menghapus buku: ' + err.message);
    }
  }

  function getStatusBadge(status) {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Menunggu Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Ditolak' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  }

  if (loading && books.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📚 Manajemen Buku</h1>
              <p className="text-gray-600 mt-2">Kelola koleksi buku perpustakaan</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
            >
              ➕ Ajukan Buku Baru
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-4 font-semibold ${
                activeTab === 'approved'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✅ Buku Approved ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 font-semibold ${
                activeTab === 'pending'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⏳ Ajuan Saya ({pendingBooks.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'approved' ? (
          /* APPROVED BOOKS TABLE */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-bold text-gray-800">Daftar Buku Approved</h2>
            </div>
            
            {books.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-xl mb-2">🔭 Tidak ada buku approved</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sampul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Judul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Penulis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tahun</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Stok</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {books.map((book, index) => (
                      <tr key={book.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          {book.sampul_buku ? (
                            <Image 
                              src={book.sampul_buku} 
                              alt={book.judul}
                              width={60}
                              height={80}
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="w-[60px] h-[80px] bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-semibold">{book.judul}</div>
                          {book.isbn && <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{book.penulis}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{book.tahun_terbit || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="font-semibold text-blue-600">{book.stok_tersedia}</span>
                          <span className="text-gray-500"> / {book.stok_total}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => openEditModal(book)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm mr-2"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* PENDING BOOKS TABLE */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-bold text-gray-800">Buku Pending Approval</h2>
              <p className="text-sm text-gray-600 mt-1">Buku yang menunggu persetujuan admin</p>
            </div>
            
            {pendingBooks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-xl mb-2">🔭 Tidak ada buku pending</p>
                <p className="text-sm">Semua buku Anda sudah disetujui atau belum ada pengajuan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sampul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Judul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Penulis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Diajukan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingBooks.map((book, index) => (
                      <tr key={book.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          {book.sampul_buku ? (
                            <Image 
                              src={book.sampul_buku} 
                              alt={book.judul}
                              width={60}
                              height={80}
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="w-[60px] h-[80px] bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-semibold">{book.judul}</div>
                          {book.isbn && <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{book.penulis}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(book.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge('pending')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleCancelPending(book.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Form dengan Upload Image */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center rounded-t-lg">
              <h3 className="text-xl font-bold">
                {modalMode === 'add' ? '📝 Ajukan Buku Baru' : '✏️ Edit Buku'}
              </h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Image Upload */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sampul Buku
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={250}
                        height={350}
                        className="w-full h-auto rounded-lg shadow-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm text-gray-600 mb-3">Upload sampul buku</p>
                      <label className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Pilih Gambar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="mt-2 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                    </div>
                  )}
                </div>

                {/* Right: Form Fields */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Judul Buku *
                      </label>
                      <input
                        type="text"
                        name="judul"
                        value={formData.judul}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Penulis *
                      </label>
                      <input
                        type="text"
                        name="penulis"
                        value={formData.penulis}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Penerbit
                      </label>
                      <input
                        type="text"
                        name="penerbit"
                        value={formData.penerbit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun Terbit
                      </label>
                      <input
                        type="number"
                        name="tahun_terbit"
                        value={formData.tahun_terbit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ISBN
                      </label>
                      <input
                        type="text"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stok Tersedia
                      </label>
                      <input
                        type="number"
                        name="stok_tersedia"
                        value={formData.stok_tersedia}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stok Total
                      </label>
                      <input
                        type="number"
                        name="stok_total"
                        value={formData.stok_total}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {modalMode === 'add' ? '📝 Ajukan Buku' : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}