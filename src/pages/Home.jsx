import { useApp } from '../context/AppContext';
import Hero from '../components/Hero/Hero';
import CategoryGrid from '../components/CategoryGrid/CategoryGrid';
import FeaturedVendors from '../components/FeaturedVendors/FeaturedVendors';
import StatsBand from '../components/StatsBand/StatsBand';
import Testimonials from '../components/Testimonials/Testimonials';
import Benefits from '../components/Benefits/Benefits';
import Decor from '../components/Hero/Decor';
import Reveal from '../components/common/Reveal';

/**
 * Homepage. Section order follows the reference exactly (spec §5):
 * hero → categories → featured vendors → statistics → testimonials → benefits.
 *
 * Every band is light. They differentiate by temperature — pearl, ivory, cream,
 * blush — so the page reads as one continuous bright surface that warms and
 * cools rather than as alternating stripes. Each band carries its own
 * background via the `.band-*` classes in global.css, so no section paints its
 * own colour.
 */
export default function Home() {
  // Source order — the sequence the reference homepage shows, decorators
  // first then catering. Any other ordering would need a ranking signal the
  // source document does not supply.
  const { vendors } = useApp();

  return (
    <>
      <Hero />

      {/* Categories, on ivory. The hero animates on load, so scroll reveal
          starts here — the first band below the fold (spec §13). */}
      <section className="band band-ivory">
        <Decor scope="page" on="light" />
        <div className="container">
          <Reveal>
            <CategoryGrid variant="row" showHeading />
          </Reveal>
        </div>
      </section>

      {/* Featured vendors, on cream — warm enough to set the white cards
          apart, light enough that the page never turns into a dark stripe. */}
      <section className="band band-cream">
        <Decor scope="page" on="light" />
        <div className="container">
          <Reveal>
            <FeaturedVendors vendors={vendors} />
          </Reveal>
        </div>
      </section>

      {/* Trust statistics, on pearl — the quietest surface, because this band
          is pure data and any warmth competes with the numbers. */}
      <section className="band band-pearl">
        <div className="container">
          <Reveal>
            <StatsBand />
          </Reveal>
        </div>
      </section>

      {/* Social proof, on blush — the page's warmest point, where it should
          feel most floral. */}
      <section className="band band-blush">
        <Decor scope="page" on="light" />
        <div className="container">
          <Reveal>
            <Testimonials />
          </Reveal>
        </div>
      </section>

      {/* Closing benefit row, back to ivory before the navy footer. */}
      <section className="band band-ivory">
        <div className="container">
          <Reveal>
            <Benefits />
          </Reveal>
        </div>
      </section>
    </>
  );
}
