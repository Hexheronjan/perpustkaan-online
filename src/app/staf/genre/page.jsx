'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

export default function ManajemenGenrePage() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentGenre, setCurrentGenre] = useState(null);
  const [formData, setFormData] = useState({
    nama_genre: '',
    deskripsi: ''
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  async function fetchGenres() {
    try {
      console.log('📚 Fetching genres from API...');
      setLoading(true);
      setError(null);
      
      const data = await apiFetch('/api/staf/genre');
      console.log('✅ Genres fetched successfully:', data);
      setGenres(data);
      
    } catch (err) {
      console.error('❌ Error fetching genres:', err);
      setError(err.message || 'Failed to fetch genres');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setModalMode('add');
    setCurrentGenre(null);
    setFormData({
      nama_genre: '',
      deskripsi: ''
    });
    setShowModal(true);
  }

  function openEditModal(genre) {
    setModalMode('edit');
    setCurrentGenre(genre);
    setFormData({
      nama_genre: genre.nama_genre || '',
      deskripsi: genre.deskripsi || ''
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setCurrentGenre(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      if (modalMode === 'add') {
        // POST - Tambah genre baru
        await apiFetch('/api/staf/genre', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        console.log('✅ Genre added successfully');
        alert('✅ Genre berhasil ditambahkan!');
      } else {
        // PUT - Update genre
        await apiFetch('/api/staf/genre', {
          method: 'PUT',
          body: JSON.stringify({
            id: currentGenre.id,
            ...formData
          })
        });
        console.log('✅ Genre updated successfully');
        alert('✅ Genre berhasil diupdate!');
      }
      
      closeModal();
      fetchGenres(); // Refresh data
    } catch (err) {
      console.error('❌ Error saving genre:', err);
      alert('❌ Gagal menyimpan genre: ' + err.message);
    }
  }

  async function handleDelete(genreId) {
    if (!confirm('Yakin ingin menghapus genre ini?\n\nPerhatian: Buku yang menggunakan genre ini akan terpengaruh!')) return;
    
    try {
      await apiFetch(`/api/staf/genre?id=${genreId}`, {
        method: 'DELETE'
      });
      console.log('✅ Genre deleted successfully');
      alert('✅ Genre berhasil dihapus!');
      fetchGenres(); // Refresh data
    } catch (err) {
      console.error('❌ Error deleting genre:', err);
      alert('❌ Gagal menghapus genre: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading genres...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchGenres}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏷️ Manajemen Genre</h1>
            <p className="text-gray-600 mt-2">Kelola kategori genre buku perpustakaan</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
          >
            ➕ Tambah Genre
          </button>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Genre</h3>
              <p className="text-4xl font-bold">{genres.length}</p>
            </div>
            <div className="text-6xl">🏷️</div>
          </div>
        </div>

        {/* Genres Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">Daftar Genre</h2>
          </div>
          
          {genres.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-xl mb-2">📭 Tidak ada genre</p>
              <p className="text-sm">Klik tombol "Tambah Genre" untuk menambahkan genre baru</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {genres.map((genre) => (
                <div 
                  key={genre.id} 
                  className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        🏷️ {genre.nama_genre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {genre.deskripsi || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">
                      ID: {genre.id}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEditModal(genre)}
                      className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(genre.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm font-semibold"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Tips Manajemen Genre:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Genre membantu pengguna menemukan buku dengan mudah</li>
                <li>Gunakan nama genre yang jelas dan mudah dipahami</li>
                <li>Hapus genre hanya jika tidak ada buku yang menggunakannya</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 bg-purple-600 text-white flex justify-between items-center rounded-t-lg">
              <h3 className="text-xl font-bold">
                {modalMode === 'add' ? '➕ Tambah Genre Baru' : '✏️ Edit Genre'}
              </h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Genre *
                  </label>
                  <input
                    type="text"
                    name="nama_genre"
                    value={formData.nama_genre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: Fiksi, Non-Fiksi, Sains"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Deskripsi singkat tentang genre ini"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {modalMode === 'add' ? '➕ Tambah' : '💾 Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}