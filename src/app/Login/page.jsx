// src/app/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login success, role:', data.user.role_id);
        
        // Redirect based on role
        switch (data.user.role_id) {
          case 4: // Admin
            router.push('/Admin/dashboard');
            break;
          case 3: // Staf
            router.push('/Staf/dashboard');
            break;
          case 2: // Member
            router.push('/Member/dashboard');
            break;
          default:
            router.push('/Visitor');
        }
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorClick = (e) => {
    e.preventDefault();
    console.log('🚀 Redirecting to Visitor page...');
    router.push('/Visitor');
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    console.log('🚀 Redirecting to Register page...');
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center justify-center mb-2">
            <BookOpen size={40} className="mr-2" />
            <h1 className="text-3xl font-bold">Perpustakaan</h1>
          </div>
          <p className="text-center text-indigo-100">Masuk ke akun Anda</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Visitor Button */}
          <button
            type="button"
            onClick={handleVisitorClick}
            className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105"
          >
            🌍 Masuk sebagai Visitor (Tanpa Login)
          </button>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={handleRegisterClick}
                className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </form>

        {/* Footer Info */}
        <div className="bg-gray-50 px-8 py-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            💡 <strong>Visitor</strong> dapat melihat katalog buku tanpa login
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            📚 <strong>Member</strong> dapat meminjam buku
          </p>
        </div>
      </div>
    </div>
  );
}