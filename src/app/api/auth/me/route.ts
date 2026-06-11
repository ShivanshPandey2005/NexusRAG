import { NextRequest, NextResponse } from 'next/server';
import { verifyMockJWT } from '@/lib/jwt-mock';

export async function GET(req: NextRequest) {
  try {
    // 1. Check for cookie first
    let token = req.cookies.get('auth_token')?.value;

    // 2. Check for Authorization header if cookie not present
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token provided' },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = verifyMockJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired session token' },
        { status: 401 }
      );
    }

    // Return the profile
    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Clear the cookie for signout
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('auth_token');
  return response;
}
