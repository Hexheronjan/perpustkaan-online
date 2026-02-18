'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, CheckSquare, Library, Menu, X, LogOut, Settings, Bookmark } from 'lucide-react';
import dynamic from 'next/dynamic';

const NotificationBellLazy = dynamic(() => import('@/components/ui/NotificationBell'), { ssr: false });

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { id: 'buku', label: 'Manajemen Buku', icon: BookOpen, path: '/admin/buku' },
    { id: 'users', label: 'Manajemen User', icon: Users, path: '/admin/users' },
    { id: 'approval', label: 'Approval Buku', icon: CheckSquare, path: '/admin/approval' },
    { id: 'katalog', label: 'Katalog Buku', icon: Library, path: '/admin/katalog' },
    { id: 'peminjaman', label: 'Peminjaman', icon: Bookmark, path: '/admin/peminjaman' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 text-white transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-800">
          {sidebarOpen && <h1 className="text-xl font-bold">Perpustakaan</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-indigo-800">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'hover:bg-indigo-800 text-indigo-200 hover:text-white'
                  }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800 space-y-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-800 w-full text-left text-indigo-200 hover:text-white transition-all">
            <Settings size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Pengaturan</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-700 w-full text-left text-indigo-200 hover:text-white transition-all"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header with NotificationBell */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Admin Panel</p>
            <p className="font-bold text-gray-800">Perpustakaan Digital</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBellLazy role="admin" />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">Admin</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;