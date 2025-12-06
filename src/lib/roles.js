import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { verifyJwt } from '@/lib/auth';

// Role constants - VISITOR DIHAPUS karena public
export const ROLES = {
  MEMBER: 2,
  STAF: 3,
  ADMIN: 4
};

// Deskripsi roles untuk reference
export const ROLE_NAMES = {
  2: 'Member',
  3: 'Staf',
  4: 'Admin'
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

/**
 * Get role from request
 * Returns role_id or null if not authenticated
 */
export async function getRoleFromRequest(req) {
  try {
    let token = null;

    // 1. Try to get from req.cookies (NextRequest)
    if (req?.cookies && typeof req.cookies.get === 'function') {
      token = req.cookies.get('token')?.value ||
        req.cookies.get('session')?.value ||
        req.cookies.get('auth-token')?.value ||
        req.cookies.get('jwt')?.value;
    }

    // 2. If no token yet, try next/headers cookies (Server Components)
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('token')?.value ||
          cookieStore.get('session')?.value ||
          cookieStore.get('auth-token')?.value ||
          cookieStore.get('jwt')?.value;
      } catch (e) {
        // Ignore error - likely called where cookies() is not available or we already have req
      }
    }

    // 3. Check Authorization header
    if (!token && req?.headers) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('⚠️  No token found in cookies or headers');
      return null;
    }

    // Verify JWT token using centralized auth lib
    const decoded = verifyJwt(token);

    if (!decoded) {
      console.error('❌ Token verification failed (verifyJwt returned null)');
      return null;
    }

    console.log('✅ Token verified:', {
      username: decoded.username,
      role_id: decoded.role_id,
      role_name: ROLE_NAMES[decoded.role_id] || 'Unknown'
    });

    return decoded.role_id || null;
  } catch (error) {
    console.error('❌ Error in getRoleFromRequest:', error.message);
    return null;
  }
}

/**
 * Require specific roles
 * Returns { ok: boolean, role?: number, error?: string }
 */
export async function requireRole(req, allowedRoles = []) {
  const userRole = await getRoleFromRequest(req);

  console.log('🔐 Auth Check:', {
    userRole,
    userRoleName: userRole ? ROLE_NAMES[userRole] : 'Not authenticated',
    allowedRoles: allowedRoles.map(r => ROLE_NAMES[r] || r),
    isAllowed: userRole && allowedRoles.includes(userRole)
  });

  // Not authenticated
  if (!userRole) {
    return {
      ok: false,
      error: 'Not authenticated',
      message: 'No valid session found. Please login.'
    };
  }

  // Not authorized (wrong role)
  if (!allowedRoles.includes(userRole)) {
    return {
      ok: false,
      error: 'Forbidden',
      message: `Role ${ROLE_NAMES[userRole]} not allowed. Required: ${allowedRoles.map(r => ROLE_NAMES[r]).join(', ')}`
    };
  }

  // Authorized
  return {
    ok: true,
    role: userRole
  };
}

/**
 * Check if user has any of the roles
 */
export async function hasAnyRole(req, roles = []) {
  const userRole = await getRoleFromRequest(req);
  return userRole && roles.includes(userRole);
}

/**
 * Check if user is admin
 */
export async function isAdmin(req) {
  return (await getRoleFromRequest(req)) === ROLES.ADMIN;
}

/**
 * Check if user is staff or admin
 */
export async function isStaffOrAdmin(req) {
  const role = await getRoleFromRequest(req);
  return role === ROLES.STAF || role === ROLES.ADMIN;
}

/**
 * Create JWT token (for login)
 */
export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Get user info from token without validation
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}