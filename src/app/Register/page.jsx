// src/app/register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nama_lengkap: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          nama_lengkap: formData.nama_lengkap,
          role_id: 2
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Registrasi berhasil! Silakan login.');
        router.push('/login');
      } else {
        setError(data.message || 'Registrasi gagal');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo & Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow"></div>
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-3xl transform group-hover:scale-110 transition-transform shadow-2xl">
              <BookOpen className="text-white" size={48} />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Perpustakaan Digital
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Sparkles size={16} className="text-yellow-400 animate-pulse" />
            <p className="text-lg">Daftar Akun Baru</p>
            <Sparkles size={16} className="text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Register Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow"></div>
          
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
            <div className="relative h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient"></div>

            <div className="p-8 space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Buat Akun Member</h2>
                <p className="text-gray-400 text-sm">Mulai petualangan literasi Anda</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-shake">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Nama Lengkap */}
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-semibold text-gray-300">Nama Lengkap</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-400 transition-colors" size={20} />
                    <input
                      type="text"
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                      placeholder="Nama lengkap Anda"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: '150ms' }}>
                <label className="block text-sm font-semibold text-gray-300">Username</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors" size={20} />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="Username unik"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-semibold text-gray-300">Email</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-pink-400 transition-colors" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none transition-all"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: '250ms' }}>
                <label className="block text-sm font-semibold text-gray-300">Password</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-400 transition-colors" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-14 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: '300ms' }}>
                <label className="block text-sm font-semibold text-gray-300">Konfirmasi Password</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-14 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="Ulangi password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl p-0.5 transition-all duration-300 animate-slide-in"
                style={{ animationDelay: '350ms' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-xl flex items-center justify-center gap-3 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all">
                  <UserPlus size={20} className="text-white group-hover:scale-110 transition-transform" />
                  <span className="text-white font-bold text-lg">
                    {loading ? 'Memproses...' : 'Daftar Sekarang'}
                  </span>
                  {!loading && <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>

              {/* Divider */}
              <div className="relative py-3 animate-slide-in" style={{ animationDelay: '400ms' }}>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-slate-800 text-gray-400 text-sm font-medium">atau</span>
                </div>
              </div>

              {/* Back to Login */}
              <button
                onClick={() => router.push('/login')}
                className="w-full border-2 border-slate-600 hover:border-purple-500 rounded-xl py-3 transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white font-semibold group animate-slide-in"
                style={{ animationDelay: '450ms' }}
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Kembali ke Login</span>
              </button>

              {/* Visitor Button */}
              <button
                onClick={() => router.push('/visitor')}
                className="w-full border-2 border-slate-600 hover:border-indigo-500 rounded-xl py-3 transition-all transform hover:scale-105 animate-slide-in"
                style={{ animationDelay: '500ms' }}
              >
                <div className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors">
                  <span className="text-xl">🌍</span>
                  <span className="font-semibold">Lihat sebagai Visitor</span>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="bg-slate-900/50 backdrop-blur-sm px-8 py-4 border-t border-slate-700/50">
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                <Sparkles size={12} className="text-yellow-400" />
                Dengan mendaftar, Anda bisa meminjam buku dari perpustakaan
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
          © 2025 Perpustakaan Digital. Made with ❤️
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.5; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float linear infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.6s ease-out forwards; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}