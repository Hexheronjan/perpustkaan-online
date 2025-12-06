'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Lock, Eye, EyeOff, Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { setToken, setUser } from '@/lib/client-auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10
    }));
    setParticles(newParticles);
  }, []);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    router.push('/register');
  };

  const handleVisitorClick = () => {
    // Set default visitor data
    const visitorUser = {
      id: 0,
      username: 'visitor',
      role: 'visitor',
      role_id: 1
    };

    setUser(visitorUser);
    // Visitor doesn't need a token for public routes, but we can set a dummy one if needed
    // setToken('visitor-token'); 

    router.push('/visitor');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat login');
      }

      // Simpan token dan user data
      setToken(data.accessToken || data.token);
      setUser(data.user);

      // Redirect berdasarkan role
      const role = data.user.role;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'staf') {
        router.push('/staf/dashboard');
      } else if (role === 'member') {
        router.push('/member/dashboard');
      } else {
        router.push('/');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
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
            <p className="text-lg">Selamat Datang Kembali</p>
            <Sparkles size={16} className="text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Login Card */}
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow"></div>

          {/* Card */}
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
            {/* Decorative Header */}
            <div className="relative h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient"></div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Welcome Text */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Masuk ke Akun</h2>
                <p className="text-gray-400 text-sm">Akses penuh ke perpustakaan digital</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-shake">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Username */}
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-semibold text-gray-300">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-400 transition-colors" size={20} />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 animate-slide-in" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-semibold text-gray-300">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition-opacity"></div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-14 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                      placeholder="Masukkan password"
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl p-0.5 transition-all duration-300 animate-slide-in"
                style={{ animationDelay: '300ms' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-xl flex items-center justify-center gap-3 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all">
                  <LogIn size={20} className="text-white group-hover:scale-110 transition-transform" />
                  <span className="text-white font-bold text-lg">
                    {loading ? 'Memproses...' : 'Masuk Sekarang'}
                  </span>
                  {!loading && (
                    <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="relative py-4 animate-slide-in" style={{ animationDelay: '400ms' }}>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-slate-800 text-gray-400 text-sm font-medium">atau</span>
                </div>
              </div>

              {/* Visitor Button */}
              <button
                type="button"
                onClick={handleVisitorClick}
                className="w-full relative group overflow-hidden border-2 border-slate-600 hover:border-indigo-500 rounded-xl py-4 transition-all transform hover:scale-105 animate-slide-in"
                style={{ animationDelay: '500ms' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-2 text-gray-300 group-hover:text-white transition-colors">
                  <span className="text-2xl">🌍</span>
                  <span className="font-semibold">Lihat sebagai Visitor</span>
                </div>
              </button>

              {/* Register Link */}
              <div className="text-center pt-4 animate-slide-in" style={{ animationDelay: '600ms' }}>
                <p className="text-gray-400 text-sm">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text font-bold hover:from-indigo-300 hover:to-purple-300 transition-all"
                  >
                    Daftar Sekarang →
                  </button>
                </p>
              </div>
            </form>

            {/* Footer Info */}
            <div className="bg-slate-900/50 backdrop-blur-sm px-8 py-6 border-t border-slate-700/50">
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span><strong className="text-indigo-400">Visitor</strong> dapat melihat katalog buku tanpa login</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span><strong className="text-purple-400">Member</strong> dapat meminjam buku</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-500 text-sm mt-8 animate-fade-in" style={{ animationDelay: '700ms' }}>
          © 2025 Perpustakaan Digital. Made with ❤️
        </p>
      </div>

      {/* Custom Styles */}
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
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
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

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}