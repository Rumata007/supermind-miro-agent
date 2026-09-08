# Miro Supermind Design Agent

> **⚠️ Research Disclaimer**
> This project was created for research and experimental purposes only. It is provided as-is, without any warranties or guarantees of any kind. Use at your own risk. The authors are not responsible for any consequences arising from the use of this software.

An AI-powered facilitation system that guides groups through **Supermind Design** (MIT Primer v2) on a Miro board. The AI acts as a facilitator of structured thinking — not a question-asker — helping groups explore problems deeply, generate diverse solutions, and synthesize them into an integrated outcome.

## How It Works

```
Miro Board (collaboration space)
     |
Claude Code (AI facilitator)
     ├── Miro MCP tools ── read board content, create documents & tables
     ├── miro-api.mjs ──── create/read stickies, update colors, position items
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
Each group selects 3–5 best ideas based on originality, feasibility, and alignment with the reformulated problem.

### Phase 4 — Clustering (Step 4)
All top ideas are collected into an Ideas Pool and grouped into 3–5 thematic clusters via affinity mapping.

### Phase 5 — Final Solution (Step 5)
Integrated solution synthesized using the **"1+1+1 > 3"** principle — clusters reinforce each other to produce something greater than the sum of parts.

### Step 5+ — Facilitator Requests
At any point, the facilitator can place a sticky note starting with `???` in the Final Solution frame to request additional content (table, diagram, or document).

### Step 6 — Deep Research
AI validates the final solution against real-world examples, academic research, and international case studies. Placed in the Evaluation frame.

## Workflow Summary

| Step | Actor | Action |
|------|-------|--------|
| **1. Problem Exploration** | AI | Reads case, places Phase 1 facilitation guide in each group frame |
| *— pause —* | Participants | Fill sticky notes under Zoom In / Zoom Out / Analogies / Reflection / Reformulation |
| **2. Solution Exploration** | AI | Reads & marks Phase 1 stickies green, synthesizes insights, places Phase 2 guide |
| *— pause —* | Participants | Fill sticky notes under Groupify / Cognify / Technify |
| **3. Selection** | AI | Reads & marks Phase 2 stickies green, selects 3–5 top ideas per group, places Top Ideas doc |
| **4. Clustering** | AI | Collects all top ideas into Ideas Pool, creates 3–5 cluster documents in Clusters frame |
| **5. Final Solution** | AI | Synthesizes integrated solution (1+1+1 > 3), places in Final Solution frame |
| **5+. Requests** | AI | Processes `???` stickies in Final Solution frame → doc / table / diagram |
| **6. Deep Research** | AI | Researches key claims, places evaluation document in Evaluation frame |

## Board Structure

Prepare the Miro board with the following frames before running the agent:

### Group Frames (3 required)
- **Group A**, **Group B**, **Group C**

Each group frame must contain text labels in this order (left to right):

| Section | Labels |
|---------|--------|
| Section 1 — Problem Exploration | `Zoom In` · `Zoom Out` · `Analogies` · `Reflection` · `Reformulation` |
| Section 2 — Solution Exploration | `Groupify` · `Cognify` · `Technify` |
| Section 3 — Selection | `Top Ideas` |

### Shared Frames
- **Information** — Case description (read by agent in Step 1)
- **Ideas Pool** — Consolidated ideas from all groups (Step 4)
- **Clusters** — Affinity map clusters (Step 4)
- **Final Solution** — Integrated solution (Step 5)
- **Evaluation** — Deep research results (Step 6)

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A Miro board structured as described above
- A [Miro REST API token](https://developers.miro.com/docs/getting-started)
- [Claude Code](https://claude.ai/claude-code) with Miro MCP server connected

### Installation

```bash
git clone https://github.com/Rumata007/supermind-miro-agent.git
cd supermind-miro-agent
npm install
```

### Configuration

Create a `.env` file:

```env
MIRO_API_TOKEN=your_miro_api_token
MIRO_BOARD_ID=your_board_id
MIRO_BOARD_URL=https://miro.com/app/board/your_board_id/
```

### Running a Session

Open a **new Claude Code chat** for each session. Then simply give commands:

```
run step 1   →  Problem Exploration guides placed on board
run step 2   →  Solution Exploration guides placed (after participants fill Phase 1)
run step 3   →  Top Ideas selected per group
run step 4   →  Clustering in Ideas Pool + Clusters frames
run step 5   →  Final Solution synthesized
run step 6   →  Deep Research in Evaluation frame
```

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

# Write content
node miro-api.mjs create-sticky <frame_id> "<content>" [--x N] [--y N] [--color COLOR]
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
| Create diagrams | MCP `diagram_create` |
| Read/create stickies | `miro-api.mjs` CLI |
| Deep research | `WebSearch` |

## Theoretical Foundation

Based on **MIT Supermind Design** (Malone, Bernstein et al.):

- **Thomas Malone (MIT)** — Superminds: how humans and computers think together in powerful ways
- **Supermind Design Primer v2** — structured methodology for collective problem-solving: Zoom In/Out, Analogize, Groupify, Cognify, Technify
- **Pierre Levy** — collective intelligence amplified through networked interaction
- **Elinor Ostrom** — commons governance and self-organizing communities

## License

MIT License — see [LICENSE](LICENSE) for details.
