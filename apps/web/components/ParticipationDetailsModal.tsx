'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';

interface CompetitionParticipant {
  userId: string;
  role: 'CAPTAIN' | 'PLAYER' | 'SUBSTITUTE';
}

interface CompetitionEntry {
  _id: string;
  tournamentId: string;
  registrationId: string;
  captainId: string;
  competitionType: string;
  displayName?: string;
  participants: CompetitionParticipant[];
  teamSheetUrl?: string;
  status:
    | 'PENDING_DETAILS'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'REJECTED';
  rejectionReason?: string;
}

interface PlayerSearchResult {
  id: string;
  fullName: string;
  profileImage?: string;
  city?: string;
  state?: string;
}

interface CompetitionRules {
  participantCount: number;
  requiresRoster: boolean;
  defaultPlayingSize?: number;
  allowsSubstitutes?: boolean;
  requiresMixedGender?: boolean;
}

interface ParticipationDetailsModalProps {
  open: boolean;
  registrationId: string;
  competitionType: string;
  competitionRules?: CompetitionRules;
  tournamentTitle: string;
  onClose: () => void;
  onSaved?: (entry: CompetitionEntry) => void;
}

function normalizeType(value: string) {
  return value.trim().toUpperCase();
}

export default function ParticipationDetailsModal({
  open,
  registrationId,
  competitionType,
  competitionRules,
  tournamentTitle,
  onClose,
  onSaved,
}: ParticipationDetailsModalProps) {
  const [entry, setEntry] =
    useState<CompetitionEntry | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [participants, setParticipants] = useState<
    CompetitionParticipant[]
  >([]);

  const [searchIndex, setSearchIndex] = useState<
    number | null
  >(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    PlayerSearchResult[]
  >([]);

  const [playerDetails, setPlayerDetails] = useState<
    Record<string, PlayerSearchResult>
  >({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const type = normalizeType(competitionType);

  const requiresRoster =
    competitionRules?.requiresRoster ?? type !== 'SINGLES';

  const requiredPlayers =
    competitionRules?.defaultPlayingSize ??
    (type === 'DOUBLES' || type === 'MIXED_DOUBLES'
      ? 2
      : 1);

  const allowsSubstitutes =
    competitionRules?.allowsSubstitutes ?? false;

  const regularPlayers = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.role !== 'SUBSTITUTE',
      ),
    [participants],
  );

  const substitutes = useMemo(
    () =>
      participants.filter(
        (participant) =>
          participant.role === 'SUBSTITUTE',
      ),
    [participants],
  );

  const regularCount = regularPlayers.filter(
    (participant) => Boolean(participant.userId),
  ).length;

  const isComplete =
    !requiresRoster ||
    regularCount >= requiredPlayers;

  const isSubmitted =
    entry?.status === 'SUBMITTED' ||
    entry?.status === 'APPROVED';

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadEntry() {
      setLoading(true);
      setError('');
      setMessage('');

      try {
        const response = await fetch(
          `/api/competition-entry/registration/${registrationId}`,
          {
            credentials: 'include',
            cache: 'no-store',
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              'Unable to load participation details.',
          );
        }

        if (cancelled) return;

        const loaded =
          data.data as CompetitionEntry;

        setEntry(loaded);
        setDisplayName(
          loaded.displayName ?? '',
        );
        setParticipants(
          loaded.participants ?? [],
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load participation details.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEntry();

    return () => {
      cancelled = true;
    };
  }, [open, registrationId]);

  useEffect(() => {
    if (
      searchIndex === null ||
      searchQuery.trim().length < 2
    ) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(
      async () => {
        try {
          const response = await fetch(
            `/api/users/search?q=${encodeURIComponent(
              searchQuery.trim(),
            )}`,
            {
              credentials: 'include',
              cache: 'no-store',
            },
          );

          const data = await response.json();

          if (!cancelled && response.ok && data.success) {
            setSearchResults(
              data.data ?? [],
            );
          }
        } catch {
          if (!cancelled) {
            setSearchResults([]);
          }
        }
      },
      300,
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, searchIndex]);

  function addPlayerSlot(role: 'PLAYER' | 'SUBSTITUTE') {
    setParticipants((current) => {
      const nextIndex = current.length;

      setSearchIndex(nextIndex);
      setSearchQuery('');
      setSearchResults([]);

      return [
        ...current,
        {
          userId: '',
          role,
        },
      ];
    });
  }

  function removePlayer(index: number) {
    setParticipants((current) =>
      current.filter(
        (_, participantIndex) =>
          participantIndex !== index,
      ),
    );
  }

  function selectPlayer(
    index: number,
    player: PlayerSearchResult,
  ) {
    setParticipants((current) =>
      current.map((participant, participantIndex) =>
        participantIndex === index
          ? {
              ...participant,
              userId: player.id,
            }
          : participant,
      ),
    );

    setPlayerDetails((current) => ({
      ...current,
      [player.id]: player,
    }));

    setSearchIndex(null);
    setSearchQuery('');
    setSearchResults([]);
  }

  function getPlayerName(userId: string) {
    if (!userId) return '';

    if (entry?.captainId === userId) {
      return 'Captain';
    }

    return playerDetails[userId]?.fullName ?? userId;
  }

  async function save(
    finalize: boolean,
  ) {
    setError('');
    setMessage('');

    if (!entry) {
      setError(
        'Participation entry is not loaded yet.',
      );
      return;
    }

    if (isSubmitted) {
      setError(
        'Participation details have already been submitted.',
      );
      return;
    }

    const missingPlayers =
      participants.filter(
        (participant) => !participant.userId,
      );

    if (missingPlayers.length > 0) {
      setError(
        'Please select a Sportora player for every roster slot.',
      );
      return;
    }

    if (
      finalize &&
      requiresRoster &&
      regularCount < requiredPlayers
    ) {
      setError(
        `Final submission requires ${requiredPlayers} players. You currently have ${regularCount}.`,
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        finalize
          ? `/api/competition-entry/registration/${registrationId}`
          : `/api/competition-entry/registration/${registrationId}/draft`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            displayName:
              displayName.trim() || undefined,
            participants,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            'Unable to save participation details.',
        );
      }

      const updated =
        data.data as CompetitionEntry;

      setEntry(updated);
      setParticipants(
        updated.participants ?? [],
      );

      setMessage(
        finalize
          ? 'Participation details submitted successfully.'
          : 'Draft saved successfully.',
      );

      onSaved?.(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save participation details.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#080b0a] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Close participation details"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-white/10 px-6 py-6 pr-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00ff66]/10 text-[#00ff66]">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00ff66]">
                PARTICIPATION DETAILS
              </p>

              <h2 className="mt-1 text-xl font-black uppercase italic text-white">
                {tournamentTitle}
              </h2>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/60">
              {type.replaceAll('_', ' ')}
            </span>

            {requiresRoster && (
              <span
                className={`rounded-full border px-3 py-1.5 ${
                  isComplete
                    ? 'border-[#00ff66]/30 bg-[#00ff66]/10 text-[#00ff66]'
                    : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-300'
                }`}
              >
                {regularCount} / {requiredPlayers} PLAYERS
              </span>
            )}

            {entry?.status && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/50">
                {entry.status.replaceAll('_', ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#00ff66]" />
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="flex items-start gap-3 rounded-2xl border border-[#00ff66]/20 bg-[#00ff66]/10 p-4 text-xs text-[#00ff66]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {type !== 'SINGLES' && (
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {type === 'TEAM' || type === 'RELAY'
                      ? 'Team Name'
                      : 'Pair Name'}
                  </label>

                  <input
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(
                        event.target.value,
                      )
                    }
                    disabled={isSubmitted}
                    placeholder={
                      type === 'TEAM' ||
                      type === 'RELAY'
                        ? 'Enter team name'
                        : 'Enter pair name'
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#00ff66]/40 disabled:opacity-50"
                  />
                </div>
              )}

              {type === 'SINGLES' ? (
                <div className="rounded-2xl border border-[#00ff66]/20 bg-[#00ff66]/5 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#00ff66]" />
                    <div>
                      <p className="text-sm font-bold text-white">
                        Singles registration complete
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        No additional participation roster is required.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {type === 'TEAM' ||
                          type === 'RELAY'
                            ? 'Player Roster'
                            : 'Pair Members'}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          Captain is already included. Add other Sportora players below.
                        </p>
                      </div>

                      {requiresRoster && (
                        <span className="text-xs font-mono font-bold text-white/50">
                          {regularCount}/{requiredPlayers}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {participants.map(
                        (
                          participant,
                          index,
                        ) => (
                          <div
                            key={`${index}-${participant.userId}`}
                            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-white/50">
                                {index + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                {entry?.captainId ===
                                participant.userId ? (
                                  <div>
                                    <p className="text-sm font-bold text-white">
                                      Captain
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-[#00ff66]">
                                      TEAM CAPTAIN
                                    </p>
                                  </div>
                                ) : participant.userId ? (
                                  <p className="truncate text-sm font-bold text-white">
                                    {getPlayerName(
                                      participant.userId,
                                    )}
                                  </p>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={
                                      isSubmitted
                                    }
                                    onClick={() => {
                                      setSearchIndex(
                                        index,
                                      );
                                      setSearchQuery(
                                        '',
                                      );
                                    }}
                                    className="flex w-full items-center gap-2 text-left text-sm text-white/40 transition hover:text-[#00ff66]"
                                  >
                                    <Search className="h-4 w-4" />
                                    Search player
                                  </button>
                                )}
                              </div>

                              {entry?.captainId !==
                                participant.userId &&
                                !isSubmitted && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removePlayer(
                                        index,
                                      )
                                    }
                                    className="rounded-xl p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                                    aria-label="Remove player"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                            </div>

                            {searchIndex ===
                              index && (
                              <div className="mt-3 border-t border-white/10 pt-3">
                                <div className="relative">
                                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                                  <input
                                    autoFocus
                                    value={
                                      searchQuery
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      setSearchQuery(
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Search player by name or email"
                                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-3 text-xs text-white outline-none focus:border-[#00ff66]/40"
                                  />
                                </div>

                                {searchResults.length >
                                  0 && (
                                  <div className="mt-2 space-y-1">
                                    {searchResults.map(
                                      (player) => (
                                        <button
                                          type="button"
                                          key={
                                            player.id
                                          }
                                          onClick={() =>
                                            selectPlayer(
                                              index,
                                              player,
                                            )
                                          }
                                          className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/5"
                                        >
                                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-bold text-white/60">
                                            {player.profileImage ? (
                                              <img
                                                src={
                                                  player.profileImage
                                                }
                                                alt=""
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              player.fullName
                                                .slice(
                                                  0,
                                                  1,
                                                )
                                                .toUpperCase()
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-white">
                                              {
                                                player.fullName
                                              }
                                            </p>
                                            <p className="truncate text-[10px] text-white/35">
                                              {
                                                player.city
                                              }
                                              {player.city &&
                                              player.state
                                                ? ', '
                                                : ''}
                                              {
                                                player.state
                                              }
                                            </p>
                                          </div>
                                        </button>
                                      ),
                                    )}
                                  </div>
                                )}

                                {searchQuery.trim().length >=
                                  2 &&
                                  searchResults.length ===
                                    0 && (
                                    <p className="px-2 pt-3 text-[10px] text-white/30">
                                      No Sportora player found.
                                    </p>
                                  )}
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>

                    {!isSubmitted &&
                      (regularCount <
                        requiredPlayers ||
                        allowsSubstitutes) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {regularCount <
                            requiredPlayers && (
                            <button
                              type="button"
                              onClick={() =>
                                addPlayerSlot(
                                  'PLAYER',
                                )
                              }
                              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-[#00ff66]/30 hover:text-[#00ff66]"
                            >
                              <Plus className="h-4 w-4" />
                              Add Player
                            </button>
                          )}

                          {allowsSubstitutes && (
                            <button
                              type="button"
                              onClick={() =>
                                addPlayerSlot(
                                  'SUBSTITUTE',
                                )
                              }
                              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-[#00ff66]/30 hover:text-[#00ff66]"
                            >
                              <Plus className="h-4 w-4" />
                              Add Substitute
                            </button>
                          )}
                        </div>
                      )}
                  </div>

                  {!isComplete && (
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
                      <p className="text-xs font-bold text-yellow-300">
                        {requiredPlayers -
                          regularCount}{' '}
                        more player
                        {requiredPlayers -
                          regularCount ===
                        1
                          ? ''
                          : 's'} required before final submission.
                      </p>
                      <p className="mt-1 text-[10px] text-yellow-200/50">
                        You can save this roster as a draft and complete it later before the registration deadline.
                      </p>
                    </div>
                  )}

                  {allowsSubstitutes &&
                    substitutes.length > 0 && (
                      <p className="text-[10px] text-white/30">
                        {substitutes.length} substitute
                        {substitutes.length === 1
                          ? ''
                          : 's'} added.
                      </p>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {type !== 'SINGLES' &&
          !loading &&
          !isSubmitted && (
            <div className="border-t border-white/10 bg-black/20 px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => save(false)}
                  disabled={saving}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition hover:bg-white/10 disabled:opacity-40"
                >
                  {saving ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    'Save Draft'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => save(true)}
                  disabled={saving || !isComplete}
                  className="rounded-2xl bg-[#00ff66] px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition hover:shadow-[0_0_30px_rgba(0,255,102,0.25)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Submit Final
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
