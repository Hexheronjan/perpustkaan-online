// src/app/Admin/peminjaman/page.jsx
// Juga bisa digunakan di: src/app/Staf/peminjaman/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, 
  User, BookOpen, Calendar, DollarSign, 
  Filter, Search, X 
} from 'lucide-react';

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

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Menunggu Approval' },
    dipinjam: { color: 'bg-blue-100 text-blue-700', icon: BookOpen, text: 'Sedang Dipinjam' },
    dikembalikan: { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Dikembalikan' },
    rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, text: 'Ditolak' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={14} />
      {config.text}
    </span>
  );
};

const PeminjamanDetail = ({ peminjaman, onAction, onClose }) => {
  const [action, setAction] = useState('');
  const [catatan, setCatatan] = useState('');
  const [denda, setDenda] = useState(peminjaman.total_denda || 0);
  const [processing, setProcessing] = useState(false);

  const calculateDurasi = () => {
    if (!peminjaman.tanggal_pinjam) return 'Belum dipinjam';
    
    const start = new Date(peminjaman.tanggal_pinjam);
    const end = peminjaman.tanggal_kembali_aktual 
      ? new Date(peminjaman.tanggal_kembali_aktual)
      : new Date();
    
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return `${diffDays} hari`;
  };

  const calculateSisaWaktu = () => {
    if (peminjaman.status !== 'dipinjam') return null;
    
    const target = new Date(peminjaman.tanggal_kembali_target);
    const now = new Date();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        text: `Terlambat ${Math.abs(diffDays)} hari`,
        color: 'text-red-600',
        bg: 'bg-red-50'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Jatuh tempo hari ini',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
      };
    } else {
      return {
        text: `${diffDays} hari lagi`,
        color: 'text-green-600',
        bg: 'bg-green-50'
      };
    }
  };

  const handleSubmit = async () => {
    if (!action) return;

    if ((action === 'reject' || action === 'return') && !catatan.trim()) {
      alert('Catatan diperlukan untuk ' + action);
      return;
    }

    setProcessing(true);
    await onAction(peminjaman.id, action, denda, catatan);
    setProcessing(false);
    onClose();
  };

  const sisaWaktu = calculateSisaWaktu();

  return (
    <div className="space-y-6">
      {/* Book & User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Informasi Peminjam</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">{peminjaman.nama_lengkap}</p>
                  <p className="text-sm text-gray-600">@{peminjaman.username}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{peminjaman.email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status Peminjaman</h3>
            <StatusBadge status={peminjaman.status} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Informasi Buku</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {peminjaman.sampul_buku && (
              <img 
                src={peminjaman.sampul_buku} 
                alt={peminjaman.buku_judul}
                className="w-full h-32 object-cover rounded-lg mb-3"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <h4 className="font-bold text-gray-800 mb-1">{peminjaman.buku_judul}</h4>
            <p className="text-sm text-gray-600">{peminjaman.buku_penulis}</p>
          </div>
        </div>
      </div>

      {/* Timeline Info */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline Peminjaman</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tanggal Request</p>
            <p className="text-sm font-medium text-gray-800">
              {new Date(peminjaman.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>

          {peminjaman.tanggal_pinjam && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Tanggal Pinjam</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(peminjaman.tanggal_pinjam).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">Target Kembali</p>
            <p className="text-sm font-medium text-gray-800">
              {new Date(peminjaman.tanggal_kembali_target).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {peminjaman.status === 'dipinjam' && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Durasi Peminjaman</p>
            <p className="text-sm font-medium text-gray-800">{calculateDurasi()}</p>
          </div>
        )}

        {sisaWaktu && (
          <div className={`${sisaWaktu.bg} p-3 rounded-lg`}>
            <p className={`text-sm font-semibold ${sisaWaktu.color}`}>
              {sisaWaktu.text}
            </p>
          </div>
        )}

        {peminjaman.hari_terlambat > 0 && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm font-semibold text-red-600">
              ⚠️ Terlambat {peminjaman.hari_terlambat} hari
            </p>
            <p className="text-xs text-red-500 mt-1">
              Denda otomatis: Rp {peminjaman.denda_otomatis?.toLocaleString('id-ID')}
            </p>
          </div>
        )}
      </div>

      {/* Denda Section */}
      {(peminjaman.status === 'dipinjam' || peminjaman.status === 'dikembalikan') && peminjaman.total_denda > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-800">Total Denda</h3>
            <p className="text-2xl font-bold text-orange-600">
              Rp {peminjaman.total_denda.toLocaleString('id-ID')}
            </p>
          </div>
          {peminjaman.denda_otomatis > 0 && (
            <p className="text-xs text-orange-600">
              Denda keterlambatan: Rp 2.000/hari × {peminjaman.hari_terlambat} hari
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {peminjaman.status === 'pending' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Approval Action</h3>
          
          <div className="flex gap-3">
            <button
              onClick={() => setAction('approve')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                action === 'approve'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <CheckCircle className="inline mr-2" size={18} />
              Approve
            </button>
            <button
              onClick={() => setAction('reject')}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                action === 'reject'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <XCircle className="inline mr-2" size={18} />
              Reject
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!action || processing}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Submit'}
          </button>
        </div>
      )}

      {peminjaman.status === 'dipinjam' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Pengembalian Buku</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denda (Rp)
            </label>
            <input
              type="number"
              value={denda}
              onChange={(e) => setDenda(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Denda otomatis: Rp {peminjaman.denda_otomatis?.toLocaleString('id-ID')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Kondisi buku, catatan tambahan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              setAction('return');
              handleSubmit();
            }}
            disabled={processing}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Kembalikan Buku'}
          </button>
        </div>
      )}

      {peminjaman.catatan && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Catatan</h3>
          <p className="text-sm text-gray-600">{peminjaman.catatan}</p>
        </div>
      )}
    </div>
  );
};

export default function ApprovalPeminjamanPage() {
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const fetchPeminjaman = async () => {
    try {
      const url = filterStatus === 'all' 
        ? '/api/peminjaman'
        : `/api/peminjaman?status=${filterStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Peminjaman data:', data);
      setPeminjaman(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
      setPeminjaman([]);
      setLoading(false);
    }
  };

  const handleAction = async (id, action, denda, catatan) => {
    try {
      const response = await fetch('/api/peminjaman', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, denda, catatan })
      });

      if (response.ok) {
        fetchPeminjaman();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Gagal memproses action');
    }
  };

  const filteredPeminjaman = peminjaman.filter(p => {
    const matchesSearch = 
      p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.buku_judul?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    pending: peminjaman.filter(p => p.status === 'pending').length,
    dipinjam: peminjaman.filter(p => p.status === 'dipinjam').length,
    terlambat: peminjaman.filter(p => p.hari_terlambat > 0).length,
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Approval Peminjaman</h1>
        <p className="text-gray-600">Kelola request peminjaman dan pengembalian buku</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium mb-1">Menunggu Approval</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Clock size={40} className="text-yellow-400" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-1">Sedang Dipinjam</p>
              <p className="text-3xl font-bold text-blue-700">{stats.dipinjam}</p>
            </div>
            <BookOpen size={40} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium mb-1">Terlambat</p>
              <p className="text-3xl font-bold text-red-700">{stats.terlambat}</p>
            </div>
            <AlertCircle size={40} className="text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari peminjam atau buku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              fetchPeminjaman();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="dipinjam">Sedang Dipinjam</option>
            <option value="dikembalikan">Dikembalikan</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peminjam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buku</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denda</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPeminjaman.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{p.nama_lengkap}</p>
                      <p className="text-sm text-gray-500">@{p.username}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{p.buku_judul}</p>
                      <p className="text-sm text-gray-500">{p.buku_penulis}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(p.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={p.status} />
                    {p.hari_terlambat > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        Terlambat {p.hari_terlambat} hari
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {p.total_denda > 0 && (
                      <span className="text-orange-600 font-semibold">
                        Rp {p.total_denda.toLocaleString('id-ID')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedPeminjaman(p);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Detail
                    </button>
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
          setSelectedPeminjaman(null);
        }}
        title="Detail Peminjaman"
      >
        {selectedPeminjaman && (
          <PeminjamanDetail
            peminjaman={selectedPeminjaman}
            onAction={handleAction}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedPeminjaman(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}