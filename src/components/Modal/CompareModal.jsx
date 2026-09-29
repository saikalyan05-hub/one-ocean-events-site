import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';
import { EmptyState } from '../common';
import CompareTable from '../Compare/CompareTable';
import Modal from './Modal';

/**
 * Side-by-side comparison of up to MAX_COMPARE vendors (spec §12).
 * The table itself lives in <CompareTable> so the dashboard's Compare screen
 * shows exactly the same rows (update spec §1, §10).
 */
export default function CompareModal({ onClose }) {
  const { compareVendors, clearCompare, maxCompare } = useApp();

  if (compareVendors.length === 0) {
    return (
      <Modal size="sm" onClose={onClose} title="Compare vendors">
        <EmptyState
          icon="scale"
          title="Nothing to compare yet"
          text={`Add up to ${maxCompare} vendors using the Compare button on any vendor card.`}
          actions={
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Browse vendors
            </button>
          }
        />
      </Modal>
    );
  }

  return (
    <Modal
      size="xl"
      onClose={onClose}
      title="Compare vendors"
      subtitle={`${compareVendors.length} of ${maxCompare} selected`}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={clearCompare}>
            <Icon name="trash" size={16} /> Clear all
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <CompareTable />
    </Modal>
  );
}
