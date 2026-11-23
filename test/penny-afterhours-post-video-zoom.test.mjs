import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const code = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('mobile post video keeps the full-image tap target and pauses preview before opening viewer', () => {
  const src = code('src/PennyAfterHours.jsx')
  assert.match(src, /const openPostVideo = \(post\) =>/)
  assert.match(src, /VIDEOS\.findIndex\(\(video\) => video\.src === post\.video\)/)
  assert.match(src, /\[post\.id\]: true/)
  assert.match(src, /setActiveMedia\(\{ kind: 'video', index \}\)/)
  assert.match(src, /className="penny-fans__post-video-expand"[\s\S]*?onClick=\{\(\) => openPostVideo\(post\)\}/)
  assert.doesNotMatch(src, /↗ Tap to enlarge/)
})

test('mobile eyes pause is beside the caption, not over the video', () => {
  const src = code('src/PennyAfterHours.jsx')
  const css = code('src/PennyAfterHours.css')
  assert.match(src, /className="penny-fans__post-copy"[\s\S]*?className="penny-fans__post-meta"[\s\S]*?className="penny-fans__post-video-control"/)
  assert.match(src, /<span aria-hidden="true">👀<\/span>/)
  assert.match(css, /\.penny-fans__post-video-expand\s*\{[^}]*inset:\s*0;/)
  assert.match(css, /\.penny-fans__post-video-control\s*\{[^}]*position:\s*static;/)
  assert.match(css, /focus-visible/)
})

test('desktop enlarges from a text-free button below video and retains native controls', () => {
  const src = code('src/components/AfterHoursDesktop.jsx')
  const css = code('src/components/AfterHoursDesktop.css')
  const player = code('src/components/UserLoopVideo.jsx')
  assert.match(src, /function DesktopPostVideo/)
  assert.match(src, /<UserLoopVideo controlRef=\{videoRef\} controls/)
  assert.match(src, /onOpen\(item\)/)
  assert.match(src, /video\.pause\(\)/)
  assert.match(src, /video\.play\(\)/)
  assert.match(src, /aria-label=\{'Enlarge ' \+ item\.title \+ ' video'\} title="Enlarge video">↗<\/button>/)
  assert.match(src, />👀<\/button>/)
  assert.doesNotMatch(src, /↗ Tap to enlarge/)
  assert.match(css, /\.ah-desktop__post-video-actions\s*\{[^}]*display:\s*flex;/)
  assert.match(player, /controlRef\.current = video/)
  assert.match(player, /controlRef\.current = null/)
})
