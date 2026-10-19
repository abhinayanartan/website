# Architecture Index

This index is the navigation guide for the analyzed repository. This index is not the full contract. Do not implement from this file alone; follow the artifact paths below.

## Implementation Guide

### Global artifacts

- `unit_graph.yaml`
  - who reads: all implementation workers
  - use for: the root page unit, source anchors, public signature, and entrypoint boundary
  - how to consume: find `home-page`; source anchors prove the page exists but are not rewrite scope
- `wire_contracts.yaml`
  - who reads: workers touching the root route or outbound links
  - use for: root document shape and contact/social/map destinations
  - how to consume: filter rows where `unit: home-page`; preserve frozen root route and must-preserve outbound destinations
- `shared_modules.yaml`
  - who reads: all workers
  - use for: cross-unit shared code registry
  - how to consume: empty for this one-unit analysis; component-local reuse remains within `home-page`
- `cross_unit_state.yaml`
  - who reads: workers changing state flow
  - use for: implicit state passed between externally triggerable units
  - how to consume: no cross-unit flows were identified; use `units/home-page/behavior.yaml` for local state and body-scroll effects

### Unit: `home-page`

- external trigger: `GET /`, the Next.js App Router root page
- must read:
  - `units/home-page/behavior.yaml` — preserve validation, interactive branches, outbound follow-up actions, modal behavior, and event-loop semantics
  - `units/home-page/bindings.yaml` — preserve root route composition, client boundaries, section ids, metadata, and environment configuration
  - `units/home-page/unit_decomposition.yaml` — advisory split candidates only; `commit: false` means no split is decided
- relevant global rows:
  - `wire_contracts.yaml` rows where `unit: home-page`
  - `shared_modules.yaml` rows where `used_by_units` includes `home-page` (none)
  - `cross_unit_state.yaml` flows where writer or reader is `home-page` (none)
- before DONE report: artifacts read, implemented `must_preserve` and `must_appear_in_target` items, unresolved or deferred contracts, and build/runtime evidence

## Analysis boundary

The repository is a single frontend page. No database entities, ORM mappings, scheduled jobs, message handlers, or backend service units were found. Deployment topology, testing coverage, and target-stack choices are intentionally outside this architecture analysis.
