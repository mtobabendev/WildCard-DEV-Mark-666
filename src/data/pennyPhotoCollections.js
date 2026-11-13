import { PANEL_IMAGES } from '../components/PennyAfterHoursSpinner.jsx';

const portraits = PANEL_IMAGES.map(({ number, src }) => ({
  id: `portrait-${number}`,
  src,
  title: `Portrait ${String(number).padStart(2, '0')}`,
}));

export const PHOTO_GALLERIES = [
  { id: 'portraits-01-06', title: 'Portraits 01–06', photos: portraits.slice(0, 6) },
  { id: 'portraits-07-08', title: 'Portraits 07–08', photos: portraits.slice(6, 8) },
  {
    id: 'cover-reveal',
    title: 'After Hours cover reveal',
    photos: [
      { id: 'cover-reveal', src: '/static/PennyOnlyFansBanner.jpg', title: 'After Hours cover reveal' },
    ],
  },
];
