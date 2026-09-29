import { VENDOR_IMAGES, portfolioSet } from './images';

/**
 * VENDOR DATA
 * -----------
 * Two kinds of record live here, and the difference is the most important thing
 * in this file:
 *
 *   SUPPLIED  (`source: true`)  — the nine vendors named in the source document.
 *                                 `facts` is the source of truth. Never edit it.
 *   SAMPLE    (`sample: true`)  — invented listings added so the demo has enough
 *                                 content to browse. The *whole record* is
 *                                 fictional, including the business name, and
 *                                 every surface labels it "Sample listing".
 *
 * Within a supplied vendor:
 *   `facts` = from the source document.
 *   `demo`  = placeholder UI values (rating, reviewCount, startingPrice,
 *             verified, services, reviews, portfolio, availability). NOT
 *             verified. Every surface that renders a `demo.*` field flags it
 *             via the <DemoTag /> component.
 *
 * `eventCount: null` means "Not supplied" in the source document. Never invent one.
 *
 * The supplied vendors' `demo.description` is *derived from their own facts* by
 * `factualSummary()` below rather than written by hand, so no marketing claim is
 * attributed to a real business that did not make it (spec §38).
 */

export const DEMO_NOTICE = 'Demo placeholder — not a verified fact about this vendor.';

export const SAMPLE_NOTICE =
  'Sample listing — an invented vendor used to populate the demo. Not a real business.';

/** Availability states shown on cards and profiles. All are demo values. */
export const AVAILABILITY = {
  open: 'Available',
  limited: 'Few dates left',
  busy: 'Booked this month',
};

/** Reusable demo review seeds so we do not fabricate distinct testimonials. */
const demoReviews = (entries) =>
  entries.map(([author, rating, text]) => ({ author, rating, text, demo: true }));

const PLACEHOLDER_REVIEW = 'Placeholder review text used to demonstrate the reviews layout.';

/**
 * Builds a supplied vendor's profile copy out of its own recorded facts.
 * Nothing here is asserted that the source document did not state.
 */
const factualSummary = (facts, location) => {
  const experience = facts.experienceLabel ?? `${facts.experienceYears} years`;
  const scale = facts.eventCountLabel
    ? ` The listing records ${facts.eventCountLabel}.`
    : ' The source did not supply an event count for this vendor.';
  return (
    `${facts.name} is listed under ${facts.category} in ${location}, ` +
    `with ${experience} of experience and a stated specialty of ` +
    `${facts.specialty.toLowerCase()}.${scale}`
  );
};

/* ------------------------------------------------- vendors from the source */

