## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools directly.

Available gstack skills:

- `/office-hours` — YC-style forcing questions for ideas; design brainstorming for projects
- `/plan-ceo-review` — CEO-perspective plan review
- `/plan-eng-review` — Engineering-perspective plan review
- `/plan-design-review` — Design-perspective plan review
- `/design-consultation` — Design consultation
- `/design-shotgun` — Rapid design exploration
- `/design-html` — Generate HTML designs
- `/review` — Code/plan review
- `/ship` — Ship a change
- `/land-and-deploy` — Land and deploy
- `/canary` — Canary deploy
- `/benchmark` — Benchmark
- `/browse` — Web browsing (use this for ALL web browsing)
- `/connect-chrome` — Connect to Chrome browser
- `/qa` — QA a feature
- `/qa-only` — QA only (no implementation)
- `/design-review` — Design review
- `/setup-browser-cookies` — Set up browser cookies
- `/setup-deploy` — Set up deployment
- `/setup-gbrain` — Set up GBrain integration
- `/retro` — Retrospective
- `/investigate` — Investigate a problem
- `/document-release` — Document a release
- `/document-generate` — Generate documentation
- `/codex` — Codex skill
- `/cso` — CSO skill
- `/autoplan` — Auto-generate a plan
- `/plan-devex-review` — DevEx-perspective plan review
- `/devex-review` — DevEx review
- `/careful` — Careful mode for risky operations
- `/freeze` — Freeze a branch/deploy
- `/guard` — Guard mode
- `/unfreeze` — Unfreeze a branch/deploy
- `/gstack-upgrade` — Upgrade gstack
- `/learn` — Learn skill

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
