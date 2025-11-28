// src/lib/roles.js
// FIXED VERSION - Visitor tidak punya role (public access)

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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
export function getRoleFromRequest(req) {
  try {
    const cookieStore = cookies();
    
    // Try different cookie names
    let token = cookieStore.get('token')?.value || 
                cookieStore.get('session')?.value ||
                cookieStore.get('auth-token')?.value ||
                cookieStore.get('jwt')?.value;
    
    // Check Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      console.log('⚠️  No token found - User not authenticated');
      return null;
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified:', {
      username: decoded.username,
      role_id: decoded.role_id,
      role_name: ROLE_NAMES[decoded.role_id] || 'Unknown'
    });
    
    return decoded.role_id || null;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('❌ Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('❌ Invalid token');
    } else {
      console.error('❌ Error verifying token:', error.message);
    }
    return null;
  }
}

/**
 * Require specific roles
 * Returns { ok: boolean, role?: number, error?: string }
 */
export function requireRole(req, allowedRoles = []) {
  const userRole = getRoleFromRequest(req);
  
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
export function hasAnyRole(req, roles = []) {
  const userRole = getRoleFromRequest(req);
  return userRole && roles.includes(userRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(req) {
  return getRoleFromRequest(req) === ROLES.ADMIN;
}

/**
 * Check if user is staff or admin
 */
export function isStaffOrAdmin(req) {
  const role = getRoleFromRequest(req);
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