// No media bytes belong in public bundles; Party performs session and grant checks.
const PARTY = 'https://party.wildcarddev.com'
export function pennyPrivateMedia(filename) {
  if (typeof filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_(). -]{0,179}$/.test(filename)) {
    throw new Error('Invalid Penny private media identifier.')
  }
  return PARTY + '/api/afterhours/media?area=penny&name=' + encodeURIComponent(filename)
}
