import Icon from '../common/Icon';
import './Testimonials.css';

/**
 * Social proof band (spec §5, after the statistics band).
 *
 * These are written sample testimonials, not collected reviews. Every card says
 * so in its own footer and in the section note, matching how the rest of this
 * codebase labels demo content (see DEMO_NOTICE in data/vendors.js). Swapping in
 * real reviews means replacing TESTIMONIALS and deleting the notice.
 */
const TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'We compared four decorators in one evening and booked the one who actually matched our budget. The whole mandap came together exactly as we pictured it.',
    name: 'Ananya & Karthik',
    event: 'Wedding · Hyderabad',
    initials: 'AK',
    tone: 'rose',
  },
  {
    id: 't2',
    quote:
      'Finding a pure-veg caterer who could handle 400 guests is usually a week of phone calls. Here it took an afternoon, and the tasting was arranged for us.',
    name: 'Sunitha R.',
    event: 'Reception · Bengaluru',
    initials: 'SR',
    tone: 'mint',
  },
  {
    id: 't3',
    quote:
      'Our team offsite needed a venue, AV and catering in three weeks. The side-by-side comparison made the sign-off conversation take ten minutes.',
    name: 'Praveen M.',
    event: 'Corporate offsite · Chennai',
    initials: 'PM',
    tone: 'sky',
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials" aria-labelledby="testimonials-heading">
      <div className="section-head testimonials-head">
        <div>
          <p className="eyebrow">Loved by hosts</p>
          <h2 id="testimonials-heading" className="section-title">
            Moments We Helped <span className="accent">Create</span>
          </h2>
          <p className="section-sub">
            Sample stories from the kinds of celebrations One Ocean Events is built for
          </p>
        </div>
      </div>

      <ul className="testimonial-grid">
        {TESTIMONIALS.map((item) => (
          <li key={item.id}>
            <figure className="testimonial-card">
              <span className="testimonial-quote" aria-hidden="true">
                &ldquo;
              </span>

              <span className="testimonial-stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" size={14} />
                ))}
              </span>

              <blockquote className="testimonial-text">{item.quote}</blockquote>

              <figcaption className="testimonial-by">
                <span className={`testimonial-avatar avatar-${item.tone}`} aria-hidden="true">
                  {item.initials}
                </span>
                <span className="testimonial-who">
                  <span className="testimonial-name">{item.name}</span>
                  <span className="testimonial-event">{item.event}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <p className="testimonials-note">
        <Icon name="info" size={14} />
        Sample testimonials written for this prototype — not collected from real customers.
      </p>
    </section>
  );
}
