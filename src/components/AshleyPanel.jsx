export default function AshleyPanel({ active }) {
  return (
    <article className="identity-card identity-card--ashley" aria-labelledby="ashley-panel-title">
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
      <div className="ashley-copy">
        <p className="eyebrow">In loving memory</p>
        <h2 id="ashley-panel-title">Ashley</h2>
        <p>Forever part of our story.</p>
      </div>
    </article>
  );
}
