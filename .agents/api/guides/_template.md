# <Feature> guide

<!-- Copy this file when creating a stable feature guide. Remove this comment and replace the placeholders. This is a documentation pattern, not a runtime instruction. -->

## Purpose and scope

Describe what this guide governs and what it intentionally does not govern.

## Status

- **Implemented:** Routes, use cases, or rules that exist today.
- **Present but not exposed:** Supporting code or schema that exists but is not part of a public workflow.
- **Planned:** Future behavior that is not an API contract yet.

Treat this section as the current repository state. Do not describe planned behavior as implemented.

## Source of truth

State which server-side records, policies, or calculations are authoritative. Explain what clients may display and what they must not calculate or submit.

## Business rules and invariants

Document vocabulary, valid values, ownership rules, constraints, idempotency, and facts that must remain true.

## Current implemented flows

Document each implemented route or application operation, including input, authorization, side effects, response, and rejection cases. Keep this factual.

## Domain lifecycle

Describe states, transitions, timestamps, and terminal behavior. Mark modeled-but-unimplemented transitions as planned.

## Architecture and ownership by layer

Show the feature's route → handler → service/use case → repository boundary. State which layer owns transport parsing, business decisions, persistence, and mapping.

### Relevant current files

List only concrete files an agent should inspect before changing the feature. Do not include planned files.

```text
apps/api/
├── internal/delivery/http/v1/<feature>/
├── internal/handler/v1/<feature>/
├── internal/domain/<feature>/
├── ent/schema/
└── test/
```

## API/client contract

Document public paths, request/response shape, authentication, status codes, and client responsibilities. Clearly label proposed paths as candidates until implemented.

## Future work and dependencies

List planned vertical slices, prerequisites, unresolved product decisions, and recommended order.

## Testing requirements

Map each rule and boundary to its test location. Include happy paths, authorization failures, invalid input, conflicts, unavailable dependencies, and rollback/retry behavior where applicable.

## Change checklist

- Does the change preserve the source of truth?
- Is the operation named after its resource and intent?
- Does each layer keep its documented responsibility?
- Are Ent changes accompanied by the correct Atlas migration when the schema changes?
- Are public contracts and error behavior documented?
- Are tests placed under the owning layer?
- Is this guide's status current?
