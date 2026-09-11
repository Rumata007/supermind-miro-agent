# Miro Supermind Design Agent

> **⚠️ Research Disclaimer**
> This project was created for research and experimental purposes only. It is provided as-is, without any warranties or guarantees of any kind. Use at your own risk. The authors are not responsible for any consequences arising from the use of this software.

An AI-powered facilitation system that guides groups through **Supermind Design** (MIT Primer v2) on a Miro board. The AI acts as a facilitator of structured thinking — not a question-asker — helping groups explore problems deeply, generate diverse solutions, and converge on either one integrated solution or a portfolio of testable hypotheses (Barnett gates).

> 🇺🇦 **Language note:** all board content the agent writes (facilitation guides, syntheses, documents) is currently hardcoded in Ukrainian in `CLAUDE.md` — that's the language the author runs workshops in. The command triggers themselves work in English (`run step 1`, `count votes`, …). If you need another working language, edit the templates in `CLAUDE.md` — they're plain text, not code.

## How It Works

```
Miro Board (collaboration space)
     |
Claude Code (AI facilitator)
     ├── Miro MCP tools ── read board content, create documents & tables
     ├── miro-api.mjs ──── create/read stickies, update colors, position items
     ├── Claude in Chrome ─ count dot votes on the live board (Route B)
     └── WebSearch ──────── deep research & validation
```

The facilitator triggers each step by telling Claude Code to run it (e.g., "run step 1"). Claude reads the board state, processes ideas, and places structured facilitation guides or synthesis documents back on the board.

## Methodology: Supermind Design (MIT)

The system follows the MIT Supermind Design framework — a structured process for collective intelligence that moves groups from problem exploration to integrated solution.

### Phase 1 — Problem Exploration (Step 1)
Five thinking moves per group:
- **Zoom In** — concrete details and current symptoms
- **Zoom Out** — systemic causes and external trends
- **Analogies** — parallels from other domains
- **Reflection** — hidden assumptions and blind spots
- **Reformulation** — reframing the problem

### Phase 2 — Solution Exploration (Step 2)
Three solution lenses per group:
- **Groupify** — collective and community-based solutions
- **Cognify** — knowledge, expertise and cognitive tools
- **Technify** — technology-enabled solutions

### Phase 3 — Selection (Step 3)
Each group selects 3–5 best ideas based on originality, feasibility, and alignment with the reformulated problem. If the session goes (or may go) down Route B, the agent adds 3–4 bolder, contested ideas per group in a separate block — the realism filter drops exactly the ideas Barnett gates need.

### Choosing a convergence route
After Step 3 the facilitator picks one of two routes:

| | Route A — one integrated solution | Route B — Barnett gates |
|---|---|---|
| Use when | The problem is understood and you need one action programme | The cause is unclear and hypotheses compete |
| What happens to consensus | It wins the vote | It goes to a "just do it" backlog |
| Outcome | Integrated solution ("1+1+1 > 3") | Portfolio of hypotheses with cheap tests and stop criteria |

### Route A

**Phase 4 — Clustering (Step 4).** All top ideas are collected into an Ideas Pool and grouped into 3–5 thematic clusters via affinity mapping.

**Step 4b — Voting (manual).** The facilitator runs a cluster vote in Miro Engage; the agent takes no part.

**Step 4c — Count Votes.** The agent reads the Engage result stickies, ranks the clusters and names the winner.

**Phase 5 — Final Solution (Step 5).** Integrated solution synthesized using the **"1+1+1 > 3"** principle — clusters reinforce each other to produce something greater than the sum of parts.

**Step 5+ — Facilitator Requests.** At any point, the facilitator can place a sticky note starting with `???` in the Final Solution frame to request additional content (table, diagram, or document).

### Route B — Barnett gates

Principle: an idea everyone supports at once already fits the existing picture of the world — there is no uncertainty in it, so there is no option to buy. Consensus isn't bad, it's already decided: it goes to the backlog. The portfolio is built from what the group **disagreed** on. A plain "vote for" (Step 4c) selects exactly the consensus ideas, so Route B votes with two colours instead.

