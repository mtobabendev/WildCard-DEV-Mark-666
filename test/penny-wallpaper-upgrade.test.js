import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync, existsSync } from 'node:fs'

const source = (name) => readFileSync(new URL(name, import.meta.url), 'utf8')

test('Penny cover uses the new protected wallpaper on both layouts with safe guest fallback', () => {
  for (const file of ['../src/PennyAfterHours.jsx', '../src/components/AfterHoursDesktop.jsx']) {
    const contents = source(file)
    assert.match(contents, /pennyPrivateMedia\('wc-vault__Penny Cover Art__5066\.mp4'\)/)
    assert.match(contents, /fallbackSrc=['"]\/static\/penny-wallpaper-teaser\.mp4['"]/)
    assert.match(contents, /poster="\/static\/penny-wallpaper-poster\.webp"/)
    assert.match(contents, /width=\{720\}\s+height=\{1080\}/)
    assert.doesNotMatch(contents, /PennyNewFansBanner\.webm/)
  }
})

test('existing viewport playback is used for video error fallback without changing privacy checks', () => {
  const c = source('../src/components/ViewportVideo.jsx')
  const binder = source('../src/components/viewport-video-playback.js')
  assert.match(c, /fallbackSrc: source === src \? fallbackSrc : src/)
  assert.match(c, /fallbackSrc, viewportRef/)
  assert.match(binder, /video\.addEventListener\('error', onError\)/)
  assert.match(binder, /currentSource = fallbackSrc/)
})

test('public route includes only the five-second safe teaser and still poster', () => {
  const video = new URL('../public/static/penny-wallpaper-teaser.mp4', import.meta.url)
  const poster = new URL('../public/static/penny-wallpaper-poster.webp', import.meta.url)
  assert.ok(existsSync(video))
  assert.ok(existsSync(poster))
  assert.ok(statSync(video).size > 20000 && statSync(video).size < 1000000)
  assert.ok(statSync(poster).size > 4000 && statSync(poster).size < 100000)
  assert.equal(existsSync(new URL('../public/static/PennyNewFansBanner1-silent.webm', import.meta.url)), false)
  assert.equal(existsSync(new URL('../public/static/wc-vault__Penny Cover Art__5066.mp4', import.meta.url)), false)
})

test('portrait wallpaper is centered and scaled without cropping on both layouts', () => {
  for (const [file, selector] of [
    ['../src/PennyAfterHours.css', '.penny-fans__cover-image'],
    ['../src/components/AfterHoursDesktop.css', '.ah-desktop__cover-video'],
  ]) {
    const rule = source(file).split(selector + ' {')[1]?.split('}')[0] || ''
    assert.match(rule, /width:\s*100%/)
    assert.match(rule, /height:\s*100%/)
    assert.match(rule, /object-fit:\s*contain/)
    assert.match(rule, /object-position:\s*center;/)
  }
})
