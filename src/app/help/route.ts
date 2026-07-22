import { NextRequest, NextResponse } from 'next/server';

const GET = (req: NextRequest) => {
    const token = Date.now();
    const url = req.nextUrl.clone();
    url.pathname = `/contact/${token}`;
    url.search = '';

    const response = NextResponse.redirect(url);
    response.cookies.set('token', `${token}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 300,
        path: '/',
        sameSite: 'lax'
    });

    return response;
};

export { GET };
