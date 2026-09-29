import { useMemo, useState } from 'react';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import { useApp } from '../../context/AppContext';
import Icon from '../../components/common/Icon';
import { EmptyState, Loading, SafeImage, Stars } from '../../components/common';
import useAsync from '../../hooks/useAsync';
import * as api from '../../services/api';
import { categorySlug } from '../../data/vendors';
import { relativeTime } from '../../utils/time';

const FILTERS = ['All', 'Pending', 'Approved', 'Hidden'];

/**
 * Review moderation (update spec §18).
 *
 * THESE ARE DEMO REVIEWS. They were written for the prototype and are not real
 * customer feedback; the banner above the table says so and every row is
 * labelled. Approving one here changes nothing on the public site's rating,
 * because that rating is itself placeholder data (spec §38).
 */
export default function AdminReviews() {
  const { openModal } = useApp();
  const { data, loading, setData } = useAsync(api.listAdminReviews);
  const [filter, setFilter] = useState('All');

  const counts = useMemo(() => {
    const list = data ?? [];
    return FILTERS.reduce((acc, name) => {
      acc[name] = name === 'All' ? list.length : list.filter((row) => row.status === name).length;
      return acc;
    }, {});
  }, [data]);

  const rows = useMemo(() => {
    const list = data ?? [];
    return filter === 'All' ? list : list.filter((row) => row.status === filter);
  }, [data, filter]);

  const setStatus = async (id, next) => {
    const result = await api.setReviewStatus(id, next);
    setData(result.data);
  };

  if (loading || !data) return <Loading label="Loading reviews…" />;

  return (
    <>
      <DashHead title="Reviews" lede="Feedback waiting to be approved or hidden." />

      <p className="dash-demo-note">
        <Icon name="info" size={15} />
        <span>
          Every review below is <strong>demo content written for this prototype</strong>. None of it
          is real customer feedback, and approving one does not publish a real review.
        </span>
      </p>

      <div className="chip-row" role="tablist" aria-label="Review status">
        {FILTERS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={filter === name}
            className={`chip ${filter === name ? 'is-on' : ''}`.trim()}
            onClick={() => setFilter(name)}
          >
            {name}
            <span className="chip-count">{counts[name]}</span>
          </button>
        ))}
      </div>

      {rows.length > 0 ? (
        <ul className="review-queue">
          {rows.map((review, i) => (
            <li key={review.id} className="review-row rise" style={{ '--i': i }}>
              <SafeImage src={review.vendorImage} alt="" className="cell-thumb" />

              <div className="review-main">
                <p className="review-head">
                  <strong className="wrap-anywhere">{review.author}</strong> on{' '}
                  <span className="wrap-anywhere">{review.vendorName}</span>
                </p>
                <Stars value={review.rating} />
                <p className="review-text wrap-anywhere">“{review.text}”</p>
                <p className="feed-time">{relativeTime(review.at)}</p>
              </div>

              <div className="review-side">
                <span className={`pill status-${categorySlug(review.status)}`}>{review.status}</span>
                <div className="cell-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openModal('vendor', { vendorId: review.vendorId })}
                  >
                    <Icon name="eye" size={14} /> View
                  </button>
                  {review.status !== 'Approved' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setStatus(review.id, 'Approved')}
                    >
                      <Icon name="check" size={14} /> Approve
                    </button>
                  )}
                  {review.status !== 'Hidden' && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setStatus(review.id, 'Hidden')}
                    >
                      <Icon name="ban" size={14} /> Hide
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="star"
          title={`Nothing ${filter.toLowerCase()} right now`}
          text="Pick another status to see the rest of the queue."
          actions={
            <button type="button" className="btn btn-primary" onClick={() => setFilter('All')}>
              Show all reviews
            </button>
          }
        />
      )}
    </>
  );
}
