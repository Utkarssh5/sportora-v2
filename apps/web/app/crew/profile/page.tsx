'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Trophy,
  UserRound,
  BriefcaseBusiness,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import Navbar from '../../../components/Navbar';

interface UserProfile {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  city?: string;
  state?: string;
  bio?: string;
}

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

export default function CrewProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [crewProfile, setCrewProfile] = useState<CrewProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [editRole, setEditRole] = useState('');
  const [editSports, setEditSports] = useState<string[]>([]);
  const [editSkills, setEditSkills] = useState('');
  const [editExperience, setEditExperience] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProfiles() {
      try {
        setLoading(true);
        setError('');

        const [userResponse, crewResponse] = await Promise.all([
          fetch('/api/user/profile', {
            credentials: 'include',
            cache: 'no-store',
          }),
          fetch('/api/crew/me', {
            credentials: 'include',
            cache: 'no-store',
          }),
        ]);

        const userData = await userResponse.json();
        const crewData = await crewResponse.json();

        if (!userResponse.ok) {
          throw new Error(
            userData.error ||
              userData.message ||
              'Unable to load your Sportora profile.',
          );
        }

        if (!crewResponse.ok || !crewData.data) {
          throw new Error(
            crewData.error ||
              crewData.message ||
              'Ground Crew profile not found.',
          );
        }

        if (mounted) {
          setProfile(userData.profile ?? null);
          setCrewProfile(crewData.data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load Ground Crew profile.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfiles();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6">
          <div className="text-center">
            <ShieldCheck className="mx-auto h-10 w-10 animate-pulse text-[#00FF66]" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-gray-500">
              Loading Ground Crew Profile
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !crewProfile) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-white/[0.03] p-8 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-red-400" />
            <h1 className="mt-5 text-xl font-black uppercase italic">
              Ground Crew Profile Unavailable
            </h1>
            <p className="mt-3 text-sm text-gray-400">
              {error || 'No Ground Crew profile is linked to this account.'}
            </p>

            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="mt-6 rounded-full bg-[#00FF66] px-6 py-3 text-[10px] font-black uppercase tracking-wider text-black"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayName =
    profile?.fullName?.trim() ||
    crewProfile.fullName?.trim() ||
    'SPORTORA USER';

  const location =
    profile?.city && profile?.state
      ? `${profile.city}, ${profile.state}`
      : `${crewProfile.city}, ${crewProfile.state}`;

  const accountRole =
    profile?.role?.replace(/_/g, ' ') || 'PLAYER';

  const startEditing = () => {
    setEditRole(crewProfile.role);
    setEditSports([...crewProfile.sportsExpertise]);
    setEditSkills(crewProfile.skills.join(', '));
    setEditExperience(String(crewProfile.experienceYears));
    setSaveError('');
    setSaveSuccess('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setSaveError('');
    setSaveSuccess('');
  };

  const toggleSport = (sport: string) => {
    setEditSports((current) =>
      current.includes(sport)
        ? current.filter((item) => item !== sport)
        : [...current, sport],
    );
  };

  const saveCrewProfile = async () => {
    if (!editRole.trim()) {
      setSaveError('Please select a primary crew role.');
      return;
    }

    if (editSports.length === 0) {
      setSaveError('Please select at least one sport.');
      return;
    }

    const experience = Number(editExperience);

    if (!Number.isFinite(experience) || experience < 0 || experience > 60) {
      setSaveError('Experience must be between 0 and 60 years.');
      return;
    }

    const skills = editSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setSaveError('');
      setSaveSuccess('');

      const response = await fetch('/api/crew/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: editRole,
          sportsExpertise: editSports,
          skills,
          experienceYears: experience,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.data) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to update Ground Crew profile.',
        );
      }

      setCrewProfile(data.data);
      setEditing(false);
      setSaveSuccess('Crew profile updated successfully.');
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Unable to update Ground Crew profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#00FF66]/20 bg-[#00FF66]/[0.06] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#00FF66] transition hover:border-[#00FF66]/50 hover:bg-[#00FF66]/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#00FF66]/20 bg-[#00FF66]/[0.025] p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#00FF66]/5 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-[#00FF66]/30 bg-[#00FF66]/10">
                <ShieldCheck className="h-9 w-9 text-[#00FF66]" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#00FF66]/20 bg-[#00FF66]/5 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#00FF66]">
                    Ground Crew
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                      crewProfile.isAvailable
                        ? 'border-[#00FF66]/20 bg-[#00FF66]/5 text-[#00FF66]'
                        : 'border-white/10 bg-white/5 text-gray-500'
                    }`}
                  >
                    {crewProfile.isAvailable
                      ? 'Available'
                      : 'Currently Unavailable'}
                  </span>
                </div>

                <h1 className="mt-3 text-3xl font-black uppercase italic tracking-tight sm:text-4xl">
                  {displayName}
                </h1>

                <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                  {crewProfile.role}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#00FF66]" />
                    {location}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 text-[#00FF66]" />
                    {accountRole}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!editing ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 rounded-full border border-[#00FF66]/30 bg-[#00FF66]/10 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#00FF66] transition hover:bg-[#00FF66]/20"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={saveCrewProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00FF66] px-5 py-3 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-[#00FF66]/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </>
              )}
            </div>

            {saveSuccess ? (
              <div className="rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/5 px-4 py-3 text-xs font-bold text-[#00FF66]">
                {saveSuccess}
              </div>
            ) : null}

            <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Rating
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <span className="text-2xl font-black">
                    {Number(crewProfile.rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Experience
                </p>
                <p className="mt-1 text-2xl font-black">
                  {crewProfile.experienceYears}
                  <span className="ml-1 text-xs text-gray-500">
                    YRS
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN PROFILE + CREW DETAILS */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="clean-glass rounded-3xl border border-white/10 p-6 lg:col-span-2">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-[#00FF66]" />
              <h2 className="text-xl font-black uppercase italic">
                Crew Expertise
              </h2>
            </div>

            {editing ? (
              <div className="mt-6 space-y-7">
                {/* PRIMARY ROLE */}
                <div>
                  <label
                    htmlFor="crew-role"
                    className="text-[10px] font-black uppercase tracking-wider text-gray-400"
                  >
                    Primary Crew Role
                  </label>

                  <select
                    id="crew-role"
                    value={editRole}
                    onChange={(event) => setEditRole(event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-xs font-bold uppercase tracking-wide text-white outline-none transition focus:border-[#00FF66]/40"
                  >
                    <option value="REFEREE">REFEREE</option>
                    <option value="UMPIRE">UMPIRE</option>
                    <option value="SCOREKEEPER">SCOREKEEPER</option>
                    <option value="VOLUNTEER">VOLUNTEER</option>
                  </select>
                </div>

                {/* SPORTS */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Sports Expertise
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      'Football',
                      'Cricket',
                      'Badminton',
                      'Table Tennis',
                      'Basketball',
                      'Volleyball',
                      'Hockey',
                      'Tennis',
                      'Kabaddi',
                    ].map((sport) => {
                      const selected = editSports.includes(sport);

                      return (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => toggleSport(sport)}
                          className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wide transition ${
                            selected
                              ? 'border-[#00FF66]/30 bg-[#00FF66]/10 text-[#00FF66]'
                              : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
                          }`}
                        >
                          {sport}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SKILLS */}
                <div>
                  <label
                    htmlFor="crew-skills"
                    className="text-[10px] font-black uppercase tracking-wider text-gray-400"
                  >
                    Skills & Expertise
                  </label>

                  <input
                    id="crew-skills"
                    type="text"
                    value={editSkills}
                    onChange={(event) => setEditSkills(event.target.value)}
                    placeholder="e.g. Match officiating, first aid, scoring"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-gray-700 transition focus:border-[#00FF66]/40"
                  />

                  <p className="mt-2 text-[9px] text-gray-600">
                    Separate multiple skills with commas.
                  </p>
                </div>

                {/* EXPERIENCE */}
                <div>
                  <label
                    htmlFor="crew-experience"
                    className="text-[10px] font-black uppercase tracking-wider text-gray-400"
                  >
                    Experience
                  </label>

                  <div className="mt-3 flex items-center gap-3">
                    <input
                      id="crew-experience"
                      type="number"
                      min="0"
                      max="60"
                      step="1"
                      value={editExperience}
                      onChange={(event) =>
                        setEditExperience(event.target.value)
                      }
                      className="w-32 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-[#00FF66]/40"
                    />

                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">
                      Years
                    </span>
                  </div>
                </div>

                {saveError ? (
                  <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs font-bold text-red-300">
                    {saveError}
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Sports Expertise
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {crewProfile.sportsExpertise.map((sport) => (
                      <span
                        key={sport}
                        className="rounded-full border border-[#00FF66]/20 bg-[#00FF66]/5 px-4 py-2 text-[10px] font-black uppercase tracking-wide text-[#00FF66]"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Skills & Expertise
                  </p>

                  {crewProfile.skills?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {crewProfile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">
                      No additional skills added yet.
                    </p>
                  )}
                </div>
              </>
            )}
          </section>

          <section className="clean-glass rounded-3xl border border-white/10 p-6">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-black uppercase italic">
                Account
              </h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Name
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {profile?.fullName || displayName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Email
                </p>
                <p className="mt-1 break-all text-sm font-bold text-white">
                  {profile?.email || '—'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Phone
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {profile?.phone || '—'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Location
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {location}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* STATUS */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-5 w-5 ${
                    crewProfile.isAvailable
                      ? 'text-[#00FF66]'
                      : 'text-gray-500'
                  }`}
                />
                <h2 className="text-lg font-black uppercase italic">
                  Marketplace Status
                </h2>
              </div>

              <p className="mt-2 text-xs leading-6 text-gray-500">
                {crewProfile.isAvailable
                  ? 'You are currently available to be discovered for eligible tournament ground crew work.'
                  : 'You are currently unavailable for new ground crew opportunities.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/crew')}
              className="shrink-0 rounded-full border border-[#00FF66]/30 bg-[#00FF66]/10 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-[#00FF66] transition hover:bg-[#00FF66]/20"
            >
              View Crew Work
            </button>
          </div>
        </section>

        {/* WORK IDENTITY */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h3 className="mt-4 text-sm font-black uppercase italic">
              Professional Identity
            </h3>
            <p className="mt-2 text-xs leading-6 text-gray-500">
              Your Ground Crew profile is connected to your existing Sportora
              account. You do not need a separate Crew login or password.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <Award className="h-6 w-6 text-cyan-400" />
            <h3 className="mt-4 text-sm font-black uppercase italic">
              Crew Experience
            </h3>
            <p className="mt-2 text-xs leading-6 text-gray-500">
              Your completed and verified tournament work can build your Ground
              Crew history, rating, and achievements over time.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
