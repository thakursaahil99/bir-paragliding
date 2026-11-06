/**
 * Supplementary, original content for the extended page sections.
 * Anything business-specific is marked PLACEHOLDER / Sample.
 */
const img = (n: string) => `/images/${n}.webp`;

/** SAMPLE reviews (clearly badged on the site). Replace with real guest reviews before launch. */
export const sampleReviews = [
  { quote: 'I was shaking at the launch and grinning by the second thermal. The run is three steps — then it is just silence and snow peaks.', who: 'Sample review', meta: 'Classic Tandem' },
  { quote: 'We booked the night before on WhatsApp, got a pickup time in minutes and flew the next morning. Zero fuss.', who: 'Sample review', meta: 'First Flight' },
  { quote: 'Fifty minutes of climbing and gliding along the ridge. Watching the pilot read the sky was half the fun.', who: 'Sample review', meta: 'Cross-Country' },
  { quote: 'Six days, a lot of kiting practice, and then my first solo flight with the instructor on the radio. Unreal.', who: 'Sample review', meta: 'P1 + P2 Course' },
  { quote: 'The GoPro footage is the best souvenir I have ever brought home. My parents watched it five times.', who: 'Sample review', meta: 'Classic Tandem' },
  { quote: 'Calm, patient pilot. He explained everything twice and the landing was a gentle jog onto the grass.', who: 'Sample review', meta: 'First Flight' },
  { quote: 'Flew in December — freezing at launch, crystal clear in the air. Wear the jacket they tell you to.', who: 'Sample review', meta: 'Classic Tandem' },
  { quote: 'Booked the flight, a machaan stay and the bus back to Delhi in one chat. Easiest trip I have planned.', who: 'Sample review', meta: 'Flight + stay' },
];

export const glossary = [
  { term: 'Thermal', def: 'A column of warm, rising air. Pilots circle inside it to gain height.' },
  { term: 'Launch', def: 'The take-off slope — at Bir, the Billing meadow at about 2,400 m.' },
  { term: 'Canopy', def: 'The fabric wing. Air fills its cells and gives it shape and lift.' },
  { term: 'Harness', def: 'The seat you sit in. On a tandem you are clipped in front of the pilot.' },
  { term: 'Reserve', def: 'A back-up parachute every pilot carries for emergencies.' },
  { term: 'Ridge lift', def: 'Wind pushed up a slope creates lift you can soar along.' },
  { term: 'Glide ratio', def: 'Distance travelled forward for each metre of height lost.' },
  { term: 'Flare', def: 'The final brake input that slows the wing for a soft landing.' },
  { term: 'Variometer', def: 'An instrument that beeps when you are climbing or sinking.' },
  { term: 'XC', def: 'Cross-country — flying a route away from the launch area.' },
];

export const gearParts = [
  { id: 'wing', label: 'Tandem wing', text: 'A larger, certified two-person canopy built for stability.', y: -150 },
  { id: 'lines', label: 'Suspension lines', text: 'Strong, thin lines that hold the wing’s shape and carry the load.', y: -70 },
  { id: 'risers', label: 'Risers & spreader bars', text: 'Connect pilot and passenger to the wing, side by side in balance.', y: 0 },
  { id: 'harness', label: 'Harnesses', text: 'Padded seats with back protection for both of you.', y: 70 },
  { id: 'reserve', label: 'Reserve parachute', text: 'Packed into the pilot’s harness — carried on every flight.', y: 140 },
];

export const itinerary = [
  {
    day: 'Day 1',
    title: 'Arrive, settle, wander',
    color: ['#1b326b', '#ff9f68'],
    slots: [
      { t: '07:30', text: 'Overnight Volvo rolls into Bir / Baijnath' },
      { t: '11:00', text: 'Check in near the landing field, breakfast at a café' },
      { t: '16:00', text: 'Walk the Tibetan colony and Chokling Monastery' },
      { t: '18:30', text: 'Sunset at the landing field, watch the last wings come in' },
    ],
  },
  {
    day: 'Day 2',
    title: 'Flight day',
    color: ['#0f56d4', '#c4e4ff'],
    slots: [
      { t: '08:30', text: 'Drive up to the Billing launch for a morning slot' },
      { t: '09:30', text: 'Briefing, run, lift — your tandem flight' },
      { t: '13:00', text: 'Lunch and tea-garden stroll' },
      { t: '19:00', text: 'Rewatch your GoPro footage over dinner' },
    ],
  },
  {
    day: 'Day 3',
    title: 'Trails & the road home',
    color: ['#26306c', '#ffad5a'],
    slots: [
      { t: '07:00', text: 'Morning walk to Gunehar and the waterfall' },
      { t: '12:00', text: 'Momos and a last café stop' },
      { t: '16:00', text: 'Pick up souvenirs in the colony' },
      { t: '19:30', text: 'Overnight Volvo back to Delhi' },
    ],
  },
];

/** Approximate Triund trail profile (popular day hike near Dharamshala). */
export const triund = [
  { km: 0, m: 2080, label: 'Dharamkot' },
  { km: 2.5, m: 2350, label: 'Galu Devi temple' },
  { km: 5.5, m: 2620, label: 'Mid-trail café' },
  { km: 7.5, m: 2780, label: 'Last switchbacks' },
  { km: 9, m: 2850, label: 'Triund top' },
];

