"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  X,
} from "lucide-react";


function createMessageId(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return (
    "msg-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2) +
    "-" +
    Math.random().toString(36).slice(2)
  );
}

type Tournament = {
  _id?: string;
  id?: string;
  title: string;
  sport?: string;
  city?: string;
  state?: string;
  locationName?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  entryFee?: number;
  prizePool?: number;
  registeredParticipants?: number;
  maxParticipants?: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  tournaments?: Tournament[];
  paymentConfirmation?: {
    amount: number;
    tournamentTitle?: string;
  };
  paymentConfirmationHandled?: boolean;
};

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
};

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const formatDate = (value?: string) => {
  if (!value) return "Date TBA";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date TBA";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (value?: number) => {
  if (value === undefined || value === null) {
    return "Free";
  }

  if (value === 0) {
    return "Free";
  }

  return `₹${value.toLocaleString("en-IN")}`;
};




async function handleAIPaymentOrder(
  paymentOrder: any,
  tournamentTitle?: string,
): Promise<string> {
  if (
    !paymentOrder?.orderId ||
    !paymentOrder?.keyId ||
    !paymentOrder?.amount ||
    !paymentOrder?.currency
  ) {
    throw new Error(
      "Payment order response is incomplete.",
    );
  }

  const Razorpay =
    await loadRazorpayCheckout();

  return await new Promise<string>(
    (resolve, reject) => {
      let settled = false;

      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      const succeed = (message: string) => {
        if (settled) return;
        settled = true;
        resolve(message);
      };

      const checkout = new Razorpay({
        key: paymentOrder.keyId,
        amount:
          Number(paymentOrder.amount) * 100,
        currency: paymentOrder.currency,
        name: "Sportora",
        description:
          tournamentTitle ||
          "Sportora Tournament Registration",
        order_id: paymentOrder.orderId,

        handler: async (
          razorpayResponse: any,
        ) => {
          try {
            const verifyResponse =
              await fetch(
                "/api/payments/verify",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    razorpay_order_id:
                      razorpayResponse.razorpay_order_id,
                    razorpay_payment_id:
                      razorpayResponse.razorpay_payment_id,
                    razorpay_signature:
                      razorpayResponse.razorpay_signature,
                  }),
                },
              );

            const verifyData =
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              throw new Error(
                verifyData.message ||
                  verifyData.error ||
                  "Payment verification failed.",
              );
            }

            /*
             * The backend has now verified the real
             * Razorpay payment. Do not manufacture
             * registration/ticket data on the client.
             */
            const verifiedData =
              verifyData.data;

            const registrationId =
              verifiedData?.registrationId ||
              verifiedData?.registration?._id ||
              verifiedData?.registration?.id;

            const ticketId =
              verifiedData?.ticketId ||
              verifiedData?.ticket?.id ||
              verifiedData?.ticket?._id;

            const details = [
              "🎉 You’re registered!",
              tournamentTitle
                ? `🏆 ${tournamentTitle}`
                : "",
              "",
              "✅ Payment verified",
              "✅ Registration confirmed",
              registrationId
                ? `📝 Registration: ${registrationId}`
                : "",
              ticketId
                ? `🎟️ Ticket: ${ticketId}`
                : "",
              "",
              "You’re all set. Good luck for the tournament! ⚽",
            ]
              .filter(Boolean)
              .join("\\n");

            succeed(details);
          } catch (error) {
            fail(
              error instanceof Error
                ? error
                : new Error(
                    "Payment verification failed.",
                  ),
            );
          }
        },

        modal: {
          ondismiss: () => {
            fail(
              new Error(
                "Payment was cancelled. No successful payment was verified.",
              ),
            );
          },
        },
      });

      checkout.open();
    },
  );
}

