"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const issues = [
  "Registration & Payment",
  "Ticket Problem",
  "Fixture & Match",
  "Cancellation & Refund",
  "Other Tournament Issue",
];

type Registration = {
  _id: string;
  ticketId?: string;
  status?: string;
  paymentStatus?: string | null;
  paymentId?: string | null;
  orderId?: string | null;
  tournamentId?: {
    _id?: string;
    title?: string;
    sport?: string;
    city?: string;
    state?: string;
    status?: string;
  };
};

export default function TournamentSupportPage() {
  const [issue, setIssue] = useState(issues[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState("");
  const [registrationsLoading, setRegistrationsLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadRegistrations() {
      try {
        setRegistrationsLoading(true);

        const response = await fetch("/api/tournament-registration/my", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || data.error || "Unable to load tournaments.",
          );
        }

        const items = Array.isArray(data.registrations) ? data.registrations : [];

        setRegistrations(items);

        if (items.length > 0) {
          setSelectedRegistrationId(items[0]._id);
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your tournaments.",
        );
      } finally {
        setRegistrationsLoading(false);
      }
    }

    loadRegistrations();
  }, []);

  const selectedRegistration = registrations.find(
    (registration) => registration._id === selectedRegistrationId,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "TOURNAMENT",
          subject: `${issue}: ${subject}`,
          description,
          priority,
          ...(selectedRegistration?.tournamentId?._id
            ? { tournamentId: selectedRegistration.tournamentId._id }
            : {}),
          ...(selectedRegistration?._id
            ? { registrationId: selectedRegistration._id }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to submit request",
        );
      }

      setMessage("Support request submitted successfully.");
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      setSubmitted(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit support request.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/contact"
          className="mb-8 inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/70 transition hover:border-[#22d3ee]/30 hover:text-[#22d3ee]"
        >
          ← Back to Support
        </Link>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#22d3ee]">
          Tournament Support
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Tournament & Registration Help
        </h1>

        <p className="mt-4 text-white/60">
          Get help with registrations, payments, tickets, fixtures,
          cancellations and tournament participation.
        </p>

        {submitted ? (
          <div className="mt-10 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-3xl text-emerald-300">
              ✓
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Support Request Submitted
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60">
              Your tournament support request has been submitted successfully.
              Our support team can now review your tournament, registration,
              and payment context.
            </p>

            {message && (
              <p className="mt-4 text-sm font-bold text-emerald-300">
                {message}
              </p>
            )}

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white/80 transition hover:border-white/20 hover:text-white"
              >
                Back to Support
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage("");
                  setIssue(issues[0]);
                  setPriority("MEDIUM");
                }}
                className="rounded-xl bg-[#22d3ee] px-5 py-3 text-sm font-black text-[#050816] transition hover:opacity-90"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
          <div>
            <label className="mb-2 block text-sm font-bold text-white/80">
              Related Tournament
            </label>

            {registrationsLoading ? (
              <div className="rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white/50">
                Loading your tournaments...
              </div>
            ) : registrations.length > 0 ? (
              <>
                <select
                  value={selectedRegistrationId}
                  onChange={(event) =>
                    setSelectedRegistrationId(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
                >
                  {registrations.map((registration) => (
                    <option key={registration._id} value={registration._id}>
                      {registration.tournamentId?.title ?? "Tournament"}
                      {registration.tournamentId?.city
                        ? ` — ${registration.tournamentId.city}`
                        : ""}
                    </option>
                  ))}
                </select>

                {selectedRegistration && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
                    <div className="font-bold text-white/80">
                      {selectedRegistration.tournamentId?.sport ?? "Sport"}
                      {selectedRegistration.tournamentId?.status
                        ? ` • ${selectedRegistration.tournamentId.status}`
                        : ""}
                    </div>

                    <div className="mt-1">
                      Registration: {selectedRegistration._id}
                    </div>

                    {selectedRegistration.ticketId && (
                      <div className="mt-1">
                        Ticket: {selectedRegistration.ticketId}
                      </div>
                    )}

                    {selectedRegistration.paymentStatus && (
                      <div className="mt-1">
                        Payment: {selectedRegistration.paymentStatus}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 text-sm text-amber-200/80">
                No tournament registrations found. You can still submit a
                support request, but tournament context will not be attached.
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white/80">
              Issue Type
            </label>
            <select
              value={issue}
              onChange={(event) => setIssue(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
            >
              {issues.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white/80">
              Subject
            </label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
              minLength={3}
              maxLength={150}
              placeholder="Briefly describe your issue"
              className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white/80">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              minLength={10}
              maxLength={2000}
              rows={6}
              placeholder="Tell us what happened and how we can help..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white/80">
              Priority
            </label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {message && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || registrationsLoading}
            className="w-full rounded-xl bg-[#22d3ee] px-5 py-3 font-black text-[#050816] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Support Request"}
          </button>
          </form>
        )}
      </div>
    </main>
  );
}
