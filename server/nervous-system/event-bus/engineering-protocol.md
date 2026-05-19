# Engineering Protocol v1.1

## Core Principles
- **Deterministic State Machine**: Explicit transitions: NORMAL → DEGRADED → HALT → COOLDOWN → RECOVERY.
- **Event-Spinal-Cord**: All actions route through event bus (market_data_received → signal_generated → risk_check → approval_required → order_executed → snapshot_saved → metrics_updated).
- **Strict Module Boundaries**: Data, signal, risk, execution, logging — no cross-coupling.
- **Zero-Trust Validation**: All external payloads validated against schema before use.
- **Persistent Memory**: Append-only JSONL event stream + pre-action known_good snapshots.
- **Typing**: Strict at boundaries and critical paths; dynamic allowed elsewhere for velocity.
- **Graceful Degradation**: On recoverable/degraded failure, continue in DEGRADED with reduced capability.
- **Timeouts and Backoff**: All external calls have timeouts; retry with exponential backoff on recoverable failures.
- **Cooldown Enforcement**: Timed COOLDOWN state with expiry → auto-transition to RECOVERY.
