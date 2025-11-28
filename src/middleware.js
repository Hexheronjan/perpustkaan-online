// src/middleware.js
// FIXED: Visitor route is PUBLIC (no auth required)
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

// ==========================================
// PUBLIC ROUTES - NO AUTH REQUIRED
// ==========================================
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/visitor',           // ✅ VISITOR IS PUBLIC
  '/api/visitor',       // ✅ VISITOR API IS PUBLIC
  '/api/auth/login',
  '/api/auth/register',
  '/_next',
  '/favicon.ico',
  '/public',
  '/',                  // ✅ ROOT IS PUBLIC (redirects to visitor)
];

// Route permissions (ONLY for authenticated users)
const ROUTE_PERMISSIONS = {
  '/admin': [ROLES.ADMIN],
  '/staf': [ROLES.STAF, ROLES.ADMIN],
  '/member': [ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN],
  '/api/admin': [ROLES.ADMIN],
  '/api/staf': [ROLES.STAF, ROLES.ADMIN],
  '/api/member': [ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN],
  '/api/peminjaman': [ROLES.MEMBER, ROLES.STAF, ROLES.ADMIN]
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log('🔍 Middleware checking:', pathname);

  // ==========================================
  // STEP 1: Check if route is PUBLIC
  // ==========================================
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    console.log('✅ Public route, allowing access:', pathname);
    return NextResponse.next();
  }

  // ==========================================
  // STEP 2: Not public - need authentication
  // ==========================================
  const token = request.cookies.get('token')?.value;

  if (!token) {
    console.log('⚠️  No token, redirecting to login:', pathname);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ==========================================
  // STEP 3: Verify token
  // ==========================================
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role_id;

    console.log('✅ Token verified:', {
      pathname,
      username: payload.username,
      role_id: userRole,
      role_name: userRole === 4 ? 'Admin' : userRole === 3 ? 'Staf' : userRole === 2 ? 'Member' : 'Unknown'
    });

    // ==========================================
    // STEP 4: Check route permissions
    // ==========================================
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
              redirectUrl = new URL('/admin/dashboard', request.url);
              break;
            case ROLES.STAF:
              redirectUrl = new URL('/staf/dashboard', request.url);
              break;
            case ROLES.MEMBER:
              redirectUrl = new URL('/member/dashboard', request.url);
              break;
            default:
              redirectUrl = new URL('/login', request.url);
          }
          
          return NextResponse.redirect(redirectUrl);
        }
        
        console.log('✅ Authorized access:', pathname);
        break;
      }
    }

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};