export const tips = [
  { title: 'Walk clockwise', text: 'Circle stupas and prayer wheels clockwise in the monasteries.' },
  { title: 'Ask before photos', text: 'Monks and families are happy to chat — ask before you take a portrait.' },
  { title: 'Carry cash', text: 'Small cafés and taxis often prefer cash; ATMs can be few.' },
  { title: 'Book mornings', text: 'Morning air is calmer — the best slot for a first flight.' },
  { title: 'Layer up', text: 'Launch is 1,000 m higher than Bir and noticeably colder.' },
  { title: 'Leave no trace', text: 'Pack out your rubbish on treks and at the launch.' },
];

export const stays = [
  { title: 'Wooden cottages', text: 'Pine-panelled rooms a short walk from the landing field.', image: img('stay-cottage') },
  { title: 'Glass-house stays', text: 'Wake up to the forest and the ridge through the walls.', image: img('stay-glasshouse') },
  { title: 'Machaan nights', text: 'Raised treehouse-style tents with a bonfire after dark.', image: img('camp-machaan') },
  { title: 'Ridge camping', text: 'Tents under the Dhauladhar for clear, starry nights.', image: img('camp-triund') },
];

export const cafes = [
  { title: 'Tea gardens', note: 'Kangra green tea, picked minutes away', image: img('tea-garden') },
  { title: 'Monastery mornings', note: 'Prayer wheels and butter-lamp light', image: img('bir-monastery-flags') },
  { title: 'Colony lanes', note: 'Momos, thukpa and bakery stops', image: img('bir-street') },
  { title: 'Courtyard calm', note: 'Quiet corners between the gompas', image: img('monastery-courtyard') },
  { title: 'Autumn tea', note: 'Golden light over the estates', image: img('tea-autumn') },
];

export const bookingSteps = [
  { n: '01', title: 'Pick & send', text: 'Choose a flight or course, a date and group size — then send it on WhatsApp.' },
  { n: '02', title: 'We confirm', text: 'We check the pilot schedule and the forecast and confirm your slot and meeting point.' },
  { n: '03', title: 'Show up & fly', text: 'Meet us at the agreed time. Your pilot handles the wing — you enjoy the view.' },
];

export const chat = [
  { from: 'you', text: 'Hi! Can we fly this Saturday? 2 people, Classic Tandem.' },
  { from: 'us', text: 'Hi! Saturday looks good. Morning slot works best for smooth air. Shall we hold it for 2?' },
  { from: 'you', text: 'Yes please! Is the GoPro video included?' },
  { from: 'us', text: 'Yes — HD GoPro footage is included with the Classic Tandem. We’ll send the meeting point and time here.' },
];

export const meetingPoints = [
  { title: 'Bir landing field', alt: '~1,400 m', text: 'Where flights end — and a common meeting point. Exact spot confirmed on WhatsApp.', image: img('landing-field') },
  { title: 'Billing launch', alt: '~2,400 m', text: 'The take-off meadow, about 40 minutes by road above Bir.', image: img('billing-launch-flags') },
  { title: 'Tibetan colony', alt: 'Chowgan', text: 'Cafés, monasteries and most guesthouses — a short ride from the field.', image: img('chokling-monastery') },
];

export const quickTemplates = [
  'Hi! Is there a slot this weekend?',
  'What is the weight limit for a tandem?',
  'Can you book my Volvo from Delhi too?',
  'I want to start the P1 + P2 course.',
];

export const myths = [
  { myth: 'You need to be super fit.', fact: 'For a tandem, a few running steps is all it takes.' },
  { myth: 'You steer the wing.', fact: 'On a tandem, the licensed pilot flies — you enjoy the view.' },
  { myth: 'It is like a rollercoaster.', fact: 'Most of a tandem is calm, quiet gliding. Ask for gentle and you get gentle.' },
  { myth: 'Flights go ahead in any weather.', fact: 'Pilots only fly in suitable conditions — rescheduling is normal.' },
  { myth: 'Bir is only for paragliding.', fact: 'Monasteries, tea gardens, treks and cafés fill the days around a flight.' },
];

export const included = [
  { icon: 'pilot', label: 'Licensed pilot' },
  { icon: 'wing', label: 'Certified tandem wing' },
  { icon: 'reserve', label: 'Reserve parachute' },
  { icon: 'helmet', label: 'Helmet & harness' },
  { icon: 'brief', label: 'Safety briefing' },
  { icon: 'camera', label: 'GoPro (Classic)' },
];

export const flyability = [
  { m: 'Jan', v: 0.62 },
  { m: 'Feb', v: 0.66 },
  { m: 'Mar', v: 0.86 },
  { m: 'Apr', v: 0.92 },
  { m: 'May', v: 0.9 },
  { m: 'Jun', v: 0.7 },
  { m: 'Jul', v: 0 },
  { m: 'Aug', v: 0 },
  { m: 'Sep', v: 0.45 },
  { m: 'Oct', v: 1 },
  { m: 'Nov', v: 0.95 },
  { m: 'Dec', v: 0.68 },
];

export const blogQuote = {
  text: 'You don’t need to be brave to fly Bir. You need closed shoes, a light breakfast and three steps of running.',
  by: 'The Bir Paragliding Flight Log',
};
