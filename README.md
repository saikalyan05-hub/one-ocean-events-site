# One Ocean Events — demo marketplace frontend

**Written for: a developer picking this repository up for the first time.**

A frontend-only prototype of an event-vendor marketplace across five South
Indian cities: browse service categories, search and filter vendors, compare up
to three side by side, save to a wishlist, place a demo booking, message a
vendor, and open either of two dashboards — a customer one and an admin one.

There is no server. Every read and write goes through
[`src/services/api.js`](src/services/api.js), which persists to `localStorage`
under the `ooe:` prefix. [`docs/BACKEND.md`](docs/BACKEND.md) specifies the
schema and REST endpoints that module is shaped to call.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production bundle into `dist/` |
| `npm run preview` | Serve the built bundle |
| `npm run lint` | oxlint |
| `npm run smoke` | 63 behavioural checks in jsdom (`scripts/smoke.mjs`) |
| `npm run qa` | Headless Chrome pass over 17 routes × 6 breakpoints, checking real horizontal overflow, elements past the right edge, tap targets under 24px and console errors. Writes `qa-screenshots/`. Needs Chrome or Edge installed. |
| `npm run probe` | Walks 25 routes plus six flows that open a tray, a modal or a dialog, and lists every visible, enabled button wired to nothing (`scripts/click-probe.mjs`). Needs Chrome or Edge installed. |

`npm run qa` drives a real browser because the jsdom suite has no layout engine
— it once passed while a mobile drawer was painting over the entire desktop
homepage. The two suites catch different classes of defect; run all three.

`npm run probe` reads each button's React props off the DOM node
(`__reactProps$…`) rather than clicking it and watching for a change. Clicking
cannot tell a handler that deliberately does nothing from a button that was
never wired up, and it stays silent either way — which is how three dead
buttons survived a green smoke run. Reading the handler is exact.

---

## Demo sign-in

**There are no credentials, on purpose.** The login modal asks for a name and an
email address, accepts anything that looks like an email, and stores the result
locally. It has no password field.

A fake password box trains people to type a real password into a prototype, and
any credential shipped in a client bundle is public. So instead of demo
credentials this build has no authentication at all — the shape of the flow is
there for a real one to replace.

The production replacement posts to `POST /api/auth/login` over HTTPS and is
responsible for password hashing (bcrypt/argon2), an HTTP-only `SameSite`
cookie, rate limiting, CAPTCHA, server-side authorization on every booking
write, and audit logging. None of that belongs in this bundle. See
[`docs/BACKEND.md`](docs/BACKEND.md) §3.4 and §4.

---

## Supplied vendors vs sample vendors

The roster has 40 listings, and they are not all the same kind of thing.

| | **Supplied** (`source: true`) | **Sample** (`sample: true`) |
|---|---|---|
| How many | 9 | 31 |
| Where they came from | the supplied vendor document | invented for this prototype |
| Business name | real | fictional |
| May carry `verified` | never in this build (see below) | never, unconditionally |
| Labelled in the UI | nothing extra | a "Sample listing" chip, explained by `SAMPLE_NOTICE` |

A sample listing is invented end to end, so it says so wherever it appears:
the vendor modal, the admin vendor table and the compare table all print the
label rather than letting a fictional business read as a real one.

---

## Source facts vs demo values

The single most important rule in this codebase.

| | **Source facts** | **Demo values** |
|---|---|---|
| Lives in | `vendor.facts`, `vendor.location`, `vendor.yearsExperience` | `vendor.demo.*` |
| Examples | name, category, years of experience, event count, specialty, city | rating, review count, starting price, `verified`, reviews, portfolio images |
| Rendered as | plain text, unlabelled | always beside a `DEMO` tag |

- **Nothing is invented.** Where the source supplies no event count,
  `eventCount` is `null` and the UI prints "Event count not supplied". It does
  not fall back to a guess.
- **No vendor is verified.** The "Verified Vendors" trust badge describes the
  intended product, not a claim about any listed business. A real badge needs a
  `vendor_verifications` record with an auditor, method and timestamp.
- **Prices are estimates, labelled as such**, never quotes.
- A footer note and a smoke test (`every rating is paired with a demo tag`)
  both enforce the separation.

Photographs in [`src/data/images.js`](src/data/images.js) are free-licence
Unsplash stand-ins, **not** pictures of the listed vendors. Each is still chosen
to be truthful about the category — a pure-veg caterer never gets a meat
photograph. Replace the whole file with vendor-uploaded or licensed assets
before launch; no component imports a raw URL, so that file is the only change.

