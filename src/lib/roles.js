export const ROLES = Object.freeze({
	VISITOR: 'visitor',
	MEMBER: 'member',
	STAF: 'staf',
	ADMIN: 'admin',
});

import { verifyJwt } from './auth';

export function getRoleFromRequest(req) {
	// Prefer Authorization: Bearer <JWT>
	const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
	if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
		const token = authHeader.slice(7).trim();
		const payload = verifyJwt(token);
		const roleFromToken = payload?.role?.toLowerCase();
		if (roleFromToken && Object.values(ROLES).includes(roleFromToken)) {
			return roleFromToken;
		}
	}

	// Backward-compat for tests: accept x-role header or role query param
	let role = req.headers.get('x-role')?.toLowerCase();
	if (!role) {
		try {
			const { searchParams } = new URL(req.url);
			const qp = searchParams.get('role');
			if (qp) role = qp.toLowerCase();
		} catch {}
	}
	if (Object.values(ROLES).includes(role)) return role || ROLES.VISITOR;
	return ROLES.VISITOR;
}

export function requireRole(req, allowedRoles) {
	const role = getRoleFromRequest(req);
	if (!allowedRoles.includes(role)) {
		return { ok: false, role };
	}
	return { ok: true, role };
}


