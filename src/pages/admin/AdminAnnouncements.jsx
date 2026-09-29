import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { Loading } from '../../components/common';
import useAsync from '../../hooks/useAsync';
import * as api from '../../services/api';
import { categorySlug } from '../../data/vendors';
import { relativeTime } from '../../utils/time';

/**
 * Announcements (update spec §13).
 *
 * Read-only in the demo. Composing one would imply it could be sent, and the
 * demo has nowhere to send it — a real build would post to an authorised
 * endpoint and queue the delivery (spec §39).
 */
export default function AdminAnnouncements() {
  const { data, loading } = useAsync(api.listAnnouncements);

  if (loading || !data) return <Loading label="Loading announcements…" />;

  return (
    <>
      <DashHead title="Announcements" lede="Notices sent to customers and vendors." />

      <ul className="announce-list">
        {data.map((item, i) => (
          <li key={item.id} className="announce-row rise" style={{ '--i': i }}>
            <span className="feed-icon stat-icon tone-orange">
              <Icon name="megaphone" size={16} />
            </span>
            <div className="announce-main">
              <p className="announce-title wrap-anywhere">{item.title}</p>
              <p className="announce-body wrap-anywhere">{item.body}</p>
              <p className="feed-time">
                {item.audience} · {relativeTime(item.at)}
              </p>
            </div>
            <span className={`pill status-${categorySlug(item.status)}`}>{item.status}</span>
          </li>
        ))}
      </ul>

      <p className="page-note">
        <Icon name="info" size={15} />
        <span>
          These are sample notices. The demo cannot send an announcement to anyone.
        </span>
      </p>
    </>
  );
}
