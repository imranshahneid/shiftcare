# ShiftCare — Mobile Appointment Booking

A React Native (Expo) app for browsing doctors, viewing 30-minute appointment slots, and booking/cancelling appointments. Bookings persist to device storage and survive app restarts.

## Stack

| Concern        | Choice                                                  |
| -------------- | ------------------------------------------------------- |
| Framework      | Expo SDK 54 (managed) + React Native 0.81 + TypeScript  |
| Navigation     | `@react-navigation/native` + native-stack               |
| Server state   | TanStack React Query                                    |
| Client state   | Zustand with `persist` middleware (over AsyncStorage)   |
| Date / time    | `date-fns` + `date-fns-tz`                              |
| Testing        | Jest (`jest-expo` preset) + React Native Testing Library |
| Lint / format  | ESLint (`eslint-config-expo`) + Prettier                |

## Setup & usage

### Prerequisites

- Node 20.x (CI is pinned to 20.x; 18+ should work locally)
- npm 10+
- Expo Go on a physical device, or an iOS/Android simulator

### Install & run

```bash
npm install
npx expo start
```

Then scan the QR code in Expo Go (iOS or Android) or press `i` / `a` to launch a simulator.

### Scripts

| Script                  | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `npm start`             | Start the Expo dev server                            |
| `npm run ios`           | Start and open in iOS simulator                      |
| `npm run android`       | Start and open in Android emulator                   |
| `npm test`              | Run Jest test suite                                  |
| `npm run test:coverage` | Run tests with coverage report                       |
| `npm run typecheck`     | TypeScript strict-mode typecheck                     |
| `npm run lint`          | ESLint                                               |
| `npm run format`        | Format the codebase with Prettier                    |

## Project layout

```
src/
├── api/                  React Query client + doctors fetcher
├── components/           Reusable UI primitives (DoctorCard, SlotChip, EmptyState…)
├── domain/               Pure business logic — no React, no AsyncStorage
│   ├── doctors.ts        Flat API rows → grouped Doctor[]
│   ├── slots.ts          Doctor + windows → 30-minute Slot[] (timezone-aware)
│   ├── time.ts           "9:00AM" parsing, format helpers
│   ├── id.ts             UUID v4 helper (uses `react-native-get-random-values`)
│   └── types.ts          Domain types + the `bookingKey` helper
├── navigation/           RootNavigator + typed param list
├── screens/              The four required screens
├── store/                Zustand bookings store with `persist`
├── test-utils/           Render-with-providers helper for component tests
└── theme.ts              Single source of truth for colours, spacing, radii, fonts
```

## Architecture decisions

### Pure domain layer

`src/domain` is the heart of the app and has zero dependencies on React, AsyncStorage, or React Native. Everything in there is deterministic and trivially unit-testable. Screens become thin views over deterministic data, which keeps test surface area small and obvious bugs out of UI code.

### Zustand + React Query (instead of Redux Toolkit)

The brief calls Redux Toolkit a bonus point, and we knowingly traded that off for a smaller, more modern stack:

- **React Query** owns the server state (the doctors fetch). Caching, retries, loading states, refetch, and stale-while-revalidate come for free.
- **Zustand with `persist`** owns the client state (bookings). The `persist` middleware wraps AsyncStorage natively, so there is no manual hydration code in screens — `App.tsx` shows a loading splash until `hasHydrated` flips true.

If we needed RTK specifically, the swap would be: replace `useDoctorsQuery` with `createApi`, and replace the Zustand store with a `bookingsSlice` plus `redux-persist`. The screens would barely change.

### Slot generation

`generateSlotsForDoctor(doctor)` is a pure function that, given a doctor and (optionally) a `now`, returns up to 7 days of 30-minute slots in ascending order. Algorithm:

