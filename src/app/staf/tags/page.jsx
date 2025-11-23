'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

export default function ManajemenTagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentTag, setCurrentTag] = useState(null);
  const [formData, setFormData] = useState({
    nama_tag: ''
  });

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      console.log('🏷️ Fetching tags from API...');
      setLoading(true);
      setError(null);
      
      const data = await apiFetch('/api/staf/tags');
      console.log('✅ Tags fetched successfully:', data);
      setTags(data);
      
    } catch (err) {
      console.error('❌ Error fetching tags:', err);
      setError(err.message || 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setModalMode('add');
    setCurrentTag(null);
    setFormData({
      nama_tag: ''
    });
    setShowModal(true);
  }

  function openEditModal(tag) {
    setModalMode('edit');
    setCurrentTag(tag);
    setFormData({
      nama_tag: tag.nama_tag || ''
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setCurrentTag(null);
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
        // POST - Tambah tag baru
        await apiFetch('/api/staf/tags', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        console.log('✅ Tag added successfully');
        alert('✅ Tag berhasil ditambahkan!');
      } else {
        // PUT - Update tag
        await apiFetch('/api/staf/tags', {
          method: 'PUT',
          body: JSON.stringify({
            id: currentTag.id,
            ...formData
          })
        });
        console.log('✅ Tag updated successfully');
        alert('✅ Tag berhasil diupdate!');
      }
      
      closeModal();
      fetchTags(); // Refresh data
    } catch (err) {
      console.error('❌ Error saving tag:', err);
      alert('❌ Gagal menyimpan tag: ' + err.message);
    }
  }

  async function handleDelete(tagId) {
    if (!confirm('Yakin ingin menghapus tag ini?\n\nPerhatian: Tag yang masih digunakan buku tidak bisa dihapus!')) return;
    
    try {
      await apiFetch(`/api/staf/tags?id=${tagId}`, {
        method: 'DELETE'
      });
      console.log('✅ Tag deleted successfully');
      alert('✅ Tag berhasil dihapus!');
      fetchTags(); // Refresh data
    } catch (err) {
      console.error('❌ Error deleting tag:', err);
      alert('❌ Gagal menghapus tag: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tags...</p>
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
              onClick={fetchTags}
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
            <h1 className="text-3xl font-bold text-gray-800">🏷️ Manajemen Tags</h1>
            <p className="text-gray-600 mt-2">Kelola label dan kategori tambahan untuk buku</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
          >
            ➕ Tambah Tag
          </button>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Tags</h3>
              <p className="text-4xl font-bold">{tags.length}</p>
            </div>
            <div className="text-6xl">🏷️</div>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">Daftar Tags</h2>
            <p className="text-sm text-gray-600 mt-1">Tags untuk memberikan label tambahan pada buku</p>
          </div>
          
          {tags.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-xl mb-2">📭 Tidak ada tags</p>
              <p className="text-sm">Klik tombol "Tambah Tag" untuk menambahkan tag baru</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-6">
              {tags.map((tag) => (
                <div 
                  key={tag.id} 
                  className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-green-400 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">🏷️</span>
                      <span className="font-bold text-gray-800 truncate">
                        {tag.nama_tag}
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded flex-shrink-0">
                      #{tag.id}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(tag)}
                      className="flex-1 bg-yellow-500 text-white px-2 py-1.5 rounded hover:bg-yellow-600 text-xs font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="flex-1 bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-xs font-semibold"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tags Examples */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-2">Contoh Tags yang Umum Digunakan:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Best Seller</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Buku Baru</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Rekomendasi</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Klasik</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Populer</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Anak-anak</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Remaja</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Dewasa</span>
              </div>
              <p className="mt-3 text-xs">
                <strong>Tips:</strong> Tags membantu pengguna filter buku berdasarkan karakteristik khusus. Hapus tag hanya jika tidak ada buku yang menggunakannya.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center rounded-t-lg">
              <h3 className="text-xl font-bold">
                {modalMode === 'add' ? '➕ Tambah Tag Baru' : '✏️ Edit Tag'}
              </h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tag *
                </label>
                <input
                  type="text"
                  name="nama_tag"
                  value={formData.nama_tag}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Best Seller, Buku Baru, Rekomendasi"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Gunakan nama tag yang singkat dan jelas
                </p>
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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