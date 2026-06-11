import { NextRequest, NextResponse } from 'next/server';
import { signMockJWT } from '@/lib/jwt-mock';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create user object
    const user = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      email,
      name,
      role: 'Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
    };

    // Sign JWT
    const token = signMockJWT(user);

    // Create response
    const response = NextResponse.json({
      success: true,
      token,
      user
    });

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
