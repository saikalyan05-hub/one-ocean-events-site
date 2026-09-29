# One Ocean Events — Database Schema & REST API

**Written for: the backend engineer who will replace the demo data layer.**

This prototype is frontend-only. Every read and write goes through
[`src/services/api.js`](../src/services/api.js), which currently persists to
`localStorage` under the `ooe:` prefix. That module is the *only* place the UI
touches data, and its function signatures already mirror the endpoints below
one-to-one. Swapping in a real backend means rewriting the bodies of those
functions to `fetch()` these routes — no component changes.

```js
// src/services/api.js
export const DEMO_MODE = true;   // flip to false once the API is live
```

---

## 1. Data honesty rules that must survive the migration

The UI draws a hard line between two kinds of value, and the schema encodes it.

| | **Source facts** | **Demo values** |
|---|---|---|
| Where | `vendors.*` columns | `vendor_demo_values.*` |
| Examples | name, category, years of experience, event count, specialty, city | rating, review count, starting price, `verified`, service list, portfolio images, review text |
| Rendered | plainly, unlabelled | always beside a `<DemoTag />` |

Three constraints follow:

1. **Never synthesise a missing fact.** `event_count` is nullable. Where it is
   null the UI prints "Event count not supplied" — it does not fall back to a
   guess. Keep the column nullable and keep the null meaningful.
2. **`verified` is not a demo flag in production.** The `vendor_demo_values`
   table must be dropped (or left empty) before launch. A production
   verification badge belongs in `vendor_verifications` with an auditor, a
   method and a timestamp — not a boolean someone typed.
3. **Estimates are not quotes.** `bookings.estimate_minor` carries
   `estimate_is_demo`. Once real pricing exists, the server computes the figure
   and the flag goes false; until then the UI keeps labelling it.

---

## 2. Entities

Postgres dialect. All ids are UUID v4 unless noted. All timestamps are
`timestamptz` stored in UTC. Money is stored as integer **minor units** (paise)
with an explicit currency — never a float.

### 2.1 `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text` NOT NULL | |
| `email` | `citext` NOT NULL UNIQUE | |
| `email_verified_at` | `timestamptz` NULL | |
| `password_hash` | `text` NULL | argon2id or bcrypt cost ≥ 12. **Null for OAuth-only accounts.** Never returned by any endpoint. |
| `phone` | `text` NULL | E.164 |
| `role` | `text` NOT NULL | `customer` \| `vendor` \| `admin`; CHECK constraint |
| `default_location` | `text` NULL | FK-ish to `locations.name` |
| `created_at` / `updated_at` | `timestamptz` NOT NULL | |
| `last_login_at` | `timestamptz` NULL | |

> The demo login form has **no password field by design** — shipping a fake one
> invites a real credential into `localStorage`. See the comment block at the
> top of `src/components/Modal/LoginModal.jsx`.

### 2.2 `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK → `users` ON DELETE CASCADE | |
| `token_hash` | `text` NOT NULL UNIQUE | store a SHA-256 of the session token, never the token |
| `user_agent` / `ip` | `text` NULL | for the "active sessions" UI and abuse review |
| `expires_at` | `timestamptz` NOT NULL | |
| `revoked_at` | `timestamptz` NULL | |

Index: `(user_id, expires_at)`.

### 2.3 `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | slug — `wedding-decoration`, `catering-services`, … matches `src/data/categories.js` |
| `label` | `text` NOT NULL | |
| `icon` | `text` NOT NULL | key into the inline SVG set in `src/components/common/Icon.jsx` |
| `tone` | `text` NOT NULL | design token name used for the tinted card |
| `sort_order` | `integer` NOT NULL | |
| `is_active` | `boolean` NOT NULL DEFAULT true | |

Five of the nine seeded categories currently resolve to zero vendors. The UI
says so honestly rather than hiding them; keep `is_active` true and let the
count speak.

### 2.4 `locations`

| Column | Type |
|---|---|
| `id` | `uuid` PK |
| `name` | `text` NOT NULL UNIQUE (`Hyderabad`) |
| `state` | `text` |
| `country` | `text` NOT NULL DEFAULT `'IN'` |
| `is_serviceable` | `boolean` NOT NULL DEFAULT true |

All nine seeded vendors are in Hyderabad. The Vendors page empty state names
that limitation explicitly instead of looking broken.

### 2.5 `vendors` — **source facts only**

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | slug — `dhruva-events-decors` |
| `name` | `text` NOT NULL | |
| `category` | `text` NOT NULL | display category: `Decorators` \| `Catering` \| … |
| `experience_years` | `integer` NULL | CHECK `>= 0` |
| `event_count` | `integer` NULL | **nullable and meaningful** |
| `event_count_label` | `text` NULL | e.g. `'150+ events'` — the label the source supplied |
| `specialty` | `text` NULL | |
| `location_id` | `uuid` FK → `locations` | |
| `hero_image_url` | `text` NULL | |
| `phone` / `email` / `website` | `text` NULL | contact, gated behind auth in production |
| `owner_user_id` | `uuid` FK → `users` NULL | set once a vendor claims the listing |
| `status` | `text` NOT NULL | `draft` \| `published` \| `suspended` |
| `created_at` / `updated_at` | `timestamptz` | |

