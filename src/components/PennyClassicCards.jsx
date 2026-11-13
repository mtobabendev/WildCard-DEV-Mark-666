import CreatorDisplayOrbit from './CreatorDisplayOrbit.jsx';

// Original six-card deck, restored from c4cf3a1 with distinct namespaced paths.
const CLASSIC_CARDS = [
  {
    "title": "Card 01",
    "description": "Original WildCard DEV spinner exhibit 1.",
    "video": "/static/penny-classic-cards/PennyCard1.webm",
    "poster": "/static/penny-classic-cards/poster-1.jpg",
    "icon": "♠"
  },
  {
    "title": "Card 02",
    "description": "Original WildCard DEV spinner exhibit 2.",
    "video": "/static/penny-classic-cards/Card2.webm",
    "poster": "/static/penny-classic-cards/poster-2.jpg",
    "icon": "♠"
  },
  {
    "title": "Card 03",
    "description": "Original WildCard DEV spinner exhibit 3.",
    "video": "/static/penny-classic-cards/PennyCard3.webm",
    "poster": "/static/penny-classic-cards/poster-3.jpg",
    "icon": "♠"
  },
  {
    "title": "Card 04",
    "description": "Original WildCard DEV spinner exhibit 4.",
    "video": "/static/penny-classic-cards/Yoga.mp4",
    "poster": "/static/penny-classic-cards/poster-4.jpg",
    "icon": "♠"
  },
  {
    "title": "Card 05",
    "description": "Original WildCard DEV spinner exhibit 5.",
    "video": "/static/penny-classic-cards/PennyCard4.webm",
    "poster": "/static/penny-classic-cards/poster-5.jpg",
    "icon": "♠"
  },
  {
    "title": "Card 06",
    "description": "Original WildCard DEV spinner exhibit 6.",
    "video": "/static/penny-classic-cards/PennyQueen.mp4",
    "poster": "/static/penny-classic-cards/poster-6.jpg",
    "icon": "♠"
  }
];

export default function PennyClassicCards() {
  return <CreatorDisplayOrbit name="Penny · Classic Cards" symbol="♠" items={CLASSIC_CARDS} videoCards />;
}
