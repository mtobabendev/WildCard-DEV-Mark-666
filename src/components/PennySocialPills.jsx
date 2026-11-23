import './PennySocialPills.css'
const LINKS = [
  { label: 'Party', glyph: 'f', href: 'https://party.wildcarddev.com/', style: 'party' },
  { label: 'X', glyph: '𝕏', href: 'https://x.com/Dev_WildCard', style: 'x' },
  { label: 'Stripagram', glyph: '◎', href: 'https://party.wildcarddev.com/stripagram/', style: 'stripagram' },
  { label: 'PennyTV', glyph: '▶', href: 'https://pennytv.wildcarddev.com/', style: 'tv' }
]
export default function PennySocialPills() {
  return <nav className="penny-social-pills" aria-label="Penny's social links; swipe left or right" tabIndex={0}>
    {LINKS.map(({ label, glyph, href, style }) =>
      <a key={href} href={href} target="_blank" rel="noopener noreferrer"
        className={'penny-social-pills__link penny-social-pills__link--' + style}
        aria-label={label + ' (opens a new tab)'}>
        <span className="penny-social-pills__symbol" aria-hidden="true">{glyph}</span><span>{label}</span>
      </a>
    )}
  </nav>
}
