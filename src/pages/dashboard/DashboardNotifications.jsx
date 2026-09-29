import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { EmptyState } from '../../components/common';
import { relativeTime } from '../../utils/time';

/** Notifications (update spec §12). Read state is kept in this browser only. */
export default function DashboardNotifications() {
  const { notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead } =
    useApp();

  return (
    <>
      <DashHead
        title="Notifications"
        lede={
          unreadNotifications > 0
            ? `${unreadNotifications} unread ${unreadNotifications === 1 ? 'update' : 'updates'}.`
            : 'You are all caught up.'
        }
      />

      {notifications.length > 0 ? (
        <>
          {unreadNotifications > 0 && (
            <div className="dash-toolbar">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={markAllNotificationsRead}
              >
                <Icon name="check" size={15} /> Mark all as read
              </button>
            </div>
          )}

          <ul className="notif-list">
            {notifications.map((item, i) => (
              <li
                key={item.id}
                className={`notif-row rise ${item.read ? '' : 'is-unread'}`.trim()}
                style={{ '--i': i }}
              >
                <span className={`feed-icon stat-icon tone-${item.tone}`}>
                  <Icon name={item.icon} size={16} />
                </span>
                <div className="notif-body">
                  <p className="notif-title">{item.title}</p>
                  <p className="notif-text wrap-anywhere">{item.text}</p>
                  <p className="feed-time">{relativeTime(item.at)}</p>
                </div>
                <div className="cell-actions">
                  {item.to && (
                    <Link to={item.to} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  )}
                  {!item.read && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => markNotificationRead(item.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          icon="bell"
          title="No notifications yet 🔔"
          text="Booking updates and vendor replies will appear here."
          actions={
            <Link to="/vendors" className="btn btn-primary">
              Find Vendors
            </Link>
          }
        />
      )}
    </>
  );
}
