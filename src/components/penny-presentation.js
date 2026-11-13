export const CABARET_GREETINGS = [
  ['Morning after midnight', 'Coffee, darling. The velvet curtain has not quite closed.'],
  ['Matinee intrigue', 'The day is young. The punchlines are not.'],
  ['Evening, darling', 'The lights are low and the wit is sharp.'],
  ['Midnight at the cabaret', 'Good conversation is the finest vice in this room.'],
]
export const CABARET_QUIPS = [
  'I prefer my jokes dry, my neon bright, and my plans elegantly complicated.',
  'A little double meaning is a luxury. A double booking is not.',
  'The dress code is confidence; the house rule is good manners.',
  'The velvet rope is purely decorative. Curiosity gets you a seat.',
  'If wit were a cocktail, I would serve it straight up.',
  'Flattery gets you a smile. A good question gets you an answer.',
  'The spotlight is warm. The punchlines are wickedly precise.',
  'Leave the drama at the door. Bring the good stories.',
]
export function presentationForPath(pathname) {
  return String(pathname).replace(/\/+$/, '') === '/penny/after-hours' ? 'cabaret' : 'standard'
}
export function cabaretAwarenessLine(card) {
  if (!card || card.kind === 'alert') return card?.text || ''
  if (card.kind === 'weather') return card.text + ' The cabaret has excellent indoor lighting.'
  if (card.kind === 'horoscope') return card.text + ' A little mystery suits you.'
  return card.text
}
