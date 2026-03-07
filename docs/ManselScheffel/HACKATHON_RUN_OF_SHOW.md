# 🏔️ ATLAS × WIDGET — Weekend Hackathon Run of Show

> **One page. One weekend. Ship it.**
> Combines [ATLAS](./build_app.md) (build execution) with [WIDGET](../WIDGET_Framework_Product_Development.docx.md) (product lifecycle) into a single operational template.

---

## 🟣 FRIDAY NIGHT — Plan & Validate (3 hrs)

### Hour 1: Ideate → Architect

| Do This | WIDGET | ATLAS | Owner (Genius) |
|---------|--------|-------|----------------|
| Brainstorm problem space — _"What's broken? What's missing?"_ | **Wonder** | — | Wonderer leads |
| Generate 3–5 solution concepts | **Invention** | — | Inventor leads |
| Kill weak ideas — _"Is this actually good? Can we demo it Sunday?"_ | **Discernment** | — | Discerner leads |
| Fill out the **App Brief** ↓ | — | **Architect** | Whole team |

```
┌─ APP BRIEF ──────────────────────────────────────────────┐
│ Problem:  ______________________________________________ │
│ User:     ______________________________________________ │
│ Success:  ______________________________________________ │
│ Constraints:                                             │
│   ⏱️ Time: ___hrs active dev                             │
│   💰 Budget: free tiers only? Y/N                        │
│   🧑‍💻 Team: ___ people                                   │
│   🎯 Demo: what does it look like at 4pm Sunday?         │
│      __________________________________________________ │
└──────────────────────────────────────────────────────────┘
```

> **Scope check:** Can you describe the MVP in one tweet (280 chars)? If not, cut features.

### Hour 2: Trace

| Do This | WIDGET | ATLAS | Owner |
|---------|--------|-------|-------|
| Sketch data schema (3–5 entities max) | **Discernment** | **Trace** | Tech lead |
| Map every integration (API, DB, auth) | — | **Trace** | Tech lead |
| Lock in stack decision | — | **Trace** | Whole team |
| Note top 3 edge cases | — | **Trace** | Discerner |

```
┌─ SCHEMA ─────────────────────────┐  ┌─ INTEGRATIONS ──────────────────────┐
│ Table/Collection:                │  │ Service    │ Purpose │ Key? │ Tested │
│ 1. _____________ (fields: ...)   │  │ __________ │ _______ │ ☐    │ ☐      │
│ 2. _____________ (fields: ...)   │  │ __________ │ _______ │ ☐    │ ☐      │
│ 3. _____________ (fields: ...)   │  │ __________ │ _______ │ ☐    │ ☐      │
│ 4. _____________ (fields: ...)   │  │ __________ │ _______ │ ☐    │ ☐      │
│                                  │  │ __________ │ _______ │ ☐    │ ☐      │
│ Relationships:                   │  └────────────┴─────────┴──────┴────────┘
│ ___ 1:N ___                      │
│ ___ 1:N ___                      │  Stack: _________________________________
└──────────────────────────────────┘  Edge cases: 1. ______ 2. ______ 3. ______
```

### Hour 3: Link

| Do This | WIDGET | ATLAS | Owner |
|---------|--------|-------|-------|
| Validate every connection | **Galvanizing** | **Link** | Everyone in parallel |
| Assign Saturday roles by genius | **Galvanizing** | — | Galvanizer leads |

```
┌─ LINK CHECKLIST — ALL MUST BE ✅ BEFORE SLEEP ──────────┐
│ [ ] Database connection tested (can read + write)        │
│ [ ] All API keys verified (made a real test call)        │
│ [ ] Auth flow working (even if basic)                    │
│ [ ] .env file populated with all secrets                 │
│ [ ] Dev server boots without errors                      │
│ [ ] Deployment target configured                         │
│ [ ] Repo initialized, everyone can push                  │
└──────────────────────────────────────────────────────────┘
```

> ⛔ **GATE: Nothing enters Saturday until every box above is checked.**

---

## 🟡 SATURDAY — Build (10–12 hrs)

### ATLAS: Assemble — Build in layers, in order

