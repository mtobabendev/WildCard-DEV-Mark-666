import ShowcaseOrbit from './ShowcaseOrbit.jsx';

const memorialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100083462238607', icon: 'f' },
  { label: 'Memorial', href: '/ashley/memorial', icon: '✦' },
  { label: 'Home', href: '/', icon: '♠' },
];

export default function AshleyPanel({ active }) {
  return (
    <article className="identity-card identity-card--ashley" aria-labelledby="ashley-panel-title">
      <div className="ashley-video-pair">
        <div className="ashley-video-shell">
          {active && (
            <video
              className="ashley-video"
              src="/static/AshleyIntroLoopmp4.webm"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Ashley’s introduction"
            />
          )}
        </div>
        <a
          className="ashley-video-shell ashley-video-portal"
          href="/ashley/what-if"
          aria-label="Open Ashley's What If Time Capsule. Combination required."
        >
          {active && (
            <video
              className="ashley-video"
              src="/static/AshleyHotLoop.webm"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          )}
          <span className="ashley-video-portal-label" aria-hidden="true">
            <span className="ashley-video-lock">🔒</span>
            WHAT IF?
          </span>
        </a>
      </div>
      <div className="ashley-copy">
        <p className="eyebrow">In loving memory</p>
        <h2 id="ashley-panel-title">Ashley</h2>
        <p>Forever part of our story.</p>
      </div>
      <ShowcaseOrbit label="Ashley memorial links" items={memorialLinks} compact />
    </article>
  );
}
