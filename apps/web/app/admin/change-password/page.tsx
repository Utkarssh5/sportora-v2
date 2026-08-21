'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from the temporary password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/me/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to change password.',
        );
      }

      setSuccess('Password changed successfully. Redirecting...');

      setTimeout(() => {
        router.replace('/admin');
        router.refresh();
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to change password.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">🔐</div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00FF66]">
            Sportora Admin Center
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Secure Your Account
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            You are using a temporary password. Set your own password
            before accessing the Admin Center.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/50">
                Temporary Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-[#00FF66]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/50">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                maxLength={100}
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-[#00FF66]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-white/50">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                maxLength={100}
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-[#00FF66]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/10 px-4 py-3 text-xs font-semibold text-[#00FF66]">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#00FF66] to-emerald-400 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'SECURING ACCOUNT...' : 'SET NEW PASSWORD'}
          </button>
        </form>
      </div>
    </main>
  );
}