| Time Block | Layer | What's Happening | WIDGET Genius |
|------------|-------|------------------|---------------|
| **Morning** (3 hrs) | 🗄️ Database | Schema creation, seed data, test queries | Enablement |
| **Midday** (3 hrs) | ⚙️ Backend/API | Routes, business logic, data validation | Enablement |
| **Afternoon** (4 hrs) | 🖥️ Frontend UI | Components, interactions, display logic | Enablement |
| **Evening** (2 hrs) | 🔗 Integration | Connect frontend → backend, test full flow | Enablement |

```
┌─ SATURDAY MILESTONES ────────────────────────────────────┐
│ [ ] NOON:     DB running, API returns real data          │
│ [ ] 6PM:      Frontend renders data from API             │
│ [ ] MIDNIGHT: Core user flow works end-to-end            │
│               (ugly is fine — it works)                   │
└──────────────────────────────────────────────────────────┘
```

**Enablement role all day:** Whoever has the Enablement genius should be _unblocking_, not just coding. Anticipate needs, clear obstacles, coordinate handoffs between layers.

> 💡 Use a component library for UI (shadcn, Radix, etc.). Spend creativity on the product, not buttons.

---

## 🟢 SUNDAY — Polish & Ship (6–8 hrs)

### ATLAS: Stress-test — Demo-focused QA

| Time Block | Activity | WIDGET Genius |
|------------|----------|---------------|
| **Morning** (3 hrs) | Bug fixes + polish on core flow | **Tenacity** |
| **Early PM** (1 hr) | Deploy to production URL | **Tenacity** |
| **Mid PM** (1 hr) | Rehearse demo (2–3 runthroughs) | **Galvanizing** |
| **Late PM** | 🎤 **DEMO TIME** | Everyone |

```
┌─ DEMO PATH TEST — MUST PASS BEFORE DEPLOY ──────────────┐
│ [ ] New user can complete the core flow (happy path)     │
│ [ ] Error states show something useful (not white screen)│
│ [ ] Demo works on projector / screen share               │
│ [ ] Seed data loaded (demo isn't empty)                  │
│ [ ] 60-second pitch matches what the app actually does   │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Role Assignments (fill in names)

| WIDGET Genius | Best At | Who |
|---------------|---------|-----|
| **Wonderer** | Asking the right questions, seeing what's missing | __________ |
| **Inventor** | Generating ideas and solutions fast | __________ |
| **Discerner** | Killing bad ideas, pattern recognition, gut checks | __________ |
| **Galvanizer** | Rallying the team, making decisions, running demos | __________ |
| **Enabler** | Unblocking, helping, anticipating needs | __________ |
| **Tenacious** | Finishing, polish, refusing to ship broken things | __________ |

> People can hold multiple roles. The point is knowing _who leads_ each phase, not creating silos.

---

## 🚨 Anti-Patterns — Kill These on Sight

| If You See This... | It Means... | Fix It By... |
|---------------------|-------------|--------------|
| Still brainstorming Saturday morning | Stuck in Invention | Discerner kills ideas, Galvanizer forces a pick |
| "The API doesn't work" on Saturday | Skipped Link | Stop. Fix the connection now. Lost time is lost. |
| Everyone coding, nobody unblocking | Missing Enablement | Assign someone to blocker-removal duty |
| "It's basically done" but nothing deploys | Weak Tenacity | Tenacious person owns the deploy checklist |
| Scope creep ("what if we also...") | No Architect discipline | Re-read the App Brief. If it's not in there, it's not in the weekend. |
| Team tension on approach | Skipped Galvanizing | Stop. Align. 15-min standup. Then continue. |

---

## 📐 The Two Rules

```
 ┌────────────────────────────────────────────────────────┐
 │  1. Nothing enters Assemble until Link = ALL ✅        │
 │  2. If you can't tweet the MVP, cut scope.             │
 └────────────────────────────────────────────────────────┘
```

---

> _Related:_ [ATLAS Workflow](./build_app.md) · [WIDGET Framework](../WIDGET_Framework_Product_Development.docx.md) · [Setup Guide](./SETUP_GUIDE.md)
