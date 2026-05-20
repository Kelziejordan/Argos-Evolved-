# Runtime Ruleset (v1.1)

1. if env != PROD: reject_live_order
2. validate(payload_schema) else reject
3. snapshot_state(tag=known_good) before irreversible_action
4. if position_size > threshold: require_human_approval_token
5. on fatal: transition(HALT) → start_cooldown(120s) → RECOVERY
6. on recoverable: transition(DEGRADED) → retry_with_backoff
7. emit(event) for every order/signal/state_change; persist to JSONL
8. enforce_version_attrs(code_hash, config_hash, strategy_version)
9. rollback_to(last_known_good) if auto_rollback_triggered
10. scorecard_compute_post_hoc(correctness, resilience, continuity, performance)
