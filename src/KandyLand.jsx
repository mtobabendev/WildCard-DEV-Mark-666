import CreatorProfile from './components/CreatorProfile.jsx';

const kandy = {
  name: 'Kandy',
  brand: 'KandyLand',
  alias: 'Kopacetic Kandle',
  symbol: '♦',
  initials: 'K',
  theme: 'kandy',
  headline: 'Music. Tarot. Imagination.',
  bio: 'Original music and cover art by Kopacetic Kandle, with a passion for tarot and storytelling.',
  contact: 'Kandy@wildcarddev.com',
  posts: [
    {
      id: 'welcome',
      label: 'CREATOR SPOTLIGHT',
      title: 'Welcome to KandyLand',
      body: 'A home for Kandy’s creative projects, music, tarot, and stories. Explore the Music tab for existing releases and return for new creative updates.',
      symbol: '♦',
    },
    {
      id: 'tarot',
      label: 'TAROT & WRITING',
      title: 'The cards and the page',
      body: 'A space for future tarot reflections and creative writing updates.',
      symbol: '✦',
    },
  ],
  music: [
    { title: 'Newest featured track', label: 'Listen on Suno', url: 'https://suno.com/s/JwxHfnS6IWD0exoW' },
    { title: 'Previous featured track', label: 'Listen on Suno', url: 'https://suno.com/song/34d73d33-56ab-4beb-adab-cde275ca1ad3?sh=HRAX1Ir73RfDIBmF' },
    { title: 'Music collection', label: 'Explore on Suno', url: 'https://suno.com/s/8wuDm8yj3GZIab9M' },
  ],
  photos: [],
  videos: [],
};

export default function KandyLand() {
  return <CreatorProfile creator={kandy} />;
}
