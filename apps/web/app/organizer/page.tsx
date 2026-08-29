'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { City, State } from 'country-state-city';
import Navbar from '../../components/Navbar';
import {
  Trophy,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  MapPin,
  CalendarDays,
  IndianRupee,
  FileText,
  Video,
  ArrowUpRight,
} from 'lucide-react';

type CompetitionRule = {
  type: 'SINGLES' | 'DOUBLES' | 'MIXED_DOUBLES' | 'TEAM' | 'RELAY';
  participantCount: number;
  requiresRoster: boolean;
  defaultPlayingSize?: number;
  allowsSubstitutes?: boolean;
  requiresMixedGender?: boolean;
};

type SportConfig = {
  sport: string;
  competitions: CompetitionRule[];
};

type OrganizerTournament = {
  _id: string;
  title: string;
  sport: string;
  format: string;
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
  createdAt: string;
  updatedAt: string;
};


type IndiaState = {
  name: string;
  isoCode: string;
  countryCode: string;
};

type IndiaCity = {
  name: string;
  stateCode: string;
  countryCode: string;
};

const FORMATS = [
  {
    value: 'KNOCKOUT',
    label: 'Knockout',
    description: 'Single elimination bracket',
  },
  {
    value: 'ROUND_ROBIN',
    label: 'Round Robin',
    description: 'Every participant plays against others',
  },
  {
    value: 'GROUP_STAGE_KNOCKOUT',
    label: 'Group Stage + Knockout',
    description: 'Groups followed by elimination rounds',
  },
];

const initialForm = {
  title: '',
  sport: '',
  competitionType: '',
  format: 'KNOCKOUT',
  city: '',
  state: '',
  locationName: '',
  pincode: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  maxParticipants: '',
  entryFee: '0',
  prizePool: '0',
};

