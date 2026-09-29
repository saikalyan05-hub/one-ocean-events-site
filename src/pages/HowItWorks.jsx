import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';
import { Breadcrumb } from '../components/common';
import Decor from '../components/Hero/Decor';
import './pages.css';
import './Static.css';

/*
 * The five stages the spec names, in the order the product actually runs them.
 * Every line describes something this build does — nothing here promises a
 * service the demo cannot perform (see the FAQ below).
 */
const STEPS = [
  {
    icon: 'compass',
    tone: 'peach',
    title: 'Discover',
    text: 'Search by service or browse categories to find vendors working in your city.',
  },
  {
    icon: 'scale',
    tone: 'lavender',
    title: 'Compare',
    text: 'Line up to three vendors side by side on experience, scale and specialty.',
  },
  {
    icon: 'heart',
    tone: 'rose',
    title: 'Choose',
    text: 'Save the ones you like to your wishlist and narrow the list in your own time.',
  },
  {
    icon: 'calendar',
    tone: 'mint',
    title: 'Book',
    text: 'Send your date, guest count and notes in one request, then track it under My Bookings.',
  },
  {
    icon: 'sparkle',
    tone: 'yellow',
    title: 'Celebrate',
    text: 'Requests, notes and saved vendors stay in one list, so the day runs off one plan.',
  },
];

const FAQS = [
  {
    q: 'Is this a live marketplace?',
    a: 'No. This is a demo prototype. Bookings, chats and sign-in all run in your browser and nothing is sent to the vendors listed.',
  },
  {
    q: 'Where do the ratings and prices come from?',
    a: 'They are placeholder values, marked with a “Demo” tag wherever they appear. Only a vendor’s name, category, years of experience, event scale and specialty come from the supplied source data.',
  },
  {
    q: 'What does the Verified badge mean here?',
    a: 'Nothing yet — it is placeholder UI. No vendor on this demo has been through a verification process, and the badge is labelled as demo data.',
  },
  {
    q: 'Which cities are covered?',
    a: 'The vendors in this demo all operate in Hyderabad. Other cities appear in the picker so the flow can be tested, but they return no results.',
  },
  {
    q: 'Will my saved vendors persist?',
    a: 'They are kept in this browser’s local storage, so they survive a reload but not a different device or a clear of site data.',
  },
];

export default function HowItWorks() {
  return (
    <div className="page">
      <header className="page-hero">
        <Decor scope="page" on="light" />
        <div className="container page-hero-inner">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'How It Works' }]} />
          <h1 className="page-title">
            How it <span className="accent">works</span>
          </h1>
          <p className="page-lede">
            Five stages from a blank guest list to a vendor who has your date.
          </p>
        </div>
      </header>

      <div className="container">
        {/* A timeline rather than five loose cards: the gold rule running between
            the medallions is what says these are stages of one journey. */}
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className={`step tone-${step.tone}`}>
              <span className="step-mark" aria-hidden="true">
                <span className="step-icon">
                  <Icon name={step.icon} size={24} />
                </span>
                <span className="step-number">{i + 1}</span>
              </span>
              <h2 className="step-title">{step.title}</h2>
              <p className="step-text">{step.text}</p>
            </li>
          ))}
        </ol>

        <section className="faq-section" id="faqs">
          <h2 className="section-title">
            Common <span className="accent">questions</span>
          </h2>
          <ul className="faq-list">
            {FAQS.map((item) => (
              <li key={item.q} className="faq-item">
                <details>
                  <summary>
                    <span>{item.q}</span>
                    <Icon name="chevronDown" size={18} className="faq-chevron" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section className="cta-band">
          <div>
            <h2 className="cta-title">Ready to find your vendors?</h2>
            <p className="cta-text">Start with the vendors already on the list.</p>
          </div>
          <Link to="/vendors" className="btn btn-primary">
            Browse vendors <Icon name="arrowRight" size={17} />
          </Link>
        </section>
      </div>
    </div>
  );
}
