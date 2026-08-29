'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type OrganizerRequest = {
  _id: string;
  organizationName: string;
  governmentIdType: string;
  governmentId: string;
  documentUrl: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  remarks?: string;
  organizer?: {
    _id?: string;
    fullName?: string;
    email?: string;
  };
  createdAt?: string;
};

type VenueRequest = {
  _id: string;
  tournament?: {
    _id?: string;
    title?: string;
    status?: string;
  };
  organizer?: {
    _id?: string;
    fullName?: string;
    email?: string;
  };
  venueName: string;
  venueAddress: string;
  city: string;
  state: string;
  pincode: string;
  venuePhotos: string[];
  venueVideos: string[];
  permissionDocs: string[];
  venueType?: string;
  bookingStatus?: string;
  proofType?: string;
  venueContactName?: string;
  venueContactPhone?: string;
  expectedBookingDate?: string;
  venueCommunication?: string;
  status: string;
  remarks?: string;
  proofDeadline?: string;
  createdAt?: string;
};

type Tournament = {
  _id: string;
  title: string;
  sport: string;
  format: string;
  type: string;
  competitionType?: string;
  city: string;
  state: string;
  locationName: string;
  pincode: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  registeredParticipants: number;
  entryFee: number;
  prizePool: number;
  status: string;
  organizerId?: string;
  aiRiskScore?: number;
  aiRiskAnalysis?: string;
};

type ActionState = {
  id: string;
  action: string;
} | null;

