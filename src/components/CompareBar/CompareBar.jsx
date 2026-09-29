import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import { SafeImage } from '../common';
import './CompareBar.css';

/**
 * Floating selection tray (spec §12). Appears only once something is selected
 * and never covers page content permanently — pages reserve bottom padding
 * through the `.has-compare-bar` class on <body>.
 */
export default function CompareBar() {
  const { compareVendors, toggleCompare, clearCompare, openModal, maxCompare } = useApp();
  const visible = compareVendors.length > 0;

  // Body padding, not a spacer element, so the tray cannot push layout around.
  useEffect(() => {
    document.body.classList.toggle('has-compare-bar', visible);
    return () => document.body.classList.remove('has-compare-bar');
  }, [visible]);

  if (!visible) return null;

  const slots = Array.from({ length: maxCompare }, (_, i) => compareVendors[i] ?? null);

  return (
    <div className="compare-bar" role="region" aria-label="Vendor comparison tray">
      <div className="container compare-bar-inner">
        <div className="compare-slots">
          {slots.map((vendor, i) =>
            vendor ? (
              <div key={vendor.id} className="compare-slot is-filled">
                <SafeImage src={vendor.image} alt="" className="compare-thumb" />
                <span className="compare-slot-name clamp-2">{vendor.facts.name}</span>
                <button
                  type="button"
                  className="compare-slot-remove"
                  onClick={() => toggleCompare(vendor)}
                  aria-label={`Remove ${vendor.facts.name} from comparison`}
                >
                  <Icon name="close" size={12} />
                </button>
              </div>
            ) : (
              <div key={`empty-${i}`} className="compare-slot is-empty" aria-hidden="true">
                <Icon name="scale" size={17} />
                <span>Add vendor</span>
              </div>
            ),
          )}
        </div>

        <div className="compare-bar-actions">
          <p className="compare-count">
            <strong>{compareVendors.length}</strong> of {maxCompare} selected
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openModal('compare')}
            disabled={compareVendors.length < 2}
          >
            <Icon name="scale" size={16} />
            Compare
          </button>
          <button type="button" className="btn btn-ghost compare-clear" onClick={clearCompare}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
