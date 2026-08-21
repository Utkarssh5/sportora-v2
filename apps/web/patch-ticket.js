const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "app/profile/page.tsx");
let content = fs.readFileSync(filePath, "utf8");

// Ensure icons are present
if (!content.includes("Download")) {
  content = content.replace("import {", "import {\n  Download,");
}
if (!content.includes("X,") && !content.includes("X }")) {
  content = content.replace("import {", "import {\n  X,");
}

const startTag = "{/* TICKET VIEW */}";
const endTag = "{/* SETTINGS */}";

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error("Tags not found in file!");
  process.exit(1);
}

const newBlock = `{/* TICKET SECTION */}
        {activeSection === "tickets" && (
          <div className="lg:col-span-3 w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#00FF66]" />
                  MY MATCH TICKETS & PASSES
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  View your tournament passes and entry credentials.
                </p>
              </div>
              <span className="rounded-full border border-[#00FF66]/20 bg-[#00FF66]/10 px-3 py-1 text-[10px] font-black text-[#00FF66]">
                {registrations.length} BOOKINGS
              </span>
            </div>

            {registrationsLoading ? (
              <div className="clean-glass rounded-3xl border border-white/10 p-8 space-y-4">
                <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
                <div className="h-24 rounded-2xl bg-white/5 animate-pulse" />
              </div>
            ) : registrations.length === 0 ? (
              <div className="clean-glass rounded-3xl border border-dashed border-white/10 p-10 text-center">
                <Ticket className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-black text-gray-400 uppercase">NO ACTIVE TICKETS FOUND</p>
                <p className="text-xs text-gray-600 mt-1 uppercase">Register in a tournament to generate match passes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registrations.map((reg) => {
                  const tournament = typeof reg.tournamentId === "object" ? reg.tournamentId : null;
                  const eventDate = tournament?.startDate
                    ? new Date(tournament.startDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "TBD";

                  return (
                    <div
                      key={reg._id}
                      className="clean-glass rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:border-[#00FF66]/30 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black uppercase text-cyan-300">
                            {tournament?.sport || "SPORT EVENT"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/20 px-2.5 py-1 text-[9px] font-black uppercase text-[#00FF66]">
                            <CheckCircle2 className="w-3 h-3" />
                            {reg.paymentStatus === "SUCCESS" ? "CONFIRMED" : reg.paymentStatus || "ACTIVE"}
                          </span>
                        </div>

                        <h3 className="text-lg font-black uppercase text-white mt-3">
                          {tournament?.title || "Tournament Entry"}
                        </h3>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                            <span className="text-[8px] font-black uppercase text-gray-500 block">Date</span>
                            <span className="font-bold text-gray-200 block mt-0.5">{eventDate}</span>
                          </div>
                          <div className="bg-[#00FF66]/5 rounded-xl p-2.5 border border-[#00FF66]/10">
                            <span className="text-[8px] font-black uppercase text-gray-500 block">Ticket ID</span>
                            <span className="font-mono font-bold text-[#00FF66] block mt-0.5 truncate">{reg.ticketId || "PASS-" + reg._id.slice(-6)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-500">
                          {reg.bookingRef ? "REF: " + reg.bookingRef : "ENTRY PASS"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigateWithinProfile("/profile?section=tickets&registration=" + reg._id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#00FF66] px-4 py-2 text-[10px] font-black uppercase text-black hover:bg-[#00FF66]/90 transition"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          View Match Pass
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FULL PASS MODAL (OPENS ON CLICK) */}
        {activeSection === "tickets" && selectedRegistration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="relative w-full max-w-xl my-8">
              <div
                ref={ticketRef}
                className="clean-glass rounded-3xl border border-[#00FF66]/30 overflow-hidden relative shadow-2xl bg-[#090D14]"
              >
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00FF66]/10 blur-3xl" />

                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-[#00FF66]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00FF66]">
                        SPORTORA MATCH PASS
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateWithinProfile("/profile?section=tickets")}
                      className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-white hover:bg-white/10 transition"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-4">
                    {typeof selectedRegistration.tournamentId === "object"
                      ? selectedRegistration.tournamentId?.title
                      : "Tournament Entry Pass"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <span className="text-[9px] text-gray-500 uppercase font-black block">Player</span>
                      <span className="text-sm text-white font-bold mt-1 block">{displayName}</span>
                    </div>

                    <div className="bg-[#00FF66]/5 rounded-2xl p-4 border border-[#00FF66]/20">
                      <span className="text-[9px] text-gray-500 uppercase font-black block">Ticket ID</span>
                      <span className="text-base text-[#00FF66] font-mono font-black mt-1 block tracking-wider break-all">
                        {selectedRegistration.ticketId || "PASS-" + selectedRegistration._id.slice(-6)}
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <span className="text-[9px] text-gray-500 uppercase font-black block">Event Date</span>
                      <span className="text-sm text-white font-bold mt-1 block">
                        {typeof selectedRegistration.tournamentId === "object" && selectedRegistration.tournamentId?.startDate
                          ? new Date(selectedRegistration.tournamentId.startDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "TBD"}
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <span className="text-[9px] text-gray-500 uppercase font-black block">Venue</span>
                      <span className="text-sm text-white font-bold mt-1 block truncate">
                        {typeof selectedRegistration.tournamentId === "object"
                          ? selectedRegistration.tournamentId?.venue || selectedRegistration.tournamentId?.city || "Venue confirmed on check-in"
                          : "Venue confirmed on check-in"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center flex flex-col items-center justify-center">
                    <div className="rounded-2xl bg-white p-3 shadow-lg">
                      <img
                        src={"https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent("SPORTORA-PASS:" + (selectedRegistration.ticketId || selectedRegistration._id))}
                        alt="Match Pass QR"
                        className="w-36 h-36"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-mono mt-3">
                      Scan at venue check-in desk for entry
                    </p>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigateWithinProfile("/profile?section=tickets")}
                      className="flex-1 rounded-full border border-white/10 bg-white/5 py-3 text-xs font-black uppercase text-gray-300 hover:bg-white/10"
                    >
                      Back to Tickets
                    </button>
                    <button
                      type="button"
                      onClick={downloadTicketAsImage}
                      className="flex-1 rounded-full bg-[#00FF66] py-3 text-xs font-black uppercase text-black hover:bg-[#00FF66]/90 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Pass
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
`;

content = content.substring(0, startIndex) + newBlock + "\n\n        " + content.substring(endIndex);
fs.writeFileSync(filePath, content, "utf8");
console.log("SUCCESS: Patched tickets view cleanly without terminal line truncation!");
