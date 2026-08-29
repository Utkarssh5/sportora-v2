'use client';

import { Suspense, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  X,
  MapPin,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TournamentsGrid from '../../components/TournamentsGrid';

type SportCompetition = {
  type: string;
  participantCount: number;
  requiresRoster: boolean;
  supportedFormats: string[];
};

type SportConfig = {
  sport: string;
  competitions: SportCompetition[];
};

const SPORTS = [
  'Football',
  'Cricket',
  'Badminton',
  'Basketball',
  'Volleyball',
  'Table Tennis',
];

function TournamentsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialState = searchParams.get('state') || '';
  const initialCity = searchParams.get('city') || '';
  const initialSport = searchParams.get('sport') || '';
  const initialCompetitionType =
    searchParams.get('competitionType') || '';
  const initialFormat = searchParams.get('format') || '';
  const initialStatus = searchParams.get('status') || 'all';
  const initialStartDateFrom =
    searchParams.get('startDateFrom') || '';
  const initialStartDateTo =
    searchParams.get('startDateTo') || '';
  const initialMinEntryFee =
    searchParams.get('minEntryFee') || '';
  const initialMaxEntryFee =
    searchParams.get('maxEntryFee') || '';
  const initialNearMe = searchParams.get('nearMe') === 'true';

  const [search, setSearch] = useState(initialSearch);
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const [sport, setSport] = useState(initialSport);
  const [competitionType, setCompetitionType] =
    useState(initialCompetitionType);
  const [format, setFormat] = useState(initialFormat);
  const [status, setStatus] = useState(initialStatus);
  const [startDateFrom, setStartDateFrom] =
    useState(initialStartDateFrom);
  const [startDateTo, setStartDateTo] =
    useState(initialStartDateTo);
  const [minEntryFee, setMinEntryFee] =
    useState(initialMinEntryFee);
  const [maxEntryFee, setMaxEntryFee] =
    useState(initialMaxEntryFee);
  const [nearMe, setNearMe] = useState(initialNearMe);
  const [searchFocused, setSearchFocused] = useState(false);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [sportsConfig, setSportsConfig] = useState<SportConfig[]>([]);
  const [sportsConfigLoading, setSportsConfigLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSportsConfig = async () => {
      try {
        const response = await fetch('/api/sports/config', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sports configuration');
        }

        const data = await response.json();

        if (!cancelled && data.success && Array.isArray(data.sports)) {
          setSportsConfig(data.sports);
        }
      } catch (error) {
        console.error('Sports config loading error:', error);
        if (!cancelled) {
          setSportsConfig([]);
        }
      } finally {
        if (!cancelled) {
          setSportsConfigLoading(false);
        }
      }
    };

    loadSportsConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSportConfig = sportsConfig.find(
    (item) => item.sport === sport,
  );

  const availableCompetitionTypes =
    selectedSportConfig?.competitions || [];

  const selectedCompetitionConfig =
    availableCompetitionTypes.find(
      (item) => item.type === competitionType,
    );

  const availableFormats =
    selectedCompetitionConfig?.supportedFormats || [];

  useEffect(() => {
    let cancelled = false;

    const loadStates = async () => {
      try {
        const response = await fetch('/api/locations?states=true', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }

        const data = await response.json();

        if (!cancelled && data.success && Array.isArray(data.data)) {
          setAvailableStates(
            data.data.filter(
              (item: unknown): item is string =>
                typeof item === 'string' && item.trim().length > 0,
            ),
          );
        }
      } catch (error) {
        console.error('State loading error:', error);

        if (!cancelled) {
          setAvailableStates([]);
        }
      }
    };

    loadStates();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!state) {
      setAvailableCities([]);
      setLocationsLoading(false);
      return;
    }

    const loadCities = async () => {
      setLocationsLoading(true);

      try {
        const response = await fetch(
          `/api/locations?state=${encodeURIComponent(state)}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }

        const data = await response.json();

        if (!cancelled && data.success && Array.isArray(data.data)) {
          const cities: string[] = data.data
            .map((item: { city?: string }) => item.city)
            .filter(
              (item: unknown): item is string =>
                typeof item === 'string' && item.trim().length > 0,
            );

          setAvailableCities(
            Array.from(new Set<string>(cities)).sort(),
          );

          if (
            city &&
            !cities.some(
              (item: string) =>
                item.toLowerCase() === city.toLowerCase(),
            )
          ) {
            setCity('');
          }
        }
      } catch (error) {
        console.error('City loading error:', error);

        if (!cancelled) {
          setAvailableCities([]);
        }
      } finally {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      }
    };

    loadCities();

    return () => {
      cancelled = true;
    };
  }, [state]);

  const updateFilters = (
    nextSearch = search,
    nextState = state,
    nextCity = city,
    nextSport = sport,
    nextStatus = status,
    nextCompetitionType = competitionType,
    nextFormat = format,
    nextStartDateFrom = startDateFrom,
    nextStartDateTo = startDateTo,
    nextMinEntryFee = minEntryFee,
    nextMaxEntryFee = maxEntryFee,
  ) => {
    const params = new URLSearchParams();

    if (nextSearch.trim()) {
      params.set('search', nextSearch.trim());
    }

    if (nextState) {
      params.set('state', nextState);
    }

    if (nextCity) {
      params.set('city', nextCity);
    }

    if (nextSport) {
      params.set('sport', nextSport);
    }

    if (nextCompetitionType) {
      params.set('competitionType', nextCompetitionType);
    }

    if (nextFormat) {
      params.set('format', nextFormat);
    }

    if (nextStatus && nextStatus !== 'all') {
      params.set('status', nextStatus);
    }

    if (nextStartDateFrom) {
      params.set('startDateFrom', nextStartDateFrom);
    }

    if (nextStartDateTo) {
      params.set('startDateTo', nextStartDateTo);
    }

    if (nextMinEntryFee) {
      params.set('minEntryFee', nextMinEntryFee);
    }

    if (nextMaxEntryFee) {
      params.set('maxEntryFee', nextMaxEntryFee);
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    setSearch('');
    setState('');
    setCity('');
    setSport('');
    setCompetitionType('');
    setFormat('');
    setStatus('all');
    setStartDateFrom('');
    setStartDateTo('');
    setMinEntryFee('');
    setMaxEntryFee('');
    setNearMe(false);
    router.push(pathname);
  };

  const hasFilters = Boolean(
    search ||
    state ||
    city ||
    sport ||
    competitionType ||
    format ||
    status !== 'all' ||
    startDateFrom ||
    startDateTo ||
    minEntryFee ||
    maxEntryFee,
  );

  return (
    <main className="arena-page min-h-screen overflow-hidden text-white">
      <div className="arena-grid" aria-hidden="true" />

      <div
        className="arena-light arena-light-one"
        aria-hidden="true"
      />

      <div
        className="arena-light arena-light-two"
        aria-hidden="true"
      />

      <div
        className="arena-light arena-light-three"
        aria-hidden="true"
      />

      {/* Ambient discovery glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-220px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#00ff66]/[0.045] blur-[140px]"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.45, 0.7, 0.45],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-6 sm:px-8 lg:px-12">
        <button
          onClick={() => router.push('/')}
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5 text-[11px] font-black tracking-[0.2em] text-white/45 backdrop-blur-xl transition-all hover:border-[#00ff66]/30 hover:bg-[#00ff66]/[0.06] hover:text-[#00ff66]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          HOME
        </button>

        <div className="hidden items-center gap-2 text-[10px] font-black tracking-[0.3em] text-white/55 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff66]" />
          SPORTORA DISCOVERY
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-20 mx-auto max-w-6xl px-5 pb-10 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-[#00ff66]" />
            <span className="text-[10px] font-black tracking-[0.35em] text-[#00ff66]">
              LIVE TOURNAMENT DISCOVERY
            </span>
            <Sparkles className="h-3.5 w-3.5 text-[#00ff66]" />
          </div>

          <h1 className="text-5xl font-black uppercase leading-[0.84] tracking-[-0.06em] sm:text-7xl md:text-8xl">
            FIND YOUR
            <br />
            <span className="text-[#00ff66] sportora-text-glow">
              ARENA.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Every match. Every city. Every opportunity.
            <br className="hidden sm:block" />
            Find the tournament that feels like yours.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-10 max-w-4xl"
        >
          <div
            className={`relative rounded-[24px] border bg-black/50 p-2 backdrop-blur-2xl transition-all duration-500 ${
              searchFocused
                ? 'border-[#00ff66]/40 shadow-[0_0_70px_rgba(0,255,102,0.08)]'
                : 'border-white/10'
            }`}
          >
            <div className="absolute -inset-px -z-10 rounded-[24px] bg-[#00ff66]/10 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />

            <div className="flex items-center">
              <Search
                className={`ml-4 h-5 w-5 shrink-0 transition-colors ${
                  searchFocused ? 'text-[#00ff66]' : 'text-white/45'
                }`}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    updateFilters();
                  }
                }}
                placeholder="Search tournaments, sports, cities..."
                className="min-w-0 flex-1 bg-transparent px-4 py-5 text-sm text-white outline-none placeholder:text-white/55 sm:text-base"
              />

              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    updateFilters('', state, city, sport);
                  }}
                  className="mr-2 rounded-full p-2 text-white/45 transition hover:bg-white/5 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => updateFilters()}
                className="group flex shrink-0 items-center gap-2 rounded-[16px] bg-[#00ff66] px-4 py-3.5 text-[11px] font-black tracking-wider text-black transition-all hover:scale-[1.02] hover:bg-[#39ff88] sm:px-6"
              >
                SEARCH
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick sports */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-5 flex flex-wrap items-center gap-2"
        >
          <span className="mr-2 text-[10px] font-black tracking-[0.25em] text-white/55">
            TRENDING
          </span>

          {SPORTS.slice(0, 4).map((item) => {
            const active = sport === item;

            return (
              <button
                key={item}
                onClick={() => {
                  const nextSportConfig = sportsConfig.find(
                    (config) => config.sport === item,
                  );
                  const nextCompetition =
                    nextSportConfig?.competitions?.[0]?.type || '';
                  const nextFormat =
                    nextSportConfig?.competitions?.[0]?.supportedFormats?.[0] || '';

                  setSport(item);
                  setCompetitionType(nextCompetition);
                  setFormat(nextFormat);

                  updateFilters(
                    search,
                    state,
                    city,
                    item,
                    status,
                    nextCompetition,
                    nextFormat,
                  );
                }}
                className={`rounded-full border px-3.5 py-2 text-[10px] font-black tracking-wider transition-all ${
                  active
                    ? 'border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66]'
                    : 'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white'
                }`}
              >
                {item}
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* Filters */}
      <section className="relative z-20 mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 rounded-[26px] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.25em] text-white/45">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            FILTER
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <label className="group flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-white/20">
              <Trophy className="h-4 w-4 text-[#00ff66]" />
              <select
                value={sport}
                onChange={(event) => {
                  const value = event.target.value;
                  setSport(value);

                  updateFilters(
                    search,
                    state,
                    city,
                    value,
                    status,
                    competitionType,
                    format,
                    startDateFrom,
                    startDateTo,
                    minEntryFee,
                    maxEntryFee,
                  );
                }}
                className="w-full bg-transparent text-xs font-bold text-white outline-none"
              >
                <option value="" className="bg-[#080b0d]">
                  ALL SPORTS
                </option>
                {SPORTS.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-[#080b0d]"
                  >
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="group flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-white/20">
              <MapPin className="h-4 w-4 text-[#00ff66]" />
              <select
                value={state}
                onChange={(event) => {
                  const value = event.target.value;
                  setState(value);
                  setCity('');
                  updateFilters(
                    search,
                    value,
                    '',
                    sport,
                    status,
                    competitionType,
                    format,
                    startDateFrom,
                    startDateTo,
                    minEntryFee,
                    maxEntryFee,
                  );
                }}
                className="w-full bg-transparent text-xs font-bold text-white outline-none"
              >
                <option value="" className="bg-[#080b0d]">
                  ALL STATES
                </option>
                {availableStates.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-[#080b0d]"
                  >
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="group flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-white/20">
              <MapPin className="h-4 w-4 text-[#00ff66]" />
              <select
                value={city}
                disabled={!state || locationsLoading}
                onChange={(event) => {
                  const value = event.target.value;
                  setCity(value);
                  updateFilters(
                    search,
                    state,
                    value,
                    sport,
                    status,
                    competitionType,
                    format,
                    startDateFrom,
                    startDateTo,
                    minEntryFee,
                    maxEntryFee,
                  );
                }}
                className="w-full bg-transparent text-xs font-bold text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" className="bg-[#080b0d]">
                  {!state
                    ? 'SELECT STATE FIRST'
                    : locationsLoading
                      ? 'LOADING CITIES...'
                      : 'ALL CITIES'}
                </option>
                {availableCities.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-[#080b0d]"
                  >
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="group flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3.5 py-3 transition hover:border-white/20">
              <Calendar className="h-4 w-4 text-[#00ff66]" />
              <input
                type="date"
                value={startDateFrom}
                onChange={(event) => {
                  const value = event.target.value;
                  setStartDateFrom(value);
                  setStartDateTo(value);

                  updateFilters(
                    search,
                    state,
                    city,
                    sport,
                    status,
                    competitionType,
                    format,
                    value,
                    value,
                    minEntryFee,
                    maxEntryFee,
                  );
                }}
                className="w-full bg-transparent text-xs font-bold text-white outline-none [color-scheme:dark]"
                title="Particular Date"
                aria-label="Particular Date"
              />
            </label>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-[10px] font-black tracking-wider text-white/55 transition hover:border-red-400/30 hover:text-red-300"
            >
              <X className="h-3.5 w-3.5" />
              CLEAR
            </button>
          )}
        </div>
      </section>

      <TournamentsGrid
          query={search}
          state={state}
          city={city}
          sport={sport}
          competitionType={competitionType}
          format={format}
          status={status}
          startDateFrom={startDateFrom}
          startDateTo={startDateTo}
          minEntryFee={minEntryFee}
          maxEntryFee={maxEntryFee}
        />
    </main>
  );
}


export default function TournamentsPage() {
  return (
    <Suspense fallback={null}>
      <TournamentsPageContent />
    </Suspense>
  );
}