const SUPPLIED = [
  {
    id: 'dhruva-events-decors',
    facts: {
      name: 'DHRUVA EVENTS & DECORS',
      category: 'Decorators',
      experienceYears: 8,
      eventCount: 150,
      eventCountLabel: '150+ events',
      specialty: 'Wedding & celebration decor',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.8,
      reviewCount: 120,
      startingPrice: 45000,
      priceUnit: 'event',
      verified: true,
      availability: AVAILABILITY.limited,
      portfolio: 'weddingDecor',
      services: ['Stage & mandap decor', 'Floral installations', 'Lighting design', 'Entrance arches'],
      reviews: demoReviews([
        ['Sample reviewer A', 5, PLACEHOLDER_REVIEW],
        ['Sample reviewer B', 4, PLACEHOLDER_REVIEW],
      ]),
    },
  },
  {
    id: 'seasons-entertainers',
    facts: {
      name: 'Seasons entertainers',
      category: 'Decorators',
      experienceYears: 7,
      eventCount: 100,
      eventCountLabel: '100+ events',
      specialty: 'Entertainment & event setups',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.6,
      reviewCount: 95,
      startingPrice: 38000,
      priceUnit: 'event',
      verified: true,
      availability: AVAILABILITY.open,
      portfolio: 'entertainment',
      services: ['Live music acts', 'Stage & sound setup', 'Anchoring', 'Themed event decor'],
      reviews: demoReviews([['Sample reviewer A', 5, PLACEHOLDER_REVIEW]]),
    },
  },
  {
    id: 'sri-mallikarjuna-flower-decoration',
    facts: {
      name: "Sri mallikarjuna flower decoration's",
      category: 'Decorators',
      experienceYears: 11,
      eventCount: 200,
      eventCountLabel: '200+ decors',
      specialty: 'Fresh flower decoration',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.7,
      reviewCount: 110,
      startingPrice: 32000,
      priceUnit: 'event',
      verified: true,
      availability: AVAILABILITY.open,
      portfolio: 'freshFlowers',
      services: ['Fresh flower mandap', 'Car & entrance decor', 'Garlands', 'Temple-style arrangements'],
      reviews: demoReviews([['Sample reviewer A', 5, PLACEHOLDER_REVIEW]]),
    },
  },
  {
    id: 'sln-decorators',
    facts: {
      name: 'SLN decorators',
      category: 'Decorators',
      experienceYears: 25,
      eventCount: 500,
      eventCountLabel: '500+ events',
      specialty: 'Large-scale event decoration',
    },
    location: 'Hyderabad',
    demo: {
      rating: 2.8,
      reviewCount: 180,
      startingPrice: 60000,
      priceUnit: 'event',
      verified: false,
      availability: AVAILABILITY.open,
      portfolio: 'largeScaleDecor',
      services: ['Large-venue draping', 'Convention & banquet setups', 'Structural staging', 'Crowd-scale lighting'],
      reviews: demoReviews([['Sample reviewer A', 3, PLACEHOLDER_REVIEW]]),
    },
  },
  {
    id: 'amogham-caterers-narasimha',
    facts: {
      name: 'Amogham caterers by Narasimha',
      category: 'Catering',
      experienceYears: 25,
      eventCount: null,
      eventCountLabel: null,
      specialty: 'Veg & non-veg; South Indian',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.7,
      reviewCount: 160,
      startingPrice: 650,
      priceUnit: 'plate',
      verified: true,
      availability: AVAILABILITY.limited,
      portfolio: 'cateringMixed',
      services: ['South Indian menus', 'Veg & non-veg counters', 'Live counters', 'Service staff'],
      reviews: demoReviews([['Sample reviewer A', 5, PLACEHOLDER_REVIEW]]),
    },
  },
  {
    id: 'savyasachi-caterers',
    facts: {
      name: 'Savyasachi caterers',
      category: 'Catering',
      experienceYears: 10,
      eventCount: null,
      eventCountLabel: null,
      specialty: 'Veg & non-veg; South Indian',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.5,
      reviewCount: 88,
      startingPrice: 550,
      priceUnit: 'plate',
      verified: true,
      availability: AVAILABILITY.open,
      portfolio: 'cateringMixed',
      services: ['South Indian menus', 'Veg & non-veg counters', 'Buffet service', 'Custom menus'],
      reviews: demoReviews([['Sample reviewer A', 4, PLACEHOLDER_REVIEW]]),
    },
  },
  {
    id: 'ashta-lakshmi-catering',
    facts: {
      name: 'Ashta Lakshmi catering',
      category: 'Catering',
      experienceYears: 12,
      eventCount: null,
      eventCountLabel: null,
      specialty: 'Pure veg; South Indian recipes',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.6,
      reviewCount: 74,
      startingPrice: 480,
      priceUnit: 'plate',
      verified: true,
      availability: AVAILABILITY.open,
      // Pure veg vendor — vegetarian photography only.
      portfolio: 'cateringPureVeg',
      services: ['Pure veg menus', 'Traditional South Indian recipes', 'Festive thalis', 'Sweets counter'],
      reviews: demoReviews([['Sample reviewer A', 5, PLACEHOLDER_REVIEW]]),
    },
  },
  {
    id: 'sri-matha-catering',
    facts: {
      name: 'Sri Matha catering',
      category: 'Catering',
      experienceYears: 17,
      eventCount: null,
      eventCountLabel: null,
      specialty: 'Veg & non-veg; South Indian',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.4,
      reviewCount: 102,
      startingPrice: 600,
      priceUnit: 'plate',
      verified: false,
      availability: AVAILABILITY.busy,
      portfolio: 'cateringMixed',
      services: ['South Indian menus', 'Veg & non-veg counters', 'Breakfast catering', 'Service staff'],
      reviews: demoReviews([['Sample reviewer A', 4, PLACEHOLDER_REVIEW]]),
    },
  },
  {
    id: 'laxmi-chandra-caterers',
    facts: {
      name: 'Laxmi Chandra caterers',
      category: 'Catering',
      experienceYears: 30,
      experienceLabel: '30+ years',
      eventCount: null,
      eventCountLabel: null,
      specialty: 'Veg & non-veg; South & North Indian',
    },
    location: 'Hyderabad',
    demo: {
      rating: 4.8,
      reviewCount: 210,
      startingPrice: 700,
      priceUnit: 'plate',
      verified: true,
      availability: AVAILABILITY.open,
      portfolio: 'cateringMixed',
      services: ['South & North Indian menus', 'Veg & non-veg counters', 'Live counters', 'Large-event catering'],
      reviews: demoReviews([['Sample reviewer A', 5, PLACEHOLDER_REVIEW]]),
    },
  },
].map((vendor) => ({
  ...vendor,
  source: true,
  sample: false,
  image: VENDOR_IMAGES[vendor.id],
  demo: {
    ...vendor.demo,
    description: factualSummary(vendor.facts, vendor.location),
    portfolioImages: portfolioSet(vendor.demo.portfolio),
  },
}));

/* ------------------------------------------------------- sample listings */

/**
 * Builder for the invented listings. Keeping them in one shape means the
 * "sample" flag can never be forgotten on an individual record.
 */
