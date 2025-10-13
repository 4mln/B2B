# Automated Full Logic & i18n Integration Summary

Branch: `automated/full-logic`

## Highlights
- i18n: Fixed malformed locale files and added comprehensive keys; wrapped visible strings across key screens/components.
- Data: Wired Explore to services via `@tanstack/react-query` (products, sellers, categories) with debounced search.
- Forms: Integrated `react-hook-form` + `yup` validation in Login, Signup, and Profile screens.
- Auth/API: Ensured axios client attaches token and improved error messaging using i18n; preserved existing auth surfaces.

## Files Touched (selected)
- i18n
  - `src/i18n/locales/en.json`, `src/i18n/locales/fa.json` — fixed shapes; added missing keys for home, add, explore, auth, errors, etc.
  - `src/i18n/index.ts` (used by app) — unchanged behavior.
- Screens / Components
  - `src/screens/HomeScreen.tsx` — wrapped text.
  - `src/screens/ConfigScreen.tsx` — wrapped placeholders; i18n fallbacks.
  - `src/components/LoginWall.tsx` — wrapped OTP UI strings.
  - `app/explore.tsx` — switched to react-query, debounced search, service wiring for products/sellers/categories.
  - `app/(tabs)/index.tsx`, `app/(tabs)/add.tsx` — ensured i18n keys exist for displayed text.
  - `app/auth/login.tsx`, `app/auth/signup.tsx` — RHF + yup validation.
  - `src/plugins/profile/ProfileScreen.tsx` — RHF + yup for editable fields.
- Services
  - `src/services/api.ts` — used as axios client.
  - `src/services/product.ts` — leveraged for products and categories.
  - `src/services/seller.ts` — fixed axios import; used for seller list.
  - `src/services/index.ts` — exported `sellerService` and product exports.
- Hooks
  - `src/hooks/useDebounce.ts` — new debounced value hook for search.

## React Query Keys
- Products: `['products', { q, category, sort }]`
- Sellers: `['sellers', {}]`
- Categories: `['categories']`

## Validation Rules (RHF + Yup)
- Login: required phone (Iran mobile validator).
- Signup: first/last name (min 2, character set, no multi-spaces/hyphens), nationalId (10 digits + checksum), phone (Iran mobile), guild required.
- Profile: optional `fullName`, `phone`, `businessName`, `businessIndustry` with basic constraints.

## i18n Keys Added (examples)
- `home.start`, `add.*`, `explore.*` (sorting, filters, headers), `auth.otpNotReceived`, `common.notSet`, plus various labels used in edited screens.

## TODOs / Follow-ups
- Services
  - RFQ, notifications, wallet: ensure all screens use react-query with services fully wired.
  - Confirm endpoints and params; adjust `productService` paths if backend differs (placeholders noted where applicable).
- UX/Polish
  - Add global toast/success notifications on mutations and richer skeletons on lists.
  - Expand RTL verification across all complex layouts.
- Translations
  - Review Persian translations for newly added keys; refine wording where needed.
- CI/Quality
  - Run `npm run lint` when available and adjust rules/auto-fixes.

## Safety Notes
- Preserved `LoginWall`/auth surfaces and navigation.
- i18n fallbacks ensure app runs even if some translations are pending.




