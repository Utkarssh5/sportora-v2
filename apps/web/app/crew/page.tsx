'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";


import {
  Users,
  ShieldCheck,
  Star,
  Search,
  MapPin,
  BriefcaseBusiness,
  Bell,
  Check,
  X,
  CalendarDays,
  Clock3,
  IndianRupee,
  ArrowUpRight,
  CircleCheck,
  MapPinned,
  Play,
  Send,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import Navbar from '../../components/Navbar';

interface CrewProfile {
  _id: string;
  userId: string;
  fullName: string;
  role: string;
  sportsExpertise: string[];
  skills: string[];
  city: string;
  state: string;
  experienceYears: number;
  isAvailable: boolean;
  rating: number;
}

interface CrewWorkOpportunity {
  _id: string;
  tournamentId:
    | string
    | {
        _id: string;
        name?: string;
        title?: string;
        sport?: string;
        format?: string;
        type?: string;
        competitionType?: string;
        startDate?: string;
        endDate?: string;
        city?: string;
        state?: string;
        locationName?: string;
        organizer?: {
          fullName?: string;
        } | null;
      };
  requirementId: string;
  role: string;
  quantity: number;
  filledQuantity: number;
  payoutAmount: number;
  currency: string;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  publishedAt: string;
  createdAt?: string;
}

interface CrewWorkApplication {
  _id: string;
  opportunityId: string | { _id: string };
  tournamentId: string;
  requirementId: string;
  crewId: string;
  message?: string;
  status:
    | 'APPLIED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN';
  appliedAt: string;
  reviewedAt?: string;
}

interface CrewInvitation {
  _id: string;
  tournamentId:
    | string
    | {
        _id: string;
        name?: string;
        title?: string;
        startDate?: string;
        endDate?: string;
        city?: string;
        state?: string;
      };
  requirementId:
    | string
    | {
        _id: string;
        role?: string;
        quantity?: number;
        filledQuantity?: number;
      };
  eventDate: string;
  status:
    | 'INVITED'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'CANCELLED';
  message?: string;
  invitedAt: string;
  respondedAt?: string;
}


interface CrewAssignment {
  _id: string;
  tournamentId:
    | string
    | {
        _id: string;
        name?: string;
        title?: string;
        city?: string;
        state?: string;
      };
  requirementId?:
    | string
    | {
        _id: string;
        role?: string;
      };
  eventDate: string;
  status:
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'COMPLETION_SUBMITTED'
    | 'VERIFIED'
    | 'PAYOUT_PENDING'
    | 'PAID';
  workStartedAt?: string;
  workCompletedAt?: string;
  completionProof?: string[];
  completionNote?: string;
}

const SPORTS = [
  'All',
  'Football',
  'Cricket',
  'Badminton',
  'Table Tennis',
  'Basketball',
  'Volleyball',
  'Hockey',
  'Tennis',
  'Kabaddi',
];

export default function CrewPage() {
  const router = useRouter();

  const [searchCity, setSearchCity] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [crewList, setCrewList] = useState<CrewProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  const [assignments, setAssignments] = useState<CrewAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [assignmentActionId, setAssignmentActionId] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState("");

  const [activeProofAssignment, setActiveProofAssignment] = useState<CrewAssignment | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [completionProofUrl, setCompletionProofUrl] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);

  const [invitations, setInvitations] = useState<
    CrewInvitation[]
  >([]);
  const [loadingInvitations, setLoadingInvitations] =
    useState(true);
  const [invitationActionId, setInvitationActionId] =
    useState<string | null>(null);
  const [invitationError, setInvitationError] =
    useState('');
  const [invitationSuccess, setInvitationSuccess] =
    useState('');

  const [workOpportunities, setWorkOpportunities] =
    useState<CrewWorkOpportunity[]>([]);
  const [myWorkApplications, setMyWorkApplications] =
    useState<CrewWorkApplication[]>([]);
  const [loadingWork, setLoadingWork] = useState(true);
  const [workError, setWorkError] = useState('');
  const [applyingOpportunityId, setApplyingOpportunityId] =
    useState<string | null>(null);
  const [workSuccess, setWorkSuccess] = useState('');

  const [selectedOpportunity, setSelectedOpportunity] =
    useState<CrewWorkOpportunity | null>(null);

  const [confirmOpportunity, setConfirmOpportunity] =
    useState<CrewWorkOpportunity | null>(null);

  const [scheduleConflict, setScheduleConflict] =
    useState<{
      message: string;
      tournamentId: string;
      tournamentTitle: string;
      startDate?: string;
      endDate?: string;
      role: 'PLAYER' | 'ORGANIZER';
    } | null>(null);



  useEffect(() => {
    const loadInvitations = async () => {
      try {
        setLoadingInvitations(true);
        setInvitationError('');

        const response = await fetch(
          '/api/tournament-crew/invitations/my',
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          },
        );

        const data = await response.json();

        // Public marketplace users may not be logged in.
        // Do not turn a normal 401 into a page-level error.
        if (response.status === 401) {
          setInvitations([]);
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              'Failed to load crew invitations.',
          );
        }

        setInvitations(data.data || []);
      } catch (err) {
        console.error(
          'Crew invitations error:',
          err,
        );

        setInvitationError(
          err instanceof Error
            ? err.message
            : 'Failed to load crew invitations.',
        );
      } finally {
        setLoadingInvitations(false);
      }
    };

    loadInvitations();
  }, []);

  
  const loadMyAssignments = async () => {
    try {
      setLoadingAssignments(true);
      setAssignmentError("");
      const res = await fetch("/api/tournament-crew/my-assignments", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        setAssignments([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to load assignments");
      setAssignments(data.data || []);
    } catch (err) {
      console.error("Crew assignments error:", err);
      setAssignmentError(err instanceof Error ? err.message : "Failed to load assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadMyAssignments();
  }, []);

  const handleStartWork = async (tournamentId: string, assignmentId: string) => {
    try {
      setAssignmentActionId(assignmentId);
      setAssignmentError("");
      setAssignmentSuccess("");
      const res = await fetch(`/api/tournament-crew/${tournamentId}/${assignmentId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Unable to start work");
      }
      setAssignmentSuccess("Work duty marked as IN PROGRESS!");
      await loadMyAssignments();
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : "Failed to start duty");
    } finally {
      setAssignmentActionId(null);
    }
  };

  const handleCompleteWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProofAssignment) return;
    const tournamentId = typeof activeProofAssignment.tournamentId === "object" ? activeProofAssignment.tournamentId._id : activeProofAssignment.tournamentId;
    try {
      setSubmittingProof(true);
      setAssignmentError("");
      setAssignmentSuccess("");
      const proofs = completionProofUrl.trim() ? [completionProofUrl.trim()] : [];
      const res = await fetch(`/api/tournament-crew/${tournamentId}/${activeProofAssignment._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          completionNote: completionNote.trim(),
          completionProof: proofs,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Unable to submit completion proof");
      }
      setAssignmentSuccess("Match-day duty completion proof submitted successfully!");
      setActiveProofAssignment(null);
      setCompletionNote("");
      setCompletionProofUrl("");
      await loadMyAssignments();
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleInvitationResponse = async (
    invitationId: string,
    responseValue: 'ACCEPTED' | 'DECLINED',
  ) => {
    try {
      setInvitationActionId(invitationId);
      setInvitationError('');
      setInvitationSuccess('');

      const response = await fetch(
        `/api/tournament-crew/invitations/${invitationId}/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            response: responseValue,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to respond to invitation.',
        );
      }

      setInvitations((current) =>
        current.map((invitation) =>
          invitation._id === invitationId
            ? {
                ...invitation,
                status: responseValue,
                respondedAt:
                  new Date().toISOString(),
              }
            : invitation,
        ),
      );

      setInvitationSuccess(
        responseValue === 'ACCEPTED'
          ? 'Invitation accepted. You are now assigned to the tournament.'
          : 'Invitation declined.',
      );
    } catch (err) {
      console.error(
        'Crew invitation response error:',
        err,
      );

      setInvitationError(
        err instanceof Error
          ? err.message
          : 'Unable to respond to invitation.',
      );
    } finally {
      setInvitationActionId(null);
    }
  };

  useEffect(() => {
    console.log('[CREW MARKETPLACE] EFFECT MOUNTED');

    const loadWorkMarketplace = async () => {
      console.log('[CREW MARKETPLACE] LOAD STARTED');
      try {
        setLoadingWork(true);
        setWorkError('');

        const [opportunitiesResponse, applicationsResponse] =
          await Promise.all([
            fetch('/api/tournament-crew/work-opportunities', {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store',
            }),
            fetch('/api/tournament-crew/work-applications/my', {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store',
            }),
          ]);

        if (opportunitiesResponse.status === 401) {
          setWorkOpportunities([]);
          setMyWorkApplications([]);
          return;
        }

        const opportunitiesData =
          await opportunitiesResponse.json();

        if (!opportunitiesResponse.ok) {
          throw new Error(
            opportunitiesData.error ||
              opportunitiesData.message ||
              'Unable to load paid work.',
          );
        }

        console.log(
          '[CREW MARKETPLACE] API DATA:',
          opportunitiesData,
        );
        console.log(
          '[CREW MARKETPLACE] OPPORTUNITIES:',
          opportunitiesData.data || [],
        );

        setWorkOpportunities(
          opportunitiesData.data || [],
        );

        if (applicationsResponse.ok) {
          const applicationsData =
            await applicationsResponse.json();

          setMyWorkApplications(
            applicationsData.data || [],
          );
        } else if (applicationsResponse.status === 401) {
          setMyWorkApplications([]);
        }
      } catch (err) {
        console.error(
          'Crew paid work marketplace error:',
          err,
        );

        setWorkError(
          err instanceof Error
            ? err.message
            : 'Unable to load paid work opportunities.',
        );
      } finally {
        setLoadingWork(false);
      }
    };

    loadWorkMarketplace();
  }, []);

  const handleApplyForWork = async (
    opportunityId: string,
  ) => {
    try {
      setApplyingOpportunityId(opportunityId);
      setWorkError('');
      setWorkSuccess('');

      const response = await fetch(
        `/api/tournament-crew/work-opportunities/by-opportunity/${opportunityId}/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({}),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        throw new Error(
          'Please login to apply for paid crew work.',
        );
      }

      if (!response.ok || !data.success) {
        if (
          data.code === 'SCHEDULE_CONFLICT' &&
          data.conflictTournament
        ) {
          const conflict = data.conflictTournament;

          setScheduleConflict({
            message:
              data.message ||
              'You already have a tournament scheduled on an overlapping date.',
            tournamentId: String(conflict.id || conflict._id),
            tournamentTitle:
              conflict.title ||
              conflict.name ||
              'Tournament',
            startDate: conflict.startDate,
            endDate: conflict.endDate,
            role:
              conflict.role === 'ORGANIZER'
                ? 'ORGANIZER'
                : 'PLAYER',
          });

          return;
        }

        throw new Error(
          data.error ||
            data.message ||
            'Unable to apply for this opportunity.',
        );
      }

      const application =
        data.data;

      if (application) {
        setMyWorkApplications((current) => [
          application,
          ...current,
        ]);
      }

      setWorkSuccess(
        'Application submitted. The tournament organizer can now review it.',
      );
    } catch (err) {
      console.error(
        'Crew work application error:',
        err,
      );

      setWorkError(
        err instanceof Error
          ? err.message
          : 'Unable to apply for this opportunity.',
      );
    } finally {
      setApplyingOpportunityId(null);
    }
  };

  useEffect(() => {
    const loadCrew = async () => {
      try {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();

        if (searchCity.trim()) {
          params.set('city', searchCity.trim());
        }

        if (selectedSport !== 'All') {
          params.set('sport', selectedSport);
        }

        const response = await fetch(
          `/api/crew/search?${params.toString()}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Failed to load Ground Crew.',
          );
        }

        setCrewList(data.data || []);
      } catch (err) {
        console.error('Crew marketplace error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load Ground Crew.',
        );
        setCrewList([]);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadCrew, 250);

    return () => clearTimeout(timeout);
  }, [searchCity, selectedSport]);

  return (
    <main className="min-h-screen bg-[#080B10] text-white selection:bg-[#00FF66] selection:text-black pt-28 pb-20 px-6">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-widest uppercase mb-3">
            <Users className="w-4 h-4" />
            ON-DEMAND MARKETPLACE
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            FIND GROUND CREW
          </h1>

          <p className="text-gray-400 mt-3 text-sm sm:text-base">
            Discover available referees, umpires, scorekeepers and
            volunteers for your sports events.
          </p>
        </div>


        
        {/* My Active Duties / Match-Day Assignments */}
        {!loadingAssignments && assignments.length > 0 && (
          <section className="max-w-5xl mx-auto mb-12">
            <div className="clean-glass rounded-3xl border border-[#00FF66]/20 bg-[#00FF66]/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00FF66]" />
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  My Active Duties (Match-Day)
                </h2>
                <span className="ml-auto rounded-full bg-[#00FF66]/10 border border-[#00FF66]/20 px-2.5 py-1 text-[10px] font-black text-[#00FF66]">
                  {assignments.length} ACTIVE
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Track your confirmed assignments, start on-ground work, and submit proof upon match completion.
              </p>

              {assignmentError && (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-xs text-red-400">{assignmentError}</p>
                </div>
              )}

              {assignmentSuccess && (
                <div className="mt-4 rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/10 px-4 py-3">
                  <p className="text-xs text-[#00FF66]">{assignmentSuccess}</p>
                </div>
              )}

              <div className="mt-5 space-y-3">
                {assignments.map((assignment) => {
                  const tournament = typeof assignment.tournamentId === "object" ? assignment.tournamentId : null;
                  const tournamentName = tournament?.name || tournament?.title || "Assigned Tournament";
                  const tournamentIdStr = tournament?._id || (typeof assignment.tournamentId === "string" ? assignment.tournamentId : "");
                  const roleName = typeof assignment.requirementId === "object" ? assignment.requirementId?.role : "GROUND CREW";

                  return (
                    <motion.div
                      key={assignment._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-black text-white">{tournamentName}</p>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-300">
                              {assignment.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                            <span>
                              Role: <strong className="text-cyan-400">{roleName}</strong>
                            </span>
                            <span>
                              Event: {new Date(assignment.eventDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 sm:w-auto">
                          {assignment.status === "ASSIGNED" && (
                            <button
                              type="button"
                              disabled={assignmentActionId === assignment._id}
                              onClick={() => handleStartWork(tournamentIdStr, assignment._id)}
                              className="flex items-center gap-2 rounded-full bg-[#00FF66] px-4 py-2 text-[11px] font-black uppercase text-black transition hover:brightness-110 disabled:opacity-50"
                            >
                              {assignmentActionId === assignment._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-black" />
                              )}
                              Start Work
                            </button>
                          )}

                          {assignment.status === "IN_PROGRESS" && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveProofAssignment(assignment);
                                setCompletionNote("");
                                setCompletionProofUrl("");
                              }}
                              className="flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/20 px-4 py-2 text-[11px] font-black uppercase text-cyan-300 transition hover:bg-cyan-400/30"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Submit Proof
                            </button>
                          )}

                          {assignment.status === "COMPLETION_SUBMITTED" && (
                            <span className="flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-[10px] font-black uppercase text-yellow-300">
                              <Clock3 className="w-3.5 h-3.5" />
                              Verification Pending
                            </span>
                          )}

                          {(assignment.status === "VERIFIED" || assignment.status === "PAYOUT_PENDING" || assignment.status === "PAID") && (
                            <span className="flex items-center gap-1.5 rounded-full border border-[#00FF66]/30 bg-[#00FF66]/10 px-3 py-1.5 text-[10px] font-black uppercase text-[#00FF66]">
                              <CircleCheck className="w-3.5 h-3.5" />
                              {assignment.status === "PAID" ? "Paid" : "Verified"}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Proof Submission Modal */}
        {activeProofAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="clean-glass relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B0F15] p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setActiveProofAssignment(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                Submit Match Completion Proof
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                Provide notes or image links verifying the completion of your ground duty.
              </p>

              <form onSubmit={handleCompleteWork} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                    Completion Notes / Match Report
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="e.g. Conducted 3 matches as head referee. Scores entered and verified."
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                    Photo / Proof URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={completionProofUrl}
                    onChange={(e) => setCompletionProofUrl(e.target.value)}
                    placeholder="https://example.com/match-scoresheet.jpg"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveProofAssignment(null)}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-black uppercase text-gray-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="flex-1 rounded-full bg-[#00FF66] py-2.5 text-xs font-black uppercase text-black hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submittingProof ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Proof
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Crew Invitations */}
        {!loadingInvitations &&
          invitations.some(
            (invitation) =>
              invitation.status === 'INVITED',
          ) && (
            <section className="max-w-5xl mx-auto mb-12">
              <div className="clean-glass rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.03] p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-black uppercase tracking-tight">
                    My Invitations
                  </h2>

                  <span className="ml-auto rounded-full bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-1 text-[10px] font-black text-cyan-400">
                    {
                      invitations.filter(
                        (invitation) =>
                          invitation.status ===
                          'INVITED',
                      ).length
                    }{' '}
                    PENDING
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Tournament organizers can invite you for
                  specific Ground Crew requirements.
                </p>

                {invitationError && (
                  <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3">
                    <p className="text-xs text-red-400">
                      {invitationError}
                    </p>
                  </div>
                )}

                {invitationSuccess && (
                  <div className="mt-4 rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/5 px-4 py-3">
                    <p className="text-xs text-[#00FF66]">
                      {invitationSuccess}
                    </p>
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  {invitations
                    .filter(
                      (invitation) =>
                        invitation.status === 'INVITED',
                    )
                    .map((invitation) => {
                      const tournament =
                        typeof invitation.tournamentId ===
                        'object'
                          ? invitation.tournamentId
                          : null;

                      const requirement =
                        typeof invitation.requirementId ===
                        'object'
                          ? invitation.requirementId
                          : null;

                      const tournamentName =
                        tournament?.name ||
                        tournament?.title ||
                        'Tournament Invitation';

                      const location = [
                        tournament?.city,
                        tournament?.state,
                      ]
                        .filter(Boolean)
                        .join(', ');

                      return (
                        <motion.div
                          key={invitation._id}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex-1">
                              <p className="text-sm font-black text-white">
                                {tournamentName}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
                                <span>
                                  Role:{' '}
                                  <strong className="text-cyan-400">
                                    {requirement?.role ||
                                      'GROUND CREW'}
                                  </strong>
                                </span>

                                <span>
                                  Event:{' '}
                                  {new Date(
                                    invitation.eventDate,
                                  ).toLocaleDateString(
                                    'en-IN',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    },
                                  )}
                                </span>

                                {location && (
                                  <span>
                                    {location}
                                  </span>
                                )}
                              </div>

                              {invitation.message && (
                                <p className="mt-3 text-xs leading-5 text-gray-500">
                                  “{invitation.message}”
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 sm:w-auto">
                              <button
                                type="button"
                                disabled={
                                  invitationActionId ===
                                  invitation._id
                                }
                                onClick={() =>
                                  handleInvitationResponse(
                                    invitation._id,
                                    'DECLINED',
                                  )
                                }
                                className="flex-1 sm:flex-none rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] font-black uppercase text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <X className="w-3.5 h-3.5" />
                                  Decline
                                </span>
                              </button>

                              <button
                                type="button"
                                disabled={
                                  invitationActionId ===
                                  invitation._id
                                }
                                onClick={() =>
                                  handleInvitationResponse(
                                    invitation._id,
                                    'ACCEPTED',
                                  )
                                }
                                className="flex-1 sm:flex-none rounded-full bg-[#00FF66] px-4 py-2.5 text-[11px] font-black uppercase text-black transition hover:brightness-110 disabled:opacity-50"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" />
                                  Accept
                                </span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </section>
          )}

        {/* Paid Work Marketplace */}
        <section className="max-w-6xl mx-auto mb-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0B0F15] shadow-2xl">
            <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-cyan-400/[0.035] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-[#00FF66]/[0.025] blur-3xl pointer-events-none" />

            <div className="relative px-5 sm:px-7 pt-6 pb-5 border-b border-white/[0.07]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-400/[0.08] border border-cyan-400/15 flex items-center justify-center">
                      <BriefcaseBusiness className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-black tracking-[0.18em] uppercase text-cyan-400/80">
                      PAID WORK
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-100">
                    Work opportunities
                  </h2>

                  <p className="mt-1 text-[11px] leading-5 text-gray-500 max-w-2xl">
                    Find verified tournament work, apply directly, and get paid after the event is completed and verified.
                  </p>
                </div>

                {!loadingWork && workOpportunities.length > 0 && (
                  <div className="self-start sm:self-auto rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
                    <span className="text-[10px] font-bold text-gray-400">
                      {workOpportunities.length} OPEN{' '}
                      {workOpportunities.length === 1
                        ? 'OPPORTUNITY'
                        : 'OPPORTUNITIES'}
                    </span>
                  </div>
                )}
              </div>

              {workError && (
                <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.035] px-3.5 py-2.5">
                  <p className="text-[11px] text-red-400">
                    {workError}
                  </p>
                </div>
              )}

              {workSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#00FF66]/15 bg-[#00FF66]/[0.035] px-3.5 py-2.5">
                  <CircleCheck className="w-3.5 h-3.5 text-[#00FF66]" />
                  <p className="text-[11px] text-[#00FF66]">
                    {workSuccess}
                  </p>
                </div>
              )}
            </div>

            <div className="relative p-4 sm:p-5">
              {loadingWork && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-44 rounded-2xl border border-white/[0.06] bg-white/[0.015] animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!loadingWork &&
                !workError &&
                workOpportunities.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="w-11 h-11 mx-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] flex items-center justify-center mb-3">
                      <BriefcaseBusiness className="w-4 h-4 text-gray-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-300">
                      No paid work available right now
                    </p>
                    <p className="mt-1 text-[11px] text-gray-600">
                      New tournament opportunities will appear here
                      when organizers publish them.
                    </p>
                  </div>
                )}

              {!loadingWork &&
                workOpportunities.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {workOpportunities.map((opportunity) => {
                      const tournament =
                        typeof opportunity.tournamentId === 'object'
                          ? opportunity.tournamentId
                          : null;

                      const application =
                        myWorkApplications.find((item) => {
                          const id =
                            typeof item.opportunityId === 'object'
                              ? item.opportunityId._id
                              : item.opportunityId;

                          return id === opportunity._id;
                        });

                      const availableSlots = Math.max(
                        opportunity.quantity -
                          opportunity.filledQuantity,
                        0,
                      );

                      const eventStart = tournament?.startDate;
                      const eventEnd = tournament?.endDate;

                      const eventDate = eventStart
                        ? new Date(eventStart).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            },
                          )
                        : null;

                      const eventEndDate = eventEnd
                        ? new Date(eventEnd).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            },
                          )
                        : null;

                      const location = [
                        tournament?.city,
                        tournament?.state,
                      ]
                        .filter(Boolean)
                        .join(', ');

                      const tournamentName =
                        tournament?.name ||
                        tournament?.title ||
                        'Tournament Crew Opportunity';

                      return (
                        <motion.div
                          key={opportunity._id}
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          whileHover={{
                            y: -2,
                          }}
                          className="group rounded-2xl border border-white/[0.07] bg-white/[0.018] hover:bg-white/[0.028] hover:border-cyan-400/20 transition-all p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-md bg-cyan-400/[0.07] border border-cyan-400/10 text-[9px] font-black tracking-wider uppercase text-cyan-400">
                                  {opportunity.role}
                                </span>

                                <span className="text-[9px] text-gray-600 uppercase tracking-wider">
                                  {opportunity.status}
                                </span>
                              </div>

                              <h3 className="mt-3 text-sm font-bold text-gray-100 truncate">
                                {tournamentName}
                              </h3>
                            </div>

                            <div className="shrink-0 text-right">
                              <div className="flex items-center justify-end gap-0.5 text-[#00FF66]">
                                <IndianRupee className="w-3.5 h-3.5" />
                                <span className="text-lg font-black tracking-tight">
                                  {opportunity.payoutAmount.toLocaleString(
                                    'en-IN',
                                  )}
                                </span>
                              </div>

                              <p className="text-[9px] text-gray-600 mt-0.5">
                                EVENT PAYOUT
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <CalendarDays className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                              <span>
                                {eventDate
                                  ? eventEndDate &&
                                    eventEndDate !== eventDate
                                    ? `${eventDate} – ${eventEndDate}`
                                    : eventDate
                                  : 'Date to be announced'}
                              </span>
                            </div>

                            {location && (
                              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <MapPinned className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                                <span>{location}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                              <BriefcaseBusiness className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                              <span>
                                {availableSlots}{' '}
                                {availableSlots === 1
                                  ? 'position'
                                  : 'positions'}{' '}
                                left
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                            <div>
                              {application ? (
                                <span
                                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                                    application.status === 'ACCEPTED'
                                      ? 'text-[#00FF66]'
                                      : application.status === 'REJECTED'
                                        ? 'text-red-400'
                                        : 'text-amber-400'
                                  }`}
                                >
                                  <CircleCheck className="w-3 h-3" />
                                  {application.status === 'APPLIED'
                                    ? 'APPLICATION SENT'
                                    : application.status}
                                </span>
                              ) : (
                                <span className="text-[9px] text-gray-600">
                                  Paid work opportunity
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedOpportunity(opportunity)
                                }
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[9px] font-black uppercase tracking-wider text-gray-300 hover:border-white/20 hover:text-white transition-all"
                              >
                                VIEW DETAILS
                              </button>

                              {!application && (
                                <button
                                  type="button"
                                  disabled={
                                    availableSlots <= 0 ||
                                    applyingOpportunityId ===
                                      opportunity._id
                                  }
                                  onClick={() =>
                                    handleApplyForWork(
                                      opportunity._id,
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[9px] font-black uppercase tracking-wider bg-cyan-400 text-black hover:bg-cyan-300 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {applyingOpportunityId ===
                                  opportunity._id
                                    ? 'APPLYING...'
                                    : 'APPLY NOW'}
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="clean-glass p-4 rounded-3xl max-w-5xl mx-auto mb-12 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-full w-full sm:w-1/2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />

            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Filter by City (e.g. Jaipur, Kota)..."
              className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full sm:w-1/2 justify-start sm:justify-end pb-1">
            {SPORTS.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSport === sport
                    ? 'bg-cyan-400 text-black'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-400 text-sm">
            Loading available Ground Crew...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-xl mx-auto text-center py-12 px-6 rounded-3xl border border-red-400/20 bg-red-400/5">
            <p className="text-red-400 text-sm font-semibold">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && crewList.length === 0 && (
          <div className="max-w-xl mx-auto text-center py-20">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-4" />

            <h3 className="text-lg font-bold text-white">
              No Ground Crew found
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Try another city or sport.
            </p>
          </div>
        )}

        {/* Crew Grid */}
        {!loading && !error && crewList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {crewList.map((crew) => (
              <motion.div
                key={crew._id}
                whileHover={{ y: -6 }}
                className="clean-glass rounded-3xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between text-center relative"
              >
                <div>
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-full h-full rounded-full border-2 border-cyan-400 bg-cyan-400/10 flex items-center justify-center">
                      <Users className="w-10 h-10 text-cyan-400" />
                    </div>

                    <ShieldCheck className="w-6 h-6 text-cyan-400 fill-black absolute bottom-0 right-0" />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {crew.fullName}
                  </h3>

                  <p className="text-xs text-cyan-400 font-semibold mt-1">
                    {crew.role}
                  </p>

                  <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {crew.city}, {crew.state}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-300">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {crew.rating.toFixed(1)}
                    </span>

                    <span>•</span>

                    <span>
                      {crew.experienceYears} yrs experience
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                    {crew.sportsExpertise
                      .slice(0, 3)
                      .map((sport) => (
                        <span
                          key={sport}
                          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-300"
                        >
                          {sport}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        crew.isAvailable
                          ? 'bg-[#00FF66]'
                          : 'bg-gray-500'
                      }`}
                    />

                    <span
                      className={`text-xs font-bold ${
                        crew.isAvailable
                          ? 'text-[#00FF66]'
                          : 'text-gray-500'
                      }`}
                    >
                      {crew.isAvailable
                        ? 'AVAILABLE'
                        : 'CURRENTLY UNAVAILABLE'}
                    </span>
                  </div>

                  <div className="w-full py-2.5 bg-white/5 border border-white/10 text-gray-300 font-extrabold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5">
                    <BriefcaseBusiness className="w-4 h-4" />
                    Assign Through Tournament
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {scheduleConflict && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close schedule conflict"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setScheduleConflict(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-amber-400/20 bg-[#0b0f12] p-6 shadow-2xl shadow-black/50">
            <button
              type="button"
              onClick={() => setScheduleConflict(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
                <CalendarDays className="h-5 w-5 text-amber-400" />
              </div>

              <div className="min-w-0 pr-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                  Schedule Conflict
                </p>

                <h3 className="mt-2 text-lg font-black text-white">
                  You already have a tournament scheduled.
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {scheduleConflict.role === 'PLAYER' ? (
                    <>
                      You&apos;re registered as a player for{' '}
                      <span className="font-bold text-gray-200">
                        {scheduleConflict.tournamentTitle}
                      </span>{' '}
                      on the overlapping date, so you can&apos;t take
                      Ground Crew work for the same day.
                    </>
                  ) : (
                    <>
                      You already have{' '}
                      <span className="font-bold text-gray-200">
                        {scheduleConflict.tournamentTitle}
                      </span>{' '}
                      scheduled as an organizer on the overlapping date,
                      so you can&apos;t take Ground Crew work for the same
                      day.
                    </>
                  )}
                </p>

                {scheduleConflict.startDate && (
                  <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-gray-600">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Conflicting Tournament
                    </div>

                    <p className="mt-1.5 text-xs font-bold text-gray-300">
                      {new Date(
                        scheduleConflict.startDate,
                      ).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}

                      {scheduleConflict.endDate &&
                        new Date(
                          scheduleConflict.endDate,
                        ).toDateString() !==
                          new Date(
                            scheduleConflict.startDate,
                          ).toDateString() && (
                          <>
                            {' – '}
                            {new Date(
                              scheduleConflict.endDate,
                            ).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </>
                        )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setScheduleConflict(null)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-400 transition hover:border-white/20 hover:text-white"
              >
                OK
              </button>

              <button
                type="button"
                onClick={() => {
                  const title =
                    scheduleConflict.tournamentTitle;

                  setScheduleConflict(null);

                  router.push(
                    `/tournaments?search=${encodeURIComponent(title)}`,
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-cyan-300"
              >
                VIEW TOURNAMENT
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Crew Work Opportunity Details Modal */}
        {selectedOpportunity && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md"
            onClick={() => setSelectedOpportunity(null)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0d10] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-400 transition hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="border-b border-white/[0.06] p-6 sm:p-7">
                <div className="pr-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    Ground Crew Opportunity
                  </span>

                  <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                    {typeof selectedOpportunity.tournamentId === 'object'
                      ? selectedOpportunity.tournamentId.title ||
                        selectedOpportunity.tournamentId.name ||
                        'Tournament'
                      : 'Tournament Opportunity'}
                  </h2>

                  <p className="mt-2 text-xs text-gray-500">
                    {selectedOpportunity.role}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-6 sm:p-7">
                {(() => {
                  const tournament =
                    typeof selectedOpportunity.tournamentId === 'object'
                      ? selectedOpportunity.tournamentId
                      : null;

                  const application = myWorkApplications.find(
                    (item) =>
                      String(
                        typeof item.opportunityId === 'object'
                          ? item.opportunityId._id
                          : item.opportunityId,
                      ) === String(selectedOpportunity._id),
                  );

                  const availableSlots = Math.max(
                    selectedOpportunity.quantity -
                      selectedOpportunity.filledQuantity,
                    0,
                  );

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-gray-600">
                            <BriefcaseBusiness className="h-3.5 w-3.5" />
                            Role
                          </div>
                          <p className="mt-2 text-xs font-bold text-white">
                            {selectedOpportunity.role}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-gray-600">
                            <IndianRupee className="h-3.5 w-3.5" />
                            Payout
                          </div>
                          <p className="mt-2 text-xs font-bold text-[#00FF66]">
                            ₹{selectedOpportunity.payoutAmount.toLocaleString(
                              'en-IN',
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-gray-600">
                            <Users className="h-3.5 w-3.5" />
                            Slots
                          </div>
                          <p className="mt-2 text-xs font-bold text-white">
                            {availableSlots} left
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-gray-600">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Status
                          </div>
                          <p className="mt-2 text-xs font-bold text-cyan-400">
                            {selectedOpportunity.status}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                              Sport
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-200">
                              {tournament?.sport || 'Not specified'}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                              Competition
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-200">
                              {tournament?.competitionType ||
                                tournament?.format ||
                                tournament?.type ||
                                'Not specified'}
                            </p>
                          </div>

                          <div>
                            <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-gray-600">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Event Date
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-200">
                              {tournament?.startDate
                                ? new Date(
                                    tournament.startDate,
                                  ).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Date to be announced'}

                              {tournament?.endDate &&
                                tournament?.startDate &&
                                new Date(
                                  tournament.endDate,
                                ).toDateString() !==
                                  new Date(
                                    tournament.startDate,
                                  ).toDateString() && (
                                  <>
                                    {' – '}
                                    {new Date(
                                      tournament.endDate,
                                    ).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </>
                                )}
                            </p>
                          </div>

                          <div>
                            <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-gray-600">
                              <MapPinned className="h-3.5 w-3.5" />
                              Venue
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-200">
                              {tournament?.locationName ||
                                [tournament?.city, tournament?.state]
                                  .filter(Boolean)
                                  .join(', ') ||
                                'Location to be announced'}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                              Organizer
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-200">
                              {tournament?.organizer?.fullName ||
                                'Verified tournament organizer'}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                              Payment
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-200">
                              Released after verified event completion
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-4">
                        <p className="text-[9px] font-black uppercase tracking-wider text-cyan-400">
                          Important
                        </p>
                        <p className="mt-2 text-xs leading-5 text-gray-400">
                          Applying does not guarantee selection. The
                          tournament organizer will review your application.
                          Payment is processed according to the completed
                          assignment and Sportora verification flow.
                        </p>
                      </div>

                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedOpportunity(null)}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 transition hover:border-white/20 hover:text-white"
                        >
                          CLOSE
                        </button>

                        {application ? (
                          <div
                            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-wider ${
                              application.status === 'ACCEPTED'
                                ? 'bg-[#00FF66]/10 text-[#00FF66]'
                                : application.status === 'REJECTED'
                                  ? 'bg-red-400/10 text-red-400'
                                  : 'bg-amber-400/10 text-amber-400'
                            }`}
                          >
                            <CircleCheck className="h-3.5 w-3.5" />
                            {application.status === 'APPLIED'
                              ? 'APPLICATION SENT'
                              : application.status}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={availableSlots <= 0}
                            onClick={() => {
                              setConfirmOpportunity(
                                selectedOpportunity,
                              );
                              setSelectedOpportunity(null);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            APPLY FOR THIS WORK
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Crew Work Application Modal */}
        {confirmOpportunity && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 px-4 py-6 backdrop-blur-md"
            onClick={() => setConfirmOpportunity(null)}
          >
            <div
              className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0d10] p-6 shadow-2xl sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    Confirm Application
                  </span>

                  <h2 className="mt-2 text-xl font-black text-white">
                    Apply for this opportunity?
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmOpportunity(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-sm font-bold text-white">
                  {typeof confirmOpportunity.tournamentId === 'object'
                    ? confirmOpportunity.tournamentId.title ||
                      confirmOpportunity.tournamentId.name ||
                      'Tournament'
                    : 'Tournament Opportunity'}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                      Role
                    </p>
                    <p className="mt-1 text-xs font-bold text-gray-300">
                      {confirmOpportunity.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-gray-600">
                      Payout
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#00FF66]">
                      ₹{confirmOpportunity.payoutAmount.toLocaleString(
                        'en-IN',
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-4">
                <p className="text-xs leading-5 text-gray-400">
                  By applying, you confirm that you are available for this
                  assignment and understand that selection is subject to
                  organizer review and Sportora verification.
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmOpportunity(null)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 transition hover:border-white/20 hover:text-white"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  disabled={
                    applyingOpportunityId ===
                    confirmOpportunity._id
                  }
                  onClick={async () => {
                    const opportunityId =
                      confirmOpportunity._id;

                    setConfirmOpportunity(null);

                    await handleApplyForWork(opportunityId);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applyingOpportunityId ===
                  confirmOpportunity._id
                    ? 'SUBMITTING...'
                    : 'CONFIRM APPLICATION'}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

    </main>
  );
}
