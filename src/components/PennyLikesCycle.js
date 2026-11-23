// Visual-only Likes counter, independent of real member engagement statistics.
export const INITIAL_LIKES_TENTHS = 2160
export const MIN_LIKES_DELAY_MS = 1000
export const MAX_LIKES_DELAY_MS = 6000

export const nextLikesTenths = count => count + 1
export function formatLikes(count) {
  const value = count / 10
  return (count % 10 === 0 ? String(value) : value.toFixed(1)) + 'K'
}
export function randomLikesDelay(random = Math.random) {
  return MIN_LIKES_DELAY_MS + Math.floor(random() * (MAX_LIKES_DELAY_MS - MIN_LIKES_DELAY_MS + 1))
}
