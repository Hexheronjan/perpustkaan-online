import { NextResponse } from 'next/server';

export async function POST(req) {
	try {
		const body = await req.json();
		const headers = Object.fromEntries(req.headers.entries());
		
		return NextResponse.json({
			success: true,
			receivedBody: body,
			bodyType: typeof body,
			bodyKeys: Object.keys(body || {}),
			headers: {
				'content-type': headers['content-type'],
				'content-length': headers['content-length']
			},
			hasUsername: 'username' in (body || {}),
			hasPassword: 'password' in (body || {}),
			usernameValue: body?.username,
			passwordValue: body?.password ? '***' : undefined
		});
	} catch (error) {
		return NextResponse.json({
			success: false,
			error: error.message,
			errorType: error.constructor.name
		}, { status: 400 });
	}
}
