import test from 'node:test'
import assert from 'node:assert/strict'
import { bindUserLoopPlayback } from '../src/components/user-loop-playback.js'

class FakeVideo extends EventTarget {
  paused = true
  loop = false
  playCalls = 0
  pauseCalls = 0

  play() {
    this.playCalls += 1
    this.paused = false
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  }
  pause() {
    this.pauseCalls += 1
    if (!this.paused) {
      this.paused = true
      this.dispatchEvent(new Event('pause'))
    }
  }
}
class FakeObserver {
  static current
  constructor(callback) {
    this.callback = callback
    this.disconnected = false
    FakeObserver.current = this
  }
  observe(target) { this.target = target }
  emit(isIntersecting) {
    this.callback([{ target: this.target, isIntersecting }])
  }
  disconnect() { this.disconnected = true }
}
function setup() {
  const video = new FakeVideo()
  const page = new EventTarget()
  page.hidden = false
  const cleanup = bindUserLoopPlayback(video, { page, Observer: FakeObserver })
  const observer = FakeObserver.current
  return { video, page, cleanup, observer }
}

test('manual clips never autoplay; first play enables native looping', () => {
  const { video, observer, cleanup } = setup()
  observer.emit(true)
  assert.equal(video.playCalls, 0)
  assert.equal(video.loop, true)
  video.play()
  assert.equal(video.paused, false)
  cleanup()
})

test('playing clip pauses offscreen and resumes on return', () => {
  const { video, observer, cleanup } = setup()
  video.play()
  observer.emit(false)
  assert.equal(video.paused, true)
  observer.emit(true)
  assert.equal(video.paused, false)
  assert.equal(video.playCalls, 2)
  cleanup()
})

test('manual Pause overrides viewport reentry until a new user Play', () => {
  const { video, observer, cleanup } = setup()
  video.play()
  video.pause()
  observer.emit(false)
  observer.emit(true)
  assert.equal(video.paused, true)
  assert.equal(video.playCalls, 1)
  video.play()
  observer.emit(false)
  observer.emit(true)
  assert.equal(video.paused, false)
  assert.equal(video.playCalls, 3)
  cleanup()
})

test('hidden browser tab pauses and visible tab resumes previously played clips', () => {
  const { video, page, cleanup } = setup()
  video.play()
  page.hidden = true
  page.dispatchEvent(new Event('visibilitychange'))
  assert.equal(video.paused, true)
  page.hidden = false
  page.dispatchEvent(new Event('visibilitychange'))
  assert.equal(video.paused, false)
  cleanup()
})

test('cleanup disconnects observer and does not restart a released video', () => {
  const { video, observer, cleanup } = setup()
  video.play()
  cleanup()
  assert.equal(observer.disconnected, true)
  assert.equal(video.paused, true)
  observer.emit(true)
  assert.equal(video.paused, true)
})
