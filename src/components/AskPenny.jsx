import { useEffect, useRef, useState } from 'react';
import './AskPenny.css';

// Extracted from WildCard Party's Ask Penny experience.
// Calls the shared Party backend via this site's same-origin /api/penny relay.
const SESSION_KEY = 'wildcard-after-hours:ask-penny-v1';

function loadMessages() {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || '[]');
    return Array.isArray(value)
      ? value.filter((item) => (
        (item?.role === 'user' || item?.role === 'assistant')
        && typeof item.text === 'string'
      )).slice(-20)
      : [];
  } catch {
    return [];
  }
}

export default function AskPenny() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(loadMessages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const transcriptRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (busy) return;
    try {
      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(messages.slice(-20).map(({ id, role, text }) => ({ id, role, text }))),
      );
    } catch {
      // Chat remains available when session storage is disabled.
    }
  }, [busy, messages]);

  useEffect(() => {
    if (open && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  function closePanel() {
    abortRef.current?.abort();
    setOpen(false);
    triggerRef.current?.focus();
  }

  function clearSession() {
    if (busy) return;
    setMessages([]);
    setDraft('');
    setError('');
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* optional */ }
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;

    const stamp = Date.now();
    const incoming = { id: 'user-' + stamp, role: 'user', text };
    const responseId = 'penny-' + stamp;
    const outgoing = [...messages, incoming].slice(-10)
      .filter((item) => item.text.trim())
      .map((item) => ({ role: item.role, content: item.text }));

    setDraft('');
    setError('');
    setBusy(true);
    setMessages((current) => [
      ...current,
      incoming,
      { id: responseId, role: 'assistant', text: '', pending: true },
    ].slice(-20));

    const controller = new AbortController();
    abortRef.current = controller;
    let received = '';

    try {
      const response = await fetch('/api/penny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: outgoing }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let message = "Penny's line is unavailable right now.";
        try {
          const payload = await response.json();
          if (typeof payload?.error === 'string') message = payload.error;
        } catch { /* retain fallback */ }
        throw new Error(message);
      }
      if (!response.body) throw new Error('The reply stream did not open.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        received += chunk;
        setMessages((current) => current.map((message) => (
          message.id === responseId
            ? { ...message, text: message.text + chunk }
            : message
        )));
      }
      const trailing = decoder.decode();
      if (trailing) {
        received += trailing;
        setMessages((current) => current.map((message) => (
          message.id === responseId
            ? { ...message, text: message.text + trailing }
            : message
        )));
      }
      if (!received.trim()) throw new Error('Penny answered with radio silence. Try again.');
      setMessages((current) => current.map((message) => (
        message.id === responseId ? { ...message, pending: false } : message
      )));
    } catch (cause) {
      const interrupted = cause?.name === 'AbortError';
      setMessages((current) => current.map((message) => (
        message.id === responseId
          ? {
              ...message,
              pending: false,
              text: message.text || (interrupted
                ? 'Transmission interrupted.'
                : 'I lost the line before I could answer.'),
            }
          : message
      )));
      if (!interrupted) {
        setError(cause?.message || "Penny's line is unavailable right now.");
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
    }
  }

  return (
    <div className="after-ask">
      {open && (
        <section
          className="after-ask__panel"
          role="dialog"
          aria-label="Ask Penny"
          aria-modal="false"
          onKeyDown={(event) => {
            if (event.key === 'Escape') closePanel();
          }}
        >
          <header className="after-ask__header">
            <div className="after-ask__identity">
              <span className="after-ask__sigil" aria-hidden="true">♠</span>
              <div><strong>ASK PENNY</strong><small>WILDCARD CONCIERGE / PARTY CONNECTION</small></div>
            </div>
            <div className="after-ask__header-actions">
              <button type="button" disabled={busy || messages.length === 0} onClick={clearSession}>
                Clear
              </button>
              <button type="button" onClick={closePanel} aria-label="Close Ask Penny">×</button>
            </div>
          </header>
          <div ref={transcriptRef} className="after-ask__transcript" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 && (
              <div className="after-ask__message after-ask__message--penny">
                <span>PENNY / LIVE CHAT</span>
                <p>Door's open. What do you need?</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={'after-ask__message ' + (
                  message.role === 'user' ? 'after-ask__message--user' : 'after-ask__message--penny'
                )}
              >
                <span>{message.role === 'user' ? 'YOU' : 'PENNY'}</span>
                <p>{message.text}{message.pending && <i className="after-ask__typing" aria-hidden="true" />}</p>
              </div>
            ))}
            {error && <p className="after-ask__error" role="alert">{error}</p>}
          </div>
          <form className="after-ask__input" onSubmit={sendMessage}>
            <textarea
              value={draft}
              disabled={busy}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage(event);
                }
              }}
              aria-label="Message Penny"
              placeholder={busy ? 'Penny is answering…' : 'Ask Penny anything…'}
              rows={2}
              maxLength={2000}
            />
            <button type="submit" disabled={busy || !draft.trim()}>
              {busy ? 'LIVE' : 'SEND'}
            </button>
          </form>
          <p className="after-ask__disclaimer">Messages use WildCard Party's existing Penny service. This browser session only.</p>
        </section>
      )}
      <button
        ref={triggerRef}
        className="after-ask__dock"
        type="button"
        aria-label={open ? 'Close Ask Penny' : 'Open Ask Penny'}
        aria-expanded={open}
        onClick={() => open ? closePanel() : setOpen(true)}
      >
        <span className="after-ask__dock-sigil" aria-hidden="true">♠</span>
        <span><strong>ASK PENNY</strong><small>{open ? 'CLOSE CHAT' : 'CONCIERGE'}</small></span>
        <span className="after-ask__dock-light" aria-hidden="true" />
      </button>
    </div>
  );
}
