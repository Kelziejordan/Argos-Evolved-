# HYPERBOT v2.0 System Map

## The Organism Anatomy

### 🧠 BRAIN (`/server/brain`)
*   **Signal Generator**: Evaluates market telemetry to produce "Neural Signals".
*   **Risk Engine**: `/server/brain/risk/Engine.ts` - Validates signals and system health (Immune System).

### 🧬 GENETICS (`/server/genetics`)
*   **Config**: Centralized constants and security firewalls.

### 🫁 ORGANS (`/server/organs`)
*   **Kraken/Gemini**: External interface organs.

### ⚡ NERVOUS SYSTEM (`/server/nervous-system`)
*   **Hardened Event Bus**: Central routing via `/server/nervous-system/event-bus/Bus.ts`.
*   **Registry**: Canonical event typing in `/server/nervous-system/event-bus/Registry.ts`.
*   **Nervous Center**: Coordination layer between subsystems.

### 💾 MEMORY (`/server/memory`)
*   **Persistent Event Log**: JSONL append-only log in `/logs/organism_events.jsonl` (Lifecycle continuity).
*   **Snapshots**: State persistence in `/snapshots/organism_snapshots.jsonl` with `known_good` tagging.

### 🛡️ GOVERNANCE (`/server/governance`)
*   **Master Charter**: v1.1 Operational law.
*   **Engineering Protocol**: Strict architectural boundaries.
*   **Runtime Ruleset**: 10 hard-coded execution rules.

### 🚀 RUNTIME (`/server/runtime`)
*   **Organism Boot**: `/server/runtime/organism.ts` - Master lifecycle controller.
*   **Approval System**: `/server/nervous-system/ApprovalSystem.ts` - Token-based human-in-the-loop authorization.

---

## The Nervous Spinal Cord Flow (v1.1)
1. **Pulse** -> `PULSE_TICK`.
2. **NervousCenter** -> Fetches market data -> `MARKET_UPDATED`.
3. **Brain** -> Generates signals -> `SIGNAL_GENERATED`.
4. **RiskEngine** -> Validates stability -> `RISK_CHECK_PASSED` or `KILL_SWITCH_TRIGGERED`.
5. **ApprovalSystem** -> (If required) Token generated -> `APPROVAL_REQUIRED`.
6. **User** -> `APPROVE [token]`.
7. **NervousCenter** -> Executes -> `ORDER_EXECUTED`.
8. **Logger** -> Persists ALL events to `organism_events.jsonl`.
9. **Persistence** -> `MEMORY_SNAPSHOT(known_good=true)` after successful execution.

