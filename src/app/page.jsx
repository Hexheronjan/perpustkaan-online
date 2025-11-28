// src/app/page.jsx
// Root page - redirect langsung ke Visitor
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect langsung ke Visitor page
    console.log('🚀 Redirecting to Visitor...');
    router.push('/visitor');
  }, [router]);

  // Loading state sementara redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl font-semibold">Loading...</p>
      </div>
    </div>
  );
}