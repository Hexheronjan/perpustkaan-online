import { useState } from "react";
import { BookOpen, Mail, Lock, Eye, EyeOff, LogIn, UserCircle, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ModernLoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setError("");
    setLoading(true);

    try {
      // Simulasi API call - Ganti dengan apiFetch yang sebenarnya
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const body = usernameOrEmail.includes("@")
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };

      console.log("Login attempt:", body);
      
      setSuccess(true);
      setTimeout(() => {
        console.log("Redirecting to dashboard...");
      }, 1500);
      
    } catch (e) {
      setError(e.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handleVisitorAccess() {
    console.log("Accessing as visitor...");
    // window.location.href = "/visitor"
  }

  function handleQuickLogin(role, username, pwd) {
    setUsernameOrEmail(username);
    setPassword(pwd);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Login Berhasil!
          </h2>
          <p className="text-gray-600 mb-4">Mengalihkan ke dashboard...</p>
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <BookOpen size={120} className="text-white/90 animate-pulse" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-5xl font-black mb-4 drop-shadow-lg">
              Perpustakaan Digital
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Akses ribuan koleksi buku, artikel, dan jurnal dalam satu platform
            </p>
            <div className="space-y-4 text-left max-w-md mx-auto">
              {[
                "📚 10,000+ Koleksi Buku Digital",
                "⚡ Peminjaman Instan 24/7",
                "🔔 Notifikasi Otomatis",
                "📊 Tracking Riwayat Baca"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all transform hover:scale-105">
                  <div className="text-2xl">{feature.split(' ')[0]}</div>
                  <span className="font-medium">{feature.substring(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-indigo-600 mb-4">
                  <BookOpen size={28} className="animate-pulse" />
                  <span className="font-bold text-xl">Perpustakaan</span>
                </div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Selamat Datang! 👋
                </h2>
                <p className="text-gray-600 mt-2">Masuk untuk melanjutkan ke akun Anda</p>
              </div>

              <div className="space-y-5">
                {/* Email/Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email atau Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="admin@perpustakaan.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white/50"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={20} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white/50"
                      disabled={loading}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                      disabled={loading}
                    />
                    <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">
                      Ingat saya
                    </span>
                  </label>
                  <button
                    onClick={() => alert("Fitur reset password segera hadir!")}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-all"
                    disabled={loading}
                  >
                    Lupa Password?
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3 animate-shake">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Masuk Sekarang</span>
                    </>
                  )}
                </button>

                {/* Visitor Button */}
                <button
                  onClick={handleVisitorAccess}
                  disabled={loading}
                  className="w-full border-2 border-indigo-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-indigo-50 transform hover:scale-105 active:scale-95"
                >
                  <UserCircle size={20} />
                  <span>Masuk sebagai Visitor</span>
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Atau daftar dengan</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Google", color: "from-red-500 to-orange-500", icon: "G" },
                    { name: "Facebook", color: "from-blue-600 to-blue-700", icon: "f" },
                    { name: "Twitter", color: "from-sky-500 to-blue-500", icon: "𝕏" }
                  ].map((social) => (
                    <button
                      key={social.name}
                      onClick={() => alert(`Login dengan ${social.name} segera hadir!`)}
                      className={`bg-gradient-to-r ${social.color} hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-md`}
                      disabled={loading}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>

                {/* Register Link */}
                <div className="text-center text-sm">
                  <span className="text-gray-600">Belum punya akun? </span>
                  <button
                    onClick={() => alert("Redirect ke /Register")}
                    className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </div>

              {/* Quick Login */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3 font-semibold">
                  🔧 Quick Login (Development Only)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: "Admin", username: "admin", pwd: "admin123", color: "bg-purple-100 hover:bg-purple-200 text-purple-700" },
                    { role: "Staf", username: "staf1", pwd: "staf123", color: "bg-blue-100 hover:bg-blue-200 text-blue-700" },
                    { role: "Member", username: "member1", pwd: "member123", color: "bg-green-100 hover:bg-green-200 text-green-700" },
                    { role: "Visitor", username: "visitor1", pwd: "visitor123", color: "bg-gray-100 hover:bg-gray-200 text-gray-700" }
                  ].map((account) => (
                    <button
                      key={account.role}
                      onClick={() => handleQuickLogin(account.role, account.username, account.pwd)}
                      className={`text-xs ${account.color} px-3 py-2 rounded-lg transition-all font-semibold transform hover:scale-105`}
                      disabled={loading}
                    >
                      {account.role}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Klik role, lalu tekan "Masuk Sekarang"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}