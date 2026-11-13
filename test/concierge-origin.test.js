import test from 'node:test'
import assert from 'node:assert/strict'
import { allowedConciergeOrigin } from '../src/components/concierge-origin.js'
test('only WildCard HTTPS production origins and enumerated aliases are accepted', () => {
  for (const origin of ['https://www.wildcarddev.com','https://labs.wildcarddev.com','https://wildcarddev.com','https://wildcard-office.vercel.app','https://pennytube.vercel.app']) assert.equal(allowedConciergeOrigin(origin), true)
  for (const origin of ['https://wildcarddev.com.evil.test','https://evilwildcarddev.com','https://any.vercel.app','http://labs.wildcarddev.com','https://labs.wildcarddev.com:444','https://labs.wildcarddev.com/path','null','']) assert.equal(allowedConciergeOrigin(origin), false)
})
