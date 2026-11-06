# Bir Paragliding — website

Cinematic, animation-heavy marketing site for **Bir Paragliding** (tandem flights & P1–P4 courses in Bir Billing, Himachal Pradesh).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP 3 + ScrollTrigger + SplitText · Lenis · Motion · React Three Fiber / three.js · sharp (build-time image prep)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Deploy: push to GitHub → import in Vercel (zero config). Set `NEXT_PUBLIC_SITE_URL` to your final domain (used for canonical URLs, sitemap, JSON-LD). Without it, Vercel's production domain is used automatically.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home — 3D descent hero + 9 more sections |
| `/packages`, `/packages/[slug]` | Flights & courses, plus a 10-section detail page for every package |
| `/about` | About us (story, milestones, office, gear, safety, principles) |
| `/experience-bir` | Seasons, map, day cycle, treks, stays, culture |
| `/gallery` | Tunnel, puzzle, filterable masonry + lightbox, reels, compare slider… |
| `/blog`, `/blog/[slug]` | **Flight Log**: guides and articles |
| `/booking`, `/faq`, `/contact` | Booking wizard (WhatsApp hand-off), FAQ, contact |
| `/legal/[slug]`, `/credits` | Terms / privacy / cancellation, and photo credits |

## Where to edit things

| What | File |
| --- | --- |
| Brand, phone, WhatsApp, email, hours, all prices & packages, FAQs, seasons, map pins, gallery list | `lib/site.ts` |
| Extra content (sample reviews, glossary, itinerary, stays, cafés, booking steps…) | `lib/extra.ts` |
| Flight Log posts | `lib/blog.ts` |
| Terms / privacy / cancellation (templates) | `lib/legal.ts` |
| Photo & video credits | `lib/credits.ts` |
| Logo / favicon | `components/layout/Logo.tsx`, `app/icon.svg`, `app/apple-icon.png`, `app/favicon.ico` |
| Global look (colours, fonts, utilities) | `app/globals.css` |

### Placeholders to replace before launch

Everything below is clearly labelled on the site ("Sample" / "Placeholder"):

- **Reviews** — `sampleReviews` in `lib/extra.ts` (shown with a "Sample" badge). Paste real Google reviews.
- **Founding year / milestones** — `timeline` in `lib/site.ts`, plus the founding-story note in `components/about/Story.tsx`.
- **Optional: business numbers** (flights flown, happy flyers, years). The `stats` in `lib/site.ts` only hold location facts today; add yours there if you want them shown.
- **Legal templates** — notice periods, waiver/insurance wording in `lib/legal.ts`.

Contact details (phone/WhatsApp/email) come from the reference site as requested. Change them in `lib/site.ts` and they update everywhere (navbar, footer, booking, contact, JSON-LD).

## Home hero (`components/home/hero`)

A scroll-driven 3D descent from the Billing launch (2,400 m) to the Bir landing field (1,400 m):

- **Backdrop:** the real Dhauladhar range (`public/images/hero-range.webp`, a sky-removed cut of a Commons photo), placed far away so it parallaxes like real mountains.
- **Sky & light:** a procedural sky with sun/moon glow, aerial-perspective haze, and four looks (dawn, midday, golden hour, night) picked from the visitor's local clock. The chip in the hero cycles them and they crossfade.
- **World:** forested ridges, valley walls and a painted valley floor (terraced fields, rivers, lanes, villages, the landing field), with cumulus shadows drifting across the ground. Warm village lights come on after dark.
- **Life:** sunlit cumulus you fly through, a low cloud-sea in the far valleys, other pilots circling in thermals, and your tandem banking with the pointer (or phone tilt).
- **Performance:** the valley and terrain are generated once, in small chunks that never block the page. Resolution steps down automatically on slower GPUs. Low-end devices and reduced-motion users get the static photo hero instead.

## Media

- Photos: `public/images/*.webp` (HD, up to 2560 px). Videos: `public/media/*.mp4` (1080p H.264 loops + posters).
- All from Wikimedia Commons under free licences (CC BY / CC BY-SA / CC0), with full attribution at `/credits`.
- To use your own photo, drop a file into `public/images/` with the same name, then regenerate the blur placeholders and sizes in `lib/blur.ts`. Any `next/image` blur generator works, or keep the existing entry if the aspect ratio is similar.

## Animation system (`components/animations`, `components/layout`)

- `SmoothScroll`: Lenis driven by the GSAP ticker, synced with ScrollTrigger.
- `Preloader`: a paraglider draws its flight path while the altimeter counts 0 → 2,400 m, then the cloud banks part.
- `Transition` (`TLink`): a "wind gust" route transition that shows the next page's title.
- `Cursor`: a dot plus a windsock ring that stretches with speed. Labels come from `data-cursor="view|drag|book"`.
- `Altimeter`: scroll progress shown as a 2,400 → 1,400 m descent with a live variometer.
- `SplitHeading`, `RevealImage`, `Magnetic`, `Parallax`: the shared primitives.
- Respects `prefers-reduced-motion` (see `lib/device.ts`).
