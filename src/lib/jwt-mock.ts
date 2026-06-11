// Simplified Mock JWT library for simulation
export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

export function signMockJWT(payload: Omit<UserSession, 'exp'>, expiresInSeconds = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  // Helper base64 encoding
  const encode = (obj: any) => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    } catch (e) {
      return '';
    }
  };

  const encodedHeader = encode(header);
  const encodedPayload = encode(fullPayload);
  const signature = 'mock_signature_secret_key'; // Hardcoded for frontend simulation

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyMockJWT(token: string): UserSession | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const decode = (str: string) => {
      return JSON.parse(decodeURIComponent(escape(atob(str))));
    };

    const payload = decode(parts[1]) as UserSession;
    
    // Check expiration
    if (payload.exp < Date.now() / 1000) {
      console.warn('Mock JWT expired');
      return null;
    }

    return payload;
  } catch (e) {
    console.error('Failed to parse Mock JWT', e);
    return null;
  }
}