const loadRazorpayCheckout = async () => {
  if (
    typeof window !== "undefined" &&
    (window as any).Razorpay
  ) {
    return (window as any).Razorpay;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(
        new Error("Unable to load Razorpay checkout.")
      ), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

  const Razorpay = (window as any).Razorpay;

  if (!Razorpay) {
    throw new Error("Razorpay checkout is unavailable.");
  }

  return Razorpay;
};

const DEMO_MODE = false;

const DEMO_TOURNAMENTS: Tournament[] = [
  {
    id: "demo-football-1",
    title: "Sportora Football Championship",
    sport: "Football",
    city: "Kanpur",
    state: "Uttar Pradesh",
    locationName: "Sportora Arena",
    startDate: "2026-10-10T09:00:00.000Z",
    endDate: "2026-10-11T18:00:00.000Z",
    registrationDeadline: "2026-10-05T23:59:59.000Z",
    entryFee: 500,
    prizePool: 25000,
    registeredParticipants: 18,
    maxParticipants: 32,
  },
  {
    id: "demo-football-2",
    title: "Sportora Football Premier Cup",
    sport: "Football",
    city: "Lucknow",
    state: "Uttar Pradesh",
    locationName: "Premier Sports Ground",
    startDate: "2026-10-18T09:00:00.000Z",
    endDate: "2026-10-19T18:00:00.000Z",
    registrationDeadline: "2026-10-12T23:59:59.000Z",
    entryFee: 750,
    prizePool: 40000,
    registeredParticipants: 24,
    maxParticipants: 32,
  },
];

const buildTournamentReply = (
  tournaments: Tournament[]
) => {
  if (tournaments.length === 0) {
    return "I couldn't find any matching tournaments.";
  }

  if (tournaments.length === 1) {
    const tournament = tournaments[0];

    return `I found one football tournament for you — ${tournament.title}. You can view the details or start registration below.`;
  }

  return `I found ${tournaments.length} football tournaments for you. Have a look at the options below. You can open any tournament, compare them, or start registration.`;
};

const showTournamentDetails = (
  tournament: Tournament
) => {
  const location =
    tournament.city ||
    tournament.locationName ||
    "Location TBA";

  const details = [
    `Here are the details for ${tournament.title}.`,
    "",
    `⚽ Sport: ${tournament.sport || "Football"}`,
    `📍 Location: ${location}`,
    `📅 Start: ${formatDate(tournament.startDate)}`,
    `💰 Entry fee: ${formatMoney(tournament.entryFee)}`,
    `🏆 Prize pool: ${formatMoney(tournament.prizePool)}`,
    `👥 Players: ${
      tournament.registeredParticipants ?? 0
    }/${
      tournament.maxParticipants ?? "—"
    }`,
  ].join("\n");

  return details;
};

export default function SportoraAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] =
    useState<string | null>(null);

  /*
   * The tournaments currently visible to the user.
   *
   * IMPORTANT:
   * This is populated from either demo data OR real backend data.
   * Conversational references such as "first one", "second one"
   * and "this tournament" always resolve against this list.
   */
  const [lastDisplayedTournaments, setLastDisplayedTournaments] =
    useState<Tournament[]>([]);

  const [selectedTournamentId, setSelectedTournamentId] =
    useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "👋 Hey! I’m Sportora AI. Tell me what you’re looking for and I’ll help you get it done.",
    },
  ]);

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(null);

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/[*_~`]/g, "")
      .replace(/^\s*#{1,6}\s*/gm, "")
      .replace(/^\s*[-+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/[|<>\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speak = (text: string) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const cleanText = cleanTextForSpeech(text);

    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(cleanText);

    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = 0;
        i < Object.keys(event.results).length;
        i++
      ) {
        const result = event.results[i];

        if (result?.[0]?.transcript) {
          transcript += result[0].transcript;
        }
      }

      setInput(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    setListening(true);

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handlePaymentConfirmationAction = async (
    prompt: string,
    messageId: string,
  ) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === messageId
          ? {
              ...message,
              paymentConfirmationHandled: true,
            }
          : message,
      ),
    );

    await sendQuickMessage(prompt);
  };

  const sendQuickMessage = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || loading) {
      return;
    }

    setInput(trimmedPrompt);

    /*
     * Give React a tick to update the input state, then use the
     * same message pipeline as normal chat.
     */
    await new Promise((resolve) =>
      setTimeout(resolve, 0)
    );

    setInput("");
    
    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      text: trimmedPrompt,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        "/api/ai/agent",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            prompt: trimmedPrompt,
            conversationId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "AI request failed."
        );
      }

      if (data.conversationId) {
        setConversationId(
          data.conversationId
        );
      }

      /*
       * AI PAYMENT BRIDGE
       *
       * The backend creates the real payment order only
       * after explicit player confirmation.
       *
       * Never create another order here.
       * Open Razorpay using the exact order returned
       * by the backend and verify it through Sportora's
       * existing payment verification route.
       */
      const aiPaymentOrder =
        data.data?.orderId &&
        data.data?.keyId &&
        data.data?.amount &&
        data.data?.currency
          ? data.data
          : null;

      let paymentResultMessage: string | null =
        null;

      const paymentConfirmation =
        data.data?.paymentRequired &&
        data.data?.confirmationRequired &&
        Number(data.data?.entryFee) > 0
          ? {
              amount: Number(data.data.entryFee),
              tournamentTitle:
                data.data?.tournamentTitle ||
                data.data?.title,
            }
          : undefined;

      if (aiPaymentOrder) {
        paymentResultMessage =
          await handleAIPaymentOrder(
            aiPaymentOrder,
            data.data?.tournamentTitle ||
              data.data?.title,
          );
      }

      const tournaments =
        Array.isArray(data.data?.tournaments)
          ? data.data.tournaments
          : [];

      if (tournaments.length > 0) {
        setLastDisplayedTournaments(
          tournaments
        );
      }

      const answer =
        paymentResultMessage ||
        data.message ||
        data.reply ||
        (tournaments.length > 0
          ? buildTournamentReply(tournaments)
          : "I could not generate a response.");

      const assistantMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        text: answer,
        ...(tournaments.length > 0
          ? { tournaments }
          : {}),
        ...(paymentConfirmation
          ? { paymentConfirmation }
          : {}),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      speak(answer);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId(),
          role: "assistant",
          text:
            `Sorry, I couldn't process that. ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalCommand = (
    prompt: string
  ): { text: string; tournaments?: Tournament[] } | null => {
    const normalized = prompt
      .toLowerCase()
      .trim();

    /*
     * Resolve against the tournaments currently visible to the user.
     * Fall back to demo data only when nothing has been displayed yet.
     */
    const availableTournaments =
      lastDisplayedTournaments;

    const first =
      normalized === "1" ||
      normalized.includes("first") ||
      normalized.includes("1st");

    const second =
      normalized === "2" ||
      normalized.includes("second") ||
      normalized.includes("2nd");

    const refersToCurrentTournament =
      normalized.includes("this tournament") ||
      normalized.includes("this one") ||
      normalized.includes("that tournament") ||
      normalized.includes("that one");

    const isCompareRequest =
      normalized.includes("compare") &&
      (
        normalized.includes("both") ||
        normalized.includes("tournament") ||
        normalized.includes("these")
      );

    /*
     * Compare the complete currently displayed list.
     * Never assume that two tournaments exist.
     */
    if (isCompareRequest) {
      if (availableTournaments.length < 2) {
        return {
          text:
            "I need at least two tournaments to compare. Please show the tournament list again.",
        };
      }

      const [a, b] =
        availableTournaments;

      return {
        text: [
          "Sure — here's a quick comparison:",
          "",
          `🏆 ${a.title}`,
          `📍 ${a.city || a.locationName || "Location TBA"}`,
          `💰 Entry: ${formatMoney(a.entryFee)}`,
          `🏆 Prize: ${formatMoney(a.prizePool)}`,
          `👥 Players: ${a.registeredParticipants ?? 0}/${a.maxParticipants ?? "—"}`,
          "",
          `🏆 ${b.title}`,
          `📍 ${b.city || b.locationName || "Location TBA"}`,
          `💰 Entry: ${formatMoney(b.entryFee)}`,
          `🏆 Prize: ${formatMoney(b.prizePool)}`,
          `👥 Players: ${b.registeredParticipants ?? 0}/${b.maxParticipants ?? "—"}`,
          "",
          a.entryFee !== undefined &&
          b.entryFee !== undefined
            ? a.entryFee < b.entryFee
              ? `💡 ${a.title} has the lower entry fee.`
              : a.entryFee > b.entryFee
                ? `💡 ${b.title} has the lower entry fee.`
                : "💡 Both tournaments have the same entry fee."
            : "",
          a.prizePool !== undefined &&
          b.prizePool !== undefined
            ? a.prizePool > b.prizePool
              ? `${a.title} has the larger prize pool.`
              : a.prizePool < b.prizePool
                ? `${b.title} has the larger prize pool.`
                : "Both tournaments have the same prize pool."
            : "",
          "",
          "Which one would you like to explore?",
        ].filter(Boolean).join("\n"),
        tournaments: availableTournaments,
      };
    }

    /*
     * Resolve "first", "second", "this", and "that".
     */
    const selected =
      first
        ? availableTournaments[0]
        : second
          ? availableTournaments[1]
          : refersToCurrentTournament
            ? availableTournaments.find(
                (tournament) =>
                  (tournament._id || tournament.id) ===
                  selectedTournamentId
              )
            : undefined;

    /*
     * "first one" / "second one" / "1" / "2"
     */
    if (first || second) {
      if (!selected) {
        return {
          text:
            first
              ? "I couldn't find a first tournament in the current list. Please show the tournaments again."
              : "I couldn't find a second tournament in the current list. Please show the tournaments again.",
        };
      }

      const selectedId =
        selected._id || selected.id;

      if (selectedId) {
        setSelectedTournamentId(
          selectedId
        );
      }

      return {
        text: [
          `Got it — you selected ${first ? "the first" : "the second"} tournament:`,
          "",
          showTournamentDetails(selected),
          "",
          "What would you like to do next?",
        ].join("\n"),
      };
    }

    /*
     * "open this", "show details of this", etc.
     */
    if (
      normalized.includes("detail") ||
      normalized.includes("open") ||
      normalized.includes("view")
    ) {
      if (!selected) {
        return {
          text:
            "I don't have a tournament selected yet. Try saying \"first one\" or \"second one\" first.",
        };
      }

      return {
        text: showTournamentDetails(
          selected
        ),
      };
    }

    return null;
  };

  const sendMessage = async () => {
    const prompt = input.trim();

    if (!prompt || loading) return;

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      text: prompt,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    /*
     * ALL conversational decisions now go through the real
     * backend Sportora Agent.
     *
     * Do not resolve "first one", "this tournament", compare,
     * details, registration, etc. in the frontend.
     *
     * The backend owns conversation state, references, tools,
     * permissions and real database state.
     */

    try {
      /*
       * REAL BACKEND PATH
       *
       * When DEMO_MODE is false, requests continue through
       * the existing authenticated AgentService architecture.
       */
      const response = await fetch(
        "/api/ai/agent",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            prompt,
            conversationId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "AI request failed."
        );
      }

      if (data.conversationId) {
        setConversationId(
          data.conversationId
        );
      }

      /*
       * AI PAYMENT BRIDGE
       *
       * The backend creates the real payment order only
       * after explicit player confirmation.
       *
       * Never create another order here.
       * Open Razorpay using the exact order returned
       * by the backend and verify it through Sportora's
       * existing payment verification route.
       */
      const aiPaymentOrder =
        data.data?.orderId &&
        data.data?.keyId &&
        data.data?.amount &&
        data.data?.currency
          ? data.data
          : null;

      let paymentResultMessage: string | null =
        null;

      if (aiPaymentOrder) {
        paymentResultMessage =
          await handleAIPaymentOrder(
            aiPaymentOrder,
            data.data?.tournamentTitle ||
              data.data?.title,
          );
      }

      const tournaments =
        Array.isArray(data.data?.tournaments)
          ? data.data.tournaments
          : [];

      if (tournaments.length > 0) {
        setLastDisplayedTournaments(
          tournaments
        );
      }

      const answer =
        paymentResultMessage ||
        data.message ||
        data.reply ||
        (tournaments.length > 0
          ? buildTournamentReply(tournaments)
          : "I could not generate a response.");

      const assistantMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        text: answer,
        ...(tournaments.length > 0
          ? { tournaments }
          : {}),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      speak(answer);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId(),
          role: "assistant",
          text:
            `Sorry, I couldn't process that. ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-[#00FF66] text-black shadow-2xl transition hover:scale-105"
        aria-label="Open Sportora AI"
      >
        <Bot className="h-7 w-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex w-[380px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#090909] text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00FF66] text-black">
            <Bot className="h-5 w-5" />
          </div>

          <div>
            <div className="font-semibold">
              Sportora AI
            </div>

            <div className="text-xs text-white/50">
              Ask • Speak • Act
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-white/50 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex max-h-[420px] min-h-[300px] flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 1 && !loading && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                void sendQuickMessage("Find football tournaments for me")
              }
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[#00FF66]/40 hover:bg-white/[0.07]"
            >
              <div className="mb-1 text-lg">⚽</div>
              <div className="text-xs font-semibold text-white">
                Find Tournament
              </div>
              <div className="mt-1 text-[10px] text-white/40">
                Discover tournaments
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                void sendQuickMessage("Find football tournaments near me")
              }
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[#00FF66]/40 hover:bg-white/[0.07]"
            >
              <div className="mb-1 text-lg">📍</div>
              <div className="text-xs font-semibold text-white">
                Tournaments Near Me
              </div>
              <div className="mt-1 text-[10px] text-white/40">
                Find nearby games
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                void sendQuickMessage("Show me upcoming football matches")
              }
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[#00FF66]/40 hover:bg-white/[0.07]"
            >
              <div className="mb-1 text-lg">🏆</div>
              <div className="text-xs font-semibold text-white">
                Upcoming Matches
              </div>
              <div className="mt-1 text-[10px] text-white/40">
                See what’s coming
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                void sendQuickMessage("Help me register for a tournament")
              }
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[#00FF66]/40 hover:bg-white/[0.07]"
            >
              <div className="mb-1 text-lg">📝</div>
              <div className="text-xs font-semibold text-white">
                Register
              </div>
              <div className="mt-1 text-[10px] text-white/40">
                Get me into a tournament
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                void sendQuickMessage("Show my tournament registrations")
              }
              className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[#00FF66]/40 hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-3">
                <div className="text-lg">💳</div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    My Registrations
                  </div>
                  <div className="mt-1 text-[10px] text-white/40">
                    Check your registrations and payments
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#00FF66] px-4 py-3 text-sm text-black"
                : "mr-auto max-w-[94%] rounded-2xl rounded-bl-md bg-white/5 px-4 py-3 text-sm text-white/90"
            }
          >
            <div>{message.text}</div>

            {message.paymentConfirmation && (
              <div className="mt-3 rounded-2xl border border-[#00FF66]/20 bg-black/20 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span className="text-sm font-semibold text-white">
                    Registration Payment
                  </span>
                </div>

                {message.paymentConfirmation.tournamentTitle && (
                  <div className="mb-2 text-xs text-white/60">
                    🏆 {message.paymentConfirmation.tournamentTitle}
                  </div>
                )}

                <div className="mb-3 flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2">
                  <span className="text-xs text-white/50">
                    Entry fee
                  </span>
                  <span className="text-base font-bold text-[#00FF66]">
                    ₹{message.paymentConfirmation.amount}
                  </span>
                </div>

                {message.paymentConfirmationHandled ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs text-white/50">
                    ✓ Confirmation submitted
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        void handlePaymentConfirmationAction(
                          "Yes, I confirm and want to proceed with the payment",
                          message.id,
                        )
                      }
                      className="rounded-xl bg-[#00FF66] px-3 py-2.5 text-xs font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ✅ Confirm & Pay
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        void handlePaymentConfirmationAction(
                          "No, cancel the registration and payment",
                          message.id,
                        )
                      }
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {message.tournaments &&
              message.tournaments.length > 0 && (
                <div className="mt-3 space-y-3">
                  {message.tournaments.map(
                    (tournament, index) => {
                      const tournamentId =
                        tournament._id ||
                        tournament.id;

                      return (
                        <div
                          key={
                            tournamentId ||
                            `${message.id}-${index}`
                          }
                          className="rounded-2xl border border-white/10 bg-black/30 p-3"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-white">
                                {index + 1}.{" "}
                                {tournament.title}
                              </div>

                              <div className="mt-1 text-xs text-white/50">
                                {tournament.sport || "Sport"}{" "}
                                •{" "}
                                {tournament.city ||
                                  "Location TBA"}
                                {tournament.state
                                  ? `, ${tournament.state}`
                                  : ""}
                              </div>
                            </div>

                            <div className="rounded-full bg-[#00FF66]/10 px-2 py-1 text-[10px] font-medium text-[#00FF66]">
                              {tournament.sport ||
                                "SPORT"}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                            <div>
                              📅{" "}
                              {formatDate(
                                tournament.startDate
                              )}
                            </div>

                            <div>
                              🏆{" "}
                              {formatMoney(
                                tournament.prizePool
                              )}
                            </div>

                            <div>
                              💰 Entry{" "}
                              {formatMoney(
                                tournament.entryFee
                              )}
                            </div>

                            <div>
                              👥{" "}
                              {tournament.registeredParticipants ??
                                0}
                              /
                              {tournament.maxParticipants ??
                                "—"}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTournamentId(
                                  tournament._id ||
                                    tournament.id ||
                                    null
                                );

                                const details = [
                                  `Here are the details for ${tournament.title}.`,
                                  "",
                                  `⚽ Sport: ${tournament.sport || "Football"}`,
                                  `📍 Location: ${tournament.city || tournament.locationName || "Location TBA"}`,
                                  `📅 Start: ${formatDate(tournament.startDate)}`,
                                  `🏁 End: ${formatDate(tournament.endDate)}`,
                                  `💰 Entry fee: ${formatMoney(tournament.entryFee)}`,
                                  `🏆 Prize pool: ${formatMoney(tournament.prizePool)}`,
                                  `👥 Participants: ${tournament.registeredParticipants ?? 0}/${tournament.maxParticipants ?? "—"}`,
                                  `⏰ Registration deadline: ${formatDate(tournament.registrationDeadline)}`,
                                  "",
                                  "What would you like to do next?",
                                ].join("\n");

                                setMessages((previous) => [
                                  ...previous,
                                  {
                                    id: createMessageId(),
                                    role: "assistant",
                                    text: details,
                                  },
                                ]);

                                speak(
                                  `Here are the details for ${tournament.title}. What would you like to do next?`
                                );
                              }}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                            >
                              👀 View Details
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                void sendQuickMessage(
                                  `register me for ${tournament.title}`
                                );
                              }}
                              className="rounded-xl bg-[#00FF66] px-3 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(0,255,102,0.12)] transition hover:brightness-110"
                            >
                              📝 Register
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              void sendQuickMessage(
                                `show the ${index + 1 === 1 ? "first" : index + 1 === 2 ? "second" : `${index + 1}th`} tournament`
                              );
                            }}
                            className="mt-2 w-full text-center text-[11px] text-white/35 hover:text-white/70"
                          >
                            Ask about this tournament
                          </button>
                        </div>
                      );
                    }
                  )}

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] text-white/40">
                    You can say:{" "}
                    <span className="text-white/60">
                      "open the first one"
                    </span>
                    ,{" "}
                    <span className="text-white/60">
                      "register the second one"
                    </span>
                    , or{" "}
                    <span className="text-white/60">
                      "show more"
                    </span>
                    .
                  </div>
                </div>
              )}
          </div>
        ))}

        {loading && (
          <div className="mr-auto rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/50">
            Sportora AI is thinking...
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask Sportora anything..."
            rows={2}
            className="min-h-[48px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-white/30"
          />

          <button
            type="button"
            onClick={
              listening
                ? stopListening
                : startListening
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              listening
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white"
            }`}
            aria-label={
              listening
                ? "Stop listening"
                : "Start voice input"
            }
          >
            {listening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (input.trim()) {
                void sendMessage();
              }
            }}
            disabled={
              loading || !input.trim()
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black disabled:opacity-30"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-white/30">
          <Volume2 className="h-3 w-3" />
          Voice replies enabled
        </div>
      </div>
    </div>
  );
}
