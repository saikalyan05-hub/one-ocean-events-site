import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import CompareTable from '../../components/Compare/CompareTable';
import Icon from '../../components/common/Icon';
import { EmptyState } from '../../components/common';

/** Compare (update spec §10). Up to three vendors, side by side. */
export default function DashboardCompare() {
  const { compareVendors, clearCompare, maxCompare } = useApp();

  return (
    <>
      <DashHead
        title="Compare"
        lede={`Put up to ${maxCompare} vendors beside each other before you decide.`}
      />

      {compareVendors.length > 0 ? (
        <>
          <div className="dash-toolbar">
            <p className="dash-lede" style={{ margin: 0 }}>
              {compareVendors.length} of {maxCompare} selected
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearCompare}>
              <Icon name="trash" size={15} /> Clear all
            </button>
          </div>
          <div className="dash-card">
            <CompareTable flush />
          </div>
        </>
      ) : (
        <EmptyState
          icon="scale"
          title="Nothing to compare yet ⚖️"
          text={`Tap Compare on any vendor card to add them here — up to ${maxCompare} at a time.`}
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
