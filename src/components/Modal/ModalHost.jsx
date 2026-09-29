import { useApp } from '../../context/AppContext';
import VendorModal from './VendorModal';
import BookingModal from './BookingModal';
import ChatModal from './ChatModal';
import CompareModal from './CompareModal';
import VideoModal from './VideoModal';
import LoginModal from './LoginModal';
import CustomerModal from './CustomerModal';
import VendorEditModal from './VendorEditModal';

const REGISTRY = {
  vendor: VendorModal,
  booking: BookingModal,
  chat: ChatModal,
  compare: CompareModal,
  video: VideoModal,
  login: LoginModal,
  customer: CustomerModal,
  vendorEdit: VendorEditModal,
};

/**
 * Renders the modal stack from context. Stacking is real — opening Book from
 * a vendor profile leaves the profile mounted underneath, and closing returns
 * to it. Modal.jsx tracks depth so only the top dialog handles Escape.
 */
export default function ModalHost() {
  const { modals, closeModal } = useApp();

  return modals.map((entry) => {
    const Component = REGISTRY[entry.type];
    if (!Component) return null;
    return <Component key={entry.key} {...entry.props} onClose={closeModal} />;
  });
}
