// src/middleware.js
// Middleware untuk proteksi route berdasarkan role
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

const ROLES = {
  MEMBER: 2,
  STAF: 3,
  ADMIN: 4
};

// Public routes (tidak perlu login)
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/Visitor',
  '/api/visitor',
  '/api/auth/login',
  '/api/auth/register',
  '/_next',
  '/favicon.ico',
  '/public'
];

// Route permissions
const ROUTE_PERMISSIONS = {
  '/Admin': [ROLES.ADMIN],
  '/Staf': [ROLES.STAF, ROLES.ADMIN],
  '/Member': [ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN],
  '/api/admin': [ROLES.ADMIN],
  '/api/staf': [ROLES.STAF, ROLES.ADMIN],
  '/api/member': [ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN],
  '/api/peminjaman': [ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN]
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // No token - redirect to login (except for visitor)
  if (!token) {
    console.log('⚠️  No token, redirecting to login:', pathname);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role_id;

    console.log('✅ Middleware auth:', {
      pathname,
      username: payload.username,
      role_id: userRole,
      role_name: userRole === 4 ? 'Admin' : userRole === 3 ? 'Staf' : userRole === 2 ? 'Member' : 'Unknown'
    });

    // Check route permissions
    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          console.log('❌ Forbidden:', {
            pathname,
            userRole,
            allowedRoles
          });
          
          // Redirect based on user role
          let redirectUrl;
          switch (userRole) {
            case ROLES.ADMIN:
              redirectUrl = new URL('/Admin/dashboard', request.url);
              break;
            case ROLES.STAF:
              redirectUrl = new URL('/Staf/dashboard', request.url);
              break;
            case ROLES.MEMBER:
              redirectUrl = new URL('/Member/dashboard', request.url);
              break;
            default:
              redirectUrl = new URL('/login', request.url);
          }
          
          return NextResponse.redirect(redirectUrl);
        }
        break;
      }
    }

    // Authorized
    return NextResponse.next();

  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    // Invalid token - clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};