'use client';

import ParticipationDetailsModal from './ParticipationDetailsModal';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  ArrowUpRight,
  X,
  CreditCard,
  User,
  CheckCircle,
  CheckCircle2,
  ArrowRight,
  Users,
  Trophy,
  Clock3,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface BackendTournament {
  _id: string;
  organizerId: string;
  title: string;
  sport: string;
  format: string;
  type: string;
  competitionType?: string;
  competitionRules?: {
    participantCount: number;
    requiresRoster: boolean;
    defaultPlayingSize?: number;
    allowsSubstitutes?: boolean;
    requiresMixedGender?: boolean;
  };
  city: string;
  state: string;
  locationName: string;
  pincode?: string;
  venuePhotos?: string[];
  venueVideos?: string[];
  permissionDocs?: string[];
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  sponsors?: {
    name: string;
    logoUrl?: string;
    _id?: string;
  }[];
  status: string;
  aiRiskScore: number;
  aiRiskAnalysis?: string;
  registeredParticipants: number;
}

interface GridProps {
  query?: string;
  limit?: number;
  city?: string;
  state?: string;
  sport?: string;
  competitionType?: string;
  format?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
  minEntryFee?: string;
  maxEntryFee?: string;
  homepageFeatured?: boolean;
}

interface TournamentRegistration {
  _id: string;
  status: string;
  registeredAt: string;
  paymentStatus?: string | null;
  tournamentId: {
    _id: string;
  };
}

type RegistrationState =
  | 'idle'
  | 'registering'
  | 'success'
  | 'error';

function formatCurrency(value: number) {
  if (value === 0) return 'FREE';

  return `₹${value.toLocaleString('en-IN')}`;
}

function formatDateRange(
  startDate: string,
  endDate: string,
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  const startText = start.toLocaleDateString(
    'en-IN',
    options,
  );

  const endText = end.toLocaleDateString(
    'en-IN',
    options,
  );

  return `${startText} — ${endText}`;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSportIcon(sport: string) {
  const normalized = sport.toLowerCase();

  if (normalized.includes('football')) return '⚽';
  if (normalized.includes('cricket')) return '🏏';
  if (normalized.includes('badminton')) return '🏸';
  if (normalized.includes('tennis')) return '🎾';
  if (normalized.includes('basketball')) return '🏀';
  if (normalized.includes('volleyball')) return '🏐';

  return '🏆';
}

function getTournamentDisplayStatus(
  tournament: BackendTournament,
) {
  const now = Date.now();
  const start = new Date(tournament.startDate).getTime();
  const end = new Date(tournament.endDate).getTime();

  if (tournament.status === 'PENDING_APPROVAL') {
    return 'pending';
  }

  if (tournament.status === 'REJECTED') {
    return 'rejected';
  }

  if (
    tournament.status === 'COMPLETED' ||
    end < now
  ) {
    return 'completed';
  }

  if (
    tournament.status === 'APPROVED' &&
    start <= now &&
    end >= now
  ) {
    return 'live';
  }

  if (
    tournament.status === 'APPROVED' &&
    start > now
  ) {
    return 'upcoming';
  }

  return 'pending';
}

function getEmptyStateContent(
  status: string,
  query: string,
  city: string,
  sport: string,
) {
  const knownSports = [
    'football',
    'cricket',
    'badminton',
    'basketball',
    'volleyball',
    'table tennis',
    'tennis',
    'hockey',
    'chess',
  ];

  const selectedSport = sport.trim();
  const searchTerm = query.trim().toLowerCase();

  const detectedSport =
    selectedSport ||
    (knownSports.includes(searchTerm) ? searchTerm : '');

  if (detectedSport) {
    const formattedSport = detectedSport
      .split(' ')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase(),
      )
      .join(' ');

    if (status === 'pending') {
      return {
        icon: '◐',
        title: `NO ${formattedSport.toUpperCase()} TOURNAMENTS AWAITING APPROVAL`,
        description:
          `There are currently no ${formattedSport} tournaments waiting for approval.`,
      };
    }

    if (status === 'upcoming') {
      return {
        icon: '◷',
        title: `NO UPCOMING ${formattedSport.toUpperCase()} TOURNAMENTS`,
        description:
          `There are no upcoming ${formattedSport} tournaments available right now. Check back soon for new events.`,
      };
    }

    if (status === 'live') {
      return {
        icon: '●',
        title: `NO LIVE ${formattedSport.toUpperCase()} TOURNAMENTS`,
        description:
          `There are no ${formattedSport} tournaments happening right now. Explore upcoming competitions instead.`,
      };
    }

    if (status === 'completed') {
      return {
        icon: '✓',
        title: `NO COMPLETED ${formattedSport.toUpperCase()} TOURNAMENTS`,
        description:
          `There are no completed ${formattedSport} tournaments in this selection.`,
      };
    }

    return {
      icon: '🏆',
      title: `NO ${formattedSport.toUpperCase()} TOURNAMENTS YET`,
      description:
        `There are currently no ${formattedSport} tournaments available. Check back soon or explore another sport.`,
    };
  }

  if (query || city) {
    return {
      icon: '⌁',
      title: 'NO MATCHES FOUND',
      description:
        'Try adjusting your search or filters to discover more tournaments.',
    };
  }

  switch (status) {
    case 'pending':
      return {
        icon: '◐',
        title: 'NO TOURNAMENTS AWAITING APPROVAL',
        description:
          'There are currently no tournaments waiting for approval.',
      };

    case 'upcoming':
      return {
        icon: '◷',
        title: 'NO UPCOMING TOURNAMENTS',
        description:
          'No upcoming competitions are available right now. Check back soon for new events.',
      };

    case 'live':
      return {
        icon: '●',
        title: 'NO LIVE ARENA RIGHT NOW',
        description:
          'There are no tournaments happening right now. Explore upcoming competitions instead.',
      };

    case 'completed':
      return {
        icon: '✓',
        title: 'NO COMPLETED TOURNAMENTS',
        description:
          'No completed tournaments are available in this selection.',
      };

    default:
      return {
        icon: '🏆',
        title: 'NO TOURNAMENTS FOUND',
        description:
          'No tournaments match the current selection. Try another sport, city, or status.',
      };
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'AWAITING APPROVAL';

    case 'upcoming':
      return 'UPCOMING';

    case 'live':
      return '● LIVE NOW';

    case 'completed':
      return 'COMPLETED';

    case 'rejected':
      return 'REJECTED';

    default:
      return status;
  }
}

