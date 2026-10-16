# Delivery workflow

Default to local delivery. Create or select a GitHub issue and add it to organization Project #4 for every coherent change, even when implementation remains local. Group related commits under one issue instead of creating one issue per commit. Do not push branches, open pull requests, or merge through GitHub unless the user explicitly asks for remote delivery. Local commits are still not backed up until they are pushed.

## Local loop (default)

Run this loop for every change:

1. **Sync** — switch to local `development` and run `git pull --ff-only origin development`. Preserve unrelated working-tree changes; never reset, discard, or overwrite them. If Git requires a stash or manual conflict resolution, stop and report it.
2. **Issue** — create or select the GitHub issue for the coherent change, define its intent and acceptance criteria, and add it to organization Project #4. If related local commits already exist, backfill their commit links on the issue. Do not create one issue per commit.
3. **Branch** — create one intent-specific local branch from `development`. Do not work directly on `development`.
4. **Implement** — inspect the scoped instructions, make the smallest complete change, and run the narrowest relevant checks.
5. **Commit** — commit only the intended files on the feature branch. Never include unrelated working-tree changes.
6. **Local merge** — switch to `development`, fast-forward merge the feature branch, delete the local feature branch, and run `git pull --ff-only origin development` again. If local and remote `development` diverged, stop instead of pushing or silently rewriting history.
7. **Verify** — report the local merge commit, checks run, and final `git status`. Make clear that local-only commits are not backed up remotely.

Never push directly to `origin/development`. Keep secrets, `.env` files, credentials, build output, generated output, and local state out of commits. Do not create Plane work-items for this repository. Preserve unrelated working-tree changes throughout.

## Local service lifecycle

- Before starting or restarting a local service, inspect its port and stop duplicate processes first.
- Stop every local service started or restarted for the task before finishing. Confirm the ports are free with `lsof -nP -iTCP:<port> -sTCP:LISTEN`; if a root process owns several services, stop that root process and verify all child ports are released.
- Do not kill unrelated user processes. If a listener cannot be safely identified or stopped, report it instead of leaving the cleanup implicit.

## Remote loop (only when explicitly requested)

When the user explicitly requests GitHub delivery, use the retained-work loop:

1. **Issue** — create or select the GitHub issue, define the intent and acceptance criteria, and add it to organization Project #4.
2. **Branch** — sync `development`, then create one intent-specific branch from it.
3. **Implement** — inspect instructions, make the smallest complete change, and run relevant checks.
4. **Pull request** — push the feature branch and open a PR linked to the issue. Never push directly to `origin/development`.
5. **CI** — wait for required checks to pass; fix failures on the same branch. Do not merge red CI.
6. **Merge** — merge one approved PR into `development` with a merge commit, keeping every commit on the branch instead of squashing.
7. **Close** — close the linked issue after merge and verification.
8. **Clean up** — delete the remote and local feature branch.
9. **Sync** — fetch/prune and fast-forward local `development`; verify the final state.

If a required remote issue, review, CI check, or merge step is blocked, report it instead of treating the work as complete.

## Commit and merge messages

Use Conventional Commits (`type(scope): subject`) everywhere a message is recorded, including GitHub-generated ones:

- Local commits follow the convention.
- PR titles follow the convention too, as the human-facing summary of the commits being merged.
- When merging, pass an explicit conventional subject **and** body instead of accepting GitHub defaults. Never land a bare `Merge pull request #N from ...` subject, and never accept GitHub's auto-generated body, which is only a flat list of the included commit subjects:

```sh
gh pr merge <number> --merge \
  -t "feat(auth): sign in with a 6-digit email OTP code" \
  -b "Adds invite-only sign-in: BetterAuth issues a 6-digit code, resends are
cooled down for 60 seconds, and the session gate covers the protected routes.

Lands #24, #25."
```

- Never rewrite published history to repair a message; fix the process going forward.

### Write substance, not labels

Every message must summarize the change it records, and merge or promotion commits matter most because they stand in for everything they bring in.

- State what now works, what moved or was removed, and why, grouped by impact rather than walked commit by commit.
- A label-only subject such as `chore: promote development to main` does not meet this bar: it names the mechanism instead of the work. Promotion and release merges are held to the same standard as any other commit.
- Do not paste the included commit subjects as the body. Reference the issues and describe the outcomes they delivered.
