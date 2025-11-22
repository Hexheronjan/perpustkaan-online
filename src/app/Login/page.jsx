"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { setToken, setUser, clearAuth, getUser } from "@/lib/client-auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Username/Email:", usernameOrEmail);
    
    try {
      const body = usernameOrEmail.includes("@")
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };
      
      console.log("Sending request to /api/auth/login");
      
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      
      console.log("Login response:", res);
      
      if (!res.success || !res.accessToken) {
        throw new Error(res.message || "Login gagal");
      }
      
      // Simpan token dan user data
      setToken(res.accessToken);
      setUser(res.user);
      
      console.log("✅ Login berhasil!");
      console.log("User:", res.user);
      console.log("Role:", res.user.role);
      
      if (!remember) {
        // Optional: if not remember, clear token on tab close
        window.addEventListener("beforeunload", () => clearAuth(), { once: true });
      }
      
      // Redirect berdasarkan role
      const role = res.user.role;
      let redirectPath = "/";
      
      switch(role) {
        case "admin":
          redirectPath = "/admin/dashboard";
          console.log("Redirecting to Admin Dashboard");
          break;
        case "staf":
          redirectPath = "/staf/dashboard";
          console.log("Redirecting to Staf Dashboard");
          break;
        case "member":
          redirectPath = "/member/dashboard";
          console.log("Redirecting to Member Dashboard");
          break;
        default:
          redirectPath = "/";
          console.log("Redirecting to Homepage");
      }
      
      // Show success message briefly before redirect
      setError("");
      
      // Redirect menggunakan Next.js router
      setTimeout(() => {
        router.push(redirectPath);
      }, 500);
      
    } catch (e) {
      console.error("❌ Login error:", e);
      setError(e.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  const currentUser = getUser();

  // Jika sudah login, tampilkan info dan tombol logout
  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f8fb] p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Sudah Login</h2>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">Anda sudah login sebagai:</p>
              <p className="text-xl font-bold text-gray-900">{currentUser.username}</p>
              <p className="text-sm text-gray-600 mt-1">
                Role: <span className="font-semibold text-blue-600">{currentUser.role}</span>
              </p>
              {currentUser.roleDisplay && (
                <p className="text-xs text-gray-500 mt-1">{currentUser.roleDisplay}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                const role = currentUser.role;
                if (role === 'admin') router.push('/admin/dashboard');
                else if (role === 'staf') router.push('/staf/dashboard');
                else if (role === 'member') router.push('/member/dashboard');
                else router.push('/');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Ke Dashboard
            </button>
            
            <button
              onClick={() => {
                clearAuth();
                window.location.reload();
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f8fb] p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Illustration / left */}
        <div className="hidden md:flex items-center justify-center bg-[#e8f6f7] p-8">
          <Image 
            src="/globe.svg" 
            alt="Illustration" 
            width={320} 
            height={320} 
            className="opacity-80" 
          />
        </div>

        {/* Form / right */}
        <div className="p-8 md:p-12">
          <div className="mb-6">
            <div className="text-sky-600 font-semibold">Perpustakaan</div>
            <h1 className="text-2xl md:text-3xl font-semibold mt-2">Welcome Back :)</h1>
            <p className="text-gray-600 mt-2 text-sm">
              Silakan login dengan email atau username dan password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2">
                Email Address / Username
              </label>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin atau admin@perpustakaan.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={remember} 
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-400"
                  disabled={loading}
                />
                <span className="text-gray-700">Remember Me</span>
              </label>
              <button 
                type="button"
                className="text-sky-600 hover:text-sky-700 transition"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-700 text-sm">Memproses login...</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-full px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? "Processing..." : "Login Now"}
              </button>
              <Link
                href="/"
                className="flex-1 text-center border-2 border-gray-300 hover:border-gray-400 rounded-full px-6 py-3 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500 mb-3">Or you can join with</div>
              <div className="flex gap-3 justify-center">
                <button 
                  type="button" 
                  className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center font-semibold text-gray-700 transition"
                  disabled={loading}
                >
                  G
                </button>
                <button 
                  type="button" 
                  className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center font-semibold text-gray-700 transition"
                  disabled={loading}
                >
                  F
                </button>
                <button 
                  type="button" 
                  className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center font-semibold text-gray-700 transition"
                  disabled={loading}
                >
                  X
                </button>
              </div>
            </div>
          </form>

          {/* Quick Test Login Buttons (Remove in production) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Quick Test Login (Development Only)</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setUsernameOrEmail("admin");
                  setPassword("$2a$10$example");
                }}
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded transition"
                disabled={loading}
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setUsernameOrEmail("staf1");
                  setPassword("$2a$10$example");
                }}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded transition"
                disabled={loading}
              >
                Staf
              </button>
              <button
                onClick={() => {
                  setUsernameOrEmail("member1");
                  setPassword("$2a$10$example");
                }}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded transition"
                disabled={loading}
              >
                Member
              </button>
              <button
                onClick={() => {
                  setUsernameOrEmail("visitor1");
                  setPassword("$2a$10$example");
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition"
                disabled={loading}
              >
                Visitor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}