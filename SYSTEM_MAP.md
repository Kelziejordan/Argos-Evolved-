# HYPERBOT v2.0 System Map

## The Organism Anatomy

### 🧠 BRAIN (`/server/brain`)
*   **Signal Generator**: Evaluates market telemetry to produce autonomous "Neural Signals".
*   **Reasoning Engine**: (Future) Will handle Gemini-powered trade justification.

### 🧬 GENETICS (`/server/genetics`)
*   **Config**: Centralized constants (Pulse intervals, symbols, probabilities).
*   **Aggression Matrix**: Defines the "risk-dna" of the bot (how aggressive it trades).

### 🫁 ORGANS (`/server/organs`)
*   **Kraken**: Sensory organ for real-time exchange data.
*   **Gemini**: The cognitive organ for natural language interaction.
*   **Firebase**: The persistence organ (Memory storage).

### ⚡ NERVOUS SYSTEM (`/server/nervous-system`)
*   **Pulse Engine**: The "heartbeat" that triggers every 5 seconds to sync data and drift simulations.
*   **Event Bus**: Routes signals from the Brain to the Interface.

### 💾 MEMORY (`/server/anatomy` & `/server/memory`)
*   **State Machine**: One source of truth for the market and system status.
*   **Persistence**: (In Progress) Handles snapshotting state to Cloud storage.

### 🖥️ INTERFACE (`/src/components`)
*   **Command Hall**: The primary "Operator" interface.
*   **Telemetry**: Real-time visualization of the organism's internal metrics.

---

## Data Flow
1. **Pulse** triggers -> **Organs** fetch data -> **Brain** evaluates -> **State** updates.
2. **User Command** -> **Gateway (Gemini)** interprets -> **Nervous System** triggers action -> **Brain** executes trade.
3. **State Sync** -> **NervousCore (Context)** broadcasts to **UI Modules**.
