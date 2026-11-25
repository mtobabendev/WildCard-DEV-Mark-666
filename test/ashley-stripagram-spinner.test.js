import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('Ashley has the third profile link while Jenn keeps her two-card deck',()=>{
 const app=read('src/App.jsx'),css=read('src/styles.css')
 assert.match(app,/<AshleyPanel[^\n]*stripagram="https:\/\/party\.wildcarddev\.com\/stripagram\/\?profile=ashley"/)
 assert.doesNotMatch(app,/<JennPanel[^\n]*stripagram=/)
 assert.match(app,/\{stripagram && <a className="identity-link-card ashley-link-card--stripagram"/)
 assert.match(css,/mini-spinner--three-person[^\n]*nth-child\(2\) \{ --mini-angle: 120deg/)
 assert.match(css,/mini-spinner--three-person[^\n]*nth-child\(3\) \{ --mini-angle: 240deg/)
 assert.match(css,/mini-spinner--three-person[^\n]*repeat\(3,minmax\(0,1fr\)\)/)
})
