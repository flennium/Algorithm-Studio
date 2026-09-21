# Contributing

Thanks for helping make Algorithm Studio more useful to students.

## Before writing code

Open an issue for a new language feature or a change to existing syntax. Include
the course material or a small program that demonstrates the expected behavior.
Pseudocode dialects differ, so examples matter more than assumptions.

Bug fixes and small interface improvements can go directly to a pull request.

## Local checks

Install dependencies with `npm ci`, then run:

```bash
npm run typecheck
npm test
npm run build
```

Interpreter changes need tests in `src/language/index.test.ts`. A new keyword or
construct also needs an update to `docs/LANGUAGE.md` and the in-app guide when it
changes what students can write.

## Pull requests

Keep a pull request focused on one problem. Explain what changed, why it changed,
and how you verified it. Screenshots are useful for visible interface changes.

Please do not mix broad formatting or dependency updates into an unrelated fix.
