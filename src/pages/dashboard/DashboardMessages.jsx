import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DemoTag, EmptyState, SafeImage } from '../../components/common';
import { clockTime, relativeTime } from '../../utils/time';

/**
 * Messages (update spec §11).
 *
 * A two-pane inbox over the same conversation state the chat modal writes to,
 * so a reply sent from a vendor card shows up here and the other way round (§25).
 */
export default function DashboardMessages() {
  const { conversationList, conversations, openConversation, sendMessage } = useApp();
  const [picked, setPicked] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);

  /*
   * Derived rather than stored: until the visitor picks a thread the newest one
   * is shown, so the pane is never blank while the seeded conversations load.
   */
  const activeId =
    (picked && conversations[picked] ? picked : conversationList[0]?.vendorId) ?? null;

  // Opening a thread marks it read, and that survives a reload.
  useEffect(() => {
    if (activeId) openConversation(activeId);
  }, [activeId, openConversation]);

  const active = activeId ? conversations[activeId] : null;
  const messageCount = active?.messages.length ?? 0;

  // Keep the latest message in view as the thread grows.
  useEffect(() => {
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messageCount]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    setSending(true);
    setDraft('');
    try {
      await sendMessage(activeId, text);
    } finally {
      setSending(false);
    }
  };

  if (conversationList.length === 0) {
    return (
      <>
        <DashHead title="Messages" lede="Your conversations with vendors." />
        <EmptyState
          icon="chat"
          title="No messages yet 💬"
          text="Open a vendor and tap Message to start a conversation."
          actions={
            <Link to="/vendors" className="btn btn-primary">
              Find Vendors
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <DashHead title="Messages" lede="Your conversations with vendors, newest first.">
        <p className="dash-lede">
          <DemoTag
            label="Demo conversations"
            notice="Sample messages written for this prototype. No vendor has been contacted."
          />
        </p>
      </DashHead>

      <div className="inbox">
        <ul className="inbox-list" aria-label="Conversations">
          {conversationList.map((conversation) => {
            const last = conversation.messages.at(-1);
            const selected = conversation.vendorId === activeId;
            return (
              <li key={conversation.vendorId}>
                <button
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  className={`inbox-item ${selected ? 'is-on' : ''}`.trim()}
                  onClick={() => setPicked(conversation.vendorId)}
                >
                  <SafeImage src={conversation.vendorImage} alt="" className="inbox-thumb" />
                  <span className="inbox-item-text">
                    <span className="inbox-name clamp-1 wrap-anywhere">
                      {conversation.vendorName}
                    </span>
                    <span className="inbox-preview clamp-1">
                      {last ? last.text : 'No messages yet'}
                    </span>
                  </span>
                  {conversation.unread > 0 && (
                    <span className="inbox-unread">
                      {conversation.unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {active && (
          <section className="thread" aria-label={`Conversation with ${active.vendorName}`}>
            <header className="thread-head">
              <SafeImage src={active.vendorImage} alt="" className="inbox-thumb" />
              <div className="inbox-item-text">
                <p className="inbox-name wrap-anywhere">{active.vendorName}</p>
                <p className="inbox-preview">
                  Last message {relativeTime(active.messages.at(-1)?.at)}
                </p>
              </div>
            </header>

            <div className="thread-body" ref={bodyRef}>
              {active.messages.map((message) => (
                <p
                  key={message.id}
                  className={`thread-msg from-${message.author === 'vendor' ? 'vendor' : 'customer'}`}
                >
                  {message.text}
                  <span className="thread-time">{clockTime(message.at)}</span>
                </p>
              ))}
            </div>

            <form className="thread-form" onSubmit={handleSend}>
              <label className="sr-only" htmlFor="dash-message">
                Message {active.vendorName}
              </label>
              <input
                id="dash-message"
                className="input"
                placeholder="Write a message…"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || draft.trim().length === 0}
              >
                <Icon name="send" size={16} /> Send
              </button>
            </form>
          </section>
        )}
      </div>
    </>
  );
}
