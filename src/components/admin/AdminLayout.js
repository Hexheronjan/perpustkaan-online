'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, CheckSquare, Library, Menu, X, LogOut, Settings } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { id: 'buku', label: 'Manajemen Buku', icon: BookOpen, path: '/admin/buku' },
    { id: 'users', label: 'Manajemen User', icon: Users, path: '/admin/users' },
    { id: 'approval', label: 'Approval Buku', icon: CheckSquare, path: '/admin/approval' },
    { id: 'katalog', label: 'Katalog Buku', icon: Library, path: '/admin/katalog' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-800">
          {sidebarOpen && <h1 className="text-xl font-bold">Perpustakaan Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-indigo-800">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-800 text-indigo-100'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800 space-y-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 w-full text-left">
            <Settings size={20} />
            {sidebarOpen && <span>Pengaturan</span>}
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-800 w-full text-left">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;