'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Trophy,
  UserRound,
  CheckCircle2,
  CircleDot,
} from 'lucide-react';

type Player = {
  id: string;
  fullName: string;
  profileImage: string;
  city: string;
  state: string;
  role: string;
};

type Match = {
  _id: string;
  tournamentId: string;
  round: string;
  matchNumber: number;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  currentSet: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  winner?: string;
  nextMatchId?: string;
  playerA: Player | null;
  playerB: Player | null;
};

type FixtureMatchCenterProps = {
  tournamentId: string;
  tournamentTitle?: string;
  venue?: string;
  date?: string;
};

const roundLabels: Record<string, string> = {
  ROUND_1: 'ROUND 1',
  ROUND_OF_64: 'ROUND OF 64',
  ROUND_OF_32: 'ROUND OF 32',
  ROUND_OF_16: 'ROUND OF 16',
  QUARTER_FINAL: 'QUARTER FINAL',
  SEMI_FINAL: 'SEMI FINAL',
  FINAL: 'FINAL',
};

function formatRound(round: string) {
  return (
    roundLabels[round] ||
    round.replaceAll('_', ' ')
  );
}

function PlayerSlot({
  player,
  fallback,
  winner,
}: {
  player: Player | null;
  fallback: string;
  winner: boolean;
}) {
  if (!player) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <UserRound className="w-4 h-4 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-gray-500">
              {fallback}
            </p>
            <p className="text-[10px] text-gray-600">
              Awaiting player
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-3 ${
        winner
          ? 'border-[#00FF66]/30 bg-[#00FF66]/5'
          : 'border-white/5 bg-white/[0.03]'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {player.profileImage ? (
          <img
            src={player.profileImage}
            alt={player.fullName}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <UserRound className="w-4 h-4 text-gray-400" />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate">
            {player.fullName}
          </p>
          <p className="text-[10px] text-gray-500 truncate">
            {player.city || 'Unknown City'}
            {player.state ? `, ${player.state}` : ''}
          </p>
        </div>
      </div>

      {winner && (
        <span className="text-[9px] font-black uppercase text-[#00FF66] ml-2">
          Winner
        </span>
      )}
    </div>
  );
}

function MatchCard({
  match,
  onEnterResult,
}: {
  match: Match;
  onEnterResult: (match: Match) => void;
}) {
  const isBye =
    match.teamA === 'BYE' ||
    match.teamB === 'BYE';

  const isTbd =
    match.teamA === 'TBD' ||
    match.teamB === 'TBD';

  const isCompleted =
    match.status === 'COMPLETED';

  return (
    <div className="bg-[#121722] border border-white/10 rounded-[24px] p-4 space-y-4 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase">
            Match #{match.matchNumber}
          </p>
          <p className="text-xs font-black italic uppercase text-white mt-1">
            {formatRound(match.round)}
          </p>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase ${
            isCompleted
              ? 'bg-[#00FF66]/10 text-[#00FF66]'
              : isBye
                ? 'bg-yellow-400/10 text-yellow-300'
                : match.status === 'LIVE'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-white/5 text-gray-400'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : match.status === 'LIVE' ? (
            <CircleDot className="w-3 h-3" />
          ) : (
            <Clock3 className="w-3 h-3" />
          )}

          {isBye
            ? 'BYE • AUTO ADVANCED'
            : match.status}
        </div>
      </div>

      <div className="space-y-2">
        <PlayerSlot
          player={match.playerA}
          fallback={
            match.teamA === 'BYE'
              ? 'BYE'
              : match.teamA === 'TBD'
                ? 'TBD'
                : 'PLAYER'
          }
          winner={
            isCompleted &&
            match.winner === match.teamA
          }
        />

        <div className="flex items-center justify-center">
          <div className="text-[9px] font-black text-gray-600">
            VS
          </div>
        </div>

        <PlayerSlot
          player={match.playerB}
          fallback={
            match.teamB === 'BYE'
              ? 'BYE'
              : match.teamB === 'TBD'
                ? 'TBD'
                : 'PLAYER'
          }
          winner={
            isCompleted &&
            match.winner === match.teamB
          }
        />
      </div>

      {isCompleted && !isBye && (
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-[10px] font-mono uppercase text-gray-500">
            Final Score
          </span>
          <span className="text-lg font-black text-white">
            {match.scoreA} — {match.scoreB}
          </span>
        </div>
      )}

      {isTbd && (
        <div className="text-center text-[9px] font-mono uppercase text-gray-600 border-t border-white/5 pt-3">
          Waiting for previous round result
        </div>
      )}

      {!isBye && !isCompleted && (
        <button
          type="button"
          onClick={() => onEnterResult(match)}
          className="w-full rounded-xl bg-[#00FF66] px-4 py-3 text-[10px] font-black uppercase text-black hover:bg-emerald-300 transition-all"
        >
          Enter Result
        </button>
      )}
    </div>
  );
}

export default function FixtureMatchCenter({
  tournamentId,
  tournamentTitle,
  venue,
  date,
}: FixtureMatchCenterProps) {
  const [matches, setMatches] =
    useState<Match[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');

  const [selectedMatch, setSelectedMatch] =
    useState<Match | null>(null);

  const [scoreA, setScoreA] =
    useState('');

  const [scoreB, setScoreB] =
    useState('');

  const [winner, setWinner] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const [resultError, setResultError] =
    useState('');

  const [resultSuccess, setResultSuccess] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/matches/tournament/${tournamentId}`,
          {
            cache: 'no-store',
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              'Failed to load tournament fixtures.',
          );
        }

        if (!cancelled) {
          setMatches(data.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load tournament fixtures.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  function openResultModal(match: Match) {
    setSelectedMatch(match);
    setScoreA(
      match.scoreA > 0 ? String(match.scoreA) : '',
    );
    setScoreB(
      match.scoreB > 0 ? String(match.scoreB) : '',
    );
    setWinner('');
    setResultError('');
    setResultSuccess('');
  }

  function closeResultModal() {
    if (submitting) return;

    setSelectedMatch(null);
    setScoreA('');
    setScoreB('');
    setWinner('');
    setResultError('');
  }

  async function submitResult() {
    if (!selectedMatch) return;

    const parsedScoreA = Number(scoreA);
    const parsedScoreB = Number(scoreB);

    if (
      !Number.isInteger(parsedScoreA) ||
      parsedScoreA < 0 ||
      !Number.isInteger(parsedScoreB) ||
      parsedScoreB < 0
    ) {
      setResultError(
        'Please enter valid non-negative scores.',
      );
      return;
    }

    if (
      !selectedMatch.playerA ||
      !selectedMatch.playerB
    ) {
      setResultError(
        'Both players must be assigned before entering a result.',
      );
      return;
    }

    if (
      winner !== selectedMatch.teamA &&
      winner !== selectedMatch.teamB
    ) {
      setResultError(
        'Please select the match winner.',
      );
      return;
    }

    if (parsedScoreA === parsedScoreB) {
      setResultError(
        'A knockout match cannot finish with a tie.',
      );
      return;
    }

    const scoreWinner =
      parsedScoreA > parsedScoreB
        ? selectedMatch.teamA
        : selectedMatch.teamB;

    if (winner !== scoreWinner) {
      setResultError(
        'Winner must match the player with the higher score.',
      );
      return;
    }

    try {
      setSubmitting(true);
      setResultError('');
      setResultSuccess('');

      const response = await fetch(
        `/api/matches/${selectedMatch._id}/score`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            scoreA: parsedScoreA,
            scoreB: parsedScoreB,
            status: 'COMPLETED',
            winner,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Failed to submit match result.',
        );
      }

      setMatches((currentMatches) =>
        currentMatches.map((currentMatch) =>
          currentMatch._id === selectedMatch._id
            ? {
                ...currentMatch,
                scoreA: parsedScoreA,
                scoreB: parsedScoreB,
                status: 'COMPLETED',
                winner,
              }
            : currentMatch,
        ),
      );

      setResultSuccess(
        'Result saved. Winner advanced automatically.',
      );

      setTimeout(async () => {
        try {
          const refreshResponse = await fetch(
            `/api/matches/tournament/${tournamentId}`,
            {
              cache: 'no-store',
            },
          );

          const refreshData =
            await refreshResponse.json();

          if (
            refreshResponse.ok &&
            refreshData.success
          ) {
            setMatches(refreshData.data ?? []);
          }
        } finally {
          setSelectedMatch(null);
          setResultSuccess('');
          setScoreA('');
          setScoreB('');
          setWinner('');
        }
      }, 700);
    } catch (err) {
      setResultError(
        err instanceof Error
          ? err.message
          : 'Failed to submit match result.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const groupedMatches = useMemo(() => {
    const groups = new Map<
      string,
      Match[]
    >();

    for (const match of matches) {
      const existing =
        groups.get(match.round) ?? [];

      existing.push(match);
      groups.set(match.round, existing);
    }

    return Array.from(groups.entries());
  }, [matches]);

  const completedCount = matches.filter(
    (match) => match.status === 'COMPLETED',
  ).length;

  const byeCount = matches.filter(
    (match) =>
      match.teamA === 'BYE' ||
      match.teamB === 'BYE',
  ).length;

  const finalMatch =
    matches.find((match) => match.round === 'FINAL') ?? null;

  const tournamentCompleted =
    finalMatch?.status === 'COMPLETED' &&
    Boolean(finalMatch.winner);

  const champion =
    tournamentCompleted && finalMatch
      ? finalMatch.winner === finalMatch.teamA
        ? finalMatch.playerA
        : finalMatch.playerB
      : null;

  const runnerUp =
    tournamentCompleted && finalMatch
      ? finalMatch.winner === finalMatch.teamA
        ? finalMatch.playerB
        : finalMatch.playerA
      : null;

  if (loading) {
    return (
      <section className="bg-[#0D1118] border border-white/10 rounded-[32px] p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 bg-white/5 rounded" />
          <div className="h-4 w-96 bg-white/5 rounded" />
          <div className="h-32 bg-white/5 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-red-500/5 border border-red-500/20 rounded-[32px] p-8">
        <p className="text-sm font-black uppercase text-red-400">
          Fixture Center Error
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="bg-[#0D1118] border border-white/10 rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#00FF66]/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#00FF66]" />
              </div>

              <div>
                <p className="text-[10px] font-mono font-bold uppercase text-[#00FF66]">
                  Organizer Control
                </p>
                <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white">
                  Fixture & Match Center
                </h2>
              </div>
            </div>

            {tournamentTitle && (
              <p className="text-sm text-gray-300 mt-5">
                {tournamentTitle}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-mono uppercase text-gray-500">
              {venue && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {venue}
                </span>
              )}

              {date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {date}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-center">
              <p className="text-xl font-black text-white">
                {matches.length}
              </p>
              <p className="text-[8px] font-mono uppercase text-gray-500">
                Matches
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-center">
              <p className="text-xl font-black text-[#00FF66]">
                {completedCount}
              </p>
              <p className="text-[8px] font-mono uppercase text-gray-500">
                Completed
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3 text-center">
              <p className="text-xl font-black text-yellow-300">
                {byeCount}
              </p>
              <p className="text-[8px] font-mono uppercase text-gray-500">
                Byes
              </p>
            </div>
          </div>
        </div>
      </div>

      {tournamentCompleted && champion && runnerUp && finalMatch && (
        <div className="relative overflow-hidden rounded-[32px] border border-[#00FF66]/20 bg-gradient-to-br from-[#00FF66]/10 via-[#0D1118] to-[#121722] p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#00FF66]/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#00FF66]" />
                  <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#00FF66]">
                    Tournament Results
                  </p>
                </div>

                <h3 className="mt-2 text-2xl sm:text-3xl font-black italic uppercase text-white">
                  Tournament Completed
                </h3>
              </div>

              <div className="rounded-full border border-[#00FF66]/20 bg-[#00FF66]/10 px-4 py-2 text-[9px] font-black uppercase text-[#00FF66]">
                Final Result
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr_1fr] gap-4 items-stretch">
              <div className="rounded-[26px] border border-[#00FF66]/25 bg-black/20 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥇</span>
                  <p className="text-[9px] font-mono font-black uppercase tracking-widest text-[#00FF66]">
                    Champion
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  {champion.profileImage ? (
                    <img
                      src={champion.profileImage}
                      alt={champion.fullName}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#00FF66]/10 flex items-center justify-center">
                      <UserRound className="w-6 h-6 text-[#00FF66]" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xl font-black text-white truncate">
                      {champion.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {champion.city || 'Unknown City'}
                      {champion.state ? `, ${champion.state}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5 sm:p-6 flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-mono font-black uppercase tracking-widest text-gray-500">
                  Final Score
                </p>

                <p className="mt-3 text-4xl sm:text-5xl font-black text-white">
                  {finalMatch.scoreA}
                  <span className="mx-2 text-gray-600">—</span>
                  {finalMatch.scoreB}
                </p>

                <p className="mt-3 text-[9px] font-mono uppercase text-gray-600">
                  Match #{finalMatch.matchNumber}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-black/20 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥈</span>
                  <p className="text-[9px] font-mono font-black uppercase tracking-widest text-gray-400">
                    Runner-up
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  {runnerUp.profileImage ? (
                    <img
                      src={runnerUp.profileImage}
                      alt={runnerUp.fullName}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                      <UserRound className="w-6 h-6 text-gray-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xl font-black text-white truncate">
                      {runnerUp.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {runnerUp.city || 'Unknown City'}
                      {runnerUp.state ? `, ${runnerUp.state}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-[9px] font-mono font-black uppercase tracking-widest text-gray-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
              Final completed • Champion declared automatically
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="bg-[#121722] border border-white/10 rounded-[28px] p-10 text-center">
          <Trophy className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-sm font-black uppercase text-gray-400 mt-4">
            Fixtures Not Generated
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Generate fixtures after registration closes.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedMatches.map(
            ([round, roundMatches]) => (
              <div key={round}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <h3 className="text-xs font-black italic uppercase text-gray-400">
                    {formatRound(round)}
                  </h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {roundMatches.map(
                    (match) => (
                      <MatchCard
                        key={match._id}
                        match={match}
                        onEnterResult={openResultModal}
                      />
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
      {selectedMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#121722] p-5 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">
                  Match #{selectedMatch.matchNumber}
                </p>
                <h3 className="mt-1 text-xl font-black uppercase italic text-white">
                  Enter Result
                </h3>
                <p className="mt-1 text-[10px] uppercase text-gray-500">
                  {formatRound(selectedMatch.round)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeResultModal}
                disabled={submitting}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: selectedMatch.teamA,
                  player: selectedMatch.playerA,
                  score: scoreA,
                  setScore: setScoreA,
                },
                {
                  id: selectedMatch.teamB,
                  player: selectedMatch.playerB,
                  score: scoreB,
                  setScore: setScoreB,
                },
              ].map((slot) => (
                <div
                  key={slot.id}
                  className={`rounded-2xl border p-3 transition-all ${
                    winner === slot.id
                      ? 'border-[#00FF66]/40 bg-[#00FF66]/5'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white">
                        {slot.player?.fullName ?? 'Player'}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {slot.player?.city || 'Unknown City'}
                        {slot.player?.state
                          ? `, ${slot.player.state}`
                          : ''}
                      </p>
                    </div>

                    <input
                      type="number"
                      min="0"
                      value={slot.score}
                      onChange={(event) =>
                        slot.setScore(event.target.value)
                      }
                      disabled={submitting}
                      className="w-20 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center text-lg font-black text-white outline-none focus:border-[#00FF66]"
                    />

                    <button
                      type="button"
                      onClick={() => setWinner(slot.id)}
                      disabled={submitting}
                      className={`rounded-xl px-3 py-2 text-[9px] font-black uppercase transition-all ${
                        winner === slot.id
                          ? 'bg-[#00FF66] text-black'
                          : 'border border-white/10 bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {winner === slot.id
                        ? 'Winner'
                        : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {resultError && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-[10px] font-bold text-red-300">
                {resultError}
              </div>
            )}

            {resultSuccess && (
              <div className="mt-4 rounded-xl border border-[#00FF66]/20 bg-[#00FF66]/10 px-4 py-3 text-[10px] font-bold text-[#00FF66]">
                {resultSuccess}
              </div>
            )}

            <button
              type="button"
              onClick={submitResult}
              disabled={submitting}
              className="mt-5 w-full rounded-xl bg-[#00FF66] px-4 py-3 text-[10px] font-black uppercase text-black transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? 'Saving Result...'
                : 'Submit Result'}
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