**Step B1 — Prepare the gates.** The agent builds the Ideas Pool, merges near-duplicates across groups into 16–18 candidates and places each as a **separate, anonymous sticky** (no group label, shuffled order) in the "Ворота Барнетта" frame, plus a voting instruction. The facilitator then runs Miro dot voting with two colours: 🟢 *agree* and 🔴 *doubt*.

**Step B2 — Count and sort.** The agent counts the dots per candidate and colour and sorts the candidates:

| Share of 🔴 | Basket |
|---|---|
| < 25% | **Just do it** — consensus, straight to the backlog |
| 25–75% | **Portfolio** — contested, worth testing |
| > 75% | **Facilitator's call** — mostly doubt, but unpopular ideas can still be valuable |
| Bottom third by total dots | **Drop** — too little attention |

**Step B3 — Portfolio and milestone contract.** For each portfolio hypothesis the agent writes the critical assumption ("what must be true"), the cheapest test, the test cost (hours / days / weeks) and a priority (criticality × cheapness). The top 3–5 go into a milestone contract: what we test this week, owner, deadline, STOP criterion, status. Owners and deadlines are left for people to fill in.

### Step 6 — Deep Research
AI validates the result against real-world examples, academic research, and international case studies, and places the findings in the Evaluation frame. On Route A it checks the final solution; on Route B it checks the critical assumptions of the portfolio hypotheses.

## Workflow Summary

| Step | Actor | Action |
|------|-------|--------|
| **1. Problem Exploration** | AI | Reads case, places Phase 1 facilitation guide in each group frame |
| *— pause —* | Participants | Fill sticky notes under Zoom In / Zoom Out / Analogies / Reflection / Reformulation |
| **2. Solution Exploration** | AI | Reads & marks Phase 1 stickies green, synthesizes insights, places Phase 2 guide |
| *— pause —* | Participants | Fill sticky notes under Groupify / Cognify / Technify |
| **3. Selection** | AI | Reads & marks Phase 2 stickies green, selects 3–5 top ideas per group (+3–4 bolder ones for Route B), places Top Ideas doc |
| *— route choice —* | Facilitator | Route A (one solution) or Route B (Barnett gates) |
| **A · 4. Clustering** | AI | Collects all top ideas into Ideas Pool, creates 3–5 cluster documents in Clusters frame |
| **A · 4b. Voting** | Facilitator | Runs a cluster vote in Miro Engage |
| **A · 4c. Count Votes** | AI | Reads Engage results, ranks clusters |
| **A · 5. Final Solution** | AI | Synthesizes integrated solution (1+1+1 > 3), places in Final Solution frame |
| **A · 5+. Requests** | AI | Processes `???` stickies in Final Solution frame → doc / table / diagram |
| **B · B1. Prepare Gates** | AI | Builds Ideas Pool, places 16–18 anonymous candidate stickies in the "Ворота Барнетта" frame |
| *— pause —* | Participants | Dot voting: 🟢 agree / 🔴 doubt |
| **B · B2. Count Gates** | AI | Counts dots per colour, sorts into Just do it / Portfolio / Drop / Facilitator's call |
| **B · B3. Portfolio** | AI | Portfolio table and milestone contract in the "Портфель гіпотез" frame |
| **6. Deep Research** | AI | Researches key claims (Route A) or critical assumptions (Route B), places evaluation document in Evaluation frame |

## Board Structure

