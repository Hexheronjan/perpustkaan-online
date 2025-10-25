// D:\Projek Coding\projek_pkl\src\lib\error-handler.js
import { NextResponse } from 'next/server';

export function handleApiError(error, context = 'API') {
	console.error(`${context} Error:`, error);
	
	// Database connection errors
	if (error.code === 'ECONNREFUSED') {
		return NextResponse.json({
			success: false,
			message: 'Database connection failed',
			error: 'Cannot connect to PostgreSQL database'
		}, { status: 503 });
	}
	
	// Database query errors
	if (error.code === '42703') {
		return NextResponse.json({
			success: false,
			message: 'Database schema error',
			error: `Column not found: ${error.message}`
		}, { status: 500 });
	}
	
	// Generic database errors
	if (error.code && error.code.startsWith('23')) {
		return NextResponse.json({
			success: false,
			message: 'Database constraint error',
			error: error.message
		}, { status: 400 });
	}
	
	// Generic error
	return NextResponse.json({
		success: false,
		message: 'Internal server error',
		error: error.message || 'Unknown error'
	}, { status: 500 });
}

export function wrapApiHandler(handler) {
	return async (req) => {
		try {
			return await handler(req);
		} catch (error) {
			return handleApiError(error, handler.name || 'API Handler');
		}
	};
}




