import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth';
import { authenticatedFetch } from '@/lib/authenticated-fetch';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('adminAccessToken')?.value;
  const refreshToken = cookieStore.get('adminRefreshToken')?.value;

  if (!accessToken && !refreshToken) {
    redirect('/');
  }

  let decoded = accessToken
    ? (verifyAccessToken(accessToken) as
        | {
            userId?: string;
            id?: string;
            role?: string;
            mustChangePassword?: boolean;
          }
        | null)
    : null;

  // If the short-lived access token expired, use the existing refresh token
  // before deciding that the session is gone.
  if (!decoded && refreshToken) {
    const authResult = await authenticatedFetch(
      '/api/v1/users/me',
      accessToken,
      refreshToken,
      { method: 'GET' },
    );

    if (authResult.response.ok && authResult.accessToken) {
      accessToken = authResult.accessToken;
      decoded = verifyAccessToken(accessToken) as
        | {
            userId?: string;
            id?: string;
            role?: string;
            mustChangePassword?: boolean;
          }
        | null;
    }
  }

  if ((decoded?.role === 'ADMIN' || decoded?.role === 'admin') && decoded.mustChangePassword) {
    redirect('/admin/change-password');
  }

  if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'admin')) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-4xl">🔒</div>
          <h1 className="text-2xl font-black">Access Denied</h1>
          <p className="mt-3 text-sm text-white/50">
            This area is restricted to authorized Sportora administrators.
          </p>
        </div>
      </main>
    );
  }

  return <AdminDashboardClient />;
}
