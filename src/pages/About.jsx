import { Link } from 'react-router-dom';
import { ABOUT_IMAGE } from '../data/images';
import Icon from '../components/common/Icon';
import { Breadcrumb, SafeImage } from '../components/common';
import Decor from '../components/Hero/Decor';
import './pages.css';
import './Static.css';

const VALUES = [
  {
    icon: 'heart',
    tone: 'pink',
    title: 'Local first',
    text: 'We start with vendors who already work in your city, not a national directory that cannot show up on the day.',
  },
  {
    icon: 'scale',
    tone: 'lavender',
    title: 'Comparable, not ranked',
    text: 'Vendors are shown on the same facts side by side so you can judge them yourself.',
  },
  {
    icon: 'shield',
    tone: 'mint',
    title: 'Honest about data',
    text: 'Anything we have not verified is labelled. A placeholder should never look like a fact.',
  },
];

export default function About() {
  return (
    <div className="page">
      <header className="page-hero">
        <Decor scope="page" on="light" />
        <div className="container page-hero-inner">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />
          <h1 className="page-title">
            About <span className="accent">One Ocean Events</span>
          </h1>
          <p className="page-lede">
            A simpler way to find the people who make a celebration happen.
          </p>
        </div>
      </header>

      <div className="container">
        <section className="about-split">
          <div className="about-copy">
            <h2 className="section-title">Why we built this</h2>
            <p>
              Planning an event in India still runs on phone numbers passed between relatives. It
              works, but it is slow, it is hard to compare, and it leaves you guessing about who is
              actually available on your date.
            </p>
            <p>
              One Ocean Events brings decorators, caterers and entertainers into one place, shows
              the same details for each of them, and turns an enquiry into a single form instead of
              a dozen calls.
            </p>
            <p>
              We are starting with Hyderabad, with vendors who have been working for years on
              weddings, receptions and family celebrations across the city.
            </p>
          </div>
          <div className="about-media">
            <SafeImage src={ABOUT_IMAGE} alt="A decorated wedding celebration" eager />
          </div>
        </section>

        <section className="values">
          <h2 className="section-title">What we care about</h2>
          <ul className="values-grid">
            {VALUES.map((value) => (
              <li key={value.title} className={`value-card tone-${value.tone}`}>
                <span className="value-icon" aria-hidden="true">
                  <Icon name={value.icon} size={24} />
                </span>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-text">{value.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Three short reference sections. As bare prose they ran the full width
            of the page and read as an unformatted document below the values row;
            as panels they keep the measure short and stay part of the system. */}
        <div className="about-panels">
          <section className="about-panel" id="vendors">
            <h2 className="section-title">For vendors</h2>
            <p>
              If you run a decoration, catering or entertainment business and want to be listed, we
              want to hear from you. Listing will be free while we are building out the city, and you
              keep full control of your own pricing and availability.
            </p>
            <p className="about-panel-note">
              <Icon name="info" size={15} />
              <span>
                Vendor onboarding is not part of this demo — there is no form to submit yet.
              </span>
            </p>
          </section>

          <section className="about-panel" id="contact">
            <h2 className="section-title">Contact</h2>
            <p>
              This prototype has no live inbox. In production, enquiries reach the team here and every
              listed vendor gets their own verified contact route.
            </p>
            <ul className="contact-list">
              <li>
                <Icon name="pin" size={16} /> Hyderabad, Telangana
              </li>
              <li>
                <Icon name="chat" size={16} /> Vendor chat is available inside each vendor profile
              </li>
            </ul>
          </section>

          <section className="about-panel about-panel-wide" id="legal">
            <h2 className="section-title">Legal &amp; data</h2>
            <p>
              Privacy, Terms and Refund policies are not drafted for this prototype. Nothing you enter
              here is transmitted or stored on a server — the wishlist, bookings, chat and sign-in all
              live in your own browser and can be removed by clearing site data.
            </p>
            <p>
              Vendor names, categories, years of experience, event scale and specialties come from the
              supplied source data. Ratings, review counts, prices, verification badges, services and
              photography are placeholder demo values and are labelled as such throughout the site.
            </p>
          </section>
        </div>

        <section className="cta-band">
          <div>
            <h2 className="cta-title">Have a date in mind?</h2>
            <p className="cta-text">See who is available and send a request in a few minutes.</p>
          </div>
          <Link to="/vendors" className="btn btn-primary">
            Browse vendors <Icon name="arrowRight" size={17} />
          </Link>
        </section>
      </div>
    </div>
  );
}
