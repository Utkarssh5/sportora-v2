"use client";

import Link from "next/link";

import { FormEvent, useState } from "react";

const issues = [
  "Login & Authentication",
  "Profile Issues",
  "Account Settings",
  "Other Technical Issue",
];

export default function AccountSupportPage() {
  const [issue, setIssue] = useState(issues[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "ACCOUNT",
          subject: `${issue}: ${subject}`,
          description,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to submit request");
      }

      setMessage("Support request submitted successfully.");
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
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
          Account & General Support
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Account & Technical Help
        </h1>

        <p className="mt-4 text-white/60">
          Get help with login, your profile, account settings and other
          technical issues.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
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
            disabled={loading}
            className="w-full rounded-xl bg-[#22d3ee] px-5 py-3 font-black text-[#050816] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Support Request"}
          </button>
        </form>
      </div>
    </main>
  );
}
