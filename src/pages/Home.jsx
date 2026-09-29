import { useApp } from '../context/AppContext';
import Hero from '../components/Hero/Hero';
import CategoryGrid from '../components/CategoryGrid/CategoryGrid';
import FeaturedVendors from '../components/FeaturedVendors/FeaturedVendors';
import Benefits from '../components/Benefits/Benefits';

/**
 * Homepage. Section order follows the visual reference exactly:
 * hero → categories → featured vendors → benefits (spec §5).
 */
export default function Home() {
  // Source order — the sequence the reference homepage shows, decorators
  // first then catering. Any other ordering would need a ranking signal the
  // source document does not supply.
  const { vendors } = useApp();

  return (
    <>
      <Hero />
      <div className="container">
        <CategoryGrid variant="row" />
        <FeaturedVendors vendors={vendors} />
        <Benefits />
      </div>
    </>
  );
}
