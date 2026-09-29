import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DEMO_DATA_NOTICE } from '../../data/demoData';

/**
 * Settings (update spec §6).
 *
 * Preferences are stored in this browser. Nothing here sends an email, an SMS
 * or a WhatsApp message — a real build would hold these against the account on
 * the server and honour them at send time (spec §39).
 */
const TOGGLES = [
  {
    key: 'emailUpdates',
    label: 'Email updates',
    help: 'Booking confirmations and vendor replies by email.',
  },
  {
    key: 'smsReminders',
    label: 'SMS reminders',
    help: 'A text message the day before an event.',
  },
  {
    key: 'whatsappUpdates',
    label: 'WhatsApp updates',
    help: 'Vendor messages forwarded to WhatsApp.',
  },
  {
    key: 'showDemoBanners',
    label: 'Show demo notices',
    help: 'Keep the labels that mark demo ratings, prices and reviews.',
  },
];

export default function DashboardSettings() {
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
      <DashHead title="Settings" lede="How this demo behaves in your browser." />

      <section className="dash-card">
        <h2 className="dash-section-title">Notifications</h2>
        {TOGGLES.map((toggle) => (
          <div className="setting-row" key={toggle.key}>
            <div>
              <label className="setting-label" htmlFor={`setting-${toggle.key}`}>
                {toggle.label}
              </label>
              <p className="setting-help">{toggle.help}</p>
            </div>
            <input
              id={`setting-${toggle.key}`}
              type="checkbox"
              checked={Boolean(settings[toggle.key])}
              onChange={(event) => updateSettings({ [toggle.key]: event.target.checked })}
            />
          </div>
        ))}
        <p className="page-note">
          <Icon name="info" size={15} />
          <span>
            These switches are saved in this browser. No message of any kind is sent from the demo.
          </span>
        </p>
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
              Resetting clears the bookings, messages and saved vendors stored in this browser and
              puts the original demo content back.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
