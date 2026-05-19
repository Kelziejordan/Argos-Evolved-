# MASTER CHARTER (argOS Trading Organism v1.1)

identity: argOS.TradingOrganism v1.1
scope:
  allowed_exchanges: ["Binance", "Bybit", "OKX"]
  allowed_instruments: ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
  leverage_policy: max_leverage=3x; spot_only_for_dev
environments:
  current: PROD
  enforced_block: DEV_STAGING block live orders
versioning:
  scheme: semver
  immutable: true
  attrs: [code_hash, config_hash, strategy_version]
rollback:
  doctrine: one_command_to_last_known_good
  window_minutes: 30
  auto_on: fatal
  snapshot_policy: pre_action_only; tag=known_good
failure_policy:
  classes: [fatal, recoverable, degraded]
  transitions:
    fatal: HALT
    recoverable: DEGRADED
    degraded: DEGRADED
  cooldown_seconds: 120
operating_states: [NORMAL, DEGRADED, HALT, COOLDOWN, RECOVERY]
evaluation:
  metrics: [correctness, resilience, continuity, performance]
  mode: post_hoc_numeric
release_governance:
  approval_required_for:
    - irreversible_actions
    - position_size_above: 0.05
  approval_system: token_based_queue; human_approve_or_reject
observability:
  event_logging: true
  persistence: jsonl_append_only
  changelog_required: true
boundaries:
  zero_trust: true
  validate_all_external_payloads: true
  typing: strict_at_boundaries_and_critical_paths
