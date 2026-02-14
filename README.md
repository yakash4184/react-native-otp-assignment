# React Native OTP Assignment (TypeScript)

This is a fresh React Native project for your assignment, created in a new folder with clean architecture.

## Folder Path

`/Users/akashyadav/Documents/Java_Project/Attendence_Management_System_OOPS/react_native_assignment`

## Tech Stack

- React Native (Expo)
- TypeScript
- Functional components only
- Hooks: `useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`
- External SDK: `@react-native-async-storage/async-storage`

## Functional Requirements Coverage

- Email + OTP login
- Locally generated 6-digit OTP
- OTP expiry: 60 seconds
- Max OTP attempts: 3
- Resend OTP invalidates previous OTP and resets attempts
- OTP stored per email (`Map<string, OtpEntry>`)
- Session screen with:
  - session start time
  - live duration (`mm:ss`)
  - logout
- Timer behavior:
  - does not reset on re-render
  - stops on logout
  - cleans up on unmount

## SDK Integration (Mandatory)

Chosen SDK: **AsyncStorage**

Used for:
- auth analytics event logging
- session persistence (bonus)

Logged events:
- `OTP_GENERATED`
- `OTP_VALIDATION_SUCCESS`
- `OTP_VALIDATION_FAILURE`
- `LOGOUT`
- `APP_TO_BACKGROUND`
- `APP_TO_FOREGROUND`

## Architecture

```text
src/
  screens/
    LoginScreen.tsx
    OtpScreen.tsx
    SessionScreen.tsx
  hooks/
    useOtpCountdown.ts
    useSessionTimer.ts
  services/
    analytics.ts
    otpManager.ts
    sessionStorage.ts
  types/
    auth.ts
App.tsx
```

- UI is isolated in `screens/`
- OTP business logic in `services/otpManager.ts`
- Side effects and timing in hooks/services
- No logic buried inside JSX render blocks

## OTP Logic and Expiry Handling

- `sendOtp(store, email)`:
  - creates new 6-digit OTP
  - sets `expiresAt = now + 60s`
  - resets attempts to 0
- `validateOtp(store, email, otp)`:
  - validates existence
  - checks expiry
  - enforces max attempts
  - validates code
- Resend calls `sendOtp` again for same email, replacing old entry.

## Data Structures Used

- `Map<string, OtpEntry>` for per-email OTP state
- `AuthEvent[]` array in AsyncStorage for logs
- `SessionInfo` object in AsyncStorage for active session

## Setup Steps

1. Open terminal in project folder:

```bash
cd /Users/akashyadav/Documents/Java_Project/Attendence_Management_System_OOPS/react_native_assignment
```

2. Install dependencies:

```bash
npm install
```

3. Run app:

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- or scan QR in Expo Go

## GitHub + VS Code Connection

- Git remote is connected to:
  - `https://github.com/yakash4184/react-native-otp-assignment.git`
- In VS Code:
  - Open Command Palette (`Cmd + Shift + P`)
  - Run `GitHub: Sign in`
  - Authorize browser login with your `yakash4184` account
  - Use Source Control tab to commit/push changes

## CI/CD Setup

GitHub Actions workflow is added at:

- `.github/workflows/ci-cd.yml`

It runs:
- CI on PR and push to `main`: install, typecheck, web build
- CD on push to `main`: deploy to Railway

Add these GitHub repository secrets (`Settings -> Secrets and variables -> Actions`):

- `RAILWAY_TOKEN`

After this secret is set, every push to `main` auto-deploys to Railway.

## What GPT helped with vs what was implemented

- GPT helped with project scaffolding and structuring files quickly.
- Core assignment logic implemented intentionally: OTP rules, timer lifecycle, state transitions, and AsyncStorage analytics/session flow.

## Notes

- If `npm install` times out, retry after setting npm registry:
  - `npm config set registry https://registry.npmjs.org/`
