// src/app/staf/users/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Users as UsersIcon,
  Shield,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export default function ManajemenUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Simulasi data - ganti dengan API call sebenarnya
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@perpustakaan.com',
          nama_lengkap: 'Administrator',
          role_id: 4,
          is_active: true,
          created_at: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          username: 'staf1',
          email: 'staf1@perpustakaan.com',
          nama_lengkap: 'Staf Perpustakaan 1',
          role_id: 3,
          is_active: true,
          created_at: '2024-02-20T14:15:00Z',
        },
        {
          id: 3,
          username: 'member1',
          email: 'member1@example.com',
          nama_lengkap: 'Member Satu',
          role_id: 2,
          is_active: true,
          created_at: '2024-03-10T09:00:00Z',
        },
        {
          id: 4,
          username: 'visitor1',
          email: 'visitor1@example.com',
          nama_lengkap: 'Visitor Satu',
          role_id: 1,
          is_active: false,
          created_at: '2024-04-05T16:45:00Z',
        },
      ]);

      setRoles([
        { id: 1, nama_role: 'visitor', deskripsi: 'Hanya dapat melihat katalog' },
        { id: 2, nama_role: 'member', deskripsi: 'Dapat meminjam buku' },
        { id: 3, nama_role: 'staf', deskripsi: 'Dapat mengelola buku' },
        { id: 4, nama_role: 'admin', deskripsi: 'Akses penuh' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.nama_role : '-';
  };

  const getRoleBadgeColor = (roleId) => {
    const colors = {
      1: 'bg-gray-100 text-gray-700',
      2: 'bg-blue-100 text-blue-700',
      3: 'bg-green-100 text-green-700',
      4: 'bg-purple-100 text-purple-700',
    };
    return colors[roleId] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !selectedRole || user.role_id === parseInt(selectedRole);
    return matchSearch && matchRole;
  });

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
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Users</h1>
        <p className="text-gray-600 mt-2">Kelola pengguna perpustakaan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <UsersIcon className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Member</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.role_id === 2).length}
              </p>
            </div>
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Staf</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.role_id === 3).length}
              </p>
            </div>
            <Shield className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
            <UsersIcon className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari username, email, atau nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">Semua Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.nama_role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terdaftar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada user yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {user.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.nama_lengkap}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-700">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role_id)}`}>
                        {getRoleName(user.role_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}