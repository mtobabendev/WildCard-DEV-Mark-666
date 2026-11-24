import './PennyKandyReel.css';

const GALLERY = 'https://party.wildcarddev.com/afterhours-members.html?area=penny&view=galleries&collection=Penny%20and%20Kandy';

export default function PennyKandyReel() {
  return (
    <div className="penny-kandy-reel">
      <a className="penny-kandy-reel__teaser" href={GALLERY}
        aria-label="Open Penny and Kandy photoshoot gallery">
        <img src="/static/penny-kandy-reel-teaser.webp" width="640" height="800"
          alt="Penny and Kandy After Hours artwork"
          loading="lazy" decoding="async" />
      </a>
    </div>
  );
}
