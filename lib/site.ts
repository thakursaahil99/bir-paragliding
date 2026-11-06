/**
 * Single source of truth for all site content — brand: "Bir Paragliding".
 *
 * From the reference site (glideinbir.vercel.app) we took ONLY the content types
 * (tandem flights, P1–P4 courses, camping/travel/stay add-ons, FAQ topics, guides)
 * and the PRICING. All copy here is original. Photos/videos are HD, free-licence
 * (see /credits). Anything business-specific we don't know is marked PLACEHOLDER.
 *
 * Contact details below are the WhatsApp/phone/email you asked us to use from the
 * reference site — change them here and they update everywhere.
 */

/** Production URL: set NEXT_PUBLIC_SITE_URL, otherwise Vercel's production domain is used. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'http://localhost:3000';

export const site = {
  name: 'Bir Paragliding',
  legalName: 'Bir Paragliding',
  url: siteUrl.replace(/\/$/, ''),
  tagline: 'Tandem flights & pilot courses in Bir Billing',
  description:
    'Tandem paragliding and P1–P4 pilot courses from the 2,400 m Billing launch in Himachal Pradesh. Licensed pilots, morning slots and bookings confirmed on WhatsApp — flights from ₹2,500.',
  phone: '+91 98053 38877',
  phoneHref: 'tel:+919805338877',
  whatsapp: '919805338877',
  email: 'glideinbir@gmail.com',
  address: { locality: 'Bir', region: 'Himachal Pradesh', country: 'India' },
  hours: 'Daily · 9 AM – 7 PM',
  geo: { lat: 32.0439, lng: 76.7166 },
  takeoffGeo: { lat: 32.0617, lng: 76.7303 },
  keywords: [
    'paragliding in Bir Billing',
    'Bir Billing paragliding price',
    'tandem paragliding Himachal',
    'Bir Billing paragliding',
    'paragliding course Bir Billing',
    'Bir Paragliding',
  ],
};

export const waLink = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
const img = (n: string) => `/images/${n}.webp`;
import { sampleReviews } from './extra';

export const routes = [
  { href: '/', label: 'Home', title: 'Take-off', image: img('flight-cloud-sea') },
  { href: '/packages', label: 'Flights & Courses', title: 'Flights', image: img('tandem-red-wing') },
  { href: '/about', label: 'About us', title: 'About us', image: img('takeoff-snow-peaks') },
  { href: '/experience-bir', label: 'Experience Bir', title: 'Experience Bir', image: img('chokling-monastery') },
  { href: '/gallery', label: 'Gallery', title: 'Gallery', image: img('flight-sunset') },
  { href: '/blog', label: 'Flight Log', title: 'Flight Log', image: img('trek-cloud-sea') },
  { href: '/faq', label: 'FAQ', title: 'Questions', image: img('dhauladhar-naddi') },
  { href: '/contact', label: 'Contact', title: 'Contact', image: img('prayer-flags') },
  { href: '/booking', label: 'Book a flight', title: 'Booking', image: img('billing-launch-flags') },
] as const;

export const routeTitle = (path: string) => {
  if (path.startsWith('/blog/')) return 'Flight Log';
  if (path.startsWith('/legal/')) return 'The fine print';
  return routes.find((r) => r.href === path)?.title ?? 'Bir Paragliding';
};

/* ---------------------------------------------------------------- stats
 * Location + package facts only. Business numbers (flights flown, happy flyers,
 * years of experience) are yours to add — e.g. { value: '5,000', suffix: '+', label: 'Flights flown', note: 'Since 20XX' }.
 */
export const stats = [
  { value: '2,400', suffix: 'm', label: 'Launch altitude', note: 'Billing take-off' },
  { value: '1,400', suffix: 'm', label: 'Landing altitude', note: 'Bir landing field' },
  { value: '1,000', suffix: 'm', label: 'Vertical drop', note: 'Launch to landing' },
  { value: '200', suffix: '+', label: 'Flyable days', note: 'Mid-Sep to June' },
  { value: '50', suffix: 'min', label: 'Longest tandem', note: 'Cross-country flight' },
  { value: '2015', suffix: '', label: 'World Cup host', note: "India's first" },
];

