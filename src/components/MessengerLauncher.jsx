import './MessengerLauncher.css';

export default function MessengerLauncher() {
  return (
    <a className="wildcard-messenger-launcher"
      href="https://party.wildcarddev.com/?app=messenger"
      target="_blank" rel="noopener noreferrer"
      aria-label="Open WildCard Messenger in a new tab"
      title="WildCard Messenger">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    </a>
  );
}
