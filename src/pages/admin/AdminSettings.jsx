import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DEMO_DATA_NOTICE, DEMO_ADMIN } from '../../data/demoData';

/**
 * Platform settings (update spec §13).
 *
 * Every switch is stored in this browser, same as the customer preferences.
 * None of them changes anything a customer or vendor would see outside this
 * demo, and the panel says so rather than implying an operational lever.
 */
const TOGGLES = [
  {
    key: 'adminAcceptNewBookings',
    label: 'Accept new bookings',
    help: 'Let customers send booking requests to vendors.',
  },
  {
    key: 'adminModerateReviews',
    label: 'Review reviews before they show',
    help: 'New reviews wait in the Reviews queue instead of publishing straight away.',
  },
  {
    key: 'adminAutoApproveVendors',
    label: 'Approve new vendors automatically',
    help: 'Off is safer — a person should check a listing before it goes live.',
  },
  {
    key: 'adminMaintenanceNotice',
    label: 'Show a maintenance notice',
    help: 'Displays a short banner telling visitors the site is being worked on.',
  },
];

export default function AdminSettings() {
  const { settings, updateSettings, resetDemo } = useApp();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemo();
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <DashHead title="Settings" lede="How the demo marketplace behaves." />

      <section className="dash-card">
        <h2 className="dash-section-title">Platform</h2>
        {TOGGLES.map((toggle) => (
          <div className="setting-row" key={toggle.key}>
            <div>
              <label className="setting-label" htmlFor={`admin-setting-${toggle.key}`}>
                {toggle.label}
              </label>
              <p className="setting-help">{toggle.help}</p>
            </div>
            <input
              id={`admin-setting-${toggle.key}`}
              type="checkbox"
              checked={Boolean(settings[toggle.key])}
              onChange={(event) => updateSettings({ [toggle.key]: event.target.checked })}
            />
          </div>
        ))}
        <p className="page-note">
          <Icon name="info" size={15} />
          <span>
            These switches are saved in this browser only. They do not change what any real customer
            or vendor sees.
          </span>
        </p>
      </section>

      <section className="dash-section">
        <div className="dash-card">
          <h2 className="dash-section-title">Admin account</h2>
          <div className="setting-row">
            <div>
              <p className="setting-label">{DEMO_ADMIN.name}</p>
              <p className="setting-help">{DEMO_ADMIN.email}</p>
            </div>
            <span className="pill status-active">Demo</span>
          </div>
          <p className="page-note">
            <Icon name="shield" size={15} />
            <span>
              No password was collected and none is checked. A real admin area needs a hashed
              password, a server-checked session, rate limiting, and an audit log of every approval,
              disable and status change made here.
            </span>
          </p>
        </div>
      </section>

      <section className="dash-section">
        <div className="dash-card">
          <h2 className="dash-section-title">Demo data</h2>
          <p className="setting-help" style={{ marginTop: 6 }}>
            {DEMO_DATA_NOTICE}
          </p>
          <div className="dash-toolbar" style={{ marginTop: 16, marginBottom: 0 }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={resetting}
              onClick={handleReset}
            >
              <Icon name="sparkle" size={16} />
              {resetting ? 'Resetting…' : 'Reset demo data'}
            </button>
          </div>
          <p className="page-note">
            <Icon name="info" size={15} />
            <span>
              Resetting puts every screen back to its starting demo content, including the vendor,
              review and customer statuses changed from this admin area.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
