import Link from "next/link";

const supportOptions = [
  {
    title: "Tournament & Registration",
    description:
      "Help with registrations, payments, tickets, fixtures, cancellations and tournament participation.",
    items: [
      "Registration & payment issues",
      "Ticket problems",
      "Fixtures & matches",
      "Cancellation & refund",
    ],
  },
  {
    title: "Organizer Support",
    description:
      "Help with organizer verification, venue verification, tournament creation and hosting.",
    items: [
      "Organizer verification",
      "Venue verification",
      "Create & host tournament",
      "Organizer account issues",
    ],
  },
  {
    title: "Account & General Support",
    description:
      "Get help with your profile, login, account settings or any other Sportora issue.",
    items: [
      "Login & authentication",
      "Profile issues",
      "Account settings",
      "Other technical issues",
    ],
  },
];

export default function ContactPage() {
  return (
    <main className="contact-page min-h-screen bg-[#050816] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#22d3ee]">
          Contact & Support
        </p>

        <h1 className="mt-4 text-4xl font-black">
          How can we help?
        </h1>

        <p className="mt-4 max-w-2xl text-white/60">
          Choose the support category that best matches your issue and get
          help with your Sportora experience.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {supportOptions.map((option) => (
            <div
              key={option.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#22d3ee]/30 hover:bg-white/[0.06]"
            >
              <h2 className="text-xl font-bold">{option.title}</h2>

              <p className="mt-3 text-sm leading-6 text-white/55">
                {option.description}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-white/65">
                {option.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <Link
                href={
                  option.title === "Tournament & Registration"
                    ? "/contact/tournament"
                    : option.title === "Organizer Support"
                      ? "/contact/organizer"
                      : "/contact/account"
                }
                className="mt-6 block w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center text-sm font-bold transition hover:border-[#22d3ee]/40 hover:text-[#22d3ee]"
              >
                Get Help
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/[0.05] p-7">
          <h2 className="text-xl font-bold">Need direct assistance?</h2>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Can&apos;t find what you&apos;re looking for? Our support system
            will help you raise a request directly with the Sportora team.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contact/my-requests"
              className="inline-flex rounded-xl border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-5 py-3 text-sm font-black text-[#22d3ee] transition hover:bg-[#22d3ee]/20"
            >
              My Support Requests
            </Link>

            <Link
              href="/"
              className="inline-flex rounded-xl bg-[#22d3ee] px-5 py-3 text-sm font-black text-black transition hover:opacity-90"
            >
              Back to Sportora
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
