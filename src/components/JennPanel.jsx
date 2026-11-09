export default function JennPanel({ videoActive }) {
  return (
    <article className="identity-card identity-card--jenn" aria-labelledby="jenn-panel-title">
      <div className="jenn-video-shell">
        {videoActive && (
          <video
            src="/static/JennOrTreat2.webm"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Jenn’s introduction"
          />
        )}
      </div>
      <h2 id="jenn-panel-title">Jenn</h2>
      <button className="penny-destination-pill" type="button" disabled aria-describedby="jenn-gallery-status">
        JENN’S GALLERY
      </button>
      <small id="jenn-gallery-status">Gallery coming soon</small>
    </article>
  );
}