export default function OrganizerDashboard() {
  const [sports, setSports] = useState<SportConfig[]>([]);
  const [formData, setFormData] = useState(initialForm);
  const [loadingSports, setLoadingSports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myTournaments, setMyTournaments] = useState<OrganizerTournament[]>([]);
  const [loadingMyTournaments, setLoadingMyTournaments] = useState(false);
  const [showActiveTournamentDetails, setShowActiveTournamentDetails] =
    useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [organizerVerificationStatus, setOrganizerVerificationStatus] =
    useState<string | null>(null);
  const [venueVerificationStatus, setVenueVerificationStatus] =
    useState<string | null>(null);
  const [venueVerificationRemarks, setVenueVerificationRemarks] =
    useState('');
  const [venueProofDeadline, setVenueProofDeadline] =
    useState<string | null>(null);
  const [venueTournamentId, setVenueTournamentId] =
    useState<string | null>(null);
  const [venueProofData, setVenueProofData] = useState({
    venueName: '',
    venueAddress: '',
    city: '',
    state: '',
    pincode: '',
    venueType: 'OTHER',
    bookingStatus: 'BOOKED',
    proofType: 'OTHER',
    venueContactName: '',
    venueContactPhone: '',
    expectedBookingDate: '',
    venueCommunication: '',
    venuePhotos: '',
    venueVideos: '',
    permissionDocs: '',
  });
  const [submittingVenueProof, setSubmittingVenueProof] =
    useState(false);

  const [crewRequirements, setCrewRequirements] = useState<
    Record<
      string,
      Array<{
        _id: string;
        role: string;
        quantity: number;
        filledQuantity: number;
        status: string;
      }>
    >
  >({});

  const [crewRole, setCrewRole] = useState('');
  const [crewQuantity, setCrewQuantity] = useState('1');
  const [crewTournamentId, setCrewTournamentId] =
    useState<string | null>(null);
  const [loadingCrewRequirements, setLoadingCrewRequirements] =
    useState(false);
  const [addingCrewRequirement, setAddingCrewRequirement] =
    useState(false);
  const [availableCrewByRequirement, setAvailableCrewByRequirement] =
    useState<
      Record<
        string,
        Array<{
          _id: string;
          fullName: string;
          role: string;
          sportsExpertise: string[];
          city: string;
          state: string;
          experienceYears: number;
          isAvailable: boolean;
          rating: number;
        }>
      >
    >({});

  const [loadingAvailableCrew, setLoadingAvailableCrew] =
    useState(false);
  const [assigningCrewId, setAssigningCrewId] =
    useState<string | null>(null);

  const [crewWorkOpportunities, setCrewWorkOpportunities] =
    useState<Record<string, Array<{
      _id: string;
      requirementId: string;
      role: string;
      quantity: number;
      filledQuantity: number;
      payoutAmount: number;
      currency: string;
      status: string;
    }>>>({});

  const [crewWorkPayouts, setCrewWorkPayouts] =
    useState<Record<string, Record<string, string>>>({});

  const [publishingCrewWork, setPublishingCrewWork] =
    useState(false);

  const [crewWorkDecision, setCrewWorkDecision] =
    useState<'YES' | 'NO' | null>(null);

  const [invitingCrewId, setInvitingCrewId] =
    useState<string | null>(null);

  const [selectedCrewProfile, setSelectedCrewProfile] =
    useState<{
      id: string;
      fullName: string;
      role: string;
      sportsExpertise: string[];
      skills: string[];
      city: string;
      state: string;
      experienceYears: number;
      rating: number;
      isAvailable: boolean;
    } | null>(null);

  const [loadingCrewProfileId, setLoadingCrewProfileId] =
    useState<string | null>(null);

  const loadCrewProfile = async (crewId: string) => {
    setLoadingCrewProfileId(crewId);
    setError('');

    try {
      const response = await fetch(
        `/api/crew/${crewId}/profile`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to load crew profile.',
        );
      }

      setSelectedCrewProfile(data.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load crew profile.',
      );
    } finally {
      setLoadingCrewProfileId(null);
    }
  };

  const [crewAssignments, setCrewAssignments] = useState<
    Record<
      string,
      Array<{
        _id: string;
        requirementId?: string;
        crewId:
          | string
          | {
              _id: string;
              fullName: string;
              role: string;
              city: string;
              state: string;
            };
        eventDate: string;
        status: string;
        workStartedAt?: string;
        workCompletedAt?: string;
        completionProof?: string[];
        completionNote?: string;
        verifiedAt?: string;
        assignedAt?: string;
      }>
    >
  >({});

  const [loadingCrewAssignments, setLoadingCrewAssignments] =
    useState(false);

  const [verifyingCrewAssignmentId, setVerifyingCrewAssignmentId] =
    useState<string | null>(null);

  const [loadingVerification, setLoadingVerification] = useState(false);

  const hasSubmittedVenueProof =
    venueVerificationStatus === 'PENDING' ||
    venueVerificationStatus === 'MORE_PROOF_REQUIRED';

  const [indiaStates] = useState<IndiaState[]>(
    () => State.getStatesOfCountry('IN') as IndiaState[],
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || data.message || 'Please login first.',
          );
        }

        setUserRole(data.profile?.role || 'PLAYER');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your account.',
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (userRole !== 'ORGANIZER') return;

    const loadOrganizerVerification = async () => {
      setLoadingVerification(true);

      try {
        const response = await fetch('/api/verification/my-request', {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              'Unable to load organizer verification status.',
          );
        }

        setOrganizerVerificationStatus(data.data?.status || null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load organizer verification status.',
        );
      } finally {
        setLoadingVerification(false);
      }
    };

    loadOrganizerVerification();
  }, [userRole]);

  useEffect(() => {
    if (userRole !== 'ORGANIZER') return;
    if (organizerVerificationStatus !== 'APPROVED') return;

    const loadMyTournaments = async () => {
      setLoadingMyTournaments(true);

      try {
        const response = await fetch('/api/tournaments/my', {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              'Unable to load your tournaments.',
          );
        }

        setMyTournaments(
          Array.isArray(data.data) ? data.data : [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your tournaments.',
        );
      } finally {
        setLoadingMyTournaments(false);
      }
    };

    loadMyTournaments();
  }, [userRole, organizerVerificationStatus]);

  useEffect(() => {
    if (userRole !== 'ORGANIZER') return;
    if (organizerVerificationStatus !== 'APPROVED') return;

    const loadMyTournaments = async () => {
      setLoadingMyTournaments(true);

      try {
        const response = await fetch('/api/tournaments/my', {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              'Unable to load your tournaments.',
          );
        }

        setMyTournaments(
          Array.isArray(data.data) ? data.data : [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your tournaments.',
        );
      } finally {
        setLoadingMyTournaments(false);
      }
    };

    loadMyTournaments();
  }, [userRole, organizerVerificationStatus]);

  useEffect(() => {
    if (userRole !== 'ORGANIZER') return;
    if (organizerVerificationStatus !== 'APPROVED') return;

    const loadVenueVerification = async () => {
      try {
        const response = await fetch('/api/venue-verification/my', {
          cache: 'no-store',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              data.message ||
              'Unable to load venue verification status.',
          );
        }

        const activeTournamentId =
          myTournaments.find((tournament) =>
            ['PENDING_APPROVAL', 'APPROVED', 'ONGOING'].includes(
              tournament.status,
            ),
          )?._id || null;

        const matchingVerification = activeTournamentId
          ? data.data?.find((verification: any) => {
              const tournamentId =
                typeof verification?.tournament === 'object'
                  ? verification?.tournament?._id
                  : verification?.tournament;

              return tournamentId === activeTournamentId;
            })
          : null;

        setVenueVerificationStatus(
          matchingVerification?.status || null,
        );
        setVenueVerificationRemarks(
          matchingVerification?.remarks || '',
        );
        setVenueProofDeadline(
          matchingVerification?.proofDeadline || null,
        );

        setVenueTournamentId(
          activeTournamentId || null,
        );

        if (matchingVerification) {
          setVenueProofData({
            venueName: matchingVerification.venueName || '',
            venueAddress: matchingVerification.venueAddress || '',
            city: matchingVerification.city || '',
            state: matchingVerification.state || '',
            pincode: matchingVerification.pincode || '',
            venueType: matchingVerification.venueType || 'OTHER',
            bookingStatus: matchingVerification.bookingStatus || 'BOOKED',
            proofType: matchingVerification.proofType || 'OTHER',
            venueContactName: matchingVerification.venueContactName || '',
            venueContactPhone: matchingVerification.venueContactPhone || '',
            expectedBookingDate: matchingVerification.expectedBookingDate
              ? new Date(matchingVerification.expectedBookingDate)
                  .toISOString()
                  .slice(0, 10)
              : '',
            venueCommunication: matchingVerification.venueCommunication || '',
            venuePhotos: Array.isArray(
              matchingVerification.venuePhotos,
            )
              ? matchingVerification.venuePhotos.join(', ')
              : '',
            venueVideos: Array.isArray(
              matchingVerification.venueVideos,
            )
              ? matchingVerification.venueVideos.join(', ')
              : '',
            permissionDocs: Array.isArray(
              matchingVerification.permissionDocs,
            )
              ? matchingVerification.permissionDocs.join(', ')
              : '',
          });
        } else {
          setVenueProofData({
            venueName: '',
            venueAddress: '',
            city: '',
            state: '',
            pincode: '',
            venueType: 'OTHER',
            bookingStatus: 'BOOKED',
            proofType: 'OTHER',
            venueContactName: '',
            venueContactPhone: '',
            expectedBookingDate: '',
            venueCommunication: '',
            venuePhotos: '',
            venueVideos: '',
            permissionDocs: '',
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load venue verification status.',
        );
      }
    };

    loadVenueVerification();
  }, [userRole, organizerVerificationStatus, myTournaments]);

  useEffect(() => {
    const loadSports = async () => {
      try {
        const response = await fetch('/api/sports/config', {
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || data.error || 'Failed to load sports.',
          );
        }

        setSports(data.sports || []);

        if (data.sports?.length > 0) {
          const firstSport = data.sports[0];

          setFormData((current) => ({
            ...current,
            sport: firstSport.sport,
            competitionType:
              firstSport.competitions?.[0]?.type || '',
          }));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load sports configuration.',
        );
      } finally {
        setLoadingSports(false);
      }
    };

    loadSports();
  }, []);

  const canCreateTournament =
    userRole === 'ADMIN' ||
    (userRole === 'ORGANIZER' &&
      organizerVerificationStatus === 'APPROVED');

  const activeTournament = useMemo(
    () =>
      myTournaments.find((tournament) =>
        ['PENDING_APPROVAL', 'APPROVED', 'ONGOING'].includes(
          tournament.status,
        ),
      ) || null,
    [myTournaments],
  );

  const hasActiveTournament =
    userRole === 'ORGANIZER' && Boolean(activeTournament);

  const selectedIndiaState = useMemo(
    () =>
      indiaStates.find(
        (item) => item.name === formData.state,
      ),
    [indiaStates, formData.state],
  );

  const indiaCities = useMemo<IndiaCity[]>(() => {
    if (!selectedIndiaState) return [];

    return City.getCitiesOfState(
      'IN',
      selectedIndiaState.isoCode,
    ) as IndiaCity[];
  }, [selectedIndiaState]);

  const selectedSport = useMemo(
    () => sports.find((item) => item.sport === formData.sport),
    [sports, formData.sport],
  );

  const selectedCompetition = useMemo(
    () =>
      selectedSport?.competitions.find(
        (item) => item.type === formData.competitionType,
      ),
    [selectedSport, formData.competitionType],
  );

  const updateField = (
    field: keyof typeof initialForm,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleStateChange = (stateName: string) => {
    setFormData((current) => ({
      ...current,
      state: stateName,
      city: '',
      pincode: '',
    }));

    setError('');
    setSuccess('');
  };

  const handleCityChange = (cityName: string) => {
    setFormData((current) => ({
      ...current,
      city: cityName,
      pincode: '',
    }));

    setError('');
    setSuccess('');
  };


  const handleSportChange = (sport: string) => {
    const config = sports.find((item) => item.sport === sport);

    setFormData((current) => ({
      ...current,
      sport,
      competitionType:
        config?.competitions?.[0]?.type || '',
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Never allow an unapproved organizer to submit a tournament.
    if (!canCreateTournament) {
      setError('');
      setSuccess('');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const deadline = new Date(formData.registrationDeadline);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        Number.isNaN(deadline.getTime())
      ) {
        throw new Error('Please enter valid tournament dates.');
      }

      if (end <= start) {
        throw new Error(
          'Tournament end date must be after the start date.',
        );
      }

      if (deadline >= start) {
        throw new Error(
          'Registration deadline must be before the tournament starts.',
        );
      }

      const maxParticipants = Number(formData.maxParticipants);
      const entryFee = Number(formData.entryFee);
      const prizePool = Number(formData.prizePool);

      if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
        throw new Error(
          'Maximum participants must be at least 1.',
        );
      }

      if (entryFee < 0 || prizePool < 0) {
        throw new Error(
          'Entry fee and prize pool cannot be negative.',
        );
      }

      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          sport: formData.sport,
          competitionType: formData.competitionType,
          format: formData.format,
          city: formData.city.trim(),
          state: formData.state.trim(),
          locationName: formData.locationName.trim(),
          pincode: formData.pincode.trim(),
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          registrationDeadline: deadline.toISOString(),
          maxParticipants,
          entryFee,
          prizePool,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Failed to create tournament.',
        );
      }

      const createdTournament =
        data.data?.tournament || data.tournament || null;

      const createdTournamentId =
        createdTournament?._id || createdTournament?.id || null;

      if (createdTournamentId) {
        setVenueTournamentId(createdTournamentId);
        setVenueVerificationStatus('PENDING');
        setVenueVerificationRemarks('');
        setVenueProofDeadline(null);

        setVenueProofData({
          venueName: formData.locationName.trim(),
          venueAddress: formData.locationName.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          venueType: 'OTHER',
          bookingStatus: 'BOOKED',
          proofType: 'OTHER',
          venueContactName: '',
          venueContactPhone: '',
          expectedBookingDate: '',
          venueCommunication: '',
          venuePhotos: '',
          venueVideos: '',
          permissionDocs: '',
        });
      }

      setSuccess(
        'Tournament proposal submitted successfully for Admin review. Venue proof is now required.',
      );

      setFormData((current) => ({
        ...initialForm,
        sport: current.sport,
        competitionType: current.competitionType,
        format: current.format,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create tournament.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loadCrewRequirements = async (tournamentId: string) => {
    setLoadingCrewRequirements(true);
    setCrewTournamentId(tournamentId);

    try {
      const response = await fetch(
        `/api/tournament-crew/${tournamentId}/requirements`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to load crew requirements.',
        );
      }

      setCrewRequirements((current) => ({
        ...current,
        [tournamentId]: Array.isArray(data.data)
          ? data.data
          : [],
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load crew requirements.',
      );
    } finally {
      setLoadingCrewRequirements(false);
    }
  };

  const loadCrewAssignments = async (tournamentId: string) => {
    setLoadingCrewAssignments(true);

    try {
      const response = await fetch(
        `/api/tournament-crew/${tournamentId}/assignments`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to load assigned crew.',
        );
      }

      setCrewAssignments((current) => ({
        ...current,
        [tournamentId]: Array.isArray(data.data)
          ? data.data
          : [],
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load assigned crew.',
      );
      setCrewAssignments((current) => ({
        ...current,
        [tournamentId]: [],
      }));
    } finally {
      setLoadingCrewAssignments(false);
    }
  };

  const loadAvailableCrew = async (
    tournament: OrganizerTournament,
    requirementId: string,
  ) => {
    setLoadingAvailableCrew(true);

    try {
      const response = await fetch(
        `/api/tournament-crew/${tournament._id}/requirements/${requirementId}/candidates`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to find suitable crew.',
        );
      }

      setAvailableCrewByRequirement((current) => ({
        ...current,
        [requirementId]: Array.isArray(data.data)
          ? data.data
          : [],
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to find suitable crew.',
      );

      setAvailableCrewByRequirement((current) => ({
        ...current,
        [requirementId]: [],
      }));
    } finally {
      setLoadingAvailableCrew(false);
    }
  };

  const handleInviteCrew = async (
    tournamentId: string,
    requirementId: string,
    crewId: string,
  ) => {
    setInvitingCrewId(crewId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/tournament-crew/${tournamentId}/requirements/${requirementId}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ crewId }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to send crew invitation.',
        );
      }

      setSuccess(
        'Crew invitation sent successfully. The crew member must accept it before assignment.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send crew invitation.',
      );
    } finally {
      setInvitingCrewId(null);
    }
  };

  const handleAssignCrew = async (
    tournamentId: string,
    requirementId: string,
    crewId: string,
  ) => {
    setAssigningCrewId(crewId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/tournament-crew/${tournamentId}/requirements/${requirementId}/assign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ crewId }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to assign crew.',
        );
      }

      await loadCrewRequirements(tournamentId);

      setSuccess('Crew member assigned successfully.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to assign crew.',
      );
    } finally {
      setAssigningCrewId(null);
    }
  };

  const handleVerifyCrewCompletion = async (
    tournamentId: string,
    assignmentId: string,
  ) => {
    setVerifyingCrewAssignmentId(assignmentId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/tournament-crew/${tournamentId}/${assignmentId}/verify`,
        {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to verify crew completion.',
        );
      }

      await loadCrewAssignments(tournamentId);

      setSuccess(
        'Crew completion verified. Assignment moved to payout processing.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to verify crew completion.',
      );
    } finally {
      setVerifyingCrewAssignmentId(null);
    }
  };

  const loadCrewWorkOpportunities = async (
    tournamentId: string,
  ) => {
    try {
      const response = await fetch(
        `/api/tournament-crew/work-opportunities/by-tournament/${tournamentId}`,
        {
          cache: 'no-store',
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to load paid crew work.',
        );
      }

      setCrewWorkOpportunities((current) => ({
        ...current,
        [tournamentId]: Array.isArray(data.data)
          ? data.data
          : [],
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load paid crew work.',
      );
    }
  };

  const handleCrewWorkPayoutChange = (
    tournamentId: string,
    requirementId: string,
    value: string,
  ) => {
    setCrewWorkPayouts((current) => ({
      ...current,
      [tournamentId]: {
        ...(current[tournamentId] || {}),
        [requirementId]: value,
      },
    }));
  };

  const handlePublishCrewWork = async (
    tournamentId: string,
  ) => {
    const tournament = myTournaments.find(
      (item) => item._id === tournamentId,
    );

    if (!tournament) {
      setError('Tournament not found.');
      return;
    }

    if (
      new Date(tournament.registrationDeadline).getTime() >
      Date.now()
    ) {
      setError(
        'Paid crew work can only be published after the registration deadline.',
      );
      return;
    }

    const requirements =
      crewRequirements[tournamentId] || [];

    if (requirements.length === 0) {
      setError(
        'Add at least one crew requirement before publishing paid work.',
      );
      return;
    }

    const existing =
      crewWorkOpportunities[tournamentId] || [];

    const existingOpenRequirementIds = new Set(
      existing
        .filter((item) => item.status === 'OPEN')
        .map((item) => item.requirementId),
    );

    const opportunities = requirements
      .filter(
        (requirement) =>
          requirement.filledQuantity <
            requirement.quantity &&
          !existingOpenRequirementIds.has(
            requirement._id,
          ),
      )
      .map((requirement) => ({
        requirementId: requirement._id,
        payoutAmount: Number(
          crewWorkPayouts[tournamentId]?.[
            requirement._id
          ] || 0,
        ),
      }));

    if (opportunities.length === 0) {
      setError(
        'No new open crew requirement is available to publish.',
      );
      return;
    }

    const invalidPayout = opportunities.find(
      (item) =>
        !Number.isFinite(item.payoutAmount) ||
        item.payoutAmount <= 0,
    );

    if (invalidPayout) {
      setError(
        'Every paid crew role must have a payout greater than ₹0.',
      );
      return;
    }

    setPublishingCrewWork(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/tournament-crew/work-opportunities/by-tournament/${tournamentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            crewNeeded: true,
            opportunities,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to publish paid crew work.',
        );
      }

      await loadCrewWorkOpportunities(tournamentId);

      setSuccess(
        'Paid ground crew opportunities published successfully.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to publish paid crew work.',
      );
    } finally {
      setPublishingCrewWork(false);
    }
  };

  const handleAddCrewRequirement = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!crewTournamentId) {
      setError('Please select a tournament first.');
      return;
    }

    const role = crewRole.trim();
    const quantity = Number(crewQuantity);

    if (!role) {
      setError('Please enter a crew role.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Crew quantity must be a whole number greater than 0.');
      return;
    }

    setAddingCrewRequirement(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/tournament-crew/${crewTournamentId}/requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            role,
            quantity,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to add crew requirement.',
        );
      }

      await loadCrewRequirements(crewTournamentId);

      setCrewRole('');
      setCrewQuantity('1');

      setSuccess('Ground crew requirement added successfully.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to add crew requirement.',
      );
    } finally {
      setAddingCrewRequirement(false);
    }
  };

  const handleVenueProofSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!venueTournamentId) {
      setError('Please submit the tournament proposal first.');
      return;
    }

    setSubmittingVenueProof(true);
    setError('');
    setSuccess('');

    try {
      const splitUrls = (value: string) =>
        value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

      const response = await fetch(
        `/api/venue-verification/tournament/${venueTournamentId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            venueName: venueProofData.venueName.trim(),
            venueAddress: venueProofData.venueAddress.trim(),
            city: venueProofData.city.trim(),
            state: venueProofData.state.trim(),
            pincode: venueProofData.pincode.trim(),
            venueType: venueProofData.venueType,
            bookingStatus: venueProofData.bookingStatus,
            proofType: venueProofData.proofType,
            venueContactName: venueProofData.venueContactName.trim(),
            venueContactPhone: venueProofData.venueContactPhone.trim(),
            expectedBookingDate:
              venueProofData.bookingStatus === 'NOT_BOOKED_YET'
                ? venueProofData.expectedBookingDate
                : '',
            venueCommunication:
              venueProofData.bookingStatus === 'NOT_BOOKED_YET'
                ? venueProofData.venueCommunication.trim()
                : '',
            venuePhotos: splitUrls(venueProofData.venuePhotos),
            venueVideos: splitUrls(venueProofData.venueVideos),
            permissionDocs: splitUrls(venueProofData.permissionDocs),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Failed to submit venue proof.',
        );
      }

      setVenueVerificationStatus(data.data?.status || 'PENDING');
      setVenueVerificationRemarks(data.data?.remarks || '');
      setVenueProofDeadline(data.data?.proofDeadline || null);

      setSuccess(
        'Venue proof submitted successfully. Your event is now pending venue verification.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit venue proof.',
      );
    } finally {
      setSubmittingVenueProof(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080B10] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl space-y-8 px-5 pb-16 pt-32 sm:px-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/20">
              <Trophy className="h-6 w-6 text-[#00FF66]" />
            </div>

            <div>
              <h1 className="text-3xl font-black italic uppercase">
                ORGANIZER PORTAL
              </h1>

              <p className="text-xs text-white/40">
                Create and submit a tournament to the Sportora network.
              </p>
            </div>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#00FF66]/30 bg-[#00FF66]/10 p-4 text-sm font-bold text-[#00FF66]">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {loadingProfile ||
        loadingVerification ||
        (userRole === 'ORGANIZER' && loadingMyTournaments) ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[32px] border border-white/10 bg-[#121722] p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#00FF66]" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">
                Checking organizer verification...
              </p>
            </div>
          </div>
        ) : !canCreateTournament ? (
          <div className="rounded-[32px] border border-yellow-400/20 bg-yellow-400/5 p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-10 w-10 text-yellow-300" />

              <div>
                <h2 className="text-xl font-black uppercase">
                  Organizer Verification Pending
                </h2>

                <p className="mt-2 max-w-xl text-sm text-white/45">
                  You can host tournaments after your organizer identity
                  verification has been approved by Sportora.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-300">
                Status: {organizerVerificationStatus || 'PENDING'}
              </div>
            </div>
          </div>
        ) : (
          <>
            {hasActiveTournament && activeTournament ? (
              <section className="rounded-[32px] border border-white/10 bg-[#121722] p-6 shadow-2xl sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-[#00FF66]" />
                      <h2 className="text-lg font-black italic uppercase">
                        Active Tournament
                      </h2>
                    </div>

                    <h3 className="mt-4 text-2xl font-black uppercase">
                      {activeTournament.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
                      <span className="rounded-full border border-[#00FF66]/20 bg-[#00FF66]/10 px-3 py-1 text-[#00FF66]">
                        {activeTournament.status}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">
                        {activeTournament.sport}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">
                        {activeTournament.competitionType || activeTournament.format}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const nextOpen = !showActiveTournamentDetails;

                      setShowActiveTournamentDetails(nextOpen);

                      if (
                        nextOpen &&
                        activeTournament?._id
                      ) {
                        await Promise.all([
                          loadCrewRequirements(
                            activeTournament._id,
                          ),
                          loadCrewAssignments(
                            activeTournament._id,
                          ),
                          loadCrewWorkOpportunities(
                            activeTournament._id,
                          ),
                        ]);
                      }
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
                  >
                    {showActiveTournamentDetails
                      ? 'Hide Details'
                      : 'View Details'}
                  </button>
                </div>

                {showActiveTournamentDetails && (
                  <>
                  <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                        Venue
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {activeTournament.locationName}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                        Location
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {activeTournament.city}, {activeTournament.state}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                        Participants
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {activeTournament.registeredParticipants}/
                        {activeTournament.maxParticipants}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                        Tournament Dates
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {new Date(activeTournament.startDate).toLocaleDateString()} —{' '}
                        {new Date(activeTournament.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                        Entry Fee
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        ₹{activeTournament.entryFee}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                        Prize Pool
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        ₹{activeTournament.prizePool}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-[#0D1118] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-[#00FF66]" />
                          <h3 className="text-base font-black italic uppercase">
                            Ground Crew
                          </h3>
                        </div>

                        <p className="mt-2 max-w-2xl text-xs leading-5 text-white/40">
                          Define the workforce required for your tournament.
                          Add roles and quantities now. Crew payout is handled
                          by Sportora after verified event completion.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {loadingCrewRequirements &&
                      crewTournamentId === activeTournament._id ? (
                        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-bold text-white/50">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading crew requirements...
                        </div>
                      ) : (crewRequirements[activeTournament._id] || [])
                          .length > 0 ? (
                        (crewRequirements[activeTournament._id] || []).map(
                          (requirement) => (
                            <div
                              key={requirement._id}
                              className="rounded-2xl border border-white/10 bg-white/5 p-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-black uppercase text-white">
                                    {requirement.role}
                                  </p>
                                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                                    Required: {requirement.quantity}
                                    {' • '}
                                    Filled: {requirement.filledQuantity}
                                  </p>
                                </div>

                                <span className="rounded-full border border-[#00FF66]/20 bg-[#00FF66]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#00FF66]">
                                  {requirement.status}
                                </span>
                              </div>

                              {requirement.filledQuantity <
                                requirement.quantity && (
                                <div className="mt-4 border-t border-white/10 pt-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300">
                                      Crew Candidates
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        loadAvailableCrew(
                                          activeTournament,
                                          requirement._id,
                                        )
                                      }
                                      disabled={loadingAvailableCrew}
                                      className="flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-cyan-300 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {loadingAvailableCrew ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Users className="h-3.5 w-3.5" />
                                      )}
                                      Find Crew
                                    </button>
                                  </div>

                                  {loadingAvailableCrew ? (
                                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white/40">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Finding available crew...
                                    </div>
                                  ) : (
                                    (() => {
                                      const matchingCrew =
                                        availableCrewByRequirement[
                                          requirement._id
                                        ] || [];

                                      if (matchingCrew.length === 0) {
                                        return (
                                          <p className="mt-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-white/35">
                                            Click FIND CREW to discover matching {requirement.role.toLowerCase()} candidates.
                                          </p>
                                        );
                                      }

                                      return (
                                        <div className="mt-3 space-y-2">
                                          {matchingCrew.map((crew) => (
                                            <div
                                              key={crew._id}
                                              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                                            >
                                              <div className="min-w-0">
                                                <p className="truncate text-xs font-black uppercase text-white">
                                                  {crew.fullName}
                                                </p>
                                                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">
                                                  {crew.role}
                                                  {' • '}
                                                  {crew.experienceYears} yrs experience
                                                  {' • '}
                                                  ★ {crew.rating}
                                                </p>
                                              </div>

                                              <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                  type="button"
                                                  disabled={
                                                    loadingCrewProfileId === crew._id
                                                  }
                                                  onClick={() =>
                                                    loadCrewProfile(crew._id)
                                                  }
                                                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                  {loadingCrewProfileId === crew._id
                                                    ? 'Loading...'
                                                    : 'View Profile'}
                                                </button>

                                                <button
                                                  type="button"
                                                  disabled={
                                                    invitingCrewId === crew._id ||
                                                    requirement.filledQuantity >=
                                                      requirement.quantity
                                                  }
                                                  onClick={() =>
                                                    handleInviteCrew(
                                                      activeTournament._id,
                                                      requirement._id,
                                                      crew._id,
                                                    )
                                                  }
                                                  className="flex items-center gap-2 rounded-xl bg-[#00FF66] px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-black transition hover:bg-[#00e85c] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                {invitingCrewId === crew._id ? (
                                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                  <Users className="h-3.5 w-3.5" />
                                                )}
                                                Invite
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()
                                  )}
                                </div>
                              )}
                            </div>
                          ),
                        )
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                            No crew requirements added yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* PAID CREW WORK */}
                    {(() => {
                      const registrationClosed =
                        new Date(
                          activeTournament.registrationDeadline,
                        ).getTime() <= Date.now();

                      const requirements =
                        crewRequirements[activeTournament._id] || [];

                      const opportunities =
                        crewWorkOpportunities[activeTournament._id] || [];

                      const openRequirementIds = new Set(
                        opportunities
                          .filter(
                            (opportunity) =>
                              opportunity.status === 'OPEN',
                          )
                          .map(
                            (opportunity) =>
                              opportunity.requirementId,
                          ),
                      );

                      const publishableRequirements =
                        requirements.filter(
                          (requirement) =>
                            requirement.filledQuantity <
                              requirement.quantity &&
                            !openRequirementIds.has(
                              requirement._id,
                            ),
                        );

                      return (
                        <div className="mt-6 border-t border-white/10 pt-6">
                          <div className="rounded-3xl border border-cyan-300/10 bg-[#090D13] p-5 shadow-[0_0_40px_rgba(34,211,238,0.04)]">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <IndianRupee className="h-4 w-4 text-cyan-300" />
                                  <h4 className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                                    Paid Work Opportunities
                                  </h4>
                                </div>

                                <p className="mt-2 max-w-2xl text-[10px] leading-5 text-white/35">
                                  Publish paid crew positions after registration
                                  closes. Crew members can discover and apply for
                                  these opportunities from the Ground Crew marketplace.
                                </p>
                              </div>

                              <div
                                className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] ${
                                  registrationClosed
                                    ? 'border-[#00FF66]/20 bg-[#00FF66]/5 text-[#00FF66]'
                                    : 'border-yellow-400/20 bg-yellow-400/5 text-yellow-300'
                                }`}
                              >
                                {registrationClosed
                                  ? 'Registration Closed'
                                  : 'Locked Until Deadline'}
                              </div>
                            </div>

                            {!registrationClosed ? (
                              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.03] p-4">
                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300" />

                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-yellow-200">
                                    Paid work is locked
                                  </p>
                                  <p className="mt-1 text-[10px] leading-5 text-white/35">
                                    You can publish crew jobs after the registration
                                    deadline on{' '}
                                    <span className="font-bold text-white/60">
                                      {new Date(
                                        activeTournament.registrationDeadline,
                                      ).toLocaleString()}
                                    </span>
                                    .
                                  </p>
                                </div>
                              </div>
                            ) : crewWorkDecision === null ? (
                              <div className="mt-5">
                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                                  Do you need ground crew?
                                </p>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCrewWorkDecision('NO')
                                    }
                                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[9px] font-black uppercase tracking-[0.1em] text-white/50 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
                                  >
                                    No
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCrewWorkDecision('YES')
                                    }
                                    className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-4 py-3 text-[9px] font-black uppercase tracking-[0.1em] text-cyan-200 transition hover:bg-cyan-300/10"
                                  >
                                    Yes, I need crew
                                  </button>
                                </div>
                              </div>
                            ) : crewWorkDecision === 'NO' ? (
                              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                                    Ground crew not required
                                  </p>
                                  <p className="mt-1 text-[9px] text-white/25">
                                    You can change this decision anytime before
                                    publishing paid opportunities.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setCrewWorkDecision('YES')
                                  }
                                  className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-cyan-200"
                                >
                                  Need Crew
                                </button>
                              </div>
                            ) : publishableRequirements.length === 0 ? (
                              <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5">
                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                                  No crew positions ready to publish
                                </p>

                                <p className="mt-1 text-[10px] leading-5 text-white/25">
                                  Add an open crew requirement above, or all available
                                  positions may already have a published opportunity.
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="mt-5 space-y-2">
                                  {publishableRequirements.map(
                                    (requirement) => {
                                      const payout =
                                        crewWorkPayouts[
                                          activeTournament._id
                                        ]?.[requirement._id] || '';

                                      return (
                                        <div
                                          key={requirement._id}
                                          className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"
                                        >
                                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px_150px] sm:items-center">
                                            <div>
                                              <p className="text-xs font-black uppercase text-white">
                                                {requirement.role}
                                              </p>
                                              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">
                                                {requirement.quantity -
                                                  requirement.filledQuantity}{' '}
                                                position
                                                {requirement.quantity -
                                                  requirement.filledQuantity !==
                                                1
                                                  ? 's'
                                                  : ''}{' '}
                                                available
                                              </p>
                                            </div>

                                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                              <p className="text-[8px] font-black uppercase tracking-[0.1em] text-white/25">
                                                Quantity
                                              </p>
                                              <p className="mt-1 text-xs font-black text-white">
                                                {requirement.quantity -
                                                  requirement.filledQuantity}
                                              </p>
                                            </div>

                                            <label className="relative block">
                                              <span className="absolute left-3 top-2 text-[8px] font-black uppercase tracking-[0.1em] text-white/25">
                                                Payout / person
                                              </span>

                                              <IndianRupee className="absolute left-3 top-7 h-3 w-3 text-cyan-300" />

                                              <input
                                                type="number"
                                                min={1}
                                                step={1}
                                                value={payout}
                                                onChange={(event) =>
                                                  handleCrewWorkPayoutChange(
                                                    activeTournament._id,
                                                    requirement._id,
                                                    event.target.value,
                                                  )
                                                }
                                                placeholder="1500"
                                                className={`${inputClass} pl-7 pt-5`}
                                              />
                                            </label>
                                          </div>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>

                                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-200">
                                      Marketplace publishing
                                    </p>
                                    <p className="mt-1 text-[9px] leading-4 text-white/30">
                                      Each role becomes a separate paid opportunity.
                                      No payment is made at publishing time.
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePublishCrewWork(
                                        activeTournament._id,
                                      )
                                    }
                                    disabled={publishingCrewWork}
                                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {publishingCrewWork ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    )}
                                    {publishingCrewWork
                                      ? 'Publishing...'
                                      : 'Publish Work'}
                                  </button>
                                </div>
                              </>
                            )}

                            {opportunities.length > 0 && (
                              <div className="mt-5 border-t border-white/10 pt-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                                  Published opportunities
                                </p>

                                <div className="mt-2 space-y-2">
                                  {opportunities.map(
                                    (opportunity) => (
                                      <div
                                        key={opportunity._id}
                                        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                      >
                                        <div>
                                          <p className="text-[10px] font-black uppercase text-white">
                                            {opportunity.role}
                                          </p>
                                          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-white/25">
                                            {opportunity.filledQuantity}/
                                            {opportunity.quantity} filled
                                            {' • '}
                                            ₹{opportunity.payoutAmount} / person
                                          </p>
                                        </div>

                                        <span
                                          className={`w-fit rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] ${
                                            opportunity.status === 'OPEN'
                                              ? 'border-[#00FF66]/20 bg-[#00FF66]/5 text-[#00FF66]'
                                              : opportunity.status === 'FILLED'
                                                ? 'border-cyan-300/20 bg-cyan-300/5 text-cyan-300'
                                                : 'border-white/10 bg-white/5 text-white/30'
                                          }`}
                                        >
                                          {opportunity.status}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ASSIGNED CREW */}
                    <div className="mt-6 border-t border-white/10 pt-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-300" />
                        <h4 className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300">
                          Assigned Crew
                        </h4>
                      </div>

                      {loadingCrewAssignments &&
                      crewTournamentId === activeTournament._id ? (
                        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs font-bold text-white/40">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading assigned crew...
                        </div>
                      ) : (crewAssignments[activeTournament._id] || [])
                          .length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {(crewAssignments[activeTournament._id] || []).map(
                            (assignment) => {
                              const crew =
                                typeof assignment.crewId === 'object'
                                  ? assignment.crewId
                                  : null;

                              return (
                                <div
                                  key={assignment._id}
                                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                                >
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-black uppercase text-white">
                                          {crew?.fullName ||
                                            'Assigned Crew Member'}
                                        </p>

                                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/50">
                                          {assignment.status}
                                        </span>
                                      </div>

                                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/30">
                                        {crew?.role || 'Crew'}
                                        {' • '}
                                        Event:{' '}
                                        {new Date(
                                          assignment.eventDate,
                                        ).toLocaleDateString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                      </p>

                                      {assignment.completionNote && (
                                        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                          <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/30">
                                            Completion Note
                                          </p>
                                          <p className="mt-1 text-xs leading-5 text-white/65">
                                            {assignment.completionNote}
                                          </p>
                                        </div>
                                      )}

                                      {assignment.completionProof &&
                                        assignment.completionProof.length >
                                          0 && (
                                          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-white/30">
                                              Proof / Evidence
                                            </p>

                                            <div className="mt-2 space-y-1">
                                              {assignment.completionProof.map(
                                                (proof, index) => (
                                                  <a
                                                    key={`${assignment._id}-proof-${index}`}
                                                    href={proof}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block truncate text-[10px] font-bold text-cyan-300 underline decoration-cyan-300/30 underline-offset-2 hover:text-cyan-200"
                                                  >
                                                    {proof}
                                                  </a>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>

                                    {assignment.status ===
                                      'COMPLETION_SUBMITTED' && (
                                      <button
                                        type="button"
                                        disabled={
                                          verifyingCrewAssignmentId ===
                                          assignment._id
                                        }
                                        onClick={() =>
                                          handleVerifyCrewCompletion(
                                            activeTournament._id,
                                            assignment._id,
                                          )
                                        }
                                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#00FF66]/30 bg-[#00FF66]/10 px-4 py-3 text-[9px] font-black uppercase tracking-[0.1em] text-[#00FF66] transition hover:border-[#00FF66]/60 hover:bg-[#00FF66]/20 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {verifyingCrewAssignmentId ===
                                        assignment._id ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Verify Completion
                                      </button>
                                    )}
                                  </div>

                                  {assignment.status ===
                                    'PAYOUT_PENDING' && (
                                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-cyan-300">
                                      <Loader2 className="h-3.5 w-3.5" />
                                      Sportora payout processing
                                    </div>
                                  )}

                                  {assignment.status === 'PAID' && (
                                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#00FF66]/20 bg-[#00FF66]/5 px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-[#00FF66]">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Crew payout completed
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                            No crew members assigned yet
                          </p>
                        </div>
                      )}
                    </div>

                    <form
                      onSubmit={handleAddCrewRequirement}
                      className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto]"
                    >
                      <input
                        value={crewRole}
                        onChange={(event) =>
                          setCrewRole(event.target.value)
                        }
                        placeholder="Crew role e.g. Referee"
                        className={inputClass}
                      />

                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={crewQuantity}
                        onChange={(event) =>
                          setCrewQuantity(event.target.value)
                        }
                        placeholder="Quantity"
                        className={inputClass}
                      />

                      <button
                        type="submit"
                        disabled={
                          addingCrewRequirement ||
                          crewTournamentId !== activeTournament._id
                        }
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#00FF66] px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-black transition hover:bg-[#00e85c] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {addingCrewRequirement ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <PlusCircle className="h-4 w-4" />
                        )}
                        Add Requirement
                      </button>
                    </form>
                  </div>
                  </>
                )}
              </section>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-8 rounded-[32px] border border-white/10 bg-[#121722] p-6 shadow-2xl sm:p-8"
              >
              <section className="space-y-5">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-[#00FF66]" />
              <h2 className="text-lg font-black italic uppercase">
                Competition Setup
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Sport">
                <select
                  required
                  value={formData.sport}
                  disabled={loadingSports}
                  onChange={(event) =>
                    handleSportChange(event.target.value)
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                >
                  {loadingSports ? (
                    <option value="">Loading sports...</option>
                  ) : (
                    sports.map((item) => (
                      <option key={item.sport} value={item.sport}>
                        {item.sport}
                      </option>
                    ))
                  )}
                </select>
              </Field>

              <Field label="Competition Type">
                <select
                  required
                  value={formData.competitionType}
                  disabled={!selectedSport}
                  onChange={(event) =>
                    updateField(
                      'competitionType',
                      event.target.value,
                    )
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                >
                  {selectedSport?.competitions.map((competition) => (
                    <option
                      key={competition.type}
                      value={competition.type}
                    >
                      {competition.type.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tournament Format">
                <select
                  required
                  value={formData.format}
                  onChange={(event) =>
                    updateField('format', event.target.value)
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                >
                  {FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {selectedCompetition && (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                  Competition Rules
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <Rule
                    label="Entry Size"
                    value={String(
                      selectedCompetition.participantCount,
                    )}
                  />

                  <Rule
                    label="Roster"
                    value={
                      selectedCompetition.requiresRoster
                        ? 'Required'
                        : 'Not required'
                    }
                  />

                  <Rule
                    label="Playing Size"
                    value={
                      selectedCompetition.defaultPlayingSize
                        ? String(
                            selectedCompetition.defaultPlayingSize,
                          )
                        : 'Individual'
                    }
                  />

                  <Rule
                    label="Substitutes"
                    value={
                      selectedCompetition.allowsSubstitutes
                        ? 'Allowed'
                        : 'No'
                    }
                  />
                </div>

                {selectedCompetition.requiresMixedGender && (
                  <p className="mt-3 text-[11px] font-semibold text-cyan-200/70">
                    Mixed-gender participation rules apply to this
                    competition.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#00FF66]" />
              <h2 className="text-lg font-black italic uppercase">
                Tournament Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Tournament Title" full>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    updateField('title', event.target.value)
                  }
                  placeholder="e.g. City Open Championship"
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                />
              </Field>

              <Field label="State / Union Territory">
                <select
                  required
                  value={formData.state}
                  onChange={(event) =>
                    handleStateChange(event.target.value)
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                >
                  <option value="">Select State / UT</option>
                  {indiaStates
                    .slice()
                    .sort((a, b) =>
                      a.name.localeCompare(b.name),
                    )
                    .map((state) => (
                      <option
                        key={state.isoCode}
                        value={state.name}
                      >
                        {state.name}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="City">
                <select
                  required
                  value={formData.city}
                  onChange={(event) =>
                    handleCityChange(event.target.value)
                  }
                  disabled={!formData.state}
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                >
                  <option value="">
                    {formData.state
                      ? 'Select City'
                      : 'Select State First'}
                  </option>
                  {indiaCities
                    .slice()
                    .sort((a, b) =>
                      a.name.localeCompare(b.name),
                    )
                    .map((city, index) => (
                      <option
                        key={`${city.name}-${city.stateCode}-${index}`}
                        value={city.name}
                      >
                        {city.name}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Venue / Location">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    required
                    type="text"
                    value={formData.locationName}
                    onChange={(event) =>
                      updateField(
                        'locationName',
                        event.target.value,
                      )
                    }
                    placeholder="Sports complex / ground / arena"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </Field>

              <Field label="Pincode">
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(event) =>
                    updateField(
                      'pincode',
                      event.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  placeholder="Enter venue PIN code"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-white/40">
                  Enter the exact 6-digit PIN code of the tournament venue.
                </p>
              </Field>

              <Field label="Maximum Participants">
                <div className="relative">
                  <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    required
                    min={1}
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(event) =>
                      updateField(
                        'maxParticipants',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 64"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </Field>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#00FF66]" />
              <h2 className="text-lg font-black italic uppercase">
                Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Registration Deadline">
                <input
                  required
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={(event) =>
                    updateField(
                      'registrationDeadline',
                      event.target.value,
                    )
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                />
              </Field>

              <Field label="Start Date & Time">
                <input
                  required
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(event) =>
                    updateField(
                      'startDate',
                      event.target.value,
                    )
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                />
              </Field>

              <Field label="End Date & Time">
                <input
                  required
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(event) =>
                    updateField(
                      'endDate',
                      event.target.value,
                    )
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-[#00FF66]" />
              <h2 className="text-lg font-black italic uppercase">
                Pricing & Prize
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Entry Fee (₹)">
                <input
                  required
                  min={0}
                  type="number"
                  value={formData.entryFee}
                  onChange={(event) =>
                    updateField('entryFee', event.target.value)
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                />
              </Field>

              <Field label="Prize Pool (₹)">
                <input
                  required
                  min={0}
                  type="number"
                  value={formData.prizePool}
                  onChange={(event) =>
                    updateField('prizePool', event.target.value)
                  }
                  className={`${inputClass} [&>option]:bg-[#121722] [&>option]:text-white`}
                />
              </Field>
            </div>
          </section>

          <div className="border-t border-white/10 pt-6">
            <button
              type="submit"
              disabled={submitting || loadingSports}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00FF66] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition-all hover:bg-[#00e85c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  SUBMITTING PROPOSAL...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  SUBMIT TO SPORTORA
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[10px] font-semibold text-white/25">
              Your tournament will remain pending until reviewed and
              approved by Sportora.
            </p>
          </div>
              </form>
            )}

          {userRole === 'ORGANIZER' && venueTournamentId && (
            <section className="rounded-[32px] border border-cyan-400/20 bg-[#121722] p-6 shadow-2xl sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-cyan-300" />
                    <h2 className="text-lg font-black italic uppercase">
                      Venue Verification
                    </h2>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm text-white/45">
                    Submit venue photos, video proof, and booking or permission
                    documents before Sportora can approve your tournament.
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                  Status: {venueVerificationStatus || 'PENDING'}
                </div>
              </div>

              {venueVerificationStatus === 'MORE_PROOF_REQUIRED' && (
                <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-yellow-300">
                    <AlertCircle className="h-4 w-4" />
                    Additional proof required
                  </div>

                  {venueVerificationRemarks && (
                    <p className="mt-2 text-sm text-white/60">
                      {venueVerificationRemarks}
                    </p>
                  )}

                  {venueProofDeadline && (
                    <p className="mt-2 text-xs font-bold text-yellow-300">
                      Deadline:{' '}
                      {new Date(venueProofDeadline).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {venueVerificationStatus !== 'APPROVED' &&
                (venueVerificationStatus === 'MORE_PROOF_REQUIRED' ||
                  !hasSubmittedVenueProof) && (
                <form
                  onSubmit={handleVenueProofSubmit}
                  className="mt-6 space-y-5"
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Venue Name">
                      <input
                        required
                        value={venueProofData.venueName}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            venueName: event.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="e.g. SKIT Sports Ground"
                      />
                    </Field>

                    <Field label="Venue Address">
                      <input
                        required
                        value={venueProofData.venueAddress}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            venueAddress: event.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="Complete venue address"
                      />
                    </Field>

                    <Field label="Venue Type">
                      <select
                        required
                        value={venueProofData.venueType}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            venueType: event.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        <option className="text-black bg-white" value="GOVERNMENT_SPORTS_CENTRE">
                          Government / Public Sports Centre
                        </option>
                        <option className="text-black bg-white" value="PRIVATE_SPORTS_COMPLEX">
                          Private Sports Complex
                        </option>
                        <option className="text-black bg-white" value="SPORTS_ACADEMY">
                          Sports Academy
                        </option>
                        <option className="text-black bg-white" value="SCHOOL_COLLEGE">
                          School / College
                        </option>
                        <option className="text-black bg-white" value="SPORTS_CLUB">
                          Sports Club
                        </option>
                        <option className="text-black bg-white" value="OTHER">Other</option>
                      </select>
                    </Field>

                    <Field label="Booking Status">
                      <select
                        required
                        value={venueProofData.bookingStatus}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            bookingStatus: event.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        <option className="text-black bg-white" value="BOOKED">Venue Already Booked</option>
                        <option className="text-black bg-white" value="NOT_BOOKED_YET">
                          Venue Not Booked Yet
                        </option>
                      </select>
                    </Field>

                    <Field label="Proof Type">
                      <select
                        required
                        value={venueProofData.proofType}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            proofType: event.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        <option className="text-black bg-white" value="BOOKING_RECEIPT">
                          Booking Receipt
                        </option>
                        <option className="text-black bg-white" value="PERMISSION_LETTER">
                          Permission Letter / NOC
                        </option>
                        <option className="text-black bg-white" value="AGREEMENT">
                          Agreement
                        </option>
                        <option className="text-black bg-white" value="INVOICE_PAYMENT_RECEIPT">
                          Invoice / Payment Receipt
                        </option>
                        <option className="text-black bg-white" value="GOVERNMENT_ALLOCATION">
                          Government Allocation
                        </option>
                        <option className="text-black bg-white" value="VENUE_CONFIRMATION">
                          Venue Confirmation
                        </option>
                        <option className="text-black bg-white" value="QUOTATION">
                          Quotation
                        </option>
                        <option className="text-black bg-white" value="OTHER">Other</option>
                      </select>
                    </Field>

                    <Field label="Venue Contact Name">
                      <input
                        value={venueProofData.venueContactName}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            venueContactName: event.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="Owner / manager / facility contact"
                      />
                    </Field>

                    <Field label="Venue Contact Phone">
                      <input
                        value={venueProofData.venueContactPhone}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            venueContactPhone: event.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="Venue contact number"
                      />
                    </Field>

                    {venueProofData.bookingStatus === 'NOT_BOOKED_YET' && (
                      <>
                        <Field label="Expected Booking Date">
                          <input
                            required
                            type="date"
                            value={venueProofData.expectedBookingDate}
                            onChange={(event) =>
                              setVenueProofData((current) => ({
                                ...current,
                                expectedBookingDate: event.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Venue Communication / Booking Plan" full>
                          <textarea
                            required
                            value={venueProofData.venueCommunication}
                            onChange={(event) =>
                              setVenueProofData((current) => ({
                                ...current,
                                venueCommunication: event.target.value,
                              }))
                            }
                            className={`${inputClass} min-h-24 resize-y`}
                            placeholder="Explain your communication with the venue, expected booking process, quotation, tentative confirmation, or other credible arrangement details."
                          />
                        </Field>
                      </>
                    )}

                    <Field label="Venue Photos">
                      <input
                        required
                        value={venueProofData.venuePhotos}
                        onChange={(event) =>
                          setVenueProofData((current) => ({
                            ...current,
                            venuePhotos: event.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="Photo URL 1, Photo URL 2"
                      />
                      <p className="mt-1 text-[10px] text-white/25">
                        Add multiple URLs separated by commas.
                      </p>
                    </Field>

                    <Field label="Venue Video">
                      <div className="relative">
                        <Video className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/30" />
                        <input
                          value={venueProofData.venueVideos}
                          onChange={(event) =>
                            setVenueProofData((current) => ({
                              ...current,
                              venueVideos: event.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10`}
                          placeholder="Venue video URL"
                        />
                      </div>
                    </Field>

                    <Field label="Booking / NOC / Permission Proof" full>
                      <div className="relative">
                        <FileText className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/30" />
                        <input
                          required
                          value={venueProofData.permissionDocs}
                          onChange={(event) =>
                            setVenueProofData((current) => ({
                              ...current,
                              permissionDocs: event.target.value,
                            }))
                          }
                          className={`${inputClass} pl-10`}
                          placeholder="Booking receipt or permission/NOC document URL"
                        />
                      </div>
                    </Field>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingVenueProof}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-300 transition-all hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingVenueProof ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        SUBMITTING VENUE PROOF...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        SUBMIT VENUE PROOF
                      </>
                    )}
                  </button>
                </form>
              )}

              {venueVerificationStatus === 'PENDING' &&
                hasSubmittedVenueProof && (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                    <div>
                      <p className="text-sm font-black uppercase text-cyan-300">
                        Venue Proof Under Review
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Your venue proof has been submitted and is currently
                        being reviewed by Sportora.
                      </p>
                    </div>
                  </div>
                )}

              {venueVerificationStatus === 'APPROVED' && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#00FF66]/20 bg-[#00FF66]/5 p-4">
                  <CheckCircle2 className="h-5 w-5 text-[#00FF66]" />
                  <div>
                    <p className="text-sm font-black uppercase text-[#00FF66]">
                      Venue Verified
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Your venue proof has been approved by Sportora.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}
          </>
        )}
      </div>

      {selectedCrewProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0D1118] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                  Ground Crew Profile
                </p>
                <h3 className="mt-2 text-xl font-black uppercase text-white">
                  {selectedCrewProfile.fullName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCrewProfile(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Close profile"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                    Role
                  </p>
                  <p className="mt-2 text-sm font-black uppercase text-white">
                    {selectedCrewProfile.role}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                    Experience
                  </p>
                  <p className="mt-2 text-sm font-black text-white">
                    {selectedCrewProfile.experienceYears} years
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                    Rating
                  </p>
                  <p className="mt-2 text-sm font-black text-white">
                    ★ {selectedCrewProfile.rating}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                    Availability
                  </p>
                  <p className="mt-2 text-sm font-black uppercase text-[#00FF66]">
                    {selectedCrewProfile.isAvailable
                      ? 'Available'
                      : 'Unavailable'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                  Location
                </p>
                <p className="mt-2 text-sm font-bold text-white">
                  {selectedCrewProfile.city}, {selectedCrewProfile.state}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                  Sports Expertise
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCrewProfile.sportsExpertise.length > 0 ? (
                    selectedCrewProfile.sportsExpertise.map((sport) => (
                      <span
                        key={sport}
                        className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[9px] font-black uppercase text-cyan-300"
                      >
                        {sport}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-white/30">
                      No sports expertise listed.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                  Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCrewProfile.skills.length > 0 ? (
                    selectedCrewProfile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase text-white/60"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-white/30">
                      No skills listed.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#00FF66]/60 disabled:cursor-not-allowed disabled:opacity-50';

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
        {label}
      </label>
      {children}
    </div>
  );
}

function Rule({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="text-[9px] font-black uppercase tracking-wider text-white/30">
        {label}
      </div>
      <div className="mt-1 text-xs font-bold text-white">
        {value}
      </div>
    </div>
  );
}
