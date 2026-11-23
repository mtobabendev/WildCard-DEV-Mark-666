const LABEL = { kandy: 'Kandy', ashley: 'Ashley' }
const PARTY = 'https://party.wildcarddev.com'

export default function AfterHoursPrivateArea({ area }) {
  const name = LABEL[area] || 'WildCard DEV'
  return <main style={{ minHeight: '100dvh', background: '#160b20', color: '#ffeafb', font: '16px/1.7 system-ui,sans-serif' }}>
    <div style={{ padding: '14px clamp(20px,4vw,50px)', borderBottom: '1px solid #543253' }}>
      <a href="/" style={{ color: '#ffc4ec' }}>♠ WildCard DEV</a>
      <span style={{ marginLeft: 22 }}>{name}'s After Hours · Approved Members</span>
    </div>
    <iframe
      title={name + ' private members vault'}
      src={PARTY + '/afterhours-members.html?area=' + encodeURIComponent(area)}
      style={{ width: '100%', minHeight: 'calc(100dvh - 62px)', height: 900, border: 0 }}
      referrerPolicy="no-referrer"
    />
  </main>
}