/* ---------------------------------------------------------------- packages (prices from reference) */
export type Pkg = {
  slug: string;
  kind: 'flight' | 'course';
  tag: string;
  name: string;
  tagline: string;
  price: number;
  unit: string;
  duration: string;
  durationShort: string;
  image: string;
  description: string;
  inclusions: string[];
  syllabus?: { title: string; text: string }[];
  popular?: boolean;
};

export const packages: Pkg[] = [
  {
    slug: 'first-flight-tandem',
    kind: 'flight',
    tag: 'Tandem',
    name: 'First Flight Tandem',
    tagline: 'A short, smooth first taste of the sky',
    price: 2500,
    unit: 'per person',
    duration: 'about 18 minutes',
    durationShort: '18 min',
    image: img('flight-blue-ridge'),
    description:
      "Your introduction to free flight. A licensed pilot handles the launch, the air and the landing while you take in the Kangra valley from above — perfect for a first time, or if you'd like to keep things gentle.",
    inclusions: ['Around 18 minutes in the air', 'Licensed tandem pilot at the controls', 'Safety briefing before launch', 'Certified tandem wing with reserve', 'Zero experience required'],
  },
  {
    slug: 'classic-tandem',
    kind: 'flight',
    tag: 'Tandem',
    name: 'Classic Tandem',
    tagline: 'Longer airtime, HD GoPro footage included',
    price: 4000,
    unit: 'per person',
    duration: 'about 25 minutes',
    durationShort: '25 min',
    image: img('tandem-red-wing'),
    popular: true,
    description:
      'The flight most people come to Bir for. Time to settle into the harness, watch the Dhauladhar line up behind you and enjoy the valley at leisure — with HD GoPro footage of the whole flight to take home.',
    inclusions: ['Around 25 minutes in the air', 'HD GoPro video of your flight', 'Licensed tandem pilot at the controls', 'Certified tandem wing with reserve', 'Scenic route over the Bir valley'],
  },
  {
    slug: 'cross-country-tandem',
    kind: 'flight',
    tag: 'Cross-country',
    name: 'Cross-Country Tandem',
    tagline: 'Chase thermals across the valley',
    price: 6500,
    unit: 'per person',
    duration: 'about 50 minutes',
    durationShort: '50 min',
    image: img('flight-gaggle'),
    description:
      'For flyers who want the real thing. Your pilot climbs in thermals and links them along the ridge for a long cross-country glide — about twice the airtime of a classic flight, and a genuine feel for how pilots travel by air.',
    inclusions: ['Around 50 minutes in the air', 'Thermal climbs along the ridge', 'Experienced cross-country pilot', 'Certified tandem wing with reserve', 'Route chosen on the day for conditions'],
  },
  {
    slug: 'p1-p2-beginner-course',
    kind: 'course',
    tag: 'Beginner',
    name: 'P1 + P2 Beginner Pilot Course',
    tagline: 'From your first kite to your first solo flight',
    price: 25000,
    unit: 'per student',
    duration: '6 days',
    durationShort: '6 days',
    image: img('takeoff-snow-peaks'),
    description:
      'Six days that turn a complete beginner into a solo pilot. You start on the training slope learning to inflate and steer the wing, then progress to supervised solo flights with your instructor on the radio — finishing with a beginner pilot licence.',
    inclusions: ['Wing, harness, helmet & radio provided', 'Ground handling on the training slope', '3–4 radio-guided solo flights', 'Beginner pilot licence on completion', 'Small batches'],
    syllabus: [
      { title: 'Gear & ground school', text: 'How a wing is built, pre-flight checks and the safety kit you fly with.' },
      { title: 'Kiting the wing', text: 'Inflating, controlling and steering the wing on the training slope.' },
      { title: 'First solo flights', text: 'Three to four supervised flights with radio guidance from your instructor.' },
      { title: 'Licence', text: 'Assessment and beginner pilot certification.' },
    ],
  },
  {
    slug: 'p3-intermediate-course',
    kind: 'course',
    tag: 'Intermediate',
    name: 'P3 Thermals & Soaring Course',
    tagline: 'Stop gliding down — start climbing',
    price: 35000,
    unit: 'per student',
    duration: '8 days',
    durationShort: '8 days',
    image: img('launch-wings'),
    description:
      "Built for P2 pilots who are ready to stay up. Over about eight days you'll work on active piloting in stronger air, learn to find and centre thermals, and practise soaring along the Billing ridge.",
    inclusions: ['For licensed P2 pilots', 'Active piloting in stronger air', 'Finding & centring thermals', 'Ridge soaring sessions', 'Instructor-led flying days'],
    syllabus: [
      { title: 'Active piloting', text: 'Handling the wing confidently in stronger, livelier conditions.' },
      { title: 'Thermalling', text: 'Reading the sky, finding lift and centring it safely.' },
      { title: 'Ridge soaring', text: 'Using the Billing ridge to extend your time in the air.' },
    ],
  },
  {
    slug: 'p4-cross-country-course',
    kind: 'course',
    tag: 'Advanced',
    name: 'P4 Cross-Country Course',
    tagline: 'Plan, fly and finish real XC routes',
    price: 60000,
    unit: 'per student',
    duration: '12 days',
    durationShort: '12 days',
    image: img('flight-dhauladhar'),
    description:
      'An expedition-style programme for experienced pilots. Route planning, thermal chaining and multi-day cross-country flights with instructor support — ending with an assessment for professional-level certification.',
    inclusions: ['For experienced pilots', 'Route planning & weather reading', 'Thermal-chaining strategy', 'Multi-day XC flights with support', 'P4 certification assessment'],
    syllabus: [
      { title: 'XC strategy', text: 'Planning routes and linking thermals across the valley.' },
      { title: 'Expedition flights', text: 'Multi-day cross-country flying with instructor support.' },
      { title: 'Certification', text: 'Assessment for P4 professional-level certification.' },
    ],
  },
];