1. Compute "today" as a YYYY-MM-DD in the doctor's timezone.
2. For each of the next 7 days, derive the day-of-week using UTC arithmetic on the ISO date string (avoiding device-timezone leakage into the calculation).
3. For each matching window, walk in 30-minute increments. If the window length isn't a multiple of 30, the trailing partial slot is dropped (e.g. a 9:00–9:45 window yields one slot, 9:00–9:30).
4. Each slot's wall-clock start/end is run through `fromZonedTime(<wallClock>, doctor.timezone)` to produce absolute UTC ISO instants. This is the canonical form stored in bookings.

### Booking uniqueness

Bookings are keyed by `${doctorId}|${startISO}`. The same doctor at the same instant can only be booked once. The store's `addBooking` is idempotent — re-adding returns `null` instead of duplicating, and the confirmation screen surfaces the "Already booked" state when the slot is already taken (e.g. if a parallel device booked it, or the user navigated back from MyBookings).

### Persistence and hydration

`useBookingsStore` uses `zustand/middleware/persist` with `createJSONStorage(() => AsyncStorage)`. On app start, `App.tsx` reads `hasHydrated` from the store and renders a loading splash until it flips true. This avoids a flash of empty bookings on cold start.

## Time-zone assumptions

These are the assumptions the app makes — worth flagging for review:

1. **API times are wall-clock in the doctor's timezone.** A row with `Australia/Sydney`, `Monday`, `9:00AM` means 9 AM as the doctor sees it on their wall clock, not 9 AM in any other reference frame.
2. **Slots are displayed in the doctor's timezone**, with a banner ("Times shown in the doctor's timezone: Australia/Sydney"). Showing both doctor-local and device-local times was considered but rejected as cluttering the chip layout. A future enhancement would be a toggle.
3. **"This week" means the next 7 days from `now`** in the doctor's timezone. Not Mon–Sun. This is a deliberate choice to avoid the awkward case where a Sunday-evening user sees an "empty week" if a doctor only works on Mondays.
4. **Bookings store absolute UTC instants.** The doctor's timezone is captured at book time so the My Bookings screen renders consistently even if the user crosses timezones.
5. **DST transitions** are handled by `date-fns-tz`'s `fromZonedTime`. If a slot would fall in a spring-forward gap, the library disambiguates by picking the next valid local time. We have not specifically tested a slot generated during the Sydney spring-forward window — a candidate for follow-up testing.
6. **One doctor → one timezone.** If the API ever sent two rows for the same doctor name with different timezones, we currently keep the first timezone seen and discard later conflicting rows. Documented in `groupDoctors`.

## Data quirks handled

The reference API has a few quirks that the domain layer handles defensively:

- **Leading whitespace** on time strings (`" 9:00AM"`) — `parseTimeString` trims and normalises before parsing.
- **Multiple windows on the same day** (e.g. Dr. Geovany Keebler has both 7:00 AM–2:00 PM and 3:00 PM–5:00 PM on Thursday) — `groupDoctors` keeps each window distinct, and `generateSlotsForDoctor` walks both.
- **No stable doctor IDs** — derived from `slugifyDoctorId(name)`. If two distinct doctors ever shared a name, the current implementation would merge them. In a real app, the backend should provide IDs.
- **Malformed rows** (missing fields, bad day name, end ≤ start) — silently skipped, never crash the list.

## Testing

```
Test Suites: 10 passed, 10 total
Tests:       71 passed, 71 total
```

Coverage is concentrated where it matters:

- `src/domain/**` — full unit coverage of `parseTimeString`, `groupDoctors`, `generateSlotsForDoctor`, including DST-relevant timezone assertions, edge cases (zero-length windows, sub-30-minute windows, multi-window days), and negative cases (malformed payloads, conflicting timezones).
- `src/store/bookingsStore.ts` — full coverage of add/cancel/idempotency/selectors.
- `src/components/**` — render + interaction tests for `DoctorCard`, `SlotChip`.
- `src/screens/**` — RNTL tests for all four screens covering loading, error, success, empty, and the booking happy/sad paths.

