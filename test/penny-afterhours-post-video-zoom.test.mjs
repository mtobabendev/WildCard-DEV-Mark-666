import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const code = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('mobile video preview opens the existing viewer and pauses the inline preview', () => {
  const src = code('src/PennyAfterHours.jsx')
  assert.match(src, /const openPostVideo = \(post\) =>/)
  assert.match(src, /VIDEOS\.findIndex\(\(video\) => video\.src === post\.video\)/)
  assert.match(src, /\[post\.id\]: true/)
  assert.match(src, /setActiveMedia\(\{ kind: 'video', index \}\)/)
  assert.match(src, /onClick=\{\(\) => openPostVideo\(post\)\}/)
  assert.match(src, /<span aria-hidden="true">👀<\/span>/)
})
test('mobile enlarged video and separate eyes pause control have tap and keyboard focus affordances', () => {
  const css = code('src/PennyAfterHours.css')
  assert.match(css, /\.penny-fans__post-video-expand/)
  assert.match(css, /cursor: zoom-in/)
  assert.match(css, /\.penny-fans__post-video-control/)
  assert.match(css, /z-index: 2/)
  assert.match(css, /focus-visible/)
})
test('desktop adds tap to enlarge plus separate eyes pause without removing native player controls', () => {
  const src = code('src/components/AfterHoursDesktop.jsx')
  const player = code('src/components/UserLoopVideo.jsx')
  assert.match(src, /function DesktopPostVideo/)
  assert.match(src, /<UserLoopVideo controlRef=\{videoRef\} controls/)
  assert.match(src, /onOpen\(item\)/)
  assert.match(src, /video\.pause\(\)/)
  assert.match(src, /video\.play\(\)/)
  assert.match(src, />👀<\/button>/)
  assert.match(player, /controlRef\.current = video/)
  assert.match(player, /controlRef\.current = null/)
})
