import { useEffect, useState } from 'react';
import './MessengerLauncher.css';

export default function MessengerLauncher() {
  const [ready, setReady] = useState(() => Boolean(document.querySelector('wildcard-messenger')));
  useEffect(() => {
    const loaded = () => setReady(true);
    window.addEventListener('wildcard:messenger:ready', loaded);
    if (document.querySelector('wildcard-messenger')) loaded();
    if (!document.querySelector('script[data-wildcard-messenger]')) {
      const script = document.createElement('script');
      script.src = '/static/messenger-launcher.js';
      script.dataset.wildcardMessenger = 'true';
      script.async = true;
      document.body.append(script);
    }
    return () => window.removeEventListener('wildcard:messenger:ready', loaded);
  }, []);
  if (ready) return null;
  return (
    <a className="wildcard-messenger-launcher"
      href="https://party.wildcarddev.com/?app=messenger"
      target="_blank" rel="noopener noreferrer"
      aria-label="Open WildCard Messenger"
      title="WildCard Messenger">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    </a>
  );
}
