import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DemoTag, Loading } from '../../components/common';
import useAsync from '../../hooks/useAsync';
import * as api from '../../services/api';

/** The four series the spec asks for, in the order it lists them (§19). */
const ORDER = ['bookingsThisMonth', 'popularCategories', 'vendorGrowth', 'customerGrowth'];

/**
 * Reports (update spec §19).
 *
 * Deliberately simple: four labelled bar lists built from plain numbers, no
 * charting library and no financial analytics. Every figure is invented for the
 * prototype, which the banner states once and each card repeats (spec §38).
 */
function BarChart({ chart, index }) {
  const peak = Math.max(...chart.series.map((point) => point.value), 1);

  return (
    <section className="dash-card rise" style={{ '--i': index }}>
      <h2 className="dash-section-title">{chart.title}</h2>

      <ul className="report-bars">
        {chart.series.map((point) => {
          const percent = Math.round((point.value / peak) * 100);
          return (
            <li className="report-bar-row" key={point.label}>
              <span className="report-bar-label" title={point.label}>
                {point.label}
              </span>
              <span className="report-bar-track">
                <span
                  className="report-bar-fill"
                  style={{ width: `${percent}%` }}
                  role="img"
                  aria-label={`${point.value} ${chart.unit}`}
                />
              </span>
              <span className="report-bar-value">{point.value.toLocaleString('en-IN')}</span>
            </li>
          );
        })}
      </ul>

      <p className="report-foot">
        Measured in {chart.unit} <DemoTag notice="Demo figure invented for the prototype." />
      </p>
    </section>
  );
}

export default function AdminReports() {
  const { data, loading } = useAsync(api.getReports);

  if (loading || !data) return <Loading label="Loading reports…" />;

  return (
    <>
      <DashHead title="Reports" lede="A quick read on how the demo marketplace is doing." />

      <p className="dash-demo-note">
        <Icon name="info" size={15} />
        <span>
          Every number on this page is a <strong>demo figure</strong> written for the prototype. None
          of it was measured from real bookings, vendors or customers.
        </span>
      </p>

      <div className="report-grid">
        {ORDER.map((key, i) => (
          <BarChart key={key} chart={data[key]} index={i} />
        ))}
      </div>

      <p className="page-note">
        <Icon name="info" size={15} />
        <span>
          Kept deliberately simple — four counts drawn as bars. A real build would read these from
          the booking and account tables server-side.
        </span>
      </p>
    </>
  );
}
