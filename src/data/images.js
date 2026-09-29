/**
 * DEMO IMAGE SOURCES
 * ------------------
 * Every URL here is a free-licence Unsplash photograph used as a stand-in for
 * real vendor photography. They are NOT pictures of the listed vendors.
 *
 * Each one is still chosen to be *truthful about the category*: a pure-veg
 * caterer never gets a meat photograph, a flower decorator gets flowers. A
 * placeholder that contradicts the vendor's stated specialty is a data-integrity
 * problem (spec §38), not just a visual one. Every id below is named for what
 * the photograph actually shows, so a future swap can be checked by reading.
 *
 * To go to production: replace each value below with a vendor-uploaded or
 * licensed asset (served from R2 / S3 / a CDN). No component imports a raw URL,
 * so this file is the single swap point.
 */

const u = (id, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72&h=${h}`;

/* --------------------------------------------------------------- photo bank */

/**
 * Verified photograph ids, keyed by what they depict. Nothing else in the app
 * refers to a raw id, so every picture choice below reads as a description.
 */
const P = {
  aisleFloralArch: '1469371670807-013ccf25f16a',
  mandapStage: '1587271407850-8d438ca9fdf2',
  outdoorCeremonyChairs: '1522673607200-164d1b6ce486',
  lawnCeremonySeats: '1529636798458-92182e662485',
  mrAndMrsSign: '1507504031003-b417219a0fde',
  stringLights: '1464047736614-af63643285bf',
  tableFloralOrange: '1511795409834-ef04bbd61622',
  tableGreeneryRunner: '1522413452208-996ff3f3e740',
  longTableVases: '1519225421980-715cb0215aed',
  banquetTablesSet: '1464366400600-7168b8af9bc3',
  ballroomRoundTables: '1519167758481-83f550bb49b3',
  banquetInterior: '1552566626-52f8b828add9',

  buffetCounters: '1555244162-803834f70033',
  vegBuffetBowls: '1498837167922-ddd27525d352',
  vegSaladBowls: '1543353071-873f17a7a088',
  idliBananaLeaf: '1589301760014-d929f3979dbc',
  indianCurriesVeg: '1585937421612-70a008356fbe',
  indianCurryCopper: '1631452180519-c014fe946bc7',
  feastSpreadOverhead: '1606787366850-de6330128bfc',
  platedFineDining: '1414235077428-338989a2e8c0',
  platedSaladDark: '1540189549336-e6e99c3679fe',
  guestsDining: '1528605248644-14dd04022da1',
  brunchTable: '1424847651672-bf20a4b0982b',
  breakfastPastries: '1596701062351-8c2c14d1fdd0',
  tieredCakeRoses: '1535254973040-607b474cb50d',
  pancakeStack: '1567620905732-2d1ec7ab7445',

  concertCrowdLights: '1514525253161-7a46d19cd819',
  concertStagePurple: '1470229538611-16ba8c7ffbd7',
  liveBandOnStage: '1516450360452-9312f5e86fc7',
  crowdConfetti: '1533174072545-7a4b6ad7a6c3',
  confettiBokeh: '1492684223066-81342ee5ff30',
  confettiTeal: '1513151233558-d860c5398176',

  coupleBlackWhite: '1460978812857-470ed1c77af0',
  ringsAndBouquet: '1465495976277-4387d4b0b4c6',
  brideBouquetBacklit: '1519741497674-611481863552',
  coupleWithBouquet: '1550005809-91ad75fb315f',
  couplePortraitOutdoor: '1591604466107-ec97de577aff',
  confettiExitCouple: '1583939003579-730e3918a45a',
  weddingPartyGroup: '1583939411023-14783179e581',
  portraitFloralDress: '1478146896981-b80fe463b330',
  bridalEyeMakeup: '1487412947147-5cebf100ffc2',

  conferenceHall: '1511578314322-379afb476865',
  conferenceAudience: '1540575467063-178a50c2df87',
  modernInterior: '1600607687920-4e2a09cf159d',
  restaurantInterior: '1517248135467-4c7edcad34c4',
  industrialVenue: '1555396273-367ea4eb4db5',
  terraceByWater: '1559339352-11d035aa65de',
  resortPoolCabanas: '1566073771259-6a8506099945',
  hotelPoolDusk: '1571896349842-33c89424de2d',

  balloonCeiling: '1530103862676-de8c9debad1d',
  partyTableBalloons: '1556125574-d7f27ec36a06',
  celebrationBalloons: '1511285560929-80b456fea0bc',
  guestsToasting: '1519671482749-fd09be7ccebf',
};

/** Hero photograph — floral ceremony setup with a draped arch, per the reference. */
export const HERO_IMAGE = u(P.aisleFloralArch, 1200, 1000);

/** Fallback used whenever a vendor image fails to load. */
export const FALLBACK_IMAGE = u(P.banquetTablesSet, 800, 600);

/** Decorative photograph for the About page. */
export const ABOUT_IMAGE = u(P.weddingPartyGroup, 1000, 700);

/* --------------------------------------------------------------- portfolios */

/**
 * Portfolio strips, one set per *kind of work* rather than one per vendor:
 * several decorators legitimately show the same kind of photograph, and a
 * shared set keeps the category-truthfulness rule checkable in one place.
 *
 * Five images each. The profile modal renders them as a small strip, so a
 * longer set would push the rest of the profile below the fold (spec §4).
 */
const set = (...ids) => ids.map((id) => u(id, 480, 360));

export const PORTFOLIO_SETS = {
  /* Wedding stage, floral mandap, reception, entrance, table. */
  weddingDecor: set(
    P.mandapStage,
    P.aisleFloralArch,
    P.outdoorCeremonyChairs,
    P.stringLights,
    P.longTableVases,
  ),
  freshFlowers: set(
    P.tableFloralOrange,
    P.aisleFloralArch,
    P.tableGreeneryRunner,
    P.lawnCeremonySeats,
    P.ringsAndBouquet,
  ),
  largeScaleDecor: set(
    P.ballroomRoundTables,
    P.banquetTablesSet,
    P.mandapStage,
    P.stringLights,
    P.banquetInterior,
  ),
  receptionStyling: set(
    P.tableGreeneryRunner,
    P.longTableVases,
    P.mrAndMrsSign,
    P.stringLights,
    P.banquetTablesSet,
  ),

  /* Buffet, South Indian dishes, dessert counter, wedding dining, live counter. */
  cateringPureVeg: set(
    P.idliBananaLeaf,
    P.indianCurriesVeg,
    P.vegBuffetBowls,
    P.vegSaladBowls,
    P.feastSpreadOverhead,
  ),
  cateringMixed: set(
    P.indianCurryCopper,
    P.buffetCounters,
    P.platedFineDining,
    P.guestsDining,
    P.feastSpreadOverhead,
  ),
  cateringBreakfast: set(
    P.brunchTable,
    P.breakfastPastries,
    P.idliBananaLeaf,
    P.pancakeStack,
    P.platedSaladDark,
  ),

  /* DJ setup, stage lighting, live performance, sound system, crowd. */
  entertainment: set(
    P.concertCrowdLights,
    P.concertStagePurple,
    P.liveBandOnStage,
    P.crowdConfetti,
    P.confettiBokeh,
  ),
  liveBand: set(
    P.liveBandOnStage,
    P.concertStagePurple,
    P.concertCrowdLights,
    P.confettiBokeh,
    P.crowdConfetti,
  ),

  /* Wedding, couple, event, traditional, candid. */
  photography: set(
    P.coupleBlackWhite,
    P.couplePortraitOutdoor,
    P.confettiExitCouple,
    P.weddingPartyGroup,
    P.coupleWithBouquet,
  ),
  bridalBeauty: set(
    P.bridalEyeMakeup,
    P.brideBouquetBacklit,
    P.portraitFloralDress,
    P.ringsAndBouquet,
    P.couplePortraitOutdoor,
  ),

  venueIndoor: set(
    P.ballroomRoundTables,
    P.banquetInterior,
    P.restaurantInterior,
    P.modernInterior,
    P.industrialVenue,
  ),
  venueOutdoor: set(
    P.resortPoolCabanas,
    P.hotelPoolDusk,
    P.terraceByWater,
    P.lawnCeremonySeats,
    P.outdoorCeremonyChairs,
  ),
  corporate: set(
    P.conferenceHall,
    P.conferenceAudience,
    P.modernInterior,
    P.brunchTable,
    P.industrialVenue,
  ),
  birthday: set(
    P.balloonCeiling,
    P.partyTableBalloons,
    P.tieredCakeRoses,
    P.confettiTeal,
    P.celebrationBalloons,
  ),
  gifting: set(
    P.feastSpreadOverhead,
    P.tieredCakeRoses,
    P.partyTableBalloons,
    P.breakfastPastries,
    P.guestsToasting,
  ),
};

/** Default strip for any vendor without an explicit set. */
export const PORTFOLIO_IMAGES = PORTFOLIO_SETS.weddingDecor;

/** Returns the named set, falling back to a safe generic one. */
export const portfolioSet = (name) => PORTFOLIO_SETS[name] ?? PORTFOLIO_IMAGES;

/* ------------------------------------------------------------ vendor covers */

/**
 * Keyed by vendor id (see data/vendors.js); matched to each stated specialty.
 * The first nine are the vendors supplied by the source document; the rest are
 * sample listings added to populate the demo.
 */
export const VENDOR_IMAGES = {
  /* --- supplied vendors ------------------------------------------------- */
  // Wedding & celebration decor — outdoor ceremony seating.
  'dhruva-events-decors': u(P.outdoorCeremonyChairs),
  // Entertainment & event setups — stage lighting and a crowd.
  'seasons-entertainers': u(P.concertCrowdLights),
  // Fresh flower decoration — fresh-cut centrepieces.
  'sri-mallikarjuna-flower-decoration': u(P.tableFloralOrange),
  // Large-scale event decoration — full banquet hall.
  'sln-decorators': u(P.ballroomRoundTables),
  // Veg & non-veg, South Indian — buffet service.
  'amogham-caterers-narasimha': u(P.buffetCounters),
  // Veg & non-veg, South Indian — plated service at an event.
  'savyasachi-caterers': u(P.platedFineDining),
  // Pure veg, South Indian recipes — idli and chutney. Must never show meat.
  'ashta-lakshmi-catering': u(P.idliBananaLeaf),
  // Veg & non-veg, South Indian — Indian curry service.
  'sri-matha-catering': u(P.indianCurryCopper),
  // Veg & non-veg, South & North Indian — mixed curry spread.
  'laxmi-chandra-caterers': u(P.indianCurriesVeg),

  /* --- sample listings -------------------------------------------------- */
  'aakriti-wedding-decor': u(P.mandapStage),
  'vrindavan-mandap-creations': u(P.aisleFloralArch),
  'blue-lotus-event-styling': u(P.tableGreeneryRunner),
  'meraki-drapes-and-lights': u(P.stringLights),
  'sreenidhi-fresh-flowers': u(P.lawnCeremonySeats),
  'pushpanjali-florists': u(P.longTableVases),

  // Pure veg listing — vegetarian photography only.
  'godavari-ruchulu-catering': u(P.vegBuffetBowls),
  'nizami-dawat-caterers': u(P.indianCurryCopper),
  // Pure veg listing — vegetarian photography only.
  'annapurna-bhojanam': u(P.vegSaladBowls),
  'spice-route-live-counters': u(P.guestsDining),
  // Pure veg tiffin listing — vegetarian photography only.
  'tirumala-tiffin-caterers': u(P.brunchTable),

  'rhythm-roots-event-crew': u(P.crowdConfetti),
  'nrityanjali-performing-arts': u(P.confettiBokeh),
  'dj-vibe-hyderabad': u(P.concertStagePurple),
  'beatbox-sound-and-light': u(P.concertCrowdLights),
  'deccan-live-band': u(P.liveBandOnStage),
  'swaralaya-music-ensemble': u(P.liveBandOnStage),

  'little-star-birthday-planners': u(P.balloonCeiling),
  'confetti-kids-events': u(P.partyTableBalloons),
  'thamboolam-return-gifts': u(P.feastSpreadOverhead),
  'giftwala-curations': u(P.breakfastPastries),

  'meridian-corporate-events': u(P.conferenceHall),
  'orbit-conference-solutions': u(P.conferenceAudience),

  'frameworks-wedding-photography': u(P.coupleBlackWhite),
  'silver-lens-studios': u(P.weddingPartyGroup),
  'aperture-tales': u(P.couplePortraitOutdoor),

  'henna-by-divya': u(P.ringsAndBouquet),
  'glow-bridal-studio': u(P.bridalEyeMakeup),

  'kachiguda-grand-convention': u(P.banquetInterior),
  'lakeview-garden-resort': u(P.resortPoolCabanas),
  'pearl-city-banquets': u(P.hotelPoolDusk),
};