function getTrustLabel(score: number) {
  if (score >= 80) return 'HIGH TRUST';
  if (score >= 50) return 'MEDIUM TRUST';
  return 'VERIFYING';
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

async function loadRazorpayCheckout() {
  if (typeof window === 'undefined') {
    throw new Error('Payment checkout is available only in the browser.');
  }

  if (window.Razorpay) {
    return window.Razorpay;
  }

  const existingScript = document.querySelector(
    'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
  );

  if (existingScript) {
    await new Promise<void>((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), {
        once: true,
      });

      existingScript.addEventListener('error', () => {
        reject(new Error('Unable to load Razorpay checkout.'));
      }, {
        once: true,
      });
    });
  } else {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');

      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () =>
        reject(
          new Error('Unable to load Razorpay checkout.'),
        );

      document.body.appendChild(script);
    });
  }

  if (!window.Razorpay) {
    throw new Error(
      'Razorpay checkout failed to initialize.',
    );
  }

  return window.Razorpay;
}

function TournamentsGridContent({
  query = '',
  limit,
  city = '',
  state = '',
  sport = '',
  competitionType = '',
  format = '',
  status = 'all',
  startDateFrom = '',
  startDateTo = '',
  minEntryFee = '',
  maxEntryFee = '',
  homepageFeatured = false,
}: GridProps) {
  const [tournaments, setTournaments] = useState<
    BackendTournament[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const displayedTournaments =
    homepageFeatured && typeof limit === 'number'
      ? (() => {
          const now = Date.now();

          // Homepage: never show tournaments that have already ended.
          const upcoming = tournaments.filter(
            (item) => new Date(item.endDate).getTime() >= now,
          );

          // Only use an approved upcoming Badminton tournament.
          const upcomingBadminton = upcoming.find(
            (item) =>
              item.sport?.trim().toLowerCase() === 'badminton' &&
              item.status === 'APPROVED',
          );

          // Keep the normal upcoming order for the other cards,
          // but reserve one slot for Badminton.
          const others = upcoming.filter(
            (item) => item !== upcomingBadminton,
          );

          return [
            ...others.slice(0, Math.max(0, limit - 1)),
            ...(upcomingBadminton ? [upcomingBadminton] : []),
          ].slice(0, limit);
        })()
      : typeof limit === 'number'
        ? tournaments.slice(0, limit)
        : tournaments;


  const [registrations, setRegistrations] = useState<
    TournamentRegistration[]
  >([]);

  const [selectedTournament, setSelectedTournament] =
    useState<BackendTournament | null>(null);

  const searchParams = useSearchParams();

  const achievementMode =
    searchParams.get('view') === 'achievement';

  const achievementPlacement =
    searchParams.get('placement') || 'COMPLETED';

  const achievementMatches = Number(
    searchParams.get('matches') || 0,
  );

  const achievementWins = Number(
    searchParams.get('wins') || 0,
  );

  const achievementLosses = Number(
    searchParams.get('losses') || 0,
  );

  const achievementRound =
    achievementPlacement === 'CHAMPION'
      ? 'FINAL'
      : achievementPlacement === 'RUNNER_UP'
        ? 'FINAL'
        : 'TOURNAMENT COMPLETE';

  const [registrationState, setRegistrationState] =
    useState<RegistrationState>('idle');

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [registrationError, setRegistrationError] =
    useState('');
  const [participationModalOpen, setParticipationModalOpen] =
    useState(false);


  const { scrollYProgress } = useScroll();

  const headerY = useTransform(
    scrollYProgress,
    [0.08, 0.35],
    [70, -20],
  );

  const headerOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.22],
    [0.3, 1],
  );

  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const storedUser = localStorage.getItem('sportoraUser');
        const user = storedUser ? JSON.parse(storedUser) : null;

        setCurrentUserId(user?.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    };

    loadCurrentUser();

    const handleAuthChange = () => {
      loadCurrentUser();
    };

    window.addEventListener(
      'sportora-auth-change',
      handleAuthChange,
    );

    return () => {
      window.removeEventListener(
        'sportora-auth-change',
        handleAuthChange,
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRegistrations() {
      try {
        const response = await fetch(
          '/api/tournament-registration/my',
          {
            credentials: 'include',
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!cancelled && data.success) {
          setRegistrations(data.registrations ?? []);
        }
      } catch {
        // Registration data is optional for tournament discovery.
      }
    }

    loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadTournaments() {
      setLoading(true);
      setFetchError('');

      try {
        const params = new URLSearchParams();

        // State is filtered server-side while the existing
        // Search + City + Sport + Status behavior remains unchanged.
        params.set('limit', '100');

        if (state) {
          params.set('state', state);
        }

        if (sport) {
          params.set('sport', sport);
        }

        if (competitionType) {
          params.set('competitionType', competitionType);
        }

        if (format) {
          params.set('format', format);
        }

        if (startDateFrom) {
          params.set('startDateFrom', startDateFrom);
        }

        if (startDateTo) {
          params.set('startDateTo', startDateTo);
        }

        if (minEntryFee) {
          params.set('minEntryFee', minEntryFee);
        }

        if (maxEntryFee) {
          params.set('maxEntryFee', maxEntryFee);
        }

        const response = await fetch(
          `/api/tournaments?${params.toString()}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              'Failed to load tournaments',
          );
        }

        if (!cancelled) {
          setTournaments(data.tournaments || []);
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(
            error instanceof Error
              ? error.message
              : 'Unable to load tournaments',
          );
          setTournaments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTournaments();

    return () => {
      cancelled = true;
    };
  }, [
    query,
    city,
    state,
    sport,
    competitionType,
    format,
    startDateFrom,
    startDateTo,
    minEntryFee,
    maxEntryFee,
  ]);

  useEffect(() => {
    const tournamentId = searchParams.get('tournament');

    if (!tournamentId || loading || tournaments.length === 0) {
      return;
    }

    const tournament = tournaments.find(
      (item) => item._id === tournamentId,
    );

    if (tournament) {
      setSelectedTournament(tournament);
      setRegistrationState('idle');
      setRegistrationError('');
    }
  }, [searchParams, loading, tournaments]);

  useEffect(() => {
    const handleOpenTournament = (event: Event) => {
      const customEvent = event as CustomEvent<{ tournamentId: string }>;
      const tournamentId = customEvent.detail?.tournamentId;

      if (!tournamentId) {
        return;
      }

      const tournament = tournaments.find(
        (item) => item._id === tournamentId,
      );

      if (tournament) {
        setSelectedTournament(tournament);
        setRegistrationState('idle');
        setRegistrationError('');
      }
    };

    window.addEventListener(
      'sportora:open-tournament',
      handleOpenTournament,
    );

    return () => {
      window.removeEventListener(
        'sportora:open-tournament',
        handleOpenTournament,
      );
    };
  }, [tournaments]);

  useEffect(() => {
    const isAchievementRoute =
      searchParams.get('view') === 'achievement';

    if (!selectedTournament) {
      document.body.style.overflow = '';

      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;

    };
  }, [selectedTournament, searchParams]);

  const handleClose = () => {
    const isAchievementRoute =
      searchParams.get('view') === 'achievement';

    setSelectedTournament(null);
    setRegistrationState('idle');
    setRegistrationError('');

    if (isAchievementRoute) {
      window.location.href = '/profile';
    }
  };

  async function markRegistrationSuccess() {
    setRegistrationState('success');

    setTournaments((current) =>
      current.map((tournament) =>
        tournament._id === selectedTournament?._id
          ? {
              ...tournament,
              registeredParticipants:
                tournament.registeredParticipants + 1,
            }
          : tournament,
      ),
    );

    setSelectedTournament((current) =>
      current
        ? {
            ...current,
            registeredParticipants:
              current.registeredParticipants + 1,
          }
        : current,
    );

    try {
      const response = await fetch(
        '/api/tournament-registration/my',
        {
          credentials: 'include',
          cache: 'no-store',
        },
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.success) {
        setRegistrations(data.registrations ?? []);
      }
    } catch {
      // Registration success is already confirmed.
      // Refresh failure should not undo the success state.
    }
  }

  const selectedRegistration =
    selectedTournament
      ? registrations.find(
          (registration) =>
            registration.tournamentId?._id ===
            selectedTournament._id,
        )
      : undefined;

  const isOwnTournament =
    Boolean(
      currentUserId &&
      selectedTournament?.organizerId === currentUserId,
    );

  const isAlreadyRegistered =
    selectedRegistration?.status === 'REGISTERED';

  async function registerFreeTournament() {
    if (!selectedTournament) return;

    const response = await fetch(
      '/api/tournaments/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tournamentId: selectedTournament._id,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
          data.message ||
          'Registration failed',
      );
    }

    await markRegistrationSuccess();
  }

  async function registerPaidTournament() {
    if (!selectedTournament) return;

    const orderResponse = await fetch(
      '/api/payments/create-order',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tournamentId: selectedTournament._id,
        }),
      },
    );

    const orderData = await orderResponse.json();

    if (!orderResponse.ok || !orderData.success) {
      throw new Error(
        orderData.error ||
          orderData.message ||
          'Unable to create payment order',
      );
    }

    const paymentOrder = orderData.data;

    if (
      !paymentOrder?.orderId ||
      !paymentOrder?.keyId ||
      !paymentOrder?.amount ||
      !paymentOrder?.currency
    ) {
      throw new Error(
        'Payment order response is incomplete.',
      );
    }

    const Razorpay = await loadRazorpayCheckout();

    await new Promise<void>((resolve, reject) => {
      let settled = false;

      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      const succeed = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const checkout = new Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount * 100,
        currency: paymentOrder.currency,
        name: 'Sportora',
        description: selectedTournament.title,
        order_id: paymentOrder.orderId,

        handler: async (
          razorpayResponse,
        ) => {
          try {
            const verifyResponse = await fetch(
              '/api/payments/verify',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  razorpay_order_id:
                    razorpayResponse.razorpay_order_id,
                  razorpay_payment_id:
                    razorpayResponse.razorpay_payment_id,
                  razorpay_signature:
                    razorpayResponse.razorpay_signature,
                }),
              },
            );

            const verifyData =
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              throw new Error(
                verifyData.error ||
                  verifyData.message ||
                  'Payment verification failed',
              );
            }

            await markRegistrationSuccess();
            succeed();
          } catch (error) {
            fail(
              error instanceof Error
                ? error
                : new Error(
                    'Payment verification failed',
                  ),
            );
          }
        },

        modal: {
          ondismiss: () => {
            fail(
              new Error(
                'Payment was cancelled. No registration was created.',
              ),
            );
          },
        },

        theme: {
          color: '#00ff66',
        },
      });

      checkout.open();
    });
  }

  async function handleRegister() {
    if (!selectedTournament) return;

    setRegistrationState('registering');
    setRegistrationError('');

    try {
      if (selectedTournament.entryFee > 0) {
        await registerPaidTournament();
      } else {
        await registerFreeTournament();
      }
    } catch (error) {
      setRegistrationState('error');

      setRegistrationError(
        error instanceof Error
          ? error.message
          : 'Registration failed',
      );
    }
  }

  const scopeFiltered = tournaments.filter((tournament) => {
    const q = query.toLowerCase().trim();

    const matchesSearch =
      !q ||
      tournament.title.toLowerCase().includes(q) ||
      tournament.sport.toLowerCase().includes(q) ||
      tournament.city.toLowerCase().includes(q) ||
      tournament.locationName.toLowerCase().includes(q);

    const matchesCity =
      !city ||
      tournament.city.toLowerCase() === city.toLowerCase();

    const matchesSport =
      !sport ||
      tournament.sport.toLowerCase() === sport.toLowerCase();

    return matchesSearch && matchesCity && matchesSport;
  });

  const statusCounts = scopeFiltered.reduce(
    (counts, tournament) => {
      const displayStatus = getTournamentDisplayStatus(tournament);

      counts.all += 1;

      if (displayStatus === "pending") counts.pending += 1;
      if (displayStatus === "upcoming") counts.upcoming += 1;
      if (displayStatus === "live") counts.live += 1;
      if (displayStatus === "completed") counts.completed += 1;

      return counts;
    },
    {
      all: 0,
      pending: 0,
      upcoming: 0,
      live: 0,
      completed: 0,
    },
  );

  const filtered = scopeFiltered.filter((tournament) => {
    const now = Date.now();
    const start = new Date(tournament.startDate).getTime();
    const end = new Date(tournament.endDate).getTime();

    const matchesStatus =
      status === "all"
        ? true
        : status === "pending"
          ? tournament.status === "PENDING_APPROVAL"
          : status === "upcoming"
            ? tournament.status === "APPROVED" && start > now
            : status === "live"
              ? tournament.status === "APPROVED" &&
                start <= now &&
                end >= now
              : status === "completed"
                ? tournament.status === "COMPLETED" || end < now
                : true;

    return matchesStatus;
  });

  return (
    <section
      id="tournaments"
      className="relative z-10 mx-auto max-w-7xl overflow-hidden px-6 py-28 sm:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-10 select-none text-[16rem] font-black leading-none tracking-[-0.08em] text-white/[0.025] sm:text-[24rem]"
      >
        03
      </div>

      <motion.div
        style={{
          y: headerY,
          opacity: headerOpacity,
        }}
        className="relative z-10 mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end"
      >
        <div className="max-w-4xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-12 bg-[#00ff66]" />

            <span className="text-[12px] font-black tracking-[0.3em] text-[#00ff66]">
              LIVE DISCOVERY ENGINE
            </span>

            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ff66] shadow-[0_0_15px_#00ff66]" />
          </div>

          <h2 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">
            {query ? (
              <>
                RESULTS
                <br />
                <span className="text-[#00ff66]">
                  FOR &quot;{query.toUpperCase()}&quot;
                </span>
              </>
            ) : (
              <>
                THE NEXT
                <br />
                <span className="text-[#00ff66] sportora-text-glow">
                  BIG GAME.
                </span>
              </>
            )}
          </h2>
        </div>

        <div className="max-w-sm border-l border-white/10 pl-5">
          <p className="text-sm leading-7 text-white/45">
            Verified tournaments across the sports ecosystem.
            Pick an event, inspect the arena, and enter the
            competition.
          </p>

          <div className="mt-5 flex items-center gap-3 text-[12px] font-bold tracking-[0.25em] text-white/45">
            <span>DISCOVER</span>
            <span className="h-px w-8 bg-white/10" />
            <span>VERIFY</span>
            <span className="h-px w-8 bg-white/10" />
            <span>COMPETE</span>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 mb-10 lg:mb-12">
        <div className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
              ARENA PULSE
            </span>
            <span className="hidden text-[10px] font-bold tracking-[0.2em] text-white/15 sm:inline">
              / TOURNAMENT INDEX
            </span>
          </div>

          <span className="text-[10px] font-black tracking-[0.25em] text-white/20">
            LIVE DATA
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            {
              label: 'ALL',
              count: statusCounts.all,
              icon: '◈',
              text: 'text-white/70',
            },
            {
              label: 'AWAITING',
              count: statusCounts.pending,
              icon: '◐',
              text: 'text-amber-300',
            },
            {
              label: 'UPCOMING',
              count: statusCounts.upcoming,
              icon: '◷',
              text: 'text-[#00ff66]',
            },
            {
              label: 'LIVE',
              count: statusCounts.live,
              icon: '●',
              text: 'text-red-400',
            },
            {
              label: 'COMPLETED',
              count: statusCounts.completed,
              icon: '✓',
              text: 'text-white/55',
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.045] hover:shadow-[0_15px_40px_rgba(0,0,0,0.25)]"
            >
              <div className={`absolute inset-x-0 top-0 h-px ${item.text} opacity-30 bg-current transition-opacity duration-300 group-hover:opacity-80`} />

              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-black ${item.text}`}>
                    {item.icon}
                  </span>

                  <div className={`mt-3 text-[10px] font-black uppercase tracking-[0.22em] ${item.text}`}>
                    {item.label}
                  </div>
                </div>

                <span className="text-[9px] font-bold tracking-[0.2em] text-white/15">
                  0{index + 1}
                </span>
              </div>

              <div className="mt-1 flex items-end justify-between">
                <span className="text-3xl font-black leading-none tracking-[-0.06em] text-white">
                  {item.count}
                </span>

                <span className="mb-0.5 text-[9px] font-bold tracking-[0.18em] text-white/20">
                  EVENTS
                </span>
              </div>

              <div className="mt-4 h-px bg-white/[0.06]">
                <div
                  className={`h-full w-1/3 ${item.text} bg-current opacity-30 transition-all duration-500 group-hover:w-full group-hover:opacity-70`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-7 flex items-center gap-3">
          <span className="text-[9px] font-black tracking-[0.28em] text-white/20">
            DISCOVERY STREAM
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          <span className="text-[9px] font-bold tracking-[0.2em] text-white/15">
            NEXT EVENTS
          </span>
        </div>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[300px] items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#00ff66]">
            <Loader2 className="h-5 w-5 animate-spin" />
            SCANNING SPORTS ARENA
          </div>
        </motion.div>
      ) : fetchError ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-red-400/20 bg-red-500/[0.04] px-6 py-20 text-center backdrop-blur-xl"
        >
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

          <p className="mt-5 text-sm font-bold uppercase tracking-wider text-red-300">
            {fetchError}
          </p>
        </motion.div>
      ) : filtered.length > 0 ? (
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#00ff66]/10 to-transparent lg:block"
          />

          <div className="space-y-8 lg:space-y-16">
            {(homepageFeatured
              ? displayedTournaments
              : typeof limit === 'number'
                ? filtered.slice(0, limit)
                : filtered
            ).map((item, index) => (
              <TournamentCard
                key={item._id}
                item={item}
                index={index}
                onSelect={async () => {
                  setSelectedTournament(item);
                  setRegistrationState('idle');
                  setRegistrationError('');

                  try {
                    const response = await fetch(
                      '/api/tournament-registration/my',
                      {
                        credentials: 'include',
                        cache: 'no-store',
                      },
                    );

                    if (!response.ok) {
                      return;
                    }

                    const data = await response.json();

                    if (data.success) {
                      setRegistrations(data.registrations ?? []);
                    }
                  } catch {
                    // Registration data is optional for tournament discovery.
                  }
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        (() => {
          const emptyState = getEmptyStateContent(
            status,
            query,
            city,
            sport,
          );

          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] px-6 py-20 text-center backdrop-blur-xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ff66]/[0.035] blur-3xl"
              />

              <div className="relative">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
                  status === 'live'
                    ? 'border-red-400/20 bg-red-500/[0.06] text-red-400'
                    : status === 'pending'
                      ? 'border-amber-400/20 bg-amber-400/[0.06] text-amber-300'
                      : 'border-white/10 bg-white/[0.03] text-[#00ff66]'
                }`}>
                  <span className="text-2xl">
                    {emptyState.icon}
                  </span>
                </div>

                <p className="mt-7 text-[12px] font-black uppercase tracking-[0.22em] text-white/65">
                  {emptyState.title}
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/55">
                  {emptyState.description}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/tournaments';
                  }}
                  className="group mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-[11px] font-black tracking-[0.18em] text-white/70 transition-all duration-300 hover:border-[#00ff66]/40 hover:bg-[#00ff66]/[0.08] hover:text-[#00ff66]"
                  aria-label="Discover all tournaments"
                >
                  <span className="text-white/80 group-hover:text-[#00ff66]">
                    SPORTORA
                  </span>
                  <span className="h-px w-8 bg-white/15 group-hover:bg-[#00ff66]/40" />
                  <span>
                    DISCOVER →
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })()
      )}

      <AnimatePresence>
        {selectedTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030507]/98 p-4 backdrop-blur-xl"
            onClick={handleClose}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              transition={{ duration: 0.35 }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#080B10] p-6 shadow-[0_0_80px_rgba(0,255,102,0.12)] sm:p-8"
            >
              <button
                onClick={handleClose}
                className="absolute right-5 top-5 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-white/50 transition hover:border-[#00ff66]/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              {achievementMode ? (
                <div className="relative overflow-hidden rounded-[28px] border border-amber-400/20 bg-[#090B0F] p-6 sm:p-8">
                  {/* Ambient achievement glow */}
                  <motion.div
                    className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.45, 0.7, 0.45],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  <motion.div
                    className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#00ff66]/10 blur-3xl"
                    animate={{
                      scale: [1.15, 1, 1.15],
                      opacity: [0.3, 0.55, 0.3],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 180,
                        damping: 12,
                        delay: 0.1,
                      }}
                      className="relative mx-auto flex h-28 w-28 items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="absolute inset-0 rounded-full border border-amber-400/30 border-dashed"
                      />

                      <div className="absolute inset-3 rounded-full border border-amber-300/20 bg-amber-400/10 shadow-[0_0_60px_rgba(245,158,11,0.25)]" />

                      <motion.span
                        animate={{
                          y: [0, -6, 0],
                          rotate: [0, -3, 3, 0],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="relative text-6xl drop-shadow-[0_0_25px_rgba(245,158,11,0.55)]"
                      >
                        {achievementPlacement === 'CHAMPION'
                          ? '🏆'
                          : achievementPlacement === 'RUNNER_UP'
                            ? '🥈'
                            : '🏅'}
                      </motion.span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="mt-5"
                    >
                      <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-[12px] font-black uppercase tracking-[0.22em] text-amber-300">
                        ✦ Achievement Unlocked ✦
                      </span>

                      <h2 className="mt-4 text-4xl font-black uppercase italic tracking-tight text-white sm:text-5xl">
                        {achievementPlacement === 'CHAMPION'
                          ? 'CHAMPION'
                          : achievementPlacement === 'RUNNER_UP'
                            ? 'RUNNER-UP'
                            : 'TOURNAMENT COMPLETE'}
                      </h2>

                      <p className="mx-auto mt-3 max-w-lg text-sm text-white/45">
                        {achievementPlacement === 'CHAMPION'
                          ? 'You dominated the tournament and finished on top.'
                          : achievementPlacement === 'RUNNER_UP'
                            ? 'An outstanding run all the way to the final.'
                            : 'Your tournament journey has been recorded.'}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8"
                    >
                      <div className="text-[12px] font-black uppercase tracking-[0.25em] text-[#00ff66]">
                        {getSportIcon(selectedTournament.sport)}{' '}
                        {selectedTournament.sport}
                      </div>

                      <h3 className="mt-2 text-2xl font-black uppercase italic text-white sm:text-3xl">
                        {selectedTournament.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-wider text-white/55">
                        <span>
                          {selectedTournament.format}
                        </span>
                        <span>•</span>
                        <span>
                          {selectedTournament.type}
                        </span>
                        <span>•</span>
                        <span>
                          {selectedTournament.city}
                        </span>
                      </div>
                    </motion.div>

                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        ['MATCHES', achievementMatches],
                        ['WINS', achievementWins],
                        ['LOSSES', achievementLosses],
                        ['ROUND', achievementRound],
                      ].map(([label, value], index) => (
                        <motion.div
                          key={String(label)}
                          initial={{
                            opacity: 0,
                            y: 18,
                            scale: 0.94,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          transition={{
                            delay: 0.65 + index * 0.08,
                            type: 'spring',
                            stiffness: 150,
                            damping: 16,
                          }}
                          className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition-all duration-300 hover:border-[#00ff66]/25 hover:bg-white/[0.055]"
                        >
                          <div className="text-[12px] font-black uppercase tracking-wider text-white/50">
                            {label}
                          </div>

                          <div
                            className={`mt-2 font-black ${
                              label === 'ROUND'
                                ? 'text-sm text-[#00ff66]'
                                : 'text-2xl text-white'
                            }`}
                          >
                            {value}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="mt-5 grid grid-cols-1 gap-3 text-left sm:grid-cols-2"
                    >
                      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                        <div className="text-[12px] font-black uppercase tracking-wider text-white/50">
                          LOCATION
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">
                          {selectedTournament.locationName}
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          {selectedTournament.city},{' '}
                          {selectedTournament.state}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                        <div className="text-[12px] font-black uppercase tracking-wider text-white/50">
                          EVENT DATE
                        </div>
                        <div className="mt-1 text-sm font-bold text-white">
                          {formatDateRange(
                            selectedTournament.startDate,
                            selectedTournament.endDate,
                          )}
                        </div>
                        <div className="mt-1 text-xs text-white/55">
                          {selectedTournament.registeredParticipants}{' '}
                          players registered
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.15 }}
                      className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                      <div className="rounded-full border border-amber-400/20 bg-amber-400/5 px-5 py-2.5 text-[12px] font-black uppercase tracking-wider text-amber-300">
                        🏆 {achievementPlacement}
                      </div>

                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full bg-[#00ff66] px-7 py-3 text-[12px] font-black uppercase tracking-wider text-black transition-all hover:scale-105 hover:bg-emerald-300 hover:shadow-[0_0_30px_rgba(0,255,102,0.25)]"
                      >
                        CLOSE ACHIEVEMENT
                      </button>
                    </motion.div>
                  </div>
                </div>
              ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getSportIcon(
                      selectedTournament.sport,
                    )}
                  </span>

                  <span className="rounded-full border border-[#00ff66]/40 bg-[#00ff66]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#00ff66]">
                    {selectedTournament.sport} •{' '}
                    {getStatusLabel(
                      getTournamentDisplayStatus(selectedTournament),
                    )}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
                    {selectedTournament.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/60">
                    {selectedTournament.aiRiskAnalysis ||
                      'Tournament information verified by Sportora.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-2">
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/55">
                      VENUE
                    </div>

                    <div className="mt-1 text-sm font-bold text-white/90">
                      {selectedTournament.locationName},{' '}
                      {selectedTournament.city}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/55">
                      DATES
                    </div>

                    <div className="mt-1 text-sm font-bold text-white/90">
                      {formatDateRange(
                        selectedTournament.startDate,
                        selectedTournament.endDate,
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/55">
                      FORMAT
                    </div>

                    <div className="mt-1 text-sm font-bold text-white/90">
                      {selectedTournament.format}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/55">
                      TYPE
                    </div>

                    <div className="mt-1 text-sm font-bold text-white/90">
                      {selectedTournament.type}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <InfoStat
                    icon={<Users className="h-4 w-4" />}
                    label="REGISTERED"
                    value={`${selectedTournament.registeredParticipants}/${selectedTournament.maxParticipants}`}
                  />

                  <InfoStat
                    icon={<Trophy className="h-4 w-4" />}
                    label="PRIZE POOL"
                    value={formatCurrency(
                      selectedTournament.prizePool,
                    )}
                  />

                  <InfoStat
                    icon={<CreditCard className="h-4 w-4" />}
                    label="ENTRY"
                    value={formatCurrency(
                      selectedTournament.entryFee,
                    )}
                  />

                  <InfoStat
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="AI SCORE"
                    value={`${selectedTournament.aiRiskScore}`}
                  />
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5">
                  <h4 className="text-[11px] font-mono font-black uppercase tracking-[0.16em] text-[#00ff66]">
                    EVENT INTELLIGENCE
                  </h4>

                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <MapPin className="h-4 w-4 shrink-0 text-[#00ff66]" />

                    <span>
                      {selectedTournament.locationName},{' '}
                      {selectedTournament.city},{' '}
                      {selectedTournament.state}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Calendar className="h-4 w-4 shrink-0 text-[#00ff66]" />

                    <span>
                      {formatDateRange(
                        selectedTournament.startDate,
                        selectedTournament.endDate,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Clock3 className="h-4 w-4 shrink-0 text-[#00ff66]" />

                    <span>
                      Starts at{' '}
                      {formatTime(
                        selectedTournament.startDate,
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#00ff66]" />

                    <span>
                      {getTrustLabel(
                        selectedTournament.aiRiskScore,
                      )}{' '}
                      •{' '}
                      {selectedTournament.aiRiskScore}
                      /100
                    </span>
                  </div>
                </div>

                {registrationState === 'error' && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-xs text-red-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>{registrationError}</span>
                  </div>
                )}

                {isAlreadyRegistered ? (
                  <div className="space-y-6 py-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#00ff66] text-black shadow-[0_0_50px_rgba(0,255,102,0.5)]">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff66]">
                        ALREADY REGISTERED
                      </span>

                      <h2 className="mt-1 text-3xl font-black uppercase italic text-white">
                        YOU&apos;RE IN THE ARENA!
                      </h2>

                      <p className="mx-auto mt-2 max-w-sm text-xs text-white/50">
                        You have already registered for this tournament.
                        No additional payment is required.
                      </p>
                    </div>

                    <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-white/55">
                          Registration ID
                        </span>

                        <span className="max-w-[220px] break-all text-right font-mono font-bold text-white">
                          {selectedRegistration?._id}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between gap-4">
                        <span className="text-white/55">
                          Payment
                        </span>

                        <span className="font-bold text-[#00ff66]">
                          {selectedRegistration?.paymentStatus ===
                          'SUCCESS'
                            ? '₹' +
                              selectedTournament.entryFee.toLocaleString(
                                'en-IN',
                              ) +
                              ' • SUCCESS'
                            : selectedRegistration?.paymentStatus ||
                              'PENDING'}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between gap-4">
                        <span className="text-white/55">
                          Registration
                        </span>

                        <span className="font-bold text-[#00ff66]">
                          {selectedRegistration?.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-extrabold uppercase text-white transition-all hover:bg-white/10"
                      >
                        CLOSE
                      </button>

                      {selectedTournament.competitionType !== 'SINGLES' && (
                        <button
                          type="button"
                          onClick={() =>
                            setParticipationModalOpen(true)
                          }
                          className="flex items-center justify-center gap-2 rounded-full border border-[#00ff66]/40 bg-[#00ff66]/10 px-6 py-3.5 text-xs font-extrabold uppercase text-[#00ff66] transition-all hover:bg-[#00ff66] hover:text-black"
                        >
                          COMPLETE PARTICIPATION
                          <Users className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          window.location.href =
                            `/profile?registration=${selectedRegistration?._id}`;
                        }}
                        className="flex items-center justify-center gap-2 rounded-full bg-[#00ff66] px-8 py-3.5 text-xs font-extrabold uppercase text-black transition-all hover:bg-emerald-300"
                      >
                        VIEW TICKET
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : registrationState === 'success' ? (
                  <div className="space-y-6 py-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#00ff66] text-black shadow-[0_0_50px_rgba(0,255,102,0.5)]">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff66]">
                        REGISTRATION CONFIRMED
                      </span>

                      <h2 className="mt-1 text-3xl font-black uppercase italic text-white">
                        YOU&apos;RE IN THE ARENA!
                      </h2>

                      <p className="mx-auto mt-2 max-w-sm text-xs text-white/50">
                        Your Sportora registration has been
                        recorded successfully.
                      </p>
                    </div>

                    <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-white/55">
                          Event
                        </span>

                        <span className="text-right font-bold text-white">
                          {selectedTournament.title}
                        </span>
                      </div>

                      <div className="mt-2 flex justify-between">
                        <span className="text-white/55">
                          Status
                        </span>

                        <span className="font-bold text-[#00ff66]">
                          REGISTERED
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                      {selectedTournament.competitionType !== 'SINGLES' && (
                        <button
                          type="button"
                          onClick={() => setParticipationModalOpen(true)}
                          className="flex items-center justify-center gap-2 rounded-full bg-[#00ff66] px-7 py-3.5 text-xs font-extrabold uppercase text-black transition-all hover:bg-emerald-300"
                        >
                          COMPLETE PARTICIPATION
                          <Users className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-xs font-extrabold uppercase text-white transition-all hover:bg-white/10"
                      >
                        RETURN TO ARENA HUB
                      </button>
                    </div>
                  </div>
                ) : isOwnTournament ? (
                  <div className="border-t border-white/10 pt-5">
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 px-6 py-5 text-center">
                      <div className="text-xs font-extrabold uppercase tracking-widest text-yellow-300">
                        YOU ARE THE ORGANIZER
                      </div>

                      <p className="mt-2 text-xs text-white/50">
                        You cannot register or participate in your own tournament.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="text-[12px] uppercase text-white/50">
                        ENTRY FEE
                      </div>

                      <div className="text-2xl font-black text-[#00ff66]">
                        {formatCurrency(
                          selectedTournament.entryFee,
                        )}
                      </div>

                      <div className="mt-1 text-[12px] text-white/50">
                        Registration deadline:{' '}
                        {new Date(
                          selectedTournament.registrationDeadline,
                        ).toLocaleDateString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={handleRegister}
                      disabled={
                        registrationState ===
                        'registering'
                      }
                      className="flex items-center justify-center gap-2 rounded-full bg-[#00ff66] px-8 py-3.5 text-xs font-extrabold uppercase text-black transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {registrationState ===
                      'registering' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {selectedTournament.entryFee > 0
                            ? 'OPENING PAYMENT...'
                            : 'REGISTERING...'}
                        </>
                      ) : (
                        <>
                          {selectedTournament.entryFee > 0
                            ? 'PAY & REGISTER'
                            : 'REGISTER NOW'}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {participationModalOpen &&
        selectedTournament &&
        selectedRegistration && (
          <ParticipationDetailsModal
            open={participationModalOpen}
            registrationId={selectedRegistration._id}
            competitionType={
              selectedTournament.competitionType ?? ''
            }
            competitionRules={
              selectedTournament.competitionRules
            }
            tournamentTitle={selectedTournament.title}
            onClose={() =>
              setParticipationModalOpen(false)
            }
            onSaved={() =>
              setParticipationModalOpen(false)
            }
          />
        )}

    </section>
  );
}

function InfoStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 text-[#00ff66]">
        {icon}
        <span className="text-[12px] font-black tracking-wider text-white/50">
          {label}
        </span>
      </div>

      <div className="mt-2 text-sm font-black text-white">
        {value}
      </div>
    </div>
  );
}

function TournamentCard({
  item,
  index,
  onSelect,
}: {
  item: BackendTournament;
  index: number;
  onSelect: () => void;
}) {
  const direction = index % 2 === 0 ? -80 : 80;

  const registered =
    item.registeredParticipants || 0;

  const capacity =
    item.maxParticipants || 0;

  const fillPercentage =
    capacity > 0
      ? Math.min(
          100,
          Math.round(
            (registered / capacity) * 100,
          ),
        )
      : 0;

  const sportFallbackImages: Record<string, string> = {
    chess:
      'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=1200',
    football:
      'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1000',
    cricket:
      'https://images.pexels.com/photos/31739439/pexels-photo-31739439.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badminton:
      'https://images.pexels.com/photos/8007157/pexels-photo-8007157.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'table tennis':
      'https://images.pexels.com/photos/13793163/pexels-photo-13793163.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tt:
      'https://images.pexels.com/photos/13793163/pexels-photo-13793163.jpeg?auto=compress&cs=tinysrgb&w=1200',
    basketball:
      'https://images.pexels.com/photos/2186251/pexels-photo-2186251.jpeg?auto=compress&cs=tinysrgb&w=1200',
    volleyball:
      'https://images.pexels.com/photos/32592341/pexels-photo-32592341.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tennis:
      'https://images.pexels.com/photos/1784798/pexels-photo-1784798.jpeg?auto=compress&cs=tinysrgb&w=1200',
    hockey:
      'https://images.pexels.com/photos/34152452/pexels-photo-34152452.jpeg?auto=compress&cs=tinysrgb&w=1200',
  };

  const sportKey = item.sport?.trim().toLowerCase();
  const image =
    item.venuePhotos?.[0] ||
    sportFallbackImages[sportKey] ||
    sportFallbackImages.football;

  console.log('🔥 SPORT IMAGE DEBUG:', {
    title: item.title,
    sport: item.sport,
    sportKey,
    venuePhotos: item.venuePhotos,
    selectedImage: image,
  });

  const isFull =
    capacity > 0 && registered >= capacity;

  return (
    <motion.article
      initial={{
        opacity: 0,
        x: direction,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 0.85,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <div className="absolute -left-1 top-8 hidden text-[12px] font-black tracking-[0.3em] text-white/55 lg:block">
        EVENT / 0{index + 1}
      </div>

      <div className="grid overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025] backdrop-blur-xl transition-all duration-500 group-hover:border-[#00ff66]/30 group-hover:shadow-[0_25px_80px_rgba(0,255,102,0.08)] md:grid-cols-[1.15fr_0.85fr]">
        <div className="relative h-[300px] overflow-hidden md:h-[430px]">
          <motion.img
            src={image}
            alt={item.title}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.8 }}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-[#080b10]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-transparent to-black/30" />

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[12px] font-black uppercase tracking-wider text-white backdrop-blur-xl">
            <span className="text-base">
              {getSportIcon(item.sport)}
            </span>

            <span className="text-[#00ff66]">
              {item.sport}
            </span>
          </div>

          <div
            className={`absolute right-5 top-5 rounded-full px-3 py-1.5 text-[12px] font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,102,0.18)] ${
              getTournamentDisplayStatus(item) === 'live'
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : getTournamentDisplayStatus(item) === 'pending'
                  ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                  : getTournamentDisplayStatus(item) === 'completed'
                    ? 'bg-white/80 text-black'
                    : 'bg-[#00ff66] text-black'
            }`}
          >
            {getStatusLabel(getTournamentDisplayStatus(item))}
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-2 flex items-center justify-between text-[12px] font-bold tracking-[0.25em] text-white/50">
              <span>
                {getTrustLabel(item.aiRiskScore)}
              </span>

              <span>
                {item.aiRiskScore}/100
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${Math.max(
                    item.aiRiskScore,
                    4,
                  )}%`,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 1,
                  delay: 0.4,
                }}
                className="h-full rounded-full bg-[#00ff66]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between p-7 sm:p-9">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[12px] font-black tracking-[0.3em] text-white/45">
                SPORTS / EVENT
              </span>

              <span className="text-5xl font-black tracking-[-0.08em] text-white/[0.06]">
                0{index + 1}
              </span>
            </div>

            <h3 className="max-w-xl text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-white transition-colors duration-300 group-hover:text-[#00ff66] sm:text-4xl">
              {item.title}
            </h3>

            <p className="mt-5 text-sm leading-6 text-white/55">
              {item.format} • {item.type} tournament in{' '}
              {item.city}, {item.state}.
            </p>

            <div className="mt-7 space-y-3 border-y border-white/10 py-5 text-xs text-white/50">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#00ff66]" />

                <span>
                  {item.locationName}, {item.city}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-[#00ff66]" />

                <span>
                  {formatDateRange(
                    item.startDate,
                    item.endDate,
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 shrink-0 text-[#00ff66]" />

                <span>
                  {registered}/{capacity} participants
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between text-[12px] font-black tracking-[0.2em] text-white/45">
              <span>ARENA CAPACITY</span>

              <span>
                {fillPercentage}% FILLED
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${fillPercentage}%`,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                }}
                className="h-full bg-[#00ff66]"
              />
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-[12px] font-black tracking-[0.2em] text-white/45">
                  ENTRY / PRIZE POOL
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xl font-black text-[#00ff66]">
                    {formatCurrency(item.entryFee)}
                  </span>

                  <span className="text-xs text-white/50">
                    →
                  </span>

                  <span className="text-sm font-bold text-white">
                    {formatCurrency(item.prizePool)}
                  </span>
                </div>
              </div>

              <button
                onClick={onSelect}
                disabled={isFull}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[12px] font-black uppercase tracking-wider text-white transition-all duration-300 hover:border-[#00ff66] hover:bg-[#00ff66] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isFull
                  ? 'FULL'
                  : 'ENTER EVENT'}

                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}


export default function TournamentsGrid(props: GridProps) {
  return (
    <Suspense fallback={null}>
      <TournamentsGridContent {...props} />
    </Suspense>
  );
}
