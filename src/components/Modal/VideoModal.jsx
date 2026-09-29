import Icon from '../common/Icon';
import Modal from './Modal';
import './VideoModal.css';

/**
 * "Watch Our Story" placeholder. No third-party player is embedded — dropping
 * an <iframe> in here later is the only change needed.
 */
export default function VideoModal({ onClose }) {
  return (
    <Modal size="lg" onClose={onClose} title="Our story" labelledBy="video-title">
      <div className="video-frame">
        <div className="video-inner">
          <span className="video-play" aria-hidden="true">
            <Icon name="play" size={30} />
          </span>
          <p className="video-title">Film coming soon</p>
          <p className="video-text">
            The One Ocean Events story film is not part of this demo. When it is ready, it plays
            right here.
          </p>
        </div>
      </div>

      <p className="video-note">
        <Icon name="info" size={14} /> Placeholder — no video is loaded and nothing is streamed.
      </p>
    </Modal>
  );
}
