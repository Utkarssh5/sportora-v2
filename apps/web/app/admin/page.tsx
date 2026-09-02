import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const decoded = verifyAccessToken(accessToken) as
    | {
        userId?: string;
        id?: string;
        role?: string;
        mustChangePassword?: boolean;
      }
    | null;

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
