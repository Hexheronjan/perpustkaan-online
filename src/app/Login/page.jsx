"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { setToken, setUser, clearAuth, getUser } from "@/lib/client-auth";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = usernameOrEmail.includes("@")
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setToken(res.accessToken);
      setUser(res.user);
      if (!remember) {
        // Optional: if not remember, clear token on tab close
        window.addEventListener("beforeunload", () => clearAuth(), { once: true });
      }
      window.location.href = "/";
    } catch (e) {
      setError(e.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  const currentUser = getUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f8fb] p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Illustration / left */}
        <div className="hidden md:flex items-center justify-center bg-[#e8f6f7] p-8">
          <Image src="/globe.svg" alt="Illustration" width={320} height={320} className="opacity-80" />
        </div>

        {/* Form / right */}
        <div className="p-8 md:p-12">
          <div className="mb-6">
            <div className="text-sky-600 font-semibold">Perpustakaan</div>
            <h1 className="text-2xl md:text-3xl font-semibold mt-2">Welcome Back :)</h1>
            <p className="text-gray-600 mt-2 text-sm">Silakan login dengan email atau username dan password.</p>
          </div>

          {currentUser ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              Sudah login sebagai <b>{currentUser.username}</b> ({currentUser.role}).
              <div className="mt-4 flex gap-3">
                <Link className="text-sky-600 underline" href="/">Ke beranda</Link>
                <button className="text-red-600 underline" onClick={() => { clearAuth(); window.location.reload(); }}>Logout</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">Email Address / Username</label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin atau admin@perpustakaan.com"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember Me
                </label>
                <span className="text-gray-400">Forgot Password?</span>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-5 py-2 disabled:opacity-60"
                >
                  {loading ? "Memproses..." : "Login Now"}
                </button>
                <Link
                  href="/"
                  className="border rounded-full px-5 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Create Account
                </Link>
              </div>

              <div className="mt-6 text-sm text-gray-500">Or you can join with</div>
              <div className="flex gap-3 mt-2">
                <button type="button" className="border rounded-full px-4 py-2">G</button>
                <button type="button" className="border rounded-full px-4 py-2">F</button>
                <button type="button" className="border rounded-full px-4 py-2">X</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}