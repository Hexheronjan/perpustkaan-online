// src/hooks/useAuth.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getToken, clearAuth } from '@/lib/client-auth';
import { apiFetch } from '@/lib/api-client';

export function useAuth(requiredRole = null) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      const cachedUser = getUser();

      if (!token || !cachedUser) {
        setLoading(false);
        router.push('/login');
        return;
      }

      try {
        // Verify token with server
        const response = await apiFetch('/api/auth/session');
        
        if (response.success) {
          setUser(response.user);
          
          // Check role if required
          if (requiredRole) {
            const userRole = response.user.role.toLowerCase();
            const allowed = Array.isArray(requiredRole)
              ? requiredRole.map(r => r.toLowerCase()).includes(userRole)
              : requiredRole.toLowerCase() === userRole;
            
            if (!allowed) {
              alert('Anda tidak memiliki akses ke halaman ini');
              router.push('/login');
              return;
            }
          }
          
          setAuthorized(true);
        } else {
          clearAuth();
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuth();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [requiredRole, router]);

  return { user, loading, authorized };
}