---

## The two dashboards

`/dashboard` is the customer view and `/admin` is the operations view. Both
are nested routes under a shared `DashboardLayout`, so the sidebar and topbar
stay mounted and only the panel fades between screens.

**Neither one is gated, and that is deliberate rather than an oversight.** A
client-side check would be theatre: anyone can edit the bundle. Authorisation
belongs on the server, in front of the endpoints `src/services/api.js` is
shaped to call. The admin Settings screen says this on the page, not just in a
comment, so nobody demoing it mistakes the screen for an access control.

Everything the admin screens show is invented, so every screen says so:

- the head-line stat cards are marked "Demo figure";
- the report charts carry a banner stating nothing was measured;
- the review queue states the reviews are prototype content, not customer
  feedback;
- announcements are read-only, because a compose box would imply the demo
  could send one, and it has nowhere to send it.

Demo data is shared rather than duplicated (`src/data/demoData.js`), so the
screens agree with each other: a booking you place appears in your own
bookings *and* in the admin booking table, marked "Your booking", and the
customer row's booking count is recomputed from storage rather than hard-coded.

Seeding is versioned. `SEED_VERSION` in `src/services/api.js` guards the
first-run write, so changing the seed data re-seeds returning browsers instead
of leaving them on a stale mix.

---

## Layout

```
src/
  components/      one folder per component: Component.jsx + Component.css
    common/        Icon, LocationSelect, and index.jsx (DemoTag, Stars,
                   SafeImage, EmptyState, Loading, SkeletonGrid, Breadcrumb)
    Modal/         Modal shell + vendor / booking / compare / chat / login / video
  context/         AppContext — wishlist, compare, bookings, filters, toasts, modals
  data/            categories.js, vendors.js (source facts), images.js (URLs only),
                   demoData.js (seeded customer + admin demo records)
  hooks/           useAsync — loading/error state around an api.js call
  pages/           one file per route
    dashboard/     the customer dashboard panels
    admin/         the admin dashboard panels
  services/        api.js — the only module that touches persistence
  styles/          variables.css (design tokens), global.css (reset + primitives)
  utils/           storage.js — namespaced, quota-safe localStorage helpers
scripts/           smoke.mjs, layout-qa.mjs, click-probe.mjs, shot.mjs
docs/BACKEND.md    schema + REST contract for the server that replaces api.js
```

Conventions worth knowing before editing:

- **Design tokens only.** Colour, spacing, radius, shadow and motion come from
  custom properties in `src/styles/variables.css`. No raw hex in components.
- **Light theme only.** There is deliberately no dark mode.
- `[hidden] { display: none !important; }` in `global.css` is load-bearing: any
  author `display` beats the UA rule for `[hidden]`, which is how a closed
  drawer ends up painted over the page.
- `overflow-x: clip` on `<body>` contains decorative bleed without creating a
  scroll container, so the sticky header keeps working. Chrome still reports an
  inflated `scrollWidth` through `clip`, so the QA harness tests whether the
  page *can actually scroll*, not what `scrollWidth` says.
- Every animation is inside a `prefers-reduced-motion` guard.
- **`categorySlug()` from `src/data/vendors.js` is the only way to turn a label
  into a class name.** A raw `status-${status}` breaks the moment the value has
  a space in it, silently producing two class names and no styling. Status pills
  are defined once, as `.status-*` in `global.css`.
- **Line endings in this repo are mixed.** Any script that rewrites a file must
  detect the file's own ending and restore it, or an anchored replacement will
  fail to match on CRLF files while appearing to work on LF ones.
- Watch for invisible characters. Four `cursor: pointer` declarations were once
  dead because a zero-width joiner had crept into the property name; nothing
  reports it, the rule just does not apply.

## Accessibility

Semantic landmarks, a skip link, visible focus rings, `aria-live` toasts, focus
trapped in modals and returned to the trigger on close, `aria-pressed` on
wishlist and compare toggles, and labelled form controls with inline error text
tied by `aria-describedby`.

Pointer targets are at least 24px (WCAG 2.5.8), which `npm run qa` measures at
every breakpoint. Where a control is meant to *look* small — the compare tray's
remove button, for instance — the visible circle stays 20px and the button box
is grown around it, so the hit area is comfortable without the design changing.
