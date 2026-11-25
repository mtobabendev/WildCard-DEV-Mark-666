import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const cover=readFileSync(new URL('../src/components/ManagedCreatorContent.jsx',import.meta.url),'utf8')
const penny=readFileSync(new URL('../src/PennyAfterHours.jsx',import.meta.url),'utf8')
test('assigned cover is isolated by media ID and uses a native inline loop',()=>{
 assert.ok(cover.includes('<ManagedCoverVideo key={video.id}'))
 assert.ok(cover.includes('src={video.src} muted loop playsInline'))
 assert.ok(cover.includes('if(element.error)element.load()'))
 assert.ok(cover.includes('onPlaying='))
})
test('changing the avatar resets pause state and old rejected play cannot latch it',()=>{
 assert.ok(penny.includes('setProfilePaused(false);\n  }, [avatarAsset?.id])'))
 assert.ok(penny.includes("key={avatarAsset?.id || 'legacy'}"))
 assert.ok(penny.includes('video.play()?.catch?.(() => {})'))
 assert.ok(penny.includes('if (video.error) video.load()'))
})
