# Testing Approach

## Decision: Standalone Node.js Test Scripts

**Why not Jest/Supertest?**
- This is a solo-developer boilerplate — heavyweight test frameworks add maintenance burden
- Inline scripts with `http` module test the real server (same as production), not a mocked instance
- Tests are self-contained, zero extra dependencies, run with `node <script>.js`

## Test Files

| File | Coverage |
|---|---|
| `_test_e2e.js` | Signup → login → refresh → logout → reuse detection |
| `_test_verify.js` | Signup → verify email → status check |
| `_test_reset.js` | Forgot password → reset → session wipe → login with new password |
| `_test_user.js` | Health check, protected routes (401/200), profile data, dashboard session count |
| `_test_full.js` | **Comprehensive suite** — all edge cases, lockout, rate limiting, validation |

## How to Run

```bash
# Start the server
npm run dev

# In another terminal, run any test
node _test_e2e.js
node _test_verify.js
node _test_reset.js
node _test_user.js
node _test_full.js
```

## Convention
- Each test prints `✅` or `❌` per check
- Tests exit with code 1 on first failure
- Test users are created with unique timestamps and cleaned up after
- All test files are prefixed with `_test_` and gitignored

