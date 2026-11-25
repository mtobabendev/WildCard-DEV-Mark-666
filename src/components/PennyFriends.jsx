import { useEffect, useRef, useState } from 'react';

export const FRIENDS = [
  { name: 'Kandy', initial: 'K', url: '/kandy/showcase', platform: 'WildCard DEV', image: '/static/KandyOnlyFans2.jpg' },
  { name: 'Ashley', initial: 'A', url: '/ashley/what-if', platform: 'WildCard DEV', image: '/static/AshleyPenthouseMemory.webp' },
  { name: 'Mia Brookes', initial: 'M', handle: '@miabrookestv', slideshow: { src: '/static/friends/mia-slides.webp', frames: 6 }, url: 'https://onlyfans.com/itsmiabrookes?rec=603551670' },
  { name: 'Brooke', initial: 'B', handle: '@brookeshowsxx', slideshow: { src: '/static/friends/brooke-slides.webp', frames: 5 }, url: 'https://onlyfans.com/brookeshowsxx?rec=603551670' },
  { name: 'Aisha Moon', initial: 'A', handle: '@aaaisha_moon', slideshow: { src: '/static/friends/aisha-moon-slides.webp', frames: 8 }, url: 'https://onlyfans.com/aaaisha_moon?rec=603551670' },
  { name: 'Angel Jessy', initial: 'A', handle: '@angel.jessyy', slideshow: { src: '/static/friends/angel-jessy-slides.webp', frames: 9 }, url: 'https://onlyfans.com/angel.jessyy?rec=603551670' },
  { name: 'Lacie Heart', initial: 'L', handle: '@lacieheartvip', slideshow: { src: '/static/friends/lacie-heart-slides.webp', frames: 10 }, url: 'https://onlyfans.com/lacieheartvip?rec=603551670' },
  { name: 'Snow Bird', initial: 'S', handle: '@snugglbuggx', slideshow: { src: '/static/friends/snow-bird-slides.webp', frames: 7 }, accent: 'snow-bird', url: 'https://onlyfans.com/snugglbuggx?rec=603551670' },
  { name: 'Goon Goddess', initial: 'G', handle: '@hotnweird', slideshow: { src: '/static/goon-goddess-slides.avif', frames: 9, avatarFrames: true }, url: 'https://onlyfans.com/hotnweird?rec=603551670' },
  { name: 'Evemarie', initial: 'E', handle: '@evamarieee', slideshow: { src: '/static/friends/evemarie-slides.webp', frames: 8, avatarFrames: true }, url: 'https://onlyfans.com/evamarieee?rec=603551670' },
  { name: 'Karley Stokes', initial: 'K', handle: '@karleystokes', slideshow: { src: '/static/friends/karley-stokes-slides.webp', frames: 8, avatarFrames: true }, url: 'https://onlyfans.com/karleystokes?rec=603551670' },
  { name: 'Annabella Ivy', initial: 'A', handle: '@annabellaivy', url: 'https://onlyfans.com/annabellaivy?rec=603551670', slideshow: { src: '/static/annabella-ivy-slides.webp', frames: 9, avatarFrames: true } },
  { name: 'LALA', initial: 'L', handle: '@laurencorazza', url: 'https://onlyfans.com/laurencorazza?rec=603551670', slideshow: { src: '/static/lala-slides.webp', frames: 8, avatarFrames: true } },
];

const FRIEND_SLIDESHOW_INTERVAL_MS = 6000;

// A featured friend's cover advances in order and the avatar shuffles independently.
export function PennyFriendCard({ friend }) {
  const slideshow = friend.slideshow || null;
  const frames = slideshow?.frames ?? 0;
  const sheetFrames = slideshow?.avatarFrames ? frames * 2 : frames;
  const isFeatured = frames > 1;
  const cardRef = useRef(null);
  const visibleRef = useRef(true);
  const [coverIndex, setCoverIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(() =>
    isFeatured ? 1 + Math.floor(Math.random() * (frames - 1)) : 0
  );

  useEffect(() => {
    if (!isFeatured || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let observer;
    if ('IntersectionObserver' in window && cardRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        visibleRef.current = entry.isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(cardRef.current);
    }

    const timer = window.setInterval(() => {
      if (!visibleRef.current || document.hidden) return;
      setCoverIndex((current) => (current + 1) % frames);
      setAvatarIndex((current) => {
        const next = Math.floor(Math.random() * (frames - 1));
        return next >= current ? next + 1 : next;
      });
    }, FRIEND_SLIDESHOW_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      observer?.disconnect();
    };
  }, [isFeatured, frames]);

  const sheetPosition = (index, avatar = false) => ({
    '--penny-friend-slide-x': (((index + (avatar && slideshow.avatarFrames ? frames : 0)) * 100) / (sheetFrames - 1)) + '%',
    '--penny-friend-slide-src': 'url("' + slideshow.src + '")',
    '--penny-friend-slide-scale': (sheetFrames * 100) + '%',
  });

  return (
    <a
      ref={cardRef}
      className={'penny-fans__friend-card' + (isFeatured ? ' penny-fans__friend-card--featured' : '') + (friend.accent === 'snow-bird' ? ' penny-fans__friend-card--snow-bird' : '')}
      href={friend.url}
      target={friend.platform ? undefined : '_blank'}
      rel={friend.platform ? undefined : 'noopener noreferrer'}
      aria-label={'Visit ' + friend.name + ' on ' + (friend.platform || 'OnlyFans') + (friend.platform ? '' : ', opens in a new tab')}
    >
      <span className="penny-fans__friend-cover" aria-hidden="true">
        {isFeatured ? (
          <span className="penny-fans__featured-cover-slide" style={sheetPosition(coverIndex)} />
        ) : friend.image && <img src={friend.image} alt="" loading="lazy" decoding="async" onError={event => { event.currentTarget.style.display = "none" }} />}
        <span className="penny-fans__friend-platform">{friend.platform || 'OnlyFans'}</span>
      </span>
      <span className="penny-fans__friend-avatar" aria-hidden="true">
        {isFeatured ? (
          <><span className="penny-fans__friend-initial-fallback">{friend.initial}</span><span className="penny-fans__featured-avatar-slide" style={sheetPosition(avatarIndex, true)} /></>
        ) : friend.image ? <><span className="penny-fans__friend-initial-fallback">{friend.initial}</span><img src={friend.image} alt="" loading="lazy" decoding="async" onError={event => { event.currentTarget.style.display = "none" }} /></> : friend.initial}
      </span>
      <span className="penny-fans__friend-name">
        <strong>{friend.name}</strong>
        <small>{friend.handle || (friend.platform || 'OnlyFans')}</small>
      </span>
    </a>
  );
}
