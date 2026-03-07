"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Mountain,
    Lightbulb,
    Search,
    Link2,
    Hammer,
    ShieldCheck,
    Copy,
    Check,
    ChevronLeft,
    Clock,
    Users,
    AlertTriangle,
    Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data: each slide is a section of the 90-second run-of-show         */
/* ------------------------------------------------------------------ */

interface Slide {
    id: string;
    phase: string;
    phaseColor: string;     // tailwind ring/border accent
    accentBg: string;       // tailwind bg for accent pill
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    duration: string;
    bullets: string[];
    copyBlock: string;      // markdown-ish text to copy
}

const SLIDES: Slide[] = [
    {
        id: "overview",
        phase: "OVERVIEW",
        phaseColor: "border-zinc-500",
        accentBg: "bg-zinc-700",
        title: "ATLAS × WIDGET",
        subtitle: "Two frameworks, one weekend, ship it.",
        icon: <Mountain className="h-8 w-8" />,
        duration: "~15s",
        bullets: [
            "ATLAS = build execution (Architect → Trace → Link → Assemble → Stress-test)",
            "WIDGET = product lifecycle (Wonder → Invention → Discernment → Galvanizing → Enablement → Tenacity)",
            "ATLAS tells you WHAT to do. WIDGET tells you WHO should lead.",
            "Together they prevent the two hackathon killers: building the wrong thing, and building the right thing wrong.",
        ],
        copyBlock: `ATLAS × WIDGET — Weekend Hackathon Playbook

ATLAS (build execution):   A→T→L→A→S
  Architect → Trace → Link → Assemble → Stress-test

WIDGET (product lifecycle): W→I→D→G→E→T
  Wonder → Invention → Discernment → Galvanizing → Enablement → Tenacity

Rule 1: Nothing enters Assemble until Link = ALL ✅
Rule 2: If you can't tweet the MVP, cut scope.`,
    },
    {
        id: "friday",
        phase: "FRIDAY NIGHT",
        phaseColor: "border-violet-500",
        accentBg: "bg-violet-600",
        title: "Plan & Validate",
        subtitle: "3 hours. Zero code. All signal.",
        icon: <Lightbulb className="h-8 w-8" />,
        duration: "~20s",
        bullets: [
            "WONDER + INVENTION → Brainstorm & pick the idea (30 min)",
            "DISCERNMENT → Kill weak ideas fast (15 min)",
            "ARCHITECT → Write the App Brief: Problem, User, Success, Constraints (30 min)",
            "TRACE → Schema (3–5 entities max), Integrations map, Stack decision (45 min)",
            "LINK → Validate EVERY connection: DB, APIs, Auth, .env (45 min)",
        ],
        copyBlock: `## APP BRIEF
- Problem:  ___
- User:     ___
- Success:  ___
- Constraints:
  - Time: ___hrs active dev
  - Budget: free tiers only? Y/N
  - Team: ___ people
  - Demo: what does it look like at 4pm Sunday?

## SCHEMA
| Table/Collection | Key Fields |
|------------------|------------|
| 1.               |            |
| 2.               |            |
| 3.               |            |

## INTEGRATIONS
| Service | Purpose | Auth | Key? | Tested? |
|---------|---------|------|------|---------|
|         |         |      | [ ]  | [ ]     |
|         |         |      | [ ]  | [ ]     |

## LINK CHECKLIST
[ ] Database connection tested (read + write)
[ ] All API keys verified (made a real call)
[ ] Auth flow working
[ ] .env file populated
[ ] Dev server boots clean
[ ] Deploy target configured
[ ] Repo init'd, everyone can push`,
    },
    {
        id: "saturday",
        phase: "SATURDAY",
        phaseColor: "border-amber-500",
        accentBg: "bg-amber-600",
        title: "Build Day",
        subtitle: "10–12 hours. Layers, in order.",
        icon: <Hammer className="h-8 w-8" />,
        duration: "~20s",
        bullets: [
            "ENABLEMENT genius runs point — unblock, don't just code",
            "Morning: 🗄️ Database layer (schema, seed data, test queries)",
            "Midday: ⚙️ Backend/API (routes, business logic, validation)",
            "Afternoon: 🖥️ Frontend UI (components, interactions)",
            "Evening: 🔗 Integration (frontend → backend, full flow test)",
        ],
        copyBlock: `## SATURDAY BUILD ORDER
1. DATABASE (morning, 2-3 hrs)
   [ ] Schema created
   [ ] Seed data loaded
   [ ] Test queries working

2. BACKEND / API (midday, 2-3 hrs)
   [ ] Routes defined
   [ ] Business logic implemented
   [ ] Data validation in place

3. FRONTEND UI (afternoon, 3-4 hrs)
   [ ] Core components built
   [ ] User interactions wired
   [ ] Display logic working

4. INTEGRATION (evening, 1-2 hrs)
   [ ] Frontend → Backend connected
   [ ] Full user flow tested end-to-end

## MILESTONES
[ ] NOON:     DB running, API returns real data
[ ] 6PM:      Frontend renders data from API
[ ] MIDNIGHT: Core user flow works end-to-end (ugly = fine)`,
    },
    {
        id: "sunday",
        phase: "SUNDAY",
        phaseColor: "border-emerald-500",
        accentBg: "bg-emerald-600",
        title: "Polish & Ship",
        subtitle: "6–8 hours. Make it demo-ready.",
        icon: <ShieldCheck className="h-8 w-8" />,
        duration: "~15s",
        bullets: [
            "TENACITY genius owns the finish — quality, not features",
            "Morning: Bug fixes + polish on the core flow only",
            "Early PM: Deploy to production URL",
            "Mid PM: Rehearse demo (2–3 runthroughs)",
            "Late PM: 🎤 Demo time",
        ],
        copyBlock: `## DEMO PATH TEST — must pass before deploy
[ ] New user can complete the core flow (happy path)
[ ] Error states show something useful (not white screen)
[ ] Demo works on projector / screen share
[ ] Seed data loaded (demo isn't empty)
[ ] 60-second pitch matches what the app does

## SUNDAY SCHEDULE
- Morning:    Bug fixes + core flow polish
- Early PM:   Deploy to production URL
- Mid PM:     Rehearse demo (2-3 runs)
- Late PM:    🎤 DEMO TIME`,
    },
    {
        id: "roles",
        phase: "TEAM",
        phaseColor: "border-sky-500",
        accentBg: "bg-sky-600",
        title: "Role Assignments",
        subtitle: "Match people to their genius.",
        icon: <Users className="h-8 w-8" />,
        duration: "~10s",
        bullets: [
            "WONDERER → Leads brainstorm (Friday)",
            "INVENTOR → Generates solution concepts (Friday)",
            "DISCERNER → Kills bad ideas, evaluates stack (Friday)",
            "GALVANIZER → Assigns roles, rallies energy, runs demos (All weekend)",
            "ENABLER → Unblocks the team during build (Saturday)",
            "TENACIOUS → Owns polish, deploy checklist, finish line (Sunday)",
        ],
        copyBlock: `## ROLE ASSIGNMENTS
| WIDGET Genius | Best At                                | Who       |
|---------------|----------------------------------------|-----------|
| Wonderer      | Asking the right questions             | _________ |
| Inventor      | Generating ideas and solutions fast    | _________ |
| Discerner     | Killing bad ideas, pattern recognition | _________ |
| Galvanizer    | Rallying energy, making decisions      | _________ |
| Enabler       | Unblocking, anticipating needs         | _________ |
| Tenacious     | Finishing, polish, shipping quality    | _________ |

Note: People can hold multiple roles.
The point is knowing WHO LEADS each phase.`,
    },
    {
        id: "antipatterns",
        phase: "WATCH OUT",
        phaseColor: "border-red-500",
        accentBg: "bg-red-600",
        title: "Anti-Patterns",
        subtitle: "Kill these on sight.",
        icon: <AlertTriangle className="h-8 w-8" />,
        duration: "~10s",
        bullets: [
            "Still brainstorming Saturday morning → Discerner kills ideas, Galvanizer forces a pick",
            "\"The API doesn't work\" on Saturday → You skipped Link. Stop. Fix now.",
            "Everyone coding, nobody unblocking → Assign Enabler to blocker duty",
            "\"It's basically done\" but nothing deploys → Tenacious person owns deploy",
            "Scope creep (\"what if we also...\") → Re-read the App Brief. Not in there = not this weekend.",
        ],
        copyBlock: `## ANTI-PATTERN QUICK KILLS
| If You See This...              | Fix It By...                              |
|---------------------------------|-------------------------------------------|
| Still brainstorming Saturday AM | Discerner kills ideas, Galvanizer picks   |
| "API doesn't work" on Saturday  | STOP. Fix connection now. (Skipped Link.) |
| Everyone coding, nobody helping | Assign someone to unblocking duty         |
| "Basically done" but no deploy  | Tenacious person owns the deploy          |
| Scope creep mid-build           | Re-read App Brief. Not in = not now.      |
| Team tension on approach        | 15-min standup. Align. Continue.          |

## THE TWO RULES
1. Nothing enters Assemble until Link = ALL ✅
2. If you can't tweet the MVP, cut scope.`,
    },
];

