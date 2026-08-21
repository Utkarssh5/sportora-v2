"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SupportTicket {
  _id: string;
  category: "TOURNAMENT" | "ORGANIZER" | "ACCOUNT";
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  adminResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusClasses: Record<SupportTicket["status"], string> = {
  OPEN: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
  IN_PROGRESS: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  RESOLVED: "border-green-400/20 bg-green-400/10 text-green-300",
  CLOSED: "border-white/10 bg-white/5 text-white/50",
};

export default function MySupportRequestsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        const response = await fetch("/api/support");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Failed to load support requests",
          );
        }

        setTickets(data.tickets ?? []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load support requests.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/contact"
          className="mb-8 inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/70 transition hover:border-[#22d3ee]/30 hover:text-[#22d3ee]"
        >
          ← Back to Support
        </Link>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#22d3ee]">
          Support
        </p>

        <h1 className="mt-4 text-4xl font-black">
          My Support Requests
        </h1>

        <p className="mt-4 text-white/60">
          Track your submitted support requests and their current status.
        </p>

        {loading && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/60">
            Loading your support requests...
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <h2 className="text-xl font-bold">
              No support requests yet
            </h2>

            <p className="mt-2 text-sm text-white/50">
              If you need help, choose a support category and submit a request.
            </p>
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="mt-10 space-y-5">
            {tickets.map((ticket) => (
              <article
                key={ticket._id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                      Ticket #{ticket._id.slice(-8).toUpperCase()}
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      {ticket.subject}
                    </h2>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[ticket.status]}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/55">
                  <span className="rounded-lg bg-white/5 px-3 py-2">
                    {ticket.category}
                  </span>

                  <span className="rounded-lg bg-white/5 px-3 py-2">
                    Priority: {ticket.priority}
                  </span>

                  <span className="rounded-lg bg-white/5 px-3 py-2">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Your Request
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">
                    {ticket.description}
                  </p>
                </div>

                {ticket.adminResponse && (
                  <div className="mt-5 rounded-xl border border-[#22d3ee]/10 bg-[#22d3ee]/[0.04] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#22d3ee]">
                      Sportora Support Response
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {ticket.adminResponse}
                    </p>
                  </div>
                )}

                <p className="mt-4 text-xs text-white/35">
                  Last updated:{" "}
                  {new Date(ticket.updatedAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