type SupportTicket = {
  _id: string;
  category: 'TOURNAMENT' | 'ORGANIZER' | 'ACCOUNT';
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  adminResponse?: string | null;
  tournamentId?: {
    _id?: string;
    title?: string;
    sport?: string;
    city?: string;
    state?: string;
    locationName?: string;
    status?: string;
  } | string | null;
  registrationId?: {
    _id?: string;
    status?: string;
    ticketId?: string;
    registeredAt?: string;
  } | string | null;
  paymentContext?: {
    status?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
    paymentId?: string | null;
  } | null;
  userId?: {
    _id?: string;
    fullName?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function AdminDashboardClient() {
  const [organizers, setOrganizers] = useState<OrganizerRequest[]>([]);
  const [venues, setVenues] = useState<VenueRequest[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState('');
  const [supportUpdatingId, setSupportUpdatingId] = useState<string | null>(null);
  const [supportEditingId, setSupportEditingId] = useState<string | null>(null);
  const [supportDetailsId, setSupportDetailsId] = useState<string | null>(null);
const [organizerDetailsId, setOrganizerDetailsId] = useState<string | null>(null);
const [venueDetailsId, setVenueDetailsId] = useState<string | null>(null);
const [tournamentDetailsId, setTournamentDetailsId] = useState<string | null>(null);
const [supportStatusFilter, setSupportStatusFilter] =
  useState<SupportTicket['status']>('OPEN');
  const [supportDrafts, setSupportDrafts] = useState<
    Record<
      string,
      {
        status: SupportTicket['status'];
        priority: SupportTicket['priority'];
        adminResponse: string;
      }
    >
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState<ActionState>(null);

  const [remarksTarget, setRemarksTarget] = useState<{
    type: 'organizer' | 'venue' | 'tournament';
    id: string;
    action: 'reject' | 'more-proof';
  } | null>(null);

  const [remarks, setRemarks] = useState('');
  const [proofDeadline, setProofDeadline] = useState('');

  const [activeSection, setActiveSection] = useState<
    'overview' | 'organizers' | 'venues' | 'tournaments' | 'users' | 'reports' | 'support'
  >('overview');

  const [adminName, setAdminName] = useState('Administrator');
  const [greetingText, setGreetingText] = useState('');
  const [typedGreeting, setTypedGreeting] = useState('');

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminCreateMessage, setAdminCreateMessage] = useState('');
  const [adminCreateError, setAdminCreateError] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();

    const greeting =
      hour >= 5 && hour < 12
        ? 'Good morning'
        : hour >= 12 && hour < 17
          ? 'Good afternoon'
          : hour >= 17 && hour < 21
            ? 'Good evening'
            : 'Good evening';

    fetch('/api/user/profile', {
      credentials: 'include',
      cache: 'no-store',
    })
      .then((response) => response.json())
      .then((result) => {
        const name = result?.profile?.fullName?.trim() || 'Administrator';

        setAdminName(name);
        setGreetingText(`${greeting}, ${name} 👋`);
      })
      .catch(() => {
        setGreetingText(`${greeting}, Administrator 👋`);
      });
  }, []);

  useEffect(() => {
    if (!greetingText) return;

    setTypedGreeting('');
    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      setTypedGreeting(greetingText.slice(0, index));

      if (index >= greetingText.length) {
        window.clearInterval(timer);
      }
    }, 45);

    return () => window.clearInterval(timer);
  }, [greetingText]);

  const navigationItems = [
    { id: 'overview' as const, label: 'Overview', icon: '⌂' },
    { id: 'organizers' as const, label: 'Organizer Verification', icon: '🛡️' },
    { id: 'venues' as const, label: 'Venue Verification', icon: '📍' },
    { id: 'tournaments' as const, label: 'Tournament Approval', icon: '🏆' },
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'reports' as const, label: 'Reports', icon: '🚨' },
    { id: 'support' as const, label: 'Support Tickets', icon: '🎫' },
  ];

  const createNewAdmin = async () => {
    const fullName = newAdminName.trim();
    const email = newAdminEmail.trim().toLowerCase();

    setAdminCreateMessage('');
    setAdminCreateError('');

    if (!fullName || fullName.length < 2) {
      setAdminCreateError('Please enter a valid admin name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setAdminCreateError('Please enter a valid email address.');
      return;
    }

    try {
      setCreatingAdmin(true);

      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Failed to create admin account.',
        );
      }

      setAdminCreateMessage(
        data.message ||
          'Admin created successfully. Welcome email sent.',
      );
      setNewAdminName('');
      setNewAdminEmail('');
    } catch (err) {
      setAdminCreateError(
        err instanceof Error
          ? err.message
          : 'Failed to create admin account.',
      );
    } finally {
      setCreatingAdmin(false);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [organizerResponse, venueResponse, tournamentResponse] =
        await Promise.all([
          fetch('/api/admin/organizer-verification', {
            cache: 'no-store',
          }),
          fetch('/api/venue-verification/all', {
            cache: 'no-store',
          }),
          fetch('/api/admin/tournaments', {
            cache: 'no-store',
          }),
        ]);

      const [organizerData, venueData, tournamentData] =
        await Promise.all([
          organizerResponse.json(),
          venueResponse.json(),
          tournamentResponse.json(),
        ]);

      if (!organizerResponse.ok || !organizerData.success) {
        throw new Error(
          organizerData.error || 'Failed to load organizer verification.',
        );
      }

      if (!venueResponse.ok || !venueData.success) {
        throw new Error(
          venueData.error || 'Failed to load venue verification.',
        );
      }

      if (!tournamentResponse.ok || !tournamentData.success) {
        throw new Error(
          tournamentData.error || 'Failed to load tournaments.',
        );
      }

      setOrganizers(organizerData.data ?? []);
      setVenues(venueData.data ?? []);
      setTournaments(tournamentData.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Admin Portal data.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadSupportTickets = useCallback(async () => {
    try {
      setSupportLoading(true);
      setSupportError('');

      const response = await fetch('/api/admin/support', {
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || data.message || 'Failed to load support tickets.',
        );
      }

      setSupportTickets(data.tickets ?? []);
    } catch (err) {
      setSupportError(
        err instanceof Error
          ? err.message
          : 'Failed to load support tickets.',
      );
    } finally {
      setSupportLoading(false);
    }
  }, []);

  const updateSupportTicket = useCallback(
    async (ticket: SupportTicket) => {
      const draft = supportDrafts[ticket._id];

      if (!draft) {
        return;
      }

      try {
        setSupportUpdatingId(ticket._id);
        setSupportError('');

        const response = await fetch(
          `/api/admin/support?ticketId=${encodeURIComponent(ticket._id)}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(draft),
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              'Failed to update support ticket.',
          );
        }

        setSupportTickets((current) =>
          current.map((item) =>
            item._id === ticket._id ? data.ticket : item,
          ),
        );

        setSupportDrafts((current) => {
          const next = { ...current };
          delete next[ticket._id];
          return next;
        });

        setSupportEditingId(null);
      } catch (err) {
        setSupportError(
          err instanceof Error
            ? err.message
            : 'Failed to update support ticket.',
        );
      } finally {
        setSupportUpdatingId(null);
      }
    },
    [supportDrafts],
  );

  useEffect(() => {
    if (activeSection === 'support') {
      loadSupportTickets();
    }
  }, [activeSection, loadSupportTickets]);

  const pendingOrganizers = useMemo(
    () => organizers.filter((item) => item.status === 'PENDING'),
    [organizers],
  );

  const pendingVenues = useMemo(
    () =>
      venues.filter(
        (item) =>
          item.status === 'PENDING' ||
          item.status === 'MORE_PROOF_REQUIRED',
      ),
    [venues],
  );

  const pendingTournaments = useMemo(
    () =>
      tournaments.filter(
        (item) => item.status === 'PENDING_APPROVAL',
      ),
    [tournaments],
  );

  const runAction = async (
    type: 'organizer' | 'venue' | 'tournament',
    id: string,
    endpoint: string,
    body: Record<string, unknown> = {},
  ) => {
    try {
      setAction({ id, action: endpoint });

      const basePath =
        type === 'organizer'
          ? '/api/admin/organizer-verification'
          : type === 'venue'
            ? '/api/venue-verification'
            : '/api/admin/tournaments';

      const response = await fetch(`${basePath}/${id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || data.message || 'Action failed.',
        );
      }

      setRemarksTarget(null);
      setRemarks('');
      setProofDeadline('');

      await loadData();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Action failed.',
      );
    } finally {
      setAction(null);
    }
  };

  const submitRemarksAction = async () => {
    if (!remarksTarget) return;

    const body: Record<string, unknown> = {
      remarks: remarks.trim(),
    };

    if (remarksTarget.action === 'more-proof' && proofDeadline) {
      body.proofDeadline = new Date(
        `${proofDeadline}T23:59:59`,
      ).toISOString();
    }

    await runAction(
      remarksTarget.type,
      remarksTarget.id,
      remarksTarget.action,
      body,
    );
  };

  const isBusy = (id: string, endpoint: string) =>
    action?.id === id && action.action === endpoint;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10">
            <p className="text-sm text-slate-400">
              Loading Sportora Admin Control Center...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">

        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-900/70 lg:flex lg:flex-col">
          <div className="border-b border-slate-800 p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">
              SPORTORA
            </p>
            <h2 className="mt-1 text-xl font-black">Admin Center</h2>
            <p className="mt-1 text-sm text-slate-300">
              Platform management
            </p>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {navigationItems.map((item) => {
              const count =
                item.id === 'organizers'
                  ? pendingOrganizers.length
                  : item.id === 'venues'
                    ? pendingVenues.length
                    : item.id === 'tournaments'
                      ? pendingTournaments.length
                      : 0;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeSection === item.id
                      ? 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>

                  {count > 0 && (
                    <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-black text-rose-300">
                      {count}
                    </span>
                  )}

                  {(item.id === 'users' || item.id === 'reports') && (
                    <span className="text-[9px] font-bold uppercase text-slate-600">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Pending Reviews
              </p>
              <p className="mt-2 text-2xl font-black">
                {pendingOrganizers.length +
                  pendingVenues.length +
                  pendingTournaments.length}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Items need your attention
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl space-y-8 p-5 md:p-8">

            <div className="overflow-x-auto lg:hidden">
              <div className="flex min-w-max gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                      activeSection === item.id
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              SPORTORA ADMIN
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Control Center
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Review organizers, venue proofs and tournament approvals.
            </p>
          </div>

          <button
            onClick={loadData}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-sky-500 hover:bg-slate-800"
          >
            ↻ Refresh
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {activeSection === 'overview' && (
        <>
          <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 p-6 md:p-8">
            <p className="min-h-[2.5rem] text-2xl font-black tracking-tight text-white md:text-3xl">
              {typedGreeting}
              {typedGreeting && typedGreeting !== greetingText && (
                <span className="ml-1 inline-block h-6 w-0.5 animate-pulse bg-sky-400 align-middle md:h-8" />
              )}
            </p>
            <p className="mt-2 text-sm text-slate-400 md:text-base">
              Here&apos;s what needs your attention today.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => setActiveSection('organizers')}
              className="group rounded-2xl border border-amber-500/20 bg-slate-900 p-5 text-left transition hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-slate-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-400">
                    🛡️ Organizers
                  </p>
                  <p className="mt-3 text-4xl font-black">
                    {pendingOrganizers.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Awaiting verification
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 transition group-hover:text-amber-300">
                  Review →
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('venues')}
              className="group rounded-2xl border border-purple-500/20 bg-slate-900 p-5 text-left transition hover:-translate-y-0.5 hover:border-purple-400/40 hover:bg-slate-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-400">
                    📍 Venues
                  </p>
                  <p className="mt-3 text-4xl font-black">
                    {pendingVenues.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Awaiting review
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 transition group-hover:text-purple-300">
                  Review →
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('tournaments')}
              className="group rounded-2xl border border-sky-500/20 bg-slate-900 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-slate-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-sky-400">
                    🏆 Tournaments
                  </p>
                  <p className="mt-3 text-4xl font-black">
                    {pendingTournaments.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Awaiting approval
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 transition group-hover:text-sky-300">
                  Review →
                </span>
              </div>
            </button>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-black">Needs Attention</h2>
              <p className="mt-1 text-sm text-slate-300">
                Items that currently need your review.
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              <button
                onClick={() => setActiveSection('organizers')}
                className="flex w-full items-center gap-3 py-4 text-left transition hover:text-white"
              >
                <span className="text-lg">🛡️</span>
                <span className="flex-1 text-sm text-slate-300">
                  <strong className="font-bold text-white">
                    {pendingOrganizers.length}
                  </strong>{' '}
                  organizer{pendingOrganizers.length === 1 ? '' : 's'} awaiting verification
                </span>
                <span className="text-xs font-bold text-sky-400">
                  Review →
                </span>
              </button>

              <button
                onClick={() => setActiveSection('venues')}
                className="flex w-full items-center gap-3 py-4 text-left transition hover:text-white"
              >
                <span className="text-lg">📍</span>
                <span className="flex-1 text-sm text-slate-300">
                  <strong className="font-bold text-white">
                    {pendingVenues.length}
                  </strong>{' '}
                  venue submission{pendingVenues.length === 1 ? '' : 's'} awaiting review
                </span>
                <span className="text-xs font-bold text-sky-400">
                  Review →
                </span>
              </button>

              <button
                onClick={() => setActiveSection('tournaments')}
                className="flex w-full items-center gap-3 py-4 text-left transition hover:text-white"
              >
                <span className="text-lg">🏆</span>
                <span className="flex-1 text-sm text-slate-300">
                  <strong className="font-bold text-white">
                    {pendingTournaments.length}
                  </strong>{' '}
                  tournament{pendingTournaments.length === 1 ? '' : 's'} awaiting approval
                </span>
                <span className="text-xs font-bold text-sky-400">
                  Review →
                </span>
              </button>
            </div>
          </section>
        </>
        )}

        {/* ORGANIZER VERIFICATION */}
        {activeSection === 'organizers' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-black">
              🛡️ Organizer Verification
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verify the identity and legitimacy of organizers.
            </p>
          </div>

          {pendingOrganizers.length === 0 ? (
            <EmptyState text="No pending organizer verification requests." />
          ) : (
            <div className="grid gap-4">
              {pendingOrganizers.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold">
                          {item.organizationName}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {item.organizer?.fullName || 'Unknown organizer'}
                          {' • '}
                          {item.organizer?.email || 'No email'}
                        </p>
                      </div>

                      <div className="grid gap-3 text-sm md:grid-cols-2">
                        <Info label="Government ID">
                          {item.governmentIdType}: {item.governmentId}
                        </Info>
                        <Info label="Address">
                          {item.address}, {item.city}, {item.state} -{' '}
                          {item.pincode}
                        </Info>
                      </div>

                      {item.documentUrl && (
                        <a
                          href={item.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-sm font-semibold text-sky-400 hover:text-sky-300"
                        >
                          📄 Open ID Proof
                        </a>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 lg:w-44">
                        <button
                          disabled={Boolean(action)}
                          onClick={() =>
                            runAction(
                              'organizer',
                              item._id,
                              'approve',
                            )
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {isBusy(item._id, 'approve')
                            ? 'Approving...'
                            : '✓ Approve'}
                        </button>

                        <button
                          disabled={Boolean(action)}
                          onClick={() => {
                            setRemarksTarget({
                              type: 'organizer',
                              id: item._id,
                              action: 'reject',
                            });
                            setRemarks(item.remarks || '');
                          }}
                          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        )}

        {/* VENUE VERIFICATION */}
        {activeSection === 'venues' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-black">
              📍 Venue Verification
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Confirm that the tournament has credible venue and permission
              proof.
            </p>
          </div>

          {venues.length === 0 ? (
            <EmptyState text="No venue verification requests found." />
          ) : (
            <div className="grid gap-4">
              {venues.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="truncate text-lg font-black text-white">
                              {item.tournament?.title || 'Tournament'}
                            </h3>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                            {item.organizer?.fullName || 'Unknown organizer'}
                            {' • '}
                            {item.organizer?.email || 'No email'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setVenueDetailsId((current) =>
                              current === item._id ? null : item._id,
                            )
                          }
                          className="shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-black text-slate-200 transition hover:border-sky-500 hover:bg-slate-800 hover:text-white"
                        >
                          {venueDetailsId === item._id
                            ? 'Hide Details'
                            : 'View Details →'}
                        </button>
                      </div>

                      {venueDetailsId === item._id && (
                        <div className="mt-5 space-y-4">
                          <div className="grid gap-3 text-sm md:grid-cols-2">
                        <Info label="Venue">
                          {item.venueName}
                        </Info>
                        <Info label="Location">
                          {item.venueAddress}, {item.city},{' '}
                          {item.state} - {item.pincode}
                        </Info>
                      </div>

                      <div className="grid gap-3 text-sm md:grid-cols-2">
                        <Info label="Venue Type">
                          {item.venueType?.replaceAll('_', ' ') || 'Not specified'}
                        </Info>

                        <Info label="Booking Status">
                          {item.bookingStatus === 'NOT_BOOKED_YET'
                            ? 'Not Booked Yet'
                            : item.bookingStatus?.replaceAll('_', ' ') || 'Not specified'}
                        </Info>

                        <Info label="Proof Type">
                          {item.proofType?.replaceAll('_', ' ') || 'Not specified'}
                        </Info>

                        <Info label="Venue Contact">
                          {item.venueContactName || 'Not provided'}
                          {item.venueContactPhone
                            ? ` • ${item.venueContactPhone}`
                            : ''}
                        </Info>

                        {item.bookingStatus === 'NOT_BOOKED_YET' &&
                          item.expectedBookingDate && (
                            <Info label="Expected Booking Date">
                              {new Date(
                                item.expectedBookingDate,
                              ).toLocaleDateString()}
                            </Info>
                          )}
                      </div>

                      {item.bookingStatus === 'NOT_BOOKED_YET' &&
                        item.venueCommunication && (
                          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-sm text-sky-200">
                            <span className="font-bold">
                              Venue Communication / Booking Plan:
                            </span>{' '}
                            {item.venueCommunication}
                          </div>
                        )}

                      {item.remarks && (
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200">
                          <span className="font-bold">Remarks:</span>{' '}
                          {item.remarks}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {item.venuePhotos.map((url, index) => (
                          <a
                            key={`photo-${index}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-sky-400 hover:border-sky-500"
                          >
                            📷 Photo {index + 1}
                          </a>
                        ))}

                        {item.venueVideos.map((url, index) => (
                          <a
                            key={`video-${index}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-sky-400 hover:border-sky-500"
                          >
                            🎥 Video {index + 1}
                          </a>
                        ))}

                        {item.permissionDocs.map((url, index) => (
                          <a
                            key={`doc-${index}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-sky-400 hover:border-sky-500"
                          >
                            📄 Permission {index + 1}
                          </a>
                        ))}
                      </div>

                      {item.status === 'PENDING' && (
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <button
                            disabled={Boolean(action)}
                            onClick={() =>
                              runAction('venue', item._id, 'approve')
                            }
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {isBusy(item._id, 'approve')
                              ? 'Approving...'
                              : '✓ Approve'}
                          </button>

                          <button
                            disabled={Boolean(action)}
                            onClick={() => {
                              setRemarksTarget({
                                type: 'venue',
                                id: item._id,
                                action: 'more-proof',
                              });
                              setRemarks(item.remarks || '');
                            }}
                            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                          >
                            + More Proof
                          </button>

                          <button
                            disabled={Boolean(action)}
                            onClick={() => {
                              setRemarksTarget({
                                type: 'venue',
                                id: item._id,
                                action: 'reject',
                              });
                              setRemarks(item.remarks || '');
                            }}
                            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        )}

        {/* TOURNAMENT APPROVAL */}
        {activeSection === 'tournaments' && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-black">
              🏆 Tournament Approval
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Final approval happens only after venue verification is approved.
            </p>
          </div>

          {pendingTournaments.length === 0 ? (
            <EmptyState text="No tournaments are waiting for approval." />
          ) : (
            <div className="grid gap-4">
              {pendingTournaments.map((item) => (
                <article
                  key={item._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="truncate text-lg font-black text-white">
                            {item.title}
                          </h3>
                          <StatusBadge status={item.status} />
                        </div>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                          {item.sport} • {item.competitionType || item.type}
                          {' • '}
                          {item.city}, {item.state}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTournamentDetailsId((current) =>
                            current === item._id ? null : item._id,
                          )
                        }
                        className="shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-black text-slate-200 transition hover:border-sky-500 hover:bg-slate-800 hover:text-white"
                      >
                        {tournamentDetailsId === item._id
                          ? 'Hide Details'
                          : 'View Details →'}
                      </button>
                    </div>

                    {tournamentDetailsId === item._id && (
                      <div className="mt-5 space-y-4">
                        <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                          <Info label="Sport">
                            {item.sport}
                          </Info>

                          <Info label="Format">
                            {item.format}
                          </Info>

                          <Info label="Competition Type">
                            {item.competitionType || item.type}
                          </Info>

                          <Info label="Venue">
                            {item.locationName}
                          </Info>

                          <Info label="Location">
                            {item.city}, {item.state} - {item.pincode}
                          </Info>

                          <Info label="Dates">
                            {formatDate(item.startDate)} →{' '}
                            {formatDate(item.endDate)}
                          </Info>

                          <Info label="Registration Deadline">
                            {formatDate(item.registrationDeadline)}
                          </Info>

                          <Info label="Participants">
                            {item.registeredParticipants}/{item.maxParticipants}
                          </Info>

                          <Info label="Entry Fee">
                            ₹{item.entryFee.toLocaleString('en-IN')}
                          </Info>

                          <Info label="Prize Pool">
                            ₹{item.prizePool.toLocaleString('en-IN')}
                          </Info>
                        </div>

                        {(typeof item.aiRiskScore === 'number' ||
                          item.aiRiskAnalysis) && (
                          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-sm text-sky-200">
                            {typeof item.aiRiskScore === 'number' && (
                              <span className="font-bold">
                                AI Risk Score: {item.aiRiskScore}
                              </span>
                            )}

                            {item.aiRiskAnalysis && (
                              <p className="mt-1">
                                {item.aiRiskAnalysis}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            disabled={Boolean(action)}
                            onClick={() =>
                              runAction(
                                'tournament',
                                item._id,
                                'approve',
                              )
                            }
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {isBusy(item._id, 'approve')
                              ? 'Approving...'
                              : '✓ Approve'}
                          </button>

                          <button
                            disabled={Boolean(action)}
                            onClick={() => {
                              setRemarksTarget({
                                type: 'tournament',
                                id: item._id,
                                action: 'reject',
                              });
                              setRemarks('');
                            }}
                            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </article>
              ))}
            </div>
          )}
        </section>
        )}

        {activeSection === 'users' && (
          <section className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">
                  Administration
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Admin Management
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Create authorized Sportora administrators and send them a
                  secure temporary login password.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-xl">
                    👤
                  </div>
                  <div>
                    <h3 className="font-black">Create New Admin</h3>
                    <p className="text-xs text-slate-500">
                      Only existing admins can create admin accounts.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Full Name
                    </label>
                    <input
                      value={newAdminName}
                      onChange={(event) =>
                        setNewAdminName(event.target.value)
                      }
                      placeholder="Enter admin name"
                      disabled={creatingAdmin}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(event) =>
                        setNewAdminEmail(event.target.value)
                      }
                      placeholder="admin@example.com"
                      disabled={creatingAdmin}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 disabled:opacity-50"
                    />
                  </div>

                  {adminCreateError && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                      {adminCreateError}
                    </div>
                  )}

                  {adminCreateMessage && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                      {adminCreateMessage}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={createNewAdmin}
                    disabled={creatingAdmin}
                    className="w-full rounded-xl bg-sky-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingAdmin ? 'Creating Admin...' : 'Create New Admin'}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="text-3xl">🛡️</div>
                <h3 className="mt-4 font-black">Secure Onboarding</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  New administrators receive a temporary password by email.
                  Their first login is required to complete a password change
                  before accessing the Admin Center.
                </p>

                <div className="mt-5 space-y-3 text-xs text-slate-400">
                  <div className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span>ADMIN role assigned automatically</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span>Temporary password is generated securely</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span>First login requires password change</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'support' && (
          <section>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-400">
                  Support
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Support Tickets
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Review and manage player and organizer support requests.
                </p>
              </div>

              <button
                onClick={loadSupportTickets}
                disabled={supportLoading}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                {supportLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {supportError && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {supportError}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['OPEN', 'Open'],
                ['IN_PROGRESS', 'In Progress'],
                ['RESOLVED', 'Resolved'],
                ['CLOSED', 'Closed'],
              ].map(([status, label]) => {
                const count = supportTickets.filter(
                  (ticket) => ticket.status === status,
                ).length;

                const isActive = supportStatusFilter === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setSupportStatusFilter(
                        status as SupportTicket['status'],
                      )
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      isActive
                        ? 'border-sky-500/60 bg-sky-500/10 shadow-lg shadow-sky-500/5'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isActive ? 'text-sky-300' : 'text-slate-500'
                      }`}
                    >
                      {label}
                    </p>

                    <p className="mt-2 text-3xl font-black text-white">
                      {count}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Click to view
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
              {supportLoading ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  Loading support tickets...
                </div>
              ) : supportTickets.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="text-4xl">🎫</div>
                  <h3 className="mt-3 font-black">
                    No support tickets
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    There are no support requests to review.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                  {(() => {
                    const filteredTickets = supportTickets.filter(
                      (ticket) => ticket.status === supportStatusFilter,
                    );

                    return filteredTickets.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="text-4xl">🎫</div>
                        <h3 className="mt-3 font-black text-white">
                          No {supportStatusFilter.replace('_', ' ').toLowerCase()} tickets
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          There are no tickets in this status.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800">
                        {filteredTickets.map((ticket) => {
                    const draft = supportDrafts[ticket._id] ?? {
                      status: ticket.status,
                      priority: ticket.priority,
                      adminResponse: ticket.adminResponse ?? '',
                    };

                    const hasChanges =
                      draft.status !== ticket.status ||
                      draft.priority !== ticket.priority ||
                      draft.adminResponse !== (ticket.adminResponse ?? '');

                    return (
                      <div
                        key={ticket._id}
                        className="p-5 transition hover:bg-slate-900"
                      >
                        <div className="flex flex-col gap-5">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
                                #{ticket._id.slice(-8)}
                              </span>

                              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-300">
                                {ticket.category}
                              </span>

                              <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
                                {ticket.priority}
                              </span>

                              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                                {ticket.status.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <h3 className="text-base font-black text-white">
                                  {ticket.subject}
                                </h3>

                                <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                                  {ticket.userId?.fullName || 'Unknown user'}
                                  {ticket.userId?.email
                                    ? ` • ${ticket.userId.email}`
                                    : ''}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setSupportDetailsId((current) =>
                                    current === ticket._id ? null : ticket._id,
                                  )
                                }
                                className="shrink-0 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-black text-slate-200 transition hover:border-sky-500 hover:bg-slate-800 hover:text-white"
                              >
                                {supportDetailsId === ticket._id
                                  ? 'Hide Details'
                                  : 'View Details →'}
                              </button>
                            </div>

                            {supportDetailsId === ticket._id && (
                              <div className="mt-5">
                                <p className="text-sm leading-6 text-slate-300">
                                  {ticket.description}
                                </p>

                                <p className="mt-3 text-xs text-slate-500">
                                  Submitted {new Date(ticket.createdAt).toLocaleString()}
                                </p>
                              </div>
                            )}

                            {supportDetailsId === ticket._id &&
                              (ticket.tournamentId ||
                              ticket.registrationId ||
                              ticket.paymentContext) && (
                              <div className="mt-4 rounded-2xl border border-sky-500/10 bg-sky-500/[0.03] p-4">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
                                  Related Context
                                </p>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {ticket.tournamentId &&
                                    typeof ticket.tournamentId === 'object' && (
                                      <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                          Tournament
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-200">
                                          {ticket.tournamentId.title || 'Unknown tournament'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-300">
                                          {[
                                            ticket.tournamentId.sport,
                                            ticket.tournamentId.city,
                                            ticket.tournamentId.state,
                                          ]
                                            .filter(Boolean)
                                            .join(' • ')}
                                        </p>
                                        {ticket.tournamentId.status && (
                                          <p className="mt-1 text-sm text-slate-300">
                                            Status: {ticket.tournamentId.status}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                  {ticket.registrationId &&
                                    typeof ticket.registrationId === 'object' && (
                                      <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                          Registration
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-slate-200">
                                          {ticket.registrationId.status || 'Unknown status'}
                                        </p>
                                        {ticket.registrationId.ticketId && (
                                          <p className="mt-1 text-sm text-slate-300">
                                            Ticket: {ticket.registrationId.ticketId}
                                          </p>
                                        )}
                                        {ticket.registrationId._id && (
                                          <p className="mt-1 break-all text-xs text-slate-400">
                                            ID: {ticket.registrationId._id}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                  {ticket.paymentContext && (
                                    <div>
                                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Payment
                                      </p>
                                      <p className="mt-1 text-sm font-bold text-slate-200">
                                        {ticket.paymentContext.status || 'Unknown'}
                                        {typeof ticket.paymentContext.amount === 'number'
                                          ? ` • ${ticket.paymentContext.currency || 'INR'} ${ticket.paymentContext.amount}`
                                          : ''}
                                      </p>
                                      {ticket.paymentContext.orderId && (
                                        <p className="mt-1 break-all text-sm text-slate-400">
                                          Order: {ticket.paymentContext.orderId}
                                        </p>
                                      )}
                                      {ticket.paymentContext.paymentId && (
                                        <p className="mt-1 break-all text-sm text-slate-400">
                                          Payment: {ticket.paymentContext.paymentId}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {supportDetailsId === ticket._id &&
                            (supportEditingId === ticket._id ? (
                            <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Status
                              <select
                                value={draft.status}
                                onChange={(event) =>
                                  setSupportDrafts((current) => ({
                                    ...current,
                                    [ticket._id]: {
                                      ...draft,
                                      status: event.target
                                        .value as SupportTicket['status'],
                                    },
                                  }))
                                }
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-sky-500"
                              >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            </label>

                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Priority
                              <select
                                value={draft.priority}
                                onChange={(event) =>
                                  setSupportDrafts((current) => ({
                                    ...current,
                                    [ticket._id]: {
                                      ...draft,
                                      priority: event.target
                                        .value as SupportTicket['priority'],
                                    },
                                  }))
                                }
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-sky-500"
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </select>
                            </label>

                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 md:col-span-2">
                              Admin Response
                              <textarea
                                value={draft.adminResponse}
                                onChange={(event) =>
                                  setSupportDrafts((current) => ({
                                    ...current,
                                    [ticket._id]: {
                                      ...draft,
                                      adminResponse: event.target.value,
                                    },
                                  }))
                                }
                                maxLength={2000}
                                rows={4}
                                placeholder="Write a response for the user..."
                                className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-500"
                              />
                              <span className="mt-1 block text-right text-[10px] text-slate-600">
                                {draft.adminResponse.length}/2000
                              </span>
                            </label>

                            <div className="md:col-span-2 flex justify-end gap-3">
                              <button
                                onClick={() => {
                                  setSupportDrafts((current) => {
                                    const next = { ...current };
                                    delete next[ticket._id];
                                    return next;
                                  });
                                  setSupportEditingId(null);
                                }}
                                disabled={supportUpdatingId === ticket._id}
                                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-black text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Cancel
                              </button>

                              <button
                                onClick={() => updateSupportTicket(ticket)}
                                disabled={
                                  !hasChanges ||
                                  supportUpdatingId === ticket._id
                                }
                                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {supportUpdatingId === ticket._id
                                  ? 'Saving...'
                                  : 'Save Changes'}
                              </button>
                            </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Current Status
                                </p>
                                <p className="mt-1 text-sm font-bold text-slate-200">
                                  {ticket.status.replace('_', ' ')}
                                  <span className="mx-2 text-slate-700">•</span>
                                  {ticket.priority} priority
                                </p>
                                {ticket.adminResponse && (
                                  <p className="mt-2 text-sm text-slate-400">
                                    Admin response: {ticket.adminResponse}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  setSupportDrafts((current) => ({
                                    ...current,
                                    [ticket._id]: {
                                      status: ticket.status,
                                      priority: ticket.priority,
                                      adminResponse: ticket.adminResponse ?? '',
                                    },
                                  }));
                                  setSupportEditingId(ticket._id);
                                }}
                                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-black text-slate-200 transition hover:border-sky-500 hover:bg-slate-800 hover:text-white"
                              >
                                ✏️ Edit Ticket
                              </button>
                            </div>
                          ))}

                        </div>
                      </div>
                    );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'reports' && (
          <section className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-12 text-center">
            <div className="text-4xl">🚨</div>
            <h2 className="mt-4 text-xl font-black">Reports</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              This module is planned for a future phase.
            </p>
            <span className="mt-5 inline-flex rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Coming Soon
            </span>
          </section>
        )}

          </div>
        </div>
      </div>

      {remarksTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-xl font-black">
              {remarksTarget.action === 'more-proof'
                ? 'Request More Proof'
                : 'Add Review Remarks'}
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              {remarksTarget.action === 'more-proof'
                ? 'Tell the organizer exactly what additional proof is required.'
                : 'These remarks will be stored with the review decision.'}
            </p>

            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Enter remarks..."
              rows={4}
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-sky-500"
            />

            {remarksTarget.action === 'more-proof' && (
              <div className="mt-4">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Proof Deadline
                </label>
                <input
                  type="date"
                  value={proofDeadline}
                  onChange={(event) =>
                    setProofDeadline(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-sky-500"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRemarksTarget(null);
                  setRemarks('');
                  setProofDeadline('');
                }}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={submitRemarksAction}
                disabled={Boolean(action)}
                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold hover:bg-sky-500 disabled:opacity-50"
              >
                {action ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-200">{children}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'APPROVED'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
      : status === 'REJECTED'
        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
        : status === 'MORE_PROOF_REQUIRED'
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
          : 'bg-sky-500/10 text-sky-300 border-sky-500/20';

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${styles}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-500">
      ✓ {text}
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