export const flights = packages.filter((p) => p.kind === 'flight');
export const courses = packages.filter((p) => p.kind === 'course');
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Comparison table for the three tandem flights. */
export const flightCompare: { label: string; values: (string | boolean)[] }[] = [
  { label: 'Time in the air', values: ['~18 min', '~25 min', '~50 min'] },
  { label: 'Price per person', values: ['₹2,500', '₹4,000', '₹6,500'] },
  { label: 'Licensed pilot flies the wing', values: [true, true, true] },
  { label: 'Reserve parachute', values: [true, true, true] },
  { label: 'HD GoPro video', values: ['On request', true, 'On request'] },
  { label: 'Thermal / cross-country flying', values: [false, false, true] },
  { label: 'Experience needed', values: ['None', 'None', 'None'] },
  { label: 'Best for', values: ['First-timers', 'Most visitors', 'Thrill seekers'] },
];

/* ---------------------------------------------------------------- add-ons (prices from reference) */
export const extras: { group: string; name: string; text: string; price: number | null; unit: string; image: string }[] = [
  { group: 'Camping', name: 'Machaan Treehouse Tent', text: 'A raised wooden machaan tent for two, with meals and a bonfire after dark.', price: 2000, unit: 'per night', image: img('camp-machaan') },
  { group: 'Camping', name: 'Rajgundha Dome Camp', text: 'Dome tents in the Rajgundha meadows, reached on a guided trek.', price: 1500, unit: 'per night', image: img('camp-himalaya') },
  { group: 'Camping', name: 'Deluxe Camp', text: 'Furnished tents with attached washrooms and an evening bonfire.', price: 4500, unit: 'per night', image: img('camp-triund') },
  { group: 'Travel', name: 'Delhi → Bir overnight Volvo', text: 'AC sleeper from Kashmiri Gate ISBT, arriving the next morning.', price: 1800, unit: '10–11 hrs', image: img('road-valley') },
  { group: 'Travel', name: 'Bir → Delhi overnight Volvo', text: 'AC sleeper back to Kashmiri Gate ISBT after your trip.', price: 1800, unit: '10–11 hrs', image: img('bir-aerial') },
  { group: 'Travel', name: 'Delhi → Bir private sedan', text: 'Door-to-door cab from Delhi airport or ISBT.', price: 7500, unit: '10–11 hrs', image: img('valley-panorama') },
  { group: 'Stay', name: 'Cottages near the landing field', text: 'Wooden cottages and guesthouses a short walk from where you land.', price: null, unit: 'Rates on request', image: img('stay-cottage') },
];

