import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DashHead } from '../../components/Dashboard/DashboardLayout';
import Icon from '../../components/common/Icon';
import { DemoTag, EmptyState, SafeImage } from '../../components/common';
import { DEMO_CUSTOMER } from '../../data/demoData';
import { clockTime, relativeTime } from '../../utils/time';

/**
 * Message oversight (update spec §13).
 *
 * Read-only on purpose. An admin can see that a thread exists and read it for
 * moderation, but cannot write into a customer's conversation — that would put
 * words in someone else's mouth. The threads are the same ones the customer
 * sees, so nothing can diverge between the two screens (§25).
 */
export default function AdminMessages() {
  const { conversationList, conversations } = useApp();
  const [picked, setPicked] = useState(null);

  /* Derived, so the newest thread is open before anything is clicked. */
  const activeId =
    (picked && conversations[picked] ? picked : conversationList[0]?.vendorId) ?? null;
  const active = activeId ? conversations[activeId] : null;

  if (conversationList.length === 0) {
    return (
      <>
        <DashHead title="Messages" lede="Conversations between customers and vendors." />
        <EmptyState
          icon="chat"
          title="No conversations yet 💬"
          text="Threads appear here as soon as a customer messages a vendor."
        />
      </>
    );
  }

  return (
    <>
      <DashHead title="Messages" lede="Conversations between customers and vendors.">
        <p className="dash-lede">
          <DemoTag
            label="Demo threads"
            notice="Sample conversations written for this prototype. No real messages."
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
                      {DEMO_CUSTOMER.name} · {last ? last.text : 'No messages yet'}
                    </span>
                  </span>
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
                <p className="inbox-name wrap-anywhere">
                  {DEMO_CUSTOMER.name} ↔ {active.vendorName}
                </p>
                <p className="inbox-preview">
                  {active.messages.length} messages · last{' '}
                  {relativeTime(active.messages.at(-1)?.at)}
                </p>
              </div>
            </header>

            <div className="thread-body">
              {active.messages.map((message) => (
                <p
                  key={message.id}
                  className={`thread-msg from-${message.author === 'vendor' ? 'vendor' : 'customer'}`}
                >
                  <strong className="thread-author">
                    {message.author === 'vendor' ? active.vendorName : DEMO_CUSTOMER.name}
                  </strong>
                  {message.text}
                  <span className="thread-time">{clockTime(message.at)}</span>
                </p>
              ))}
            </div>

            <p className="page-note">
              <Icon name="info" size={15} />
              <span>
                Admins can read a thread for moderation but cannot reply as the customer or the
                vendor.
              </span>
            </p>
          </section>
        )}
      </div>
    </>
  );
}
