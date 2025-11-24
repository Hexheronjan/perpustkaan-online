import { useState } from "react";
import { BookOpen, Mail, User, Lock, Eye, EyeOff, UserPlus, Check, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ModernRegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nama_lengkap: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ["Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  // Validasi
  const validations = {
    username: formData.username.length >= 3,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    password: formData.password.length >= 6,
    confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword !== "",
    nama_lengkap: formData.nama_lengkap.length >= 2,
  };

  const isFormValid = Object.values(validations).every(Boolean);

  async function handleSubmit() {
    setError("");

    if (!isFormValid) {
      setError("Mohon lengkapi semua field dengan benar");
      return;
    }

    setLoading(true);

    try {
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Register data:", {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        nama_lengkap: formData.nama_lengkap.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        console.log("Redirecting to login or home...");
      }, 2000);
    } catch (e) {
      setError(e.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Registrasi Berhasil! 🎉
          </h2>
          <p className="text-gray-600 mb-4">Akun Anda telah berhasil dibuat. Anda akan dialihkan...</p>
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center order-2 lg:order-1">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-emerald-600 mb-4">
                  <BookOpen size={28} className="animate-pulse" />
                  <span className="font-bold text-xl">Perpustakaan</span>
                </div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Buat Akun Baru 📚
                </h2>
                <p className="text-gray-600 mt-2">Daftar untuk mulai meminjam buku dan mengakses koleksi</p>
              </div>

              <div className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={formData.nama_lengkap}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className={`w-full border-2 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-4 transition-all bg-white/50 ${
                        formData.nama_lengkap 
                          ? validations.nama_lengkap 
                            ? "border-green-300 focus:border-green-500 focus:ring-green-100" 
                            : "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />
                    {formData.nama_lengkap && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {validations.nama_lengkap ? 
                          <Check size={18} className="text-green-500" /> : 
                          <X size={18} className="text-red-500" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 font-semibold">@</span>
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Pilih username unik"
                      className={`w-full border-2 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-4 transition-all bg-white/50 ${
                        formData.username 
                          ? validations.username 
                            ? "border-green-300 focus:border-green-500 focus:ring-green-100" 
                            : "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />
                    {formData.username && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {validations.username ? 
                          <Check size={18} className="text-green-500" /> : 
                          <X size={18} className="text-red-500" />
                        }
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimal 3 karakter</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className={`w-full border-2 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-4 transition-all bg-white/50 ${
                        formData.email 
                          ? validations.email 
                            ? "border-green-300 focus:border-green-500 focus:ring-green-100" 
                            : "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />
                    {formData.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {validations.email ? 
                          <Check size={18} className="text-green-500" /> : 
                          <X size={18} className="text-red-500" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-12 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                            }`} 
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${passwordStrength >= 3 ? "text-green-600" : "text-orange-600"}`}>
                        Kekuatan: {strengthLabels[passwordStrength - 1] || "Sangat Lemah"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ulangi password"
                      className={`w-full border-2 rounded-xl pl-10 pr-12 py-2.5 focus:outline-none focus:ring-4 transition-all bg-white/50 ${
                        formData.confirmPassword 
                          ? validations.confirmPassword 
                            ? "border-green-300 focus:border-green-500 focus:ring-green-100" 
                            : "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />
                    <button 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-500"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && !validations.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 font-medium">Password tidak cocok</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex items-center gap-2 animate-shake">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                    <span className="text-red-600 text-sm font-medium">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Mendaftar...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Daftar Sekarang</span>
                    </>
                  )}
                </button>

                <div className="text-center text-sm">
                  <span className="text-gray-600">Sudah punya akun? </span>
                  <button
                    onClick={() => alert("Redirect ke /Login")}
                    className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                  >
                    Login di sini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl order-1 lg:order-2">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center">
            <UserPlus size={100} className="mb-6 opacity-90 mx-auto animate-pulse" />
            <h2 className="text-4xl font-black mb-4">Bergabung Sekarang</h2>
            <p className="text-lg text-white/90 max-w-xs mx-auto mb-8">
              Nikmati akses ke ribuan buku, fitur peminjaman mudah, dan notifikasi pengingat pengembalian.
            </p>
            <div className="space-y-3 text-left max-w-sm mx-auto">
              {[
                { icon: "✅", text: "Akses katalog lengkap" },
                { icon: "📖", text: "Peminjaman online" },
                { icon: "📅", text: "Riwayat peminjaman" },
                { icon: "🔔", text: "Notifikasi otomatis" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-all transform hover:scale-105">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
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