/* ---------------------------------------------------------------- why bir */
export const whyBir = [
  { kicker: '2015', title: 'World Cup pedigree', text: "Bir Billing hosted India's first Paragliding World Cup in 2015 — and pilots from around the world still return every season.", image: img('landing-field') },
  { kicker: '1,000 m', title: 'One huge, gentle drop', text: 'Launch at roughly 2,400 m on the Billing meadow, land near 1,400 m beside Bir village. That height buys long, unhurried flights.', image: img('valley-panorama') },
  { kicker: '200+', title: 'A long flying season', text: 'Outside the monsoon, the ridge works on most days from mid-September right through to June.', image: img('flight-cloud-sea') },
  { kicker: '0 hrs', title: 'No training required', text: 'On a tandem you are the passenger. Your pilot launches, flies and lands — your job is a few running steps and the view.', image: img('tandem-snow-peaks') },
  { kicker: '+2 days', title: 'A valley worth staying for', text: 'Monasteries and momos in the Tibetan colony, tea gardens, forest treks and camping under the Dhauladhar.', image: img('monks-billing') },
];

/* ---------------------------------------------------------------- flight journey */
export const journey = [
  { id: 'takeoff', label: 'Take-off', alt: '2,400 m', title: 'Run, lean, lift', text: 'A short drive brings you up to the Billing meadow. Your pilot lays out the wing, clips you in and waits for a clean breath of wind — a few strong steps downhill and the ground simply falls away.', image: img('takeoff-pilot') },
  { id: 'thermal', label: 'Thermal', alt: '+ lift', title: 'Circle up on warm air', text: "Columns of rising air lift the wing like an invisible elevator. Your pilot may circle inside one to gain height — say the word if you'd prefer it smooth and gentle.", image: img('flight-sunset') },
  { id: 'valley', label: 'Valley view', alt: '15–50 min', title: 'The valley opens up', text: 'Settle back into the harness: snow on the Dhauladhar behind you, terraced fields, tea gardens and monastery roofs spread out below.', image: img('valley-panorama') },
  { id: 'landing', label: 'Landing', alt: '1,400 m', title: 'Touch down in Bir', text: 'A long final glide lines you up with the landing field. Lift your legs, then a couple of easy steps as you touch down — usually to a crowd of cheering friends.', image: img('landing-field') },
];

/* ---------------------------------------------------------------- testimonials (PLACEHOLDER)
 * Replace with real guest reviews (e.g. from your Google Business profile) before launch.
 */
export const testimonials = sampleReviews.map((r) => ({ placeholder: true, name: r.who, meta: r.meta, quote: r.quote, rating: 5 }));

/* ---------------------------------------------------------------- about */
export const principles = [
  { title: 'Rooted in Bir', text: 'We live and fly here. Every pilot, camp and stay we recommend is someone we know personally — not a listing pulled off the internet.' },
  { title: 'Safety before schedule', text: "Licensed pilots, inspected gear and one firm rule: if the air isn't right, nobody flies. A rescheduled slot beats a rushed one." },
  { title: 'Honest pricing', text: 'One clear price per flight or course, shown up front. What you see on this site is what you pay on the hill.' },
  { title: 'One chat, whole trip', text: 'Flight, course, stay, camp or bus — plan everything in a single WhatsApp conversation instead of juggling five phone numbers.' },
];

export const timeline = [
  { year: '2015', title: 'The World Cup comes to Bir', text: "Bir Billing hosts India's first Paragliding World Cup and lands on the global flying map.", placeholder: false },
  { year: '[Year]', title: 'Bir Paragliding takes off', text: '[Placeholder — add your founding story: who started Bir Paragliding, when and why.]', placeholder: true },
  { year: '[Milestone]', title: '[Your proudest number]', text: '[Placeholder — flights flown, pilots trained, an award or a record flight.]', placeholder: true },
  { year: 'Today', title: 'Flights, courses & stays', text: 'Tandem flights, P1–P4 pilot courses and help with stays, camps and travel — all planned in one conversation.', placeholder: false },
];


