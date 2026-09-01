# Sportora - AI Studio Safety Rules

## IMPORTANT

This is a copy of a real-world deployed project.

Before making any changes:

1. Do NOT modify production directly.
2. Create a Git branch before making changes.
3. Never expose or recreate secrets.
4. Never commit `.env` files.
5. Never hardcode API keys, JWT secrets, database passwords, or credentials.
6. Do not change deployment configuration unless explicitly requested.
7. Do not delete existing functionality unless explicitly requested.
8. Preserve the existing architecture unless there is a strong reason to change it.
9. Run TypeScript/build/tests after making changes.
10. Show a summary of changed files before considering the work complete.

## Secrets

The uploaded project intentionally does NOT contain:

- `.env`
- API keys
- JWT secrets
- MongoDB credentials
- database passwords
- cloud credentials
- private keys
- deployment secrets

Environment variables must be referenced through `process.env` or the existing environment configuration.

## Git Safety

GitHub is the safe checkpoint.

Before implementing major changes:

```bash
git checkout -b ai/<feature-name>
git checkout -b ai/<feature-name>After changes:git status
git diff Do NOT push changes automatically.## Production Safety This project is deployed on a real server.
Do not stop production services or modify production data unless explicitly instructed. ## Development Principle First understand the existing codebase.
Then explain the implementation, make a plan, make minimal safe changes, build/test, and report changed files.
