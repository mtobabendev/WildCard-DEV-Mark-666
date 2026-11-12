export default function JennPanel({ videoActive, links }) {
  return (
    <article className="identity-card identity-card--jenn" aria-labelledby="jenn-panel-title">
      <div className="jenn-video-shell">
        {videoActive && (
          <video
            src="/static/JennIntro.webm"
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
      <a className="jenn-company-email" href="mailto:Jenn@WildCardDEV.com" style={{ color: "inherit", fontSize: ".8rem", overflowWrap: "anywhere", alignSelf: "start" }}>Jenn@WildCardDEV.com</a>
      {links}
    </article>
  );
}