export const safety = [
  { icon: 'license', title: 'Licensed pilots', text: 'Every tandem is flown by a licensed pilot who controls the wing from launch to landing.' },
  { icon: 'wing', title: 'Certified wings', text: 'Tandem wings and harnesses are certified and checked before every flying day.' },
  { icon: 'reserve', title: 'Reserve parachute', text: 'Each pilot flies with a reserve parachute — standard on every single flight.' },
  { icon: 'weather', title: 'Weather calls', text: "If the wind isn't right, we wait or reschedule. That's the safety system working, not failing." },
  { icon: 'brief', title: 'Clear briefing', text: 'A short, simple briefing on the run, the seat and the landing before you clip in.' },
  { icon: 'rules', title: 'By the book', text: "We operate within Himachal tourism's rules and seasonal guidelines for Bir Billing." },
];

/* ---------------------------------------------------------------- experience bir */
export const places = [
  { id: 'billing', name: 'Billing Launch', alt: '~2,400 m', x: 30, y: 18, kind: 'fly', image: img('billing-launch-flags'), text: 'The launch meadow at about 2,400 m, roughly 40 minutes by road above Bir. Huge views, a few tea stalls and prayer flags snapping in the wind.' },
  { id: 'landing', name: 'Bir Landing Field', alt: '~1,400 m', x: 52, y: 64, kind: 'fly', image: img('landing-field'), text: 'The big open field beside Bir village where every flight ends. Grab a chai and watch the wings spiral down in the afternoon.' },
  { id: 'colony', name: 'Tibetan Colony & Chokling Gompa', alt: 'Chowgan', x: 66, y: 72, kind: 'culture', image: img('chokling-monastery'), text: "Painted gompas, prayer wheels and quiet courtyards in Chowgan's Tibetan settlement — the cultural heart of Bir." },
  { id: 'cafes', name: 'Cafés & Tea Gardens', alt: 'Bir village', x: 44, y: 78, kind: 'food', image: img('tea-garden'), text: 'Bakeries, rooftop cafés and the green tea estates around Bir — where every flight story gets told twice.' },
  { id: 'rajgundha', name: 'Rajgundha Valley', alt: 'Trek & camp', x: 13, y: 30, kind: 'camp', image: img('camp-himalaya'), text: 'A remote meadow valley beyond the Billing ridge, reached on foot — dome camps, starry skies and hardly anyone else.' },
  { id: 'gunehar', name: 'Gunehar & the Waterfall', alt: 'Half-day walk', x: 30, y: 60, kind: 'trek', image: img('trek-stream'), text: 'Old slate-roofed houses and a short forest walk to a waterfall — an easy half-day outing from Bir.' },
  { id: 'camping', name: 'Machaan & Forest Camps', alt: 'Camping', x: 75, y: 44, kind: 'camp', image: img('camp-machaan'), text: 'Raised machaan tents and furnished camps tucked into the forest around Bir, with bonfires after dark.' },
  { id: 'baijnath', name: 'Baijnath · Bus Arrival', alt: 'Arrival', x: 88, y: 86, kind: 'travel', image: img('road-valley'), text: "Where most overnight Volvos from Delhi pull in. From here it's a short taxi ride up to Bir." },
] as const;

export const seasons = [
  { id: 'spring', name: 'Spring', months: 'Mar – Apr', status: 'Flying · strong air', open: true, fx: 'petals', image: img('season-spring'), text: 'Blossom across the valley and thermals that wake up early. Afternoons get punchy — pick a morning slot for a smooth first flight.', from: '#2a6f6b', to: '#f6b3a4', accent: '#ff9db0' },
  { id: 'summer', name: 'Summer', months: 'May – Jun', status: 'Flying · long days', open: true, fx: 'rays', image: img('dhauladhar-naddi'), text: 'Long, bright days and the strongest lift of the year — prime time for cross-country. Mornings stay calm; afternoons get lively.', from: '#0c4aa6', to: '#ffb347', accent: '#ffd36b' },
  { id: 'monsoon', name: 'Monsoon', months: 'Jul – mid Sep', status: 'No flying', open: false, fx: 'rain', image: img('season-monsoon'), text: "Rain and unstable air ground every wing from about 1 July to 15 September. The valley turns emerald and cafés stay open — it's just not flying weather.", from: '#1b2733', to: '#43566b', accent: '#8fb3d9' },
  { id: 'autumn', name: 'Autumn', months: 'Mid Sep – Nov', status: 'Best season', open: true, fx: 'leaves', image: img('season-autumn'), text: 'Rain-washed skies, gentle thermals and crisp views — the most reliable flying of the year. Also the busiest, so book a few days ahead.', from: '#7a2e0e', to: '#f39c3d', accent: '#ffb35c' },
  { id: 'winter', name: 'Winter', months: 'Dec – Feb', status: 'Flying · cold', open: true, fx: 'snow', image: img('season-winter'), text: 'Stable, glassy air and fresh snow on the Dhauladhar. Flights run on clear days — wrap up, because launch at 2,400 m is properly cold.', from: '#16233f', to: '#a9c3e8', accent: '#e8f1ff' },
];

