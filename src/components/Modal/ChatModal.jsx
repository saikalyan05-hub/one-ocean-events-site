import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getVendorById } from '../../data/vendors';
import Icon from '../common/Icon';
import { Loading, SafeImage } from '../common';
import Modal from './Modal';
import './ChatModal.css';

const timeLabel = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

/**
 * Demo chat (spec §14). The vendor reply is simulated locally; in production
 * the same conversation object arrives over a socket, so the UI is unchanged.
 */
export default function ChatModal({ vendorId, onClose }) {
  const { conversations, openConversation, sendMessage } = useApp();
  const [draft, setDraft] = useState('');
  const [ready, setReady] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const vendor = getVendorById(vendorId);
  const conversation = conversations[vendorId];
  const messages = conversation?.messages ?? [];

  useEffect(() => {
    let active = true;
    openConversation(vendorId)
      .then(() => active && setReady(true))
      .catch(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [vendorId, openConversation]);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  if (!vendor) {
    return (
      <Modal title="Vendor unavailable" size="sm" onClose={onClose}>
        <p>We could not find that vendor, so there is no conversation to open.</p>
      </Modal>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    sendMessage(vendorId, text);
    inputRef.current?.focus();
  };

  return (
    <Modal size="md" onClose={onClose} labelledBy="chat-title">
      <div className="chat">
        <header className="chat-head">
          <SafeImage src={vendor.image} alt="" className="chat-avatar" />
          <div className="chat-head-text">
            <h2 id="chat-title" className="chat-name wrap-anywhere">
              {vendor.facts.name}
            </h2>
            <p className="chat-status">
              <span className="chat-dot" aria-hidden="true" />
              Usually replies within a few hours
            </p>
          </div>
        </header>

        <div
          className="chat-log"
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-label={`Conversation with ${vendor.facts.name}`}
          tabIndex={0}
        >
          {!ready && messages.length === 0 ? (
            <Loading label="Opening conversation…" />
          ) : (
            <ul className="chat-messages">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`chat-msg chat-msg-${message.author === 'customer' ? 'me' : 'them'}`}
                >
                  <span className="sr-only">
                    {message.author === 'customer' ? 'You said:' : `${vendor.facts.name} said:`}
                  </span>
                  <p className="chat-bubble wrap-anywhere">{message.text}</p>
                  <span className="chat-time">{timeLabel(message.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <label htmlFor="chat-input" className="sr-only">
            Write a message to {vendor.facts.name}
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            className="input chat-input"
            placeholder="Type your message…"
            value={draft}
            maxLength={500}
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary chat-send"
            disabled={draft.trim().length === 0}
          >
            <Icon name="send" size={17} />
            <span className="sr-only">Send message</span>
          </button>
        </form>

        <p className="chat-note">
          <Icon name="info" size={14} /> Demo chat — replies are automated and messages stay in this
          browser.
        </p>
      </div>
    </Modal>
  );
}