Negative & edge cases explicitly tested:

- Network 500, network error, empty doctors response.
- 12 AM / 12 PM and case-insensitive AM/PM parsing.
- Windows shorter than 30 minutes yield zero slots.
- Same-day multi-window slot generation (Geovany Keebler scenario).
- Double-booking is rejected (button disabled, store stays at 1).
- Cancelling an unknown booking ID is a no-op.

## CI

`.github/workflows/ci.yml` runs on every PR and push to `main`:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test:coverage`
5. Coverage report uploaded as a build artifact.

We chose **not** to add full release-build pipelines (signed APK/IPA) — the reviewer experience is `npx expo start` + Expo Go, and Apple/Android signing complexity would have outweighed any benefit for a take-home submission.

## Known limitations

- **Single-device only.** No backend; bookings live in AsyncStorage on the device. Two devices booking the same doctor concurrently won't see each other.
- **No authentication.** Per the brief, the experience is non-authenticated.
- **Slots regenerate from `new Date()` each render of the availability screen.** If a screen is left open across midnight in the doctor's timezone, the slot list won't refresh until navigated away and back. A pull-to-refresh on availability would address this if needed.
- **No reminder notifications, no calendar sync, no rescheduling** — out of scope for this slice.
- **Dr. Geovany Keebler's two Thursday windows** are presented as a single Thursday section in the UI rather than visually separated. If we wanted clearer "lunch break" semantics, the section header could split or label the windows.
- **Web target (`expo start --web`)** is wired but untested. The `react-native-get-random-values` polyfill is not strictly needed on web (since `crypto.randomUUID` exists), but is harmless.

## If I had more time

**Architecture**

- Move the domain layer into a workspace package, so it can be unit-tested in pure Node (no `jest-expo` overhead) and reused if a web client is built.
- Wrap React Query and AsyncStorage behind a thin "data access" interface so the screens depend on intent (e.g. `useAvailableDoctors()`, `useBookings()`) rather than the specific libraries.
- Split `bookingsStore` into a thin slice and a typed selector module — `useShallow` becomes more obvious then.
- A test factory (`makeDoctor`, `makeSlot`, `makeBooking`) so component tests don't repeat fixture data.

**Features**

- **Calendar-style day picker** (bonus point in the brief) — a horizontally scrollable strip of the next 14 days with availability counts per day. The doctor's existing `windows` makes this trivial.
- **Offline-first booking queue** (bonus) — when the booking action fires while offline, queue the intent in AsyncStorage and replay it when connectivity returns. With Zustand + a tiny middleware this is a couple of hundred lines.
- **Local notifications** for a booking 30 minutes before it starts (Expo Notifications).
- **Doctor detail polish** — search/filter on the list, alphabetical pinning, specialty filter (when the API ships specialties).
- **Accessibility audit** with VoiceOver + TalkBack — the components have `accessibilityRole`/`accessibilityLabel` set, but a real audit (focus order, dynamic-type scaling) would be the next pass.
- **A real CI matrix** — Node 18 + 20, and an EAS preview-build job behind a manual workflow_dispatch trigger so reviewers can scan a build instead of running locally.

## Reviewer flow

End-to-end manual run after `npm install`:

1. `npx expo start`, open in Expo Go.
2. Doctors list loads (≥ 5 doctors visible).
3. Tap **Dr. Geovany Keebler** — confirms multi-window day rendering (Thursday morning + afternoon, no overlap).
4. Tap a 30-minute slot, confirm on the modal — should redirect to **My Bookings**.
5. Return to the doctor's availability — the slot should now be marked **Booked** and disabled.
6. Kill the app and reopen — the booking persists across the relaunch.
7. From My Bookings, cancel the booking — the slot returns to available.
8. Toggle airplane mode and pull to refresh on the doctors list — error state with a retry button appears.
