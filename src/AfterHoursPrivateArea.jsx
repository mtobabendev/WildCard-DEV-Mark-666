import AfterHoursPublicProfile from './components/AfterHoursPublicProfile.jsx'

const LABEL = { kandy: 'Kandy', ashley: 'Ashley' }
const PARTY = 'https://party.wildcarddev.com'

export default function AfterHoursPrivateArea({ area }) {
  const name = LABEL[area] || 'WildCard DEV'
  return <AfterHoursPublicProfile area={area} accessStatus="allowed">
    <iframe
      title={name + ' private members vault'}
      src={PARTY + '/afterhours-members.html?area=' + encodeURIComponent(area)}
      style={{ display: 'block', width: '100%', minHeight: '70dvh', height: 900, border: 0 }}
      referrerPolicy="no-referrer"
    />
  </AfterHoursPublicProfile>
}