const sample = ({
  id,
  name,
  category,
  years,
  events,
  eventsLabel,
  specialty,
  city = 'Hyderabad',
  description,
  services,
  portfolio,
  price,
  unit = 'event',
  rating,
  reviewCount,
  availability = AVAILABILITY.open,
  reviews,
}) => ({
  id,
  source: false,
  sample: true,
  facts: {
    name,
    category,
    experienceYears: years,
    eventCount: events,
    eventCountLabel: eventsLabel,
    specialty,
  },
  location: city,
  image: VENDOR_IMAGES[id],
  demo: {
    rating,
    reviewCount,
    startingPrice: price,
    priceUnit: unit,
    // No invented listing is ever marked verified, in the demo or anywhere else.
    verified: false,
    availability,
    portfolio,
    portfolioImages: portfolioSet(portfolio),
    description,
    services,
    reviews: demoReviews(reviews),
  },
});

const SAMPLES = [
  /* ------------------------------------------------- wedding decoration */
  sample({
    id: 'aakriti-wedding-decor',
    name: 'Aakriti Wedding Decor',
    category: 'Decorators',
    years: 9,
    events: 180,
    eventsLabel: '180+ events',
    specialty: 'Theme weddings & mandap design',
    description:
      'Builds the whole ceremony look from one idea — mandap, entrance, stage and seating styled to a single palette. Handles both indoor halls and open-air lawns.',
    services: ['Theme mandap design', 'Entrance & pathway decor', 'Stage backdrops', 'Seating & table styling'],
    portfolio: 'weddingDecor',
    price: 52000,
    rating: 4.7,
    reviewCount: 86,
    reviews: [
      ['Keerthi R.', 5, 'The mandap looked exactly like the drawing they showed us a month earlier.'],
      ['Nikhil P.', 4, 'Setup finished well before the muhurtham. Lighting was the standout.'],
    ],
  }),
  sample({
    id: 'vrindavan-mandap-creations',
    name: 'Vrindavan Mandap Creations',
    category: 'Decorators',
    years: 14,
    events: 260,
    eventsLabel: '260+ events',
    specialty: 'Traditional mandap & temple-style decor',
    description:
      'Traditional South Indian ceremony decor — carved mandap frames, banana stems, kalash arrangements and temple-style entrances.',
    services: ['Carved mandap frames', 'Kalash & banana stem setups', 'Temple-style entrances', 'Kalyana vedika decor'],
    portfolio: 'weddingDecor',
    price: 48000,
    rating: 4.6,
    reviewCount: 132,
    availability: AVAILABILITY.limited,
    reviews: [
      ['Sailaja M.', 5, 'They knew every ritual requirement without being told. Very reassuring.'],
      ['Ravi Teja K.', 4, 'Traditional work done properly. Would have liked more lighting options.'],
    ],
  }),
  sample({
    id: 'blue-lotus-event-styling',
    name: 'Blue Lotus Event Styling',
    category: 'Decorators',
    years: 6,
    events: 90,
    eventsLabel: '90+ events',
    specialty: 'Minimal & pastel reception styling',
    description:
      'Pared-back reception styling in pastels and soft neutrals — long tables, candle runners and a single statement backdrop.',
    services: ['Reception backdrops', 'Table runners & centrepieces', 'Candle & ambient lighting', 'Photo corners'],
    portfolio: 'receptionStyling',
    price: 36000,
    rating: 4.5,
    reviewCount: 54,
    reviews: [
      ['Anusha V.', 5, 'Simple and elegant, which is exactly what we asked for.'],
      ['Harish B.', 4, 'Good eye for colour. Responsive on WhatsApp throughout.'],
    ],
  }),
  sample({
    id: 'meraki-drapes-and-lights',
    name: 'Meraki Drapes & Lights',
    category: 'Decorators',
    years: 5,
    events: 70,
    eventsLabel: '70+ events',
    specialty: 'Draping, lighting & entrance arches',
    description:
      'Drape and light specialists brought in alongside a main decorator, or on their own for smaller functions and haldi events.',
    services: ['Ceiling & wall draping', 'Fairy & uplighting', 'Entrance arches', 'Haldi & mehendi setups'],
    portfolio: 'largeScaleDecor',
    price: 28000,
    rating: 4.4,
    reviewCount: 41,
    reviews: [
      ['Pooja S.', 4, 'Transformed a plain function hall in about four hours.'],
      ['Imran Q.', 5, 'Fair pricing and they cleared out quickly afterwards.'],
    ],
  }),

  /* ------------------------------------------------------------ florists */
  sample({
    id: 'sreenidhi-fresh-flowers',
    name: 'Sreenidhi Fresh Flowers',
    category: 'Florists',
    years: 13,
    events: 300,
    eventsLabel: '300+ decors',
    specialty: 'Fresh flower mandap, garlands & car decor',
    description:
      'Fresh flower work sourced the morning of the event — mandap, garlands, car decor and pooja arrangements.',
    services: ['Fresh flower mandap', 'Varmala & garlands', 'Car decoration', 'Pooja arrangements'],
    portfolio: 'freshFlowers',
    price: 24000,
    rating: 4.8,
    reviewCount: 148,
    reviews: [
      ['Lakshmi N.', 5, 'Flowers were still cold from the market when they arrived. Lasted all day.'],
      ['Vinay C.', 5, 'The varmalas were beautiful and they carried spares, which we needed.'],
    ],
  }),
  sample({
    id: 'pushpanjali-florists',
    name: 'Pushpanjali Florists',
    category: 'Florists',
    years: 8,
    events: 140,
    eventsLabel: '140+ decors',
    specialty: 'Jasmine & rose arrangements',
    description:
      'Jasmine, rose and marigold arrangements for engagements, housewarmings and smaller ceremonies.',
    services: ['Jasmine strings', 'Rose & marigold arrangements', 'Doorway torans', 'Engagement stage flowers'],
    portfolio: 'freshFlowers',
    price: 18000,
    rating: 4.5,
    reviewCount: 63,
    city: 'Vijayawada',
    availability: AVAILABILITY.limited,
    reviews: [
      ['Madhavi T.', 5, 'The jasmine smell filled the whole hall. Lovely.'],
      ['Srikanth D.', 4, 'Slightly late arriving but the work itself was good.'],
    ],
  }),

  /* ------------------------------------------------------------ catering */
  sample({
    id: 'godavari-ruchulu-catering',
    name: 'Godavari Ruchulu Catering',
    category: 'Catering',
    years: 16,
    events: 400,
    eventsLabel: '400+ events',
    specialty: 'Pure veg; Andhra & Telangana thali',
    description:
      'Pure vegetarian Andhra and Telangana cooking — gongura, pappu, pulihora and a full festive thali, served by their own staff.',
    services: ['Andhra thali menus', 'Pure veg buffet', 'Sweets & pickles counter', 'Service staff'],
    // Pure veg listing — vegetarian photography only.
    portfolio: 'cateringPureVeg',
    price: 520,
    unit: 'plate',
    rating: 4.7,
    reviewCount: 176,
    reviews: [
      ['Padma J.', 5, 'The gongura pappu was the thing everyone asked about afterwards.'],
      ['Chandra M.', 4, 'Generous portions and no shortage even with extra guests.'],
    ],
  }),
  sample({
    id: 'nizami-dawat-caterers',
    name: 'Nizami Dawat Caterers',
    category: 'Catering',
    years: 21,
    events: 350,
    eventsLabel: '350+ events',
    specialty: 'Veg & non-veg; Hyderabadi biryani & dum dishes',
    description:
      'Hyderabadi dawat menus with dum biryani cooked on site, plus a separate vegetarian counter kept apart from the non-veg line.',
    services: ['Dum biryani on site', 'Separate veg counter', 'Haleem & kebabs', 'Mehendi & walima catering'],
    portfolio: 'cateringMixed',
    price: 780,
    unit: 'plate',
    rating: 4.8,
    reviewCount: 224,
    availability: AVAILABILITY.busy,
    reviews: [
      ['Zainab A.', 5, 'Biryani cooked in front of the guests. Worth every rupee.'],
      ['Faisal R.', 5, 'Veg and non-veg kept properly separate, which mattered to our family.'],
    ],
  }),
  sample({
    id: 'annapurna-bhojanam',
    name: 'Annapurna Bhojanam',
    category: 'Catering',
    years: 9,
    events: 210,
    eventsLabel: '210+ events',
    specialty: 'Pure veg; South Indian meals & tiffin',
    description:
      'Pure vegetarian South Indian meals and tiffin for weddings, satyanarayana vratams and housewarmings.',
    services: ['Pure veg meals', 'Tiffin counters', 'Filter coffee station', 'Festive sweets'],
    // Pure veg listing — vegetarian photography only.
    portfolio: 'cateringPureVeg',
    price: 450,
    unit: 'plate',
    rating: 4.4,
    reviewCount: 97,
    city: 'Bengaluru',
    reviews: [
      ['Shruti K.', 4, 'Clean, simple food. The filter coffee counter was busy all morning.'],
      ['Ganesh I.', 5, 'Handled a 400-guest vratam without a single complaint.'],
    ],
  }),
  sample({
    id: 'spice-route-live-counters',
    name: 'Spice Route Live Counters',
    category: 'Catering',
    years: 7,
    events: 160,
    eventsLabel: '160+ events',
    specialty: 'Veg & non-veg; live counters & fusion menus',
    description:
      'Live-counter catering — chaat, pasta, grill and dessert stations built for receptions and corporate evenings.',
    services: ['Live chaat & grill counters', 'Fusion menus', 'Dessert station', 'Mocktail bar'],
    portfolio: 'cateringMixed',
    price: 690,
    unit: 'plate',
    rating: 4.3,
    reviewCount: 72,
    reviews: [
      ['Deepika S.', 4, 'The chaat counter had a queue all evening. Good problem to have.'],
      ['Arvind L.', 4, 'Modern menu that still had enough for the older guests.'],
    ],
  }),
  sample({
    id: 'tirumala-tiffin-caterers',
    name: 'Tirumala Tiffin Caterers',
    category: 'Catering',
    years: 19,
    events: 480,
    eventsLabel: '480+ events',
    specialty: 'Pure veg; breakfast & tiffin catering',
    description:
      'Morning-function specialists: idli, dosa, pongal and vada served hot from live counters for muhurtham and pooja mornings.',
    services: ['Live dosa & idli counters', 'Pongal & vada', 'Filter coffee & tea', 'Early-morning service'],
    // Pure veg listing — vegetarian photography only.
    portfolio: 'cateringBreakfast',
    price: 260,
    unit: 'plate',
    rating: 4.6,
    reviewCount: 138,
    reviews: [
      ['Usha P.', 5, 'On site from 4am without us having to chase them.'],
      ['Mohan Rao G.', 4, 'Hot dosas straight off the pan for two hours straight.'],
    ],
  }),

  /* -------------------------------------------------- event entertainment */
  sample({
    id: 'rhythm-roots-event-crew',
    name: 'Rhythm Roots Event Crew',
    category: 'Entertainment',
    years: 10,
    events: 220,
    eventsLabel: '220+ shows',
    specialty: 'Anchoring, stage games & sangeet coordination',
    description:
      'Anchors and stage coordinators who run the sangeet — games, family performances, cue sheets and the running order on the night.',
    services: ['Bilingual anchoring', 'Sangeet choreography support', 'Stage games', 'Run-of-show coordination'],
    portfolio: 'entertainment',
    price: 35000,
    rating: 4.5,
    reviewCount: 88,
    reviews: [
      ['Swetha R.', 5, 'The anchor kept everyone involved without being loud about it.'],
      ['Kiran V.', 4, 'Handled a last-minute change in the performance order calmly.'],
    ],
  }),
  sample({
    id: 'nrityanjali-performing-arts',
    name: 'Nrityanjali Performing Arts',
    category: 'Entertainment',
    years: 15,
    events: 280,
    eventsLabel: '280+ shows',
    specialty: 'Classical & folk dance troupes',
    description:
      'Kuchipudi, Bharatanatyam and Telangana folk troupes for wedding receptions, corporate cultural evenings and festivals.',
    services: ['Kuchipudi & Bharatanatyam', 'Telangana folk troupes', 'Welcome dance', 'Live percussion'],
    portfolio: 'entertainment',
    price: 42000,
    rating: 4.7,
    reviewCount: 116,
    availability: AVAILABILITY.limited,
    reviews: [
      ['Sridevi B.', 5, 'The welcome dance set the tone for the whole reception.'],
      ['Prakash N.', 5, 'Professional troupe, arrived early and rehearsed on the actual stage.'],
    ],
  }),

  /* ----------------------------------------------------------------- DJs */
  sample({
    id: 'dj-vibe-hyderabad',
    name: 'DJ Vibe Hyderabad',
    category: 'DJs',
    years: 8,
    events: 400,
    eventsLabel: '400+ nights',
    specialty: 'Sangeet, reception & club sets',
    description:
      'Wedding DJ covering sangeet and reception sets — Telugu, Hindi and English, with a requested-songs list agreed beforehand.',
    services: ['Sangeet & reception sets', 'Requested playlist', 'Wireless mics', 'Dance-floor lighting'],
    portfolio: 'entertainment',
    price: 30000,
    rating: 4.6,
    reviewCount: 205,
    reviews: [
      ['Rahul S.', 5, 'Read the room well and kept the older relatives dancing too.'],
      ['Meghana T.', 4, 'Played our full request list. Volume stayed sensible.'],
    ],
  }),
  sample({
    id: 'beatbox-sound-and-light',
    name: 'Beatbox Sound & Light',
    category: 'DJs',
    years: 6,
    events: 250,
    eventsLabel: '250+ nights',
    specialty: 'DJ console with sound & lighting rigs',
    description:
      'Sound and light rental with a DJ included — line arrays, trussing and moving heads sized to the hall.',
    services: ['Line array sound', 'Moving-head lighting', 'DJ console', 'On-site technician'],
    portfolio: 'entertainment',
    price: 26000,
    rating: 4.3,
    reviewCount: 91,
    reviews: [
      ['Naveen A.', 4, 'Clear sound at the back of a very large hall.'],
      ['Ritu M.', 4, 'Technician stayed the whole night, which saved us twice.'],
    ],
  }),

  /* ---------------------------------------------------------- live bands */
  sample({
    id: 'deccan-live-band',
    name: 'Deccan Live Band',
    category: 'Live Bands',
    years: 12,
    events: 190,
    eventsLabel: '190+ shows',
    specialty: 'Live band for sangeet & receptions',
    description:
      'Seven-piece live band playing Telugu and Hindi film music, with an acoustic set for the earlier part of the evening.',
    services: ['Seven-piece live band', 'Acoustic dinner set', 'Vocalists in three languages', 'Own sound engineer'],
    portfolio: 'liveBand',
    price: 65000,
    rating: 4.7,
    reviewCount: 78,
    availability: AVAILABILITY.limited,
    reviews: [
      ['Yashwanth K.', 5, 'The acoustic set during dinner was the best part of the evening.'],
      ['Divya H.', 4, 'Learned two songs we asked for specially.'],
    ],
  }),
  sample({
    id: 'swaralaya-music-ensemble',
    name: 'Swaralaya Music Ensemble',
    category: 'Live Bands',
    years: 18,
    events: 320,
    eventsLabel: '320+ shows',
    specialty: 'Carnatic & light music ensemble',
    description:
      'Carnatic and light music ensemble for muhurtham mornings, nadaswaram processions and temple functions.',
    services: ['Nadaswaram & thavil', 'Carnatic vocal ensemble', 'Light music set', 'Muhurtham accompaniment'],
    portfolio: 'liveBand',
    price: 55000,
    rating: 4.8,
    reviewCount: 134,
    city: 'Chennai',
    reviews: [
      ['Janaki S.', 5, 'The nadaswaram during the muhurtham was exactly right.'],
      ['Balaji V.', 5, 'Serious musicians. Punctual and respectful of the rituals.'],
    ],
  }),

  /* ---------------------------------------------------- birthday parties */
  sample({
    id: 'little-star-birthday-planners',
    name: 'Little Star Birthday Planners',
    category: 'Birthday Parties',
    years: 7,
    events: 500,
    eventsLabel: '500+ parties',
    specialty: "Kids' theme parties & balloon decor",
    description:
      "Children's birthday parties end to end — theme decor, balloon arches, games host, cake table and return gifts.",
    services: ['Theme balloon decor', 'Games host', 'Cake table styling', 'Return gift packs'],
    portfolio: 'birthday',
    price: 18000,
    rating: 4.6,
    reviewCount: 162,
    reviews: [
      ['Sneha D.', 5, 'Kept twenty five children entertained for three hours. Miraculous.'],
      ['Ajay P.', 4, 'Balloon arch was up in half an hour and looked great in photos.'],
    ],
  }),
  sample({
    id: 'confetti-kids-events',
    name: 'Confetti Kids Events',
    category: 'Birthday Parties',
    years: 4,
    events: 180,
    eventsLabel: '180+ parties',
    specialty: 'Cake tables, games & character visits',
    description:
      'Smaller-scale birthday setups for apartment clubhouses and homes, including costumed character visits.',
    services: ['Cake table setup', 'Character visits', 'Party games', 'Photo backdrop'],
    portfolio: 'birthday',
    price: 14000,
    rating: 4.2,
    reviewCount: 58,
    reviews: [
      ['Farah S.', 4, 'Good value for a clubhouse party. The character visit was a hit.'],
      ['Rohit G.', 4, 'Straightforward to book and they cleaned up afterwards.'],
    ],
  }),

  /* -------------------------------------------------------- return gifts */
  sample({
    id: 'thamboolam-return-gifts',
    name: 'Thamboolam Return Gifts',
    category: 'Return Gifts',
    years: 11,
    events: 600,
    eventsLabel: '600+ orders',
    specialty: 'Traditional return gift hampers',
    description:
      'Traditional thamboolam bags and hampers — blouse pieces, dry fruits, brass items and sweets, packed to a chosen budget per guest.',
    services: ['Thamboolam bags', 'Brass & silver items', 'Dry fruit boxes', 'Bulk packing & delivery'],
    portfolio: 'gifting',
    price: 180,
    unit: 'guest',
    rating: 4.5,
    reviewCount: 143,
    reviews: [
      ['Vasantha R.', 5, 'Packed 350 bags exactly to the budget we set.'],
      ['Suresh K.', 4, 'Delivered a day early, which made the morning much easier.'],
    ],
  }),
  sample({
    id: 'giftwala-curations',
    name: 'Giftwala Curations',
    category: 'Return Gifts',
    years: 5,
    events: 220,
    eventsLabel: '220+ orders',
    specialty: 'Custom hampers & favour boxes',
    description:
      'Contemporary favour boxes and hampers with printed tags, aimed at receptions and corporate gifting.',
    services: ['Custom favour boxes', 'Printed tags & cards', 'Corporate hampers', 'Courier to guests'],
    portfolio: 'gifting',
    price: 240,
    unit: 'guest',
    rating: 4.3,
    reviewCount: 67,
    city: 'Bengaluru',
    reviews: [
      ['Tanvi J.', 4, 'The printed tags with our names were a nice touch.'],
      ['Manoj B.', 4, 'Handled a corporate order of 200 boxes without fuss.'],
    ],
  }),

  /* ----------------------------------------------------- corporate events */
  sample({
    id: 'meridian-corporate-events',
    name: 'Meridian Corporate Events',
    category: 'Corporate Events',
    years: 13,
    events: 240,
    eventsLabel: '240+ events',
    specialty: 'Conferences, town halls & team offsites',
    description:
      'Corporate event management — conferences, all-hands, product launches and offsites, including venue sourcing and vendor coordination.',
    services: ['Conference production', 'Town halls & all-hands', 'Offsite planning', 'Vendor coordination'],
    portfolio: 'corporate',
    price: 95000,
    rating: 4.6,
    reviewCount: 84,
    reviews: [
      ['Anand Rao', 5, 'Ran a 600-person all-hands to the minute.'],
      ['Preeti N.', 4, 'Single point of contact throughout, which is what we needed.'],
    ],
  }),
  sample({
    id: 'orbit-conference-solutions',
    name: 'Orbit Conference Solutions',
    category: 'Corporate Events',
    years: 9,
    events: 170,
    eventsLabel: '170+ events',
    specialty: 'AV, staging & delegate management',
    description:
      'AV and staging contractor for conferences: screens, sound, stage build, registration desks and delegate badging.',
    services: ['Stage & screen build', 'Conference AV', 'Registration & badging', 'Live streaming setup'],
    portfolio: 'corporate',
    price: 78000,
    rating: 4.4,
    reviewCount: 59,
    city: 'Bengaluru',
    availability: AVAILABILITY.limited,
    reviews: [
      ['Vikram S.', 4, 'Stream went out without a hitch to three other offices.'],
      ['Leela M.', 5, 'Registration desk was set up and tested the night before.'],
    ],
  }),

  /* ----------------------------------------------- photography & video */
  sample({
    id: 'frameworks-wedding-photography',
    name: 'Frameworks Wedding Photography',
    category: 'Photography',
    years: 10,
    events: 300,
    eventsLabel: '300+ weddings',
    specialty: 'Candid wedding photography & films',
    description:
      'Candid photography and a wedding film, shot by a two-photographer team with a same-day teaser edit.',
    services: ['Candid photography', 'Wedding film', 'Same-day teaser', 'Album design'],
    portfolio: 'photography',
    price: 85000,
    rating: 4.8,
    reviewCount: 196,
    availability: AVAILABILITY.busy,
    reviews: [
      ['Aishwarya M.', 5, 'The teaser was ready before the reception ended. Everyone shared it.'],
      ['Karthik R.', 5, 'They stayed out of the way and still caught everything.'],
    ],
  }),
  sample({
    id: 'silver-lens-studios',
    name: 'Silver Lens Studios',
    category: 'Photography',
    years: 17,
    events: 450,
    eventsLabel: '450+ weddings',
    specialty: 'Traditional & candid coverage',
    description:
      'Traditional coverage with a candid second shooter — full ritual documentation plus posed family groups.',
    services: ['Traditional coverage', 'Candid second shooter', 'Family group portraits', 'Printed album'],
    portfolio: 'photography',
    price: 70000,
    rating: 4.6,
    reviewCount: 238,
    reviews: [
      ['Sudha G.', 5, 'They got every single family group photo my mother asked for.'],
      ['Bharath C.', 4, 'Album arrived about a week later than promised, but the work is lovely.'],
    ],
  }),
  sample({
    id: 'aperture-tales',
    name: 'Aperture Tales',
    category: 'Photography',
    years: 6,
    events: 120,
    eventsLabel: '120+ weddings',
    specialty: 'Pre-wedding films & drone coverage',
    description:
      'Pre-wedding shoots and drone coverage, usually booked alongside a main wedding photographer.',
    services: ['Pre-wedding shoot', 'Drone coverage', 'Save-the-date film', 'Location scouting'],
    portfolio: 'photography',
    price: 60000,
    rating: 4.5,
    reviewCount: 71,
    city: 'Visakhapatnam',
    reviews: [
      ['Nandini P.', 5, 'The beach drone shots were better than anything we had imagined.'],
      ['Tarun S.', 4, 'Scouted two locations with us before the shoot day.'],
    ],
  }),

  /* -------------------------------------------------- mehendi & makeup */
  sample({
    id: 'henna-by-divya',
    name: 'Henna by Divya',
    category: 'Mehendi & Makeup',
    years: 9,
    events: 700,
    eventsLabel: '700+ brides',
    specialty: 'Bridal mehendi & Arabic designs',
    description:
      'Bridal mehendi in traditional and Arabic styles, with additional artists for guests at the same sitting.',
    services: ['Bridal mehendi', 'Arabic & minimal designs', 'Guest artists', 'Organic henna cones'],
    portfolio: 'bridalBeauty',
    price: 12000,
    rating: 4.9,
    reviewCount: 312,
    availability: AVAILABILITY.limited,
    reviews: [
      ['Ramya K.', 5, 'Deep colour by the next morning and it lasted three weeks.'],
      ['Shalini A.', 5, 'Brought four extra artists so no guest was left waiting.'],
    ],
  }),
  sample({
    id: 'glow-bridal-studio',
    name: 'Glow Bridal Studio',
    category: 'Mehendi & Makeup',
    years: 12,
    events: 500,
    eventsLabel: '500+ brides',
    specialty: 'HD bridal makeup & hair styling',
    description:
      'Bridal makeup and hair for the muhurtham and reception looks, with a trial session included before the date.',
    services: ['HD bridal makeup', 'Hair styling & draping', 'Trial session', 'Family makeup packages'],
    portfolio: 'bridalBeauty',
    price: 22000,
    rating: 4.7,
    reviewCount: 189,
    reviews: [
      ['Harini V.', 5, 'The trial made all the difference. No surprises on the day.'],
      ['Nishitha B.', 4, 'Makeup held up through a very long, very hot day.'],
    ],
  }),

  /* -------------------------------------------------------------- venues */
  sample({
    id: 'kachiguda-grand-convention',
    name: 'Kachiguda Grand Convention',
    category: 'Venues',
    years: 15,
    events: 800,
    eventsLabel: '800+ events',
    specialty: 'Air-conditioned banquet hall for up to 1000 guests',
    description:
      'Air-conditioned convention hall seating up to 1000, with a separate dining hall, bridal rooms and covered parking.',
    services: ['Main hall up to 1000 guests', 'Separate dining hall', 'Bridal & guest rooms', 'Covered parking'],
    portfolio: 'venueIndoor',
    price: 150000,
    rating: 4.5,
    reviewCount: 121,
    reviews: [
      ['Girish T.', 4, 'Parking alone made it worth it for a wedding this size.'],
      ['Sarita M.', 5, 'Staff were helpful and the AC actually coped in May.'],
    ],
  }),
  sample({
    id: 'lakeview-garden-resort',
    name: 'Lakeview Garden Resort',
    category: 'Venues',
    years: 11,
    events: 400,
    eventsLabel: '400+ events',
    specialty: 'Outdoor lawn & poolside celebrations',
    description:
      'Lawn and poolside venue on the city outskirts, suited to evening receptions, haldi functions and corporate offsites.',
    services: ['Open lawn up to 600 guests', 'Poolside deck', 'On-site rooms', 'In-house kitchen (optional)'],
    portfolio: 'venueOutdoor',
    price: 185000,
    rating: 4.6,
    reviewCount: 96,
    availability: AVAILABILITY.limited,
    reviews: [
      ['Ashwin R.', 5, 'The lawn at sunset photographed beautifully.'],
      ['Jyothi N.', 4, 'A drive from the city, but guests said it was worth it.'],
    ],
  }),
  sample({
    id: 'pearl-city-banquets',
    name: 'Pearl City Banquets',
    category: 'Venues',
    years: 8,
    events: 350,
    eventsLabel: '350+ events',
    specialty: 'Banquet halls for 200 to 600 guests',
    description:
      'Two banquet halls that can be combined or booked separately, used mostly for engagements, receptions and birthdays.',
    services: ['Two combinable halls', 'In-house AV', 'Valet parking', 'Outside catering allowed'],
    portfolio: 'venueIndoor',
    price: 110000,
    rating: 4.3,
    reviewCount: 64,
    reviews: [
      ['Mounika S.', 4, 'Letting us bring our own caterer was the deciding factor.'],
      ['Rajesh Kumar', 4, 'Clean and well run. AV was already set up when we arrived.'],
    ],
  }),
];

/* ---------------------------------------------------------------- exports */

export const VENDORS = [...SUPPLIED, ...SAMPLES];

/** The nine vendors named in the source document, in source order. */
export const SOURCE_VENDORS = SUPPLIED;

/** Turns any label into a CSS-safe modifier, e.g. "Live Bands" -> "live-bands". */
export const categorySlug = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Human label for years of experience, honouring "30+ years" from the source. */
export const experienceLabel = (vendor) =>
  vendor.facts.experienceLabel ?? `${vendor.facts.experienceYears} years`;

/** Human label for scale. Returns null when the source did not supply a count. */
export const scaleLabel = (vendor) => vendor.facts.eventCountLabel ?? null;

export const getVendorById = (id) => VENDORS.find((v) => v.id === id) ?? null;

/** Every distinct vendor category, in first-appearance order. */
export const VENDOR_CATEGORIES = [...new Set(VENDORS.map((v) => v.facts.category))];