export const reach = [
  { from: 'Delhi', how: 'Overnight AC Volvo to Bir / Baijnath, or drive via Chandigarh and Mandi', time: '12–13 hrs', dist: '520 km', code: 'DEL' },
  { from: 'Chandigarh', how: 'Bus or cab via Una and Jawalamukhi', time: '~8 hrs', dist: '285 km', code: 'IXC' },
  { from: 'Gaggal Airport', how: 'Closest airport (Kangra) — about two hours to Bir by taxi', time: '~2 hrs', dist: '70 km', code: 'DHM' },
  { from: 'Pathankot', how: 'Nearest major railway station — taxi, or the scenic toy train to Baijnath', time: '~3.5 hrs', dist: '145 km', code: 'PTK' },
];

export const packing = [
  'Closed-toe trainers or hiking shoes — no sandals or flip-flops',
  'Long trousers and a windproof layer; launch is chilly in every season',
  'Sunglasses and sunscreen',
  "A phone leash if you plan to film — or let the pilot's GoPro do it",
  'A light breakfast; skip the big meal right before you fly',
];

/* ---------------------------------------------------------------- gallery */
export const galleryCats = ['All', 'Flights', 'Launch & courses', 'Bir & culture', 'Mountains', 'Stays & camps', 'Treks'] as const;
export type GalleryCat = (typeof galleryCats)[number];

export const gallery: { src: string; cat: Exclude<GalleryCat, 'All'>; alt: string }[] = [
  { src: img('flight-cloud-sea'), cat: 'Flights', alt: 'Paragliders soaring above a sea of clouds at Bir' },
  { src: img('flight-sunset'), cat: 'Flights', alt: 'A paraglider silhouetted against the setting sun in Bir' },
  { src: img('tandem-red-wing'), cat: 'Flights', alt: 'Tandem flight under a red wing over the valley' },
  { src: img('flight-sunset-pair'), cat: 'Flights', alt: 'Two wings gliding at sunset' },
  { src: img('tandem-forest'), cat: 'Flights', alt: 'Tandem paraglider over forested hills' },
  { src: img('flight-gaggle'), cat: 'Flights', alt: 'A gaggle of paragliders above the ridge' },
  { src: img('flight-dhauladhar'), cat: 'Flights', alt: 'Paraglider in front of the snowy Dhauladhar' },
  { src: img('tandem-snow-peaks'), cat: 'Flights', alt: 'Tandem pilot and passenger against snow peaks' },
  { src: img('flight-over-bir'), cat: 'Flights', alt: 'Glider above Bir with clouds on the hills' },
  { src: img('flight-blue-ridge'), cat: 'Flights', alt: 'Paraglider high above a blue ridge line' },
  { src: img('flight-ridge'), cat: 'Flights', alt: 'Wing soaring over the Billing ridge' },
  { src: img('tandem-snow-sky'), cat: 'Flights', alt: 'Two tandem wings in a deep blue sky' },
  { src: img('glider-mist'), cat: 'Flights', alt: 'Glider launching into the morning mist' },
  { src: img('billing-launch-flags'), cat: 'Launch & courses', alt: 'Prayer flags and pilots at the Billing launch' },
  { src: img('takeoff-snow-peaks'), cat: 'Launch & courses', alt: 'Pilots preparing at the launch with snow peaks behind' },
  { src: img('takeoff-pilot'), cat: 'Launch & courses', alt: 'Pilot ready on the Billing take-off' },
  { src: img('takeoff-crew'), cat: 'Launch & courses', alt: 'Pilots and wings spread across the launch' },
  { src: img('launch-wings'), cat: 'Launch & courses', alt: 'Wings laid out ready for launch' },
  { src: img('billing-upper-takeoff'), cat: 'Launch & courses', alt: 'The upper take-off at Bir Billing' },
  { src: img('takeoff-dusk'), cat: 'Launch & courses', alt: 'Pilot on the ridge at dusk' },
  { src: img('landing-field'), cat: 'Launch & courses', alt: 'Crowd at the Bir landing field' },
  { src: img('chokling-monastery'), cat: 'Bir & culture', alt: 'Chokling Monastery in Bir' },
  { src: img('monks-billing'), cat: 'Bir & culture', alt: 'Tibetan monks with a red umbrella at Billing' },
  { src: img('bir-monastery-flags'), cat: 'Bir & culture', alt: 'Monastery and prayer flags in Bir' },
  { src: img('monastery-courtyard'), cat: 'Bir & culture', alt: 'Monastery courtyard in the Tibetan colony' },
  { src: img('monastery-gate'), cat: 'Bir & culture', alt: 'Ornate monastery gate in Bir' },
  { src: img('bir-street'), cat: 'Bir & culture', alt: 'A street in Bir village' },
  { src: img('prayer-flags'), cat: 'Bir & culture', alt: 'Tibetan prayer flags at Billing' },
  { src: img('tea-garden'), cat: 'Bir & culture', alt: 'Tea garden in the Kangra valley' },
  { src: img('tea-autumn'), cat: 'Bir & culture', alt: 'Tea estate in autumn light' },
  { src: img('bir-aerial'), cat: 'Bir & culture', alt: 'Aerial view of Bir and the Kangra valley' },
  { src: img('dhauladhar-alpenglow'), cat: 'Mountains', alt: 'Alpenglow on the Dhauladhar range' },
  { src: img('dhauladhar-naddi'), cat: 'Mountains', alt: 'Snow-capped Dhauladhar above green hills' },
  { src: img('dhauladhar-snow'), cat: 'Mountains', alt: 'Snow on the Dhauladhar range' },
  { src: img('dhauladhar-layers'), cat: 'Mountains', alt: 'Layered ridges of the Dhauladhar' },
  { src: img('dhauladhar-clouds'), cat: 'Mountains', alt: 'Clouds rolling over the Dhauladhar' },
  { src: img('valley-panorama'), cat: 'Mountains', alt: 'Panorama of the valley from Billing' },
  { src: img('bir-autumn-village'), cat: 'Mountains', alt: 'Village houses beneath autumn peaks' },
  { src: img('season-winter'), cat: 'Mountains', alt: 'Snow-covered Himalayan ridge and pine forest' },
  { src: img('stay-cottage'), cat: 'Stays & camps', alt: 'Wooden cottage room in Bir' },
  { src: img('stay-cottage-2'), cat: 'Stays & camps', alt: 'Cosy cottage interior' },
  { src: img('stay-machaan'), cat: 'Stays & camps', alt: 'Wooden machaan cottage' },
  { src: img('stay-glasshouse'), cat: 'Stays & camps', alt: 'Glass-house cottage in the forest' },
  { src: img('camp-machaan'), cat: 'Stays & camps', alt: 'Machaan tents in a garden camp' },
  { src: img('camp-himalaya'), cat: 'Stays & camps', alt: 'Tent pitched below a snowy peak' },
  { src: img('camp-triund'), cat: 'Stays & camps', alt: 'Tents on the Triund ridge' },
  { src: img('triund-night'), cat: 'Treks', alt: 'Triund ridge under a night sky' },
  { src: img('trek-cloud-sea'), cat: 'Treks', alt: 'Morning above the clouds at Triund' },
  { src: img('trek-triund-evening'), cat: 'Treks', alt: 'Evening light on the Triund trail' },
  { src: img('trek-hanumangarh'), cat: 'Treks', alt: 'Hanuman Garh trek above Bir Billing' },
  { src: img('trek-stream'), cat: 'Treks', alt: 'Mountain stream on a forest trail' },
];

