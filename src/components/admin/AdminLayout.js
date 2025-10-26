import React, { useState } from 'react';
import { Home, BookOpen, Users, CheckSquare, Library, Menu, X, LogOut, Settings } from 'lucide-react';

const AdminLayout = ({ children, activePage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/Admin/dashboard' },
    { id: 'buku', label: 'Manajemen Buku', icon: BookOpen, path: '/Admin/buku' },
    { id: 'users', label: 'Manajemen User', icon: Users, path: '/Admin/users' },
    { id: 'approval', label: 'Approval Buku', icon: CheckSquare, path: '/Admin/approval' },
    { id: 'katalog', label: 'Katalog Buku', icon: Library, path: '/Admin/katalog' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-indigo-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-800">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">Perpustakaan Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-indigo-800 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : 'hover:bg-indigo-800 text-indigo-100'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-800 space-y-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors w-full">
            <Settings size={20} />
            {sidebarOpen && <span>Pengaturan</span>}
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-800 transition-colors w-full">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// Demo Component
export default function AdminLayoutDemo() {
  return (
    <AdminLayout activePage="dashboard">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Selamat Datang di Admin Panel</h2>
        <p className="text-gray-600">Pilih menu di sidebar untuk mulai mengelola perpustakaan.</p>
      </div>
    </AdminLayout>
  );
}