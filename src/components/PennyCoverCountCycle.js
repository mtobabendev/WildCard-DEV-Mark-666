// Decorative Penny After Hours profile counter; not the number of published previews.
export const FIRST_POST_COUNT = 661
export const LAST_POST_COUNT = 666
export const POST_COUNT_TICK_MS = 2000

export function advancePostCount(current) {
  return current >= LAST_POST_COUNT ? FIRST_POST_COUNT : current + 1
}
