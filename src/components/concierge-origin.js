// Production hosts only; never trust an arbitrary Vercel preview origin.
const aliases = new Set([
  'https://wildcard-office.vercel.app',
  'https://wildcard-showroom-enhanced-1500.vercel.app',
  'https://pennytube.vercel.app',
  'https://wildcard-party.vercel.app',
  'https://wild-card-dev-mark-666.vercel.app',
])
export function allowedConciergeOrigin(value) {
  try {
    const url = new URL(value)
    return url.origin === value && url.protocol === 'https:' && !url.port &&
      (url.hostname === 'wildcarddev.com' || url.hostname.endsWith('.wildcarddev.com') || aliases.has(value))
  } catch { return false }
}