Indexes: `(status, location_id)`, GIN trigram on `name` and `specialty` for the
search in §3.1.

### 2.6 `vendor_categories` (join)

`(vendor_id text FK, category_id text FK)`, PK on both. A vendor appears under
several browse categories; `vendorMatchesCategory()` in
`src/data/categories.js` is the demo stand-in for this join.

### 2.7 `vendor_demo_values` — **delete before production**

| Column | Type |
|---|---|
| `vendor_id` | `text` PK FK → `vendors` ON DELETE CASCADE |
| `rating` | `numeric(2,1)` NULL |
| `review_count` | `integer` NULL |
| `starting_price_minor` | `bigint` NULL |
| `currency` | `char(3)` NOT NULL DEFAULT `'INR'` |
| `price_unit` | `text` NULL — `plate` \| `event` |
| `verified` | `boolean` NOT NULL DEFAULT false |
| `services` | `text[]` |
| `portfolio_urls` | `text[]` |

Its production successors are `vendor_pricing`, `reviews` (below) and
`vendor_verifications`. Keeping the demo values in their own table is what makes
"drop this table" a complete, auditable cleanup step.

### 2.8 `reviews`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `vendor_id` | `text` FK → `vendors` | |
| `user_id` | `uuid` FK → `users` | |
| `booking_id` | `uuid` FK → `bookings` NULL | **a review should require a completed booking** |
| `rating` | `smallint` NOT NULL | CHECK `between 1 and 5` |
| `body` | `text` | |
| `status` | `text` NOT NULL | `pending` \| `published` \| `rejected` |
| `created_at` | `timestamptz` | |

Unique `(user_id, booking_id)`. Aggregate rating is a materialised view over
`status = 'published'`, never a writable column.

### 2.9 `wishlists`

`(user_id uuid FK, vendor_id text FK, created_at timestamptz)`, PK on the pair.
Anonymous visitors keep their wishlist in `localStorage`; on first login the
client POSTs the local ids once and then treats the server as authoritative.

### 2.10 `bookings`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `reference` | `text` NOT NULL UNIQUE | human-facing, `OOE-123456` |
| `user_id` | `uuid` FK → `users` | |
| `vendor_id` | `text` FK → `vendors` | |
| `event_date` | `date` NOT NULL | CHECK `>= created_at::date` |
| `event_type` | `text` NOT NULL | |
| `location` | `text` NOT NULL | |
| `guest_count` | `integer` NOT NULL | CHECK `between 1 and 10000` |
| `notes` | `text` | length ≤ 500 |
| `status` | `text` NOT NULL | `Requested` \| `Confirmed` \| `Completed` \| `Cancelled` |
| `estimate_minor` | `bigint` NULL | |
| `estimate_is_demo` | `boolean` NOT NULL DEFAULT true | |
| `currency` | `char(3)` NOT NULL DEFAULT `'INR'` | |
| `created_at` / `updated_at` | `timestamptz` | |

Indexes: `(user_id, event_date desc)`, `(vendor_id, status)`.
Cancelling **updates** `status`; it never deletes the row — the Bookings page's
Cancelled tab depends on that.

### 2.11 `booking_events` (audit trail)

`(id uuid PK, booking_id uuid FK, actor_user_id uuid NULL, from_status text,
to_status text, reason text, created_at timestamptz)`. Append-only. Every status
transition writes one row.

### 2.12 `conversations` / `messages`

`conversations`: `(id uuid PK, user_id uuid FK, vendor_id text FK,
last_message_at timestamptz, created_at)`, unique `(user_id, vendor_id)`.

`messages`: `(id uuid PK, conversation_id uuid FK ON DELETE CASCADE,
author text CHECK in ('customer','vendor','system'), body text NOT NULL,
read_at timestamptz NULL, created_at timestamptz NOT NULL)`.
Index `(conversation_id, created_at)`.

The demo's automated vendor reply (`simulateVendorReply`) has no production
counterpart — real replies arrive over WebSocket or SSE on
`/api/conversations/:id/stream`.

---

## 3. REST API

Base path `/api`. JSON in, JSON out. Success bodies are
`{ "data": … }` (plus `"total"` on collections); errors are
`{ "error": { "code": "...", "message": "...", "fields": { … } } }`.
Auth is an HTTP-only, `Secure`, `SameSite=Lax` session cookie — there is no
token in JavaScript's reach, so there is nothing for XSS to steal.

