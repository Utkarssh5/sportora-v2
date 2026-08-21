import { NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';

export function authorize(req: Request, allowedRoles: string[] = []) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthorized: false, response: NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 }) };
  }

  const token = authHeader.split(' ')[1];
  const decoded: any = verifyAccessToken(token);

  if (!decoded) {
    return { isAuthorized: false, response: NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 403 }) };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
    return { isAuthorized: false, response: NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
  }

  return { isAuthorized: true, user: decoded };
}