/* ------------------------------------------------------------------ */
/*  Copy-to-clipboard button                                          */
/* ------------------------------------------------------------------ */

function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:bg-zinc-700 hover:text-white active:scale-95"
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{label ?? "Copy for paste"}</span>
                </>
            )}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Copy-all: aggregates every slide's copyBlock                       */
/* ------------------------------------------------------------------ */

function CopyAllButton() {
    const allText = SLIDES.map(
        (s) => `${"=".repeat(50)}\n${s.phase}: ${s.title}\n${"=".repeat(50)}\n\n${s.copyBlock}`
    ).join("\n\n");

    return <CopyButton text={allText} label="Copy entire playbook" />;
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                       */
/* ------------------------------------------------------------------ */

function ProgressDots({
    total,
    current,
    onSelect,
}: {
    total: number;
    current: number;
    onSelect: (i: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onSelect(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${i === current
                            ? "w-8 bg-white"
                            : "w-2 bg-zinc-600 hover:bg-zinc-500"
                        }`}
                />
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function PlaybookPage() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState<"left" | "right">("right");
    const [animating, setAnimating] = useState(false);
    const [showCopyBlock, setShowCopyBlock] = useState(false);

    const slide = SLIDES[current];

    const goTo = useCallback(
        (index: number) => {
            if (index === current || animating) return;
            setDirection(index > current ? "right" : "left");
            setAnimating(true);
            setShowCopyBlock(false);
            setTimeout(() => {
                setCurrent(index);
                setAnimating(false);
            }, 200);
        },
        [current, animating]
    );

    const next = useCallback(() => {
        if (current < SLIDES.length - 1) goTo(current + 1);
    }, [current, goTo]);

    const prev = useCallback(() => {
        if (current > 0) goTo(current - 1);
    }, [current, goTo]);

    // Keyboard nav
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                next();
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                prev();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [next, prev]);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50 overflow-hidden select-none">
            {/* Top nav */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    repOptics
                </Link>

                <div className="flex items-center gap-4">
                    <CopyAllButton />
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Clock className="h-3.5 w-3.5" />
                        90 sec presentation
                    </div>
                </div>
            </div>

            {/* Slide content */}
            <div className="w-full max-w-3xl pt-20 pb-24">
                <div
                    className={`transition-all duration-200 ${animating
                            ? direction === "right"
                                ? "opacity-0 translate-x-8"
                                : "opacity-0 -translate-x-8"
                            : "opacity-100 translate-x-0"
                        }`}
                >
                    {/* Phase pill + timing */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full ${slide.accentBg} px-3 py-1 text-xs font-bold uppercase tracking-widest text-white`}
                            >
                                {slide.icon}
                                {slide.phase}
                            </span>
                            <span className="text-xs text-zinc-500 font-mono">
                                Slide {current + 1}/{SLIDES.length}
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 font-mono">
                            <Zap className="h-3 w-3" />
                            {slide.duration}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        {slide.title}
                    </h1>
                    <p className="text-lg text-zinc-400 mb-8">{slide.subtitle}</p>

                    {/* Bullet points */}
                    <div className={`rounded-xl border ${slide.phaseColor} bg-zinc-900/60 backdrop-blur-sm p-6 mb-6`}>
                        <ul className="space-y-3">
                            {slide.bullets.map((bullet, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${slide.accentBg}`} />
                                    <span className="text-zinc-200">{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Copy block toggle */}
                    <div className="space-y-3">
                        <button
                            onClick={() => setShowCopyBlock(!showCopyBlock)}
                            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <Copy className="h-3.5 w-3.5" />
                            {showCopyBlock ? "Hide copyable content" : "Show copyable content"}
                        </button>

                        {showCopyBlock && (
                            <div className="relative rounded-lg border border-zinc-800 bg-zinc-900 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="absolute top-3 right-3">
                                    <CopyButton text={slide.copyBlock} label="Copy" />
                                </div>
                                <pre className="whitespace-pre-wrap text-xs text-zinc-400 font-mono leading-relaxed overflow-x-auto pr-24">
                                    {slide.copyBlock}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom controls */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/50">
                <button
                    onClick={prev}
                    disabled={current === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <ProgressDots
                    total={SLIDES.length}
                    current={current}
                    onSelect={goTo}
                />

                <button
                    onClick={next}
                    disabled={current === SLIDES.length - 1}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-all hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Next
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </main>
    );
}