/* ---------------------------------------------------------------- faq (original answers) */
export const faqs: { cat: string; q: string; a: string }[] = [
  { cat: 'General', q: 'When can I fly in Bir Billing?', a: 'The season runs from about mid-September to the end of June. Flying pauses for the monsoon, roughly 1 July to 15 September. October–November and March–May are the most dependable months.' },
  { cat: 'General', q: 'How do I reach Bir?', a: 'Most people take an overnight AC Volvo from Delhi (12–13 hours) or a cab from Chandigarh (about 8 hours). The nearest airport is Gaggal near Dharamshala, about 70 km away, and the nearest major railway station is Pathankot, around 145 km.' },
  { cat: 'General', q: 'How early should I book?', a: 'For weekends, holidays and the October and May peaks, book a few days to a week ahead — morning slots go first. On weekdays outside peak season, a day’s notice is usually enough.' },
  { cat: 'General', q: 'How does booking work?', a: 'Choose your flight, date and group size on the booking page and send it to us on WhatsApp. We confirm your slot, meeting point and timing in the same chat.' },
  { cat: 'General', q: 'Can you arrange my stay, camping or bus too?', a: 'Yes. Mention it in the same WhatsApp chat — rooms near the landing field, camps, treks or Volvo / taxi travel — and we’ll plan it around your flight.' },
  { cat: 'Tandem flights', q: 'Do I need any experience for a tandem flight?', a: 'None at all. Your licensed pilot sits behind you and controls the wing from launch to landing. You get a short briefing, take a few running steps, and then simply enjoy the ride.' },
  { cat: 'Tandem flights', q: 'Is tandem paragliding safe?', a: 'Bir Billing is one of the world’s most established flying sites. Tandem pilots are licensed, wings are certified and every pilot carries a reserve parachute. Weather is the real variable — so we only fly when conditions are right, and we’d always rather reschedule than push it.' },
  { cat: 'Tandem flights', q: 'How long will I be in the air?', a: 'It depends on the package and the day: around 18 minutes on the First Flight, about 25 on the Classic and roughly 50 on the Cross-Country tandem.' },
  { cat: 'Tandem flights', q: 'Are there age or weight limits?', a: 'As a general guide, passengers should be about 12 or older and between roughly 30 and 90 kg; children need a parent’s consent. If you’re near either limit, message us before booking and we’ll check with the pilot.' },
  { cat: 'Tandem flights', q: 'Will I get photos or video?', a: 'The Classic Tandem includes HD GoPro footage. On the other flights, just ask — pilots can usually film from a wing-mounted camera.' },
  { cat: 'Tandem flights', q: 'What happens if the weather is bad?', a: 'If the pilot decides conditions aren’t safe, your flight moves to the next suitable slot, or you can cancel as per our policy. The pilot’s safety call is final.' },
  { cat: 'Tandem flights', q: 'What should I wear?', a: 'Closed shoes, full-length trousers and a windproof jacket — it’s cool at launch even in summer. Add sunglasses, and keep breakfast light.' },
  { cat: 'Courses', q: 'Which course is right for a total beginner?', a: 'Start with the P1 + P2 Beginner Pilot Course. It covers ground handling and your first radio-guided solo flights. P3 then teaches thermalling and soaring, and P4 moves you into cross-country flying.' },
  { cat: 'Courses', q: 'How long does it take to learn?', a: 'The beginner course runs about six days. Weather can add a day or two, so leave some slack in your plans. P3 and P4 take roughly 8 and 12 days.' },
  { cat: 'Courses', q: 'Do I need my own equipment?', a: 'No — wing, harness, helmet and radio are provided during the course. Bring sturdy shoes, sun protection and clothes you can move in.' },
  { cat: 'Courses', q: 'How fit do I need to be?', a: 'Average fitness is enough. Expect to carry a pack and jog short uphill stretches during ground handling. Tell your instructor about any injuries or medical conditions before you start.' },
  { cat: 'Stays', q: 'Should I stay in Bir or Billing?', a: 'Stay in Bir. It’s where the landing field, cafés, monasteries and most guesthouses are. Billing is just the launch meadow, about 40 minutes uphill, with basic camps only.' },
  { cat: 'Stays', q: 'Can I leave luggage before my flight?', a: 'Usually, yes — most stays in Bir will hold bags before check-in. Ask us and we’ll sort it out with your host.' },
];