> 📋 **[Template board](https://miro.com/app/board/uXjVHps0_1M=/?share_link_id=456753110758)** — copy this into your own Miro account to get the structure below pre-built, instead of setting it up by hand.

Prepare the Miro board with the following frames before running the agent:

### Group Frames (3 by default — see [Known Limitations](#known-limitations))
- **Group A**, **Group B**, **Group C**

Each group frame must contain text labels in this order (left to right):

| Section | Labels |
|---------|--------|
| Section 1 — Problem Exploration | `Zoom In` · `Zoom Out` · `Analogies` · `Reflection` · `Reformulation` |
| Section 2 — Solution Exploration | `Cognify` · `Groupify` · `Technify` |
| Section 3 — Selection | `Top Ideas` |

The agent assigns each sticky to the nearest label by x-coordinate, so participants can put stickies anywhere in a label's column.

### Shared Frames
- **Information** — Case description (read by agent in Step 1)
- **Ideas Pool** — Consolidated ideas from all groups (Step 4 / B1)
- **Clusters** — Affinity map clusters (Route A, Step 4)
- **Final Solution** — Integrated solution (Route A, Step 5)
- **Ворота Барнетта** — Candidate stickies and sorting result (Route B, B1–B2)
- **Портфель гіпотез** — Hypothesis portfolio and milestone contract (Route B, B3)
- **Evaluation** — Deep research results (Step 6)

The two Route B frames are only needed if you run that route; the agent looks them up by these exact (Ukrainian) titles.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A Miro board structured as described below (or copy the [template board](https://miro.com/app/board/uXjVHps0_1M=/?share_link_id=456753110758))
- [Claude Code](https://claude.ai/claude-code)
- For Route B vote counting: the Claude in Chrome extension in the facilitator's Chrome, logged in to Miro (see [Known Limitations](#known-limitations))

### Connect the Miro MCP Server

Half of the agent's actions (documents, tables, diagrams, board reading) go through Miro's official MCP server, not the CLI script — this step is required.

```
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

(alternative: `claude mcp add --transport http miro https://mcp.miro.com`). Restart Claude Code, then run any Miro command — you'll be prompted to authenticate with your Miro account on first use.

### Get a Miro REST API Token

The CLI script (`miro-api.mjs`) needs its own token, separate from the MCP server's auth:

1. Go to [Miro Developer Platform](https://developers.miro.com/docs/getting-started) → create an app in your workspace
2. Install the app to your workspace to generate an access token
3. Make sure the app has **read and write** board scopes (`boards:read`, `boards:write`) — a read-only token will fail on every `create-sticky` / `resize-frame` / `update-sticky-color` call

### Installation

```bash
git clone https://github.com/Rumata007/supermind-miro-agent.git
cd supermind-miro-agent
npm install
```

### Configuration

Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

```env
MIRO_API_TOKEN=your_miro_api_token
MIRO_BOARD_ID=your_board_id
MIRO_BOARD_URL=https://miro.com/app/board/your_board_id/
```

### Running a Session

Open a **new Claude Code chat** for each session. Then simply give commands:

```
run step 1          →  Problem Exploration guides placed on board
run step 2          →  Solution Exploration guides placed (after participants fill Phase 1)
run step 3          →  Top Ideas selected per group

# Route A — one integrated solution
run step 4          →  Clustering in Ideas Pool + Clusters frames
                       (facilitator runs the cluster vote in Miro Engage)
count votes         →  Clusters ranked by votes
run step 5          →  Final Solution synthesized
run step 5+         →  `???` requests in Final Solution processed (repeat as needed)

# Route B — Barnett gates
run barnett gates   →  Anonymous candidate stickies placed in "Ворота Барнетта"
                       (facilitator runs dot voting: 🟢 agree / 🔴 doubt)
count gates         →  Dots counted, candidates sorted into baskets
run portfolio       →  Portfolio + milestone contract in "Портфель гіпотез"

run step 6          →  Deep Research in Evaluation frame
```

A reference frame with all commands can live on the board itself so participants see where the session is heading.

> ⚠️ Start a **new chat** for each training session. The agent is stateless by design — all state lives on the Miro board, not in conversation memory.

## CLI Reference

The `miro-api.mjs` script bridges Claude Code to the Miro REST API.

```bash
# Discover board structure
node miro-api.mjs list-frames
node miro-api.mjs list-items-in-frame <frame_id> [--type sticky_note|text]

# Read content
node miro-api.mjs get-sticky <item_id>
node miro-api.mjs find-text-in-frame <frame_id> "<text>"
node miro-api.mjs list-dot-votes [--since ISO_TIME]

# Write content
node miro-api.mjs create-sticky <frame_id> "<content>" [--x N] [--y N] [--width N] [--color COLOR]
node miro-api.mjs create-stickies-below-label <frame_id> "<label>" '<json_array>' [--color COLOR]
node miro-api.mjs get-position-below-label <frame_id> "<label>"
node miro-api.mjs get-frame-bottom <frame_id>

# Update items
node miro-api.mjs update-sticky-color <item_id> <color>
node miro-api.mjs update-stickies-color <frame_id> <color> '<json_array_of_ids>'
node miro-api.mjs resize-frame <frame_id> --width N --height N [--x N --y N]
node miro-api.mjs delete-item <item_id>

# Positioning
node miro-api.mjs get-position-beside-item <item_id> --side right
```

### Sticky Colors Convention

| Color | Meaning |
|-------|---------|
| Any non-green | Participant idea (unprocessed) |
| `green` | Processed by agent (skip on next read) |

## Architecture

**Claude Code as orchestrator** — no separate workflow engine. All business logic lives in `CLAUDE.md`.

| Need | Tool |
|------|------|
| Read board overview | MCP `context_explore` |
| Read frame content | MCP `context_get` |
| Create documents | MCP `doc_create` |
| Create tables | MCP `table_create` + `table_sync_rows` |
| Create diagrams | MCP `diagram_create_mermaid` |
| Read/create stickies | `miro-api.mjs` CLI |
| List dot votes (id, author, time) | `miro-api.mjs list-dot-votes` |
| Map dots to stickies and read colours | Claude in Chrome: Miro Web SDK on the board page (`parentId`) + screenshots |
| Deep research | `WebSearch` |

## Known Limitations

- **One board per `.env`.** `MIRO_BOARD_ID` is read once from `.env` at startup — there's no `--board` flag to override it per command. Running two sessions against two different boards from the same clone means the second one silently overwrites the first's config. Workaround: use a separate clone (and `.env`) per board, or per parallel session. Feel free to extend `miro-api.mjs` with a `--board` override if you need true multi-board support.
- **Ukrainian-only content**, see the language note above.
- **Dot votes are only half-visible to the REST API.** Miro returns dot-voting dots as unsupported items: id, author and time, but not the sticky they sit on or their colour. Route B counting therefore goes through the facilitator's Chrome (Claude in Chrome): the Web SDK on the board page gives each dot's `parentId`, and colours are read from screenshots and cross-checked against the SDK count.
  - The Chrome tab with the board must be **visible on screen** — in a background tab Miro loads and animates very slowly and screenshots time out.
  - Vote on **separate stickies**, not on lines of a document: a dot next to a document line can only be attributed by coordinates and screenshots, which is slow.
  - Participants sometimes resize dots or draw circle shapes instead of voting — the agent counts those too, but check the total.
  - Guests vote anonymously, so the agent can't tell which group a voter belongs to.
- **Stickies that carry dot votes can't be deleted via the REST API** (it returns 500). Remove them by hand in Miro.
- **3 group frames (`Group A`/`B`/`C`) is the default the agent expects**, not a hard limit — it's what `CLAUDE.md` looks for out of the box. If your workshop has a different number or naming of groups, just tell the agent at the start of the session (or note it in the "Information" frame) and it will adapt; you don't need to edit `CLAUDE.md` for a one-off session.

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `list-frames` returns `[]` | Wrong `MIRO_BOARD_ID`, or the token's app isn't installed on the board's workspace |
| `API error 403` on write commands (`create-sticky`, `resize-frame`, …) | Token missing `boards:write` scope — see [Get a Miro REST API Token](#get-a-miro-rest-api-token) |
| `API error 401` | Token expired or revoked — regenerate it in the Miro Developer Platform |
| Requests hang then retry with "Rate limited. Waiting Ns..." | Expected — the script retries once automatically after the `Retry-After` delay |
| Claude can't find a frame/label | Check exact frame/label spelling against [Board Structure](#board-structure) — the agent doesn't guess, it reports back instead |

## Theoretical Foundation

Based on **MIT Supermind Design** (Malone, Bernstein et al.):

- **Thomas Malone (MIT)** — Superminds: how humans and computers think together in powerful ways
- **Supermind Design Primer v2** — structured methodology for collective problem-solving: Zoom In/Out, Analogize, Groupify, Cognify, Technify
- **Pierre Levy** — collective intelligence amplified through networked interaction
- **Elinor Ostrom** — commons governance and self-organizing communities

Route B (Barnett gates) adds:

- **William P. Barnett (Stanford GSB)** — ideas everyone agrees with are already part of the existing worldview; the option value lies in the contested ones
- **Rita McGrath & Ian MacMillan — Discovery-Driven Planning** (HBR, 1995) — a plan is a set of assumptions; funding is staged and tied to checkpoints, which is what the milestone contract encodes

## License

MIT License — see [LICENSE](LICENSE) for details.
