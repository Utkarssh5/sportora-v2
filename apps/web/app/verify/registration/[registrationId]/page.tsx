'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  CalendarDays,
  MapPin,
  User,
  CreditCard,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface VerificationData {
  success: boolean;
  valid: boolean;
  message: string;
  registration?: {
    id: string;
    status: string;
    registeredAt: string;
  };
  player?: {
    fullName: string;
  };
  tournament?: {
    id: string;
    title: string;
    sport: string;
    format: string;
    startDate: string;
    endDate: string;
    locationName: string;
    city: string;
    state: string;
  };
  payment?: {
    status: string | null;
  };
}

export default function RegistrationVerificationPage() {
  const params = useParams();
  const registrationId = params.registrationId as string;

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const response = await fetch(
          `/api/tournament-registration/verify/${registrationId}`,
          {
            cache: 'no-store',
          },
        );

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Verification failed:', error);
        setData({
          success: false,
          valid: false,
          message: 'Unable to verify registration',
        });
      } finally {
        setLoading(false);
      }
    }

    if (registrationId) {
      verify();
    }
  }, [registrationId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#00FF66] animate-spin mx-auto" />
          <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-gray-400">
            Verifying Registration
          </p>
        </div>
      </main>
    );
  }

  const valid = data?.valid === true;

  return (
    <main className="min-h-screen bg-[#050505] text-white px-4 py-10 md:py-16">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#00FF66]" />
            <span className="text-[#00FF66] font-black tracking-[0.25em] text-sm">
              SPORTORA
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight mt-4">
            Registration Verification
          </h1>
        </div>

        <div
          className={`rounded-3xl border p-6 md:p-8 ${
            valid
              ? 'border-[#00FF66]/30 bg-[#00FF66]/5'
              : 'border-red-500/30 bg-red-500/5'
          }`}
        >
          <div className="text-center">

            {valid ? (
              <CheckCircle2 className="w-20 h-20 text-[#00FF66] mx-auto" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            )}

            <h2
              className={`text-3xl font-black uppercase italic mt-4 ${
                valid ? 'text-[#00FF66]' : 'text-red-500'
              }`}
            >
              {valid ? 'Valid Registration' : 'Invalid Registration'}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              {data?.message}
            </p>
          </div>

          {valid && data?.tournament && data?.player && (
            <div className="mt-8 space-y-3">

              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-[#00FF66]" />
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase font-black">
                      Tournament
                    </p>
                    <p className="text-lg font-black uppercase">
                      {data.tournament.title}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <User className="w-4 h-4 text-[#00FF66] mb-2" />
                  <p className="text-[9px] text-gray-500 uppercase font-black">
                    Player
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {data.player.fullName}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <CreditCard className="w-4 h-4 text-[#00FF66] mb-2" />
                  <p className="text-[9px] text-gray-500 uppercase font-black">
                    Payment
                  </p>
                  <p className="text-sm font-black text-[#00FF66] mt-1">
                    {data.payment?.status || 'UNKNOWN'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <CalendarDays className="w-4 h-4 text-[#00FF66] mb-2" />
                  <p className="text-[9px] text-gray-500 uppercase font-black">
                    Event Date
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {new Date(
                      data.tournament.startDate,
                    ).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <MapPin className="w-4 h-4 text-[#00FF66] mb-2" />
                  <p className="text-[9px] text-gray-500 uppercase font-black">
                    Venue
                  </p>
                  <p className="text-sm font-bold mt-1">
                    {data.tournament.locationName}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {data.tournament.city},{' '}
                    {data.tournament.state}
                  </p>
                </div>

              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mt-3">
                <p className="text-[9px] text-gray-500 uppercase font-black">
                  Registration ID
                </p>
                <p className="text-xs text-[#00FF66] font-mono font-bold mt-1 break-all">
                  {data.registration?.id}
                </p>
              </div>

              <div className="rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/5 p-4 text-center mt-5">
                <p className="text-[10px] text-[#00FF66] font-black uppercase tracking-[0.15em]">
                  ✓ Registered & Payment Verified
                </p>
                <p className="text-[10px] text-gray-500 mt-2">
                  Present this verification at the tournament venue.
                </p>
              </div>

            </div>
          )}
        </div>

        <p className="text-center text-[9px] text-gray-600 uppercase tracking-[0.2em] mt-8">
          Sportora Tournament Verification System
        </p>

      </div>
    </main>
  );
}
