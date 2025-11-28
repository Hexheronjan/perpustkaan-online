"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { getUser, getRole, clearAuth } from "@/lib/client-auth";
import { BookOpen, Search, LogOut, AlertCircle } from "lucide-react";

export default function MemberPage() {
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    setRole(getRole());
    setAuthReady(true);
  }, []);

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoadingBooks(true);
        setError("");
        const data = await apiFetch("/api/member/buku");
        setBooks(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Gagal memuat data buku");
      } finally {
        setLoadingBooks(false);
      }
    }

    // Hanya fetch jika role adalah member atau admin
    if (authReady && (role === "member" || role === "admin")) {
      loadBooks();
    } else {
      setLoadingBooks(false);
    }
  }, [role, authReady]);

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    return books.filter((book) => {
      const keyword = searchQuery.toLowerCase();
      return (
        (book.judul || book.title || "").toLowerCase().includes(keyword) ||
        (book.penulis || book.author || "").toLowerCase().includes(keyword)
      );
    });
  }, [books, searchQuery]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white shadow rounded-xl p-6 text-center space-y-3">
          <h1 className="text-lg font-semibold text-slate-800">
            Menyiapkan halaman member...
          </h1>
          <p className="text-sm text-slate-500">
            Mohon tunggu sebentar.
          </p>
        </div>
      </div>
    );
  }

  // If role mismatch
  if (role !== "member" && role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Panel ini khusus Member
          </h1>
          <p className="text-sm text-slate-600">
            Silakan login sebagai <span className="font-semibold">Member</span>{" "}
            untuk mengakses fitur peminjaman. Role Visitor hanya dapat melihat
            katalog.
          </p>
          <button
            onClick={() => (window.location.href = "/Login")}
            className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  const totalStock = books.reduce(
    (sum, book) => sum + (book.stok_tersedia ?? book.stock ?? 0),
    0
  );
  const approvedBooks = books.length;
  const outOfStock = books.filter(
    (book) => (book.stok_tersedia ?? book.stock ?? 0) === 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500">
        <div className="max-w-6xl mx-auto px-6 py-10 text-white flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">
              Portal Member
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold mt-1">
              Selamat datang, {user?.username || "Member"}
            </h1>
            <p className="text-white/80 text-sm md:text-base mt-3 max-w-2xl">
              Akses katalog buku, cari referensi bacaan favorit, dan ajukan peminjaman.
            </p>
          </div>
          <button
            onClick={() => {
              clearAuth();
              window.location.href = "/Login";
            }}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white shadow-lg p-5 border border-slate-100">
            <p className="text-xs uppercase text-slate-400">Total Buku</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {approvedBooks}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Buku yang siap dipinjam
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow-lg p-5 border border-slate-100">
            <p className="text-xs uppercase text-slate-400">Stok Aktif</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {totalStock}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Total eksemplar tersedia
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow-lg p-5 border border-slate-100">
            <p className="text-xs uppercase text-slate-400">Stok Habis</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {outOfStock}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Buku yang perlu ditunggu
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                Katalog Buku
              </h2>
              <p className="text-sm text-slate-500">
                Cari buku favoritmu dan lihat detail untuk meminjam.
              </p>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul atau penulis..."
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {loadingBooks ? (
            <div className="text-sm text-slate-500 py-10 text-center">Memuat data buku...</div>
          ) : books.length === 0 ? (
            <div className="text-sm text-slate-500 py-10 text-center">
              Belum ada data buku yang bisa ditampilkan.
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-sm text-slate-500 py-10 text-center">
              Tidak ada buku yang cocok dengan pencarian.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBooks.map((book) => {
                const available = (book.stok_tersedia ?? book.stock ?? 0) > 0;
                return (
                  <div
                    key={book.id}
                    className="group border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md transition bg-white"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">
                          {book.genre_id ? `Genre #${book.genre_id}` : "Umum"}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${available ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {available ? 'Tersedia' : 'Habis'}
                        </span>
                      </div>

                      <div className="flex gap-4">
                        {/* Placeholder for cover if we had one, or icon */}
                        <div className="w-16 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-300">
                          {book.sampul_buku ? (
                            <img src={book.sampul_buku} alt={book.judul} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <BookOpen className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {book.judul || book.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {book.penulis || book.author || "Penulis tidak diketahui"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Stok: {book.stok_tersedia ?? book.stock ?? 0}
                      </span>
                      <button
                        onClick={() => window.location.href = `/member/buku/${book.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-medium px-4 py-2 hover:bg-indigo-600 transition"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