| Method | Path | Auth | Maps to |
|---|---|---|---|
| GET | `/api/vendors` | public | `listVendors` |
| GET | `/api/vendors/:id` | public | `getVendor` |
| GET | `/api/categories` | public | `listCategories` |
| GET | `/api/wishlist` | user | `getWishlist` |
| POST | `/api/wishlist/:vendorId` | user | `toggleWishlist` |
| POST | `/api/compare` | public | `validateCompare` |
| GET | `/api/bookings` | user | `listBookings` |
| POST | `/api/bookings` | user | `createBooking` |
| PATCH | `/api/bookings/:id` | user (owner) | `cancelBooking` |
| GET | `/api/conversations` | user | `listConversations` |
| POST | `/api/conversations` | user | `openConversation` |
| POST | `/api/conversations/:id/messages` | user (participant) | `sendMessage` |
| POST | `/api/auth/login` | public | `login` |
| POST | `/api/auth/logout` | user | `logout` |
| GET | `/api/auth/session` | public | `getSession` |

### 3.1 `GET /api/vendors`

Query: `query`, `categoryId`, `location`, `sort`
(`experience` \| `events` \| `name`), `page`, `perPage`.
`query` matches vendor name, specialty and category, case-insensitively.

```json
{
  "data": [
    {
      "id": "dhruva-events-decors",
      "facts": {
        "name": "DHRUVA EVENTS & DECORS",
        "category": "Decorators",
        "experienceYears": 8,
        "eventCount": 150,
        "eventCountLabel": "150+ events",
        "specialty": "Wedding & celebration decor"
      },
      "location": "Hyderabad",
      "image": "https://…",
      "demo": { "rating": 4.8, "reviewCount": 120, "startingPrice": 45000,
                "priceUnit": "event", "verified": true, "services": ["…"] }
    }
  ],
  "total": 9
}
```

The nested `facts` / `demo` split is not cosmetic — it is the contract that lets
the UI decide what needs a demo tag. In production `demo` disappears and its
survivors move up: `rating` and `reviewCount` become computed aggregates,
`startingPrice` comes from `vendor_pricing`, and `verified` comes from
`vendor_verifications`.

### 3.2 `POST /api/bookings`

```json
{ "vendorId": "…", "eventDate": "2026-12-04", "eventType": "Wedding",
  "location": "Hyderabad", "guestCount": 250, "notes": "" }
```

`201` returns the persisted booking, including `reference` and `status`.

**The server must re-validate every field** — the browser is not a trust
boundary. `src/components/Modal/BookingModal.jsx` says so in a comment above its
`validate()` because client validation here is a convenience, not a control.
Server-side: authenticate the caller, confirm the vendor is `published`, reject
past dates in the vendor's timezone, clamp `guestCount` to 1–10000, cap `notes`
at 500 characters, and rate-limit per user and per IP.

### 3.3 `PATCH /api/bookings/:id`

`{ "status": "Cancelled" }`. Authorise on **`booking.user_id = session.user_id`**
(or an admin role) before writing — an id in a URL is not authorisation. Allowed
transitions: `Requested → Cancelled`, `Requested → Confirmed` (vendor),
`Confirmed → Completed|Cancelled`. Anything else is `409`. Every transition
appends a `booking_events` row.

### 3.4 `POST /api/auth/login`

```json
{ "email": "…", "password": "…" }
```

Verify with argon2id/bcrypt, then `Set-Cookie: session=…; HttpOnly; Secure;
SameSite=Lax; Path=/; Max-Age=…`. Return the user record **without**
`password_hash`. Required around it: per-IP and per-account rate limiting,
CAPTCHA after repeated failures, an identical response time and message for
"unknown email" and "wrong password", and an audit log entry on every attempt.

The demo sends only `{ name, email }` and checks nothing. That is deliberate —
there is no credential in the bundle to leak.

### 3.5 Error codes

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_FAILED` | with a `fields` map the form renders inline |
| 401 | `UNAUTHENTICATED` | no or expired session |
| 403 | `FORBIDDEN` | authenticated but not the owner |
| 404 | `NOT_FOUND` | unknown vendor, booking or conversation |
| 409 | `CONFLICT` | illegal status transition, duplicate wishlist row |
| 422 | `COMPARE_LIMIT` | more than `MAX_COMPARE` (3) vendors |
| 429 | `RATE_LIMITED` | with `Retry-After` |

---

## 4. Migration checklist

1. Set `DEMO_MODE = false` and replace each function body in
   `src/services/api.js` with a `fetch()` to the matching route. Keep the return
   shapes (`{ data, total }`) — the components destructure them.
2. Send `credentials: 'include'` on every request and add a CSRF token to
   unsafe methods.
3. Drop `vendor_demo_values`, remove the `demo` block from the vendor payload,
   and delete the `<DemoTag />` usages that no longer have anything to tag.
   `grep -rn "DemoTag" src/` lists every one.
4. Move image URLs out of `src/data/images.js` to your own CDN. The current
   hotlinks are free-licence placeholders for the demo only, and the real
   photography needs a signed licence before launch.
5. Add a `Content-Security-Policy` and remove `images.unsplash.com` from
   `index.html`'s preconnect once step 4 is done.
6. Replace `clearStorage()` on logout with a server-side session revoke, and
   keep the client-side clear as belt-and-braces.
