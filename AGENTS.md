# Karimla repository instructions

## Scope and routing

These instructions apply to the repository. More specific `AGENTS.md` files take precedence inside their directory.

- Follow [`.agents/workflow.md`](.agents/workflow.md) for the local delivery workflow.
- For subsystem-specific work, read the matching `.agents/<area>/AGENTS.md` first when it exists.
- For architecture or feature work, read the relevant `.agents/<area>/architecture/` or `.agents/<area>/guides/` reference when it exists.
- `.agents/` contains agent instructions and references; its files are not automatically active unless this file or a more specific `AGENTS.md` directs you to read them.
- Preserve unrelated working-tree changes.
- Prefer the smallest change that fully solves the requested problem.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
