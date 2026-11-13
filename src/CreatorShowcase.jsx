import { useEffect, useState } from 'react';
import ShowcaseOrbit from './components/ShowcaseOrbit.jsx';
import CreatorDisplayOrbit from './components/CreatorDisplayOrbit.jsx';
import './CreatorShowcase.css';
import AskPenny from './components/AskPenny.jsx';

const profiles = {
  kandy: { name: 'Kandy', accent: '#c5a0ff', symbol: '♦', headline: 'Art, music & tarot', description: 'A creative corner for original art, music, storytelling, and tarot-inspired reflection.', sections: [
    ['Music', 'Explore Kandy’s music on Suno.'], ['Art', 'Original visual art and creative projects.'], ['Tarot', 'A home for tarot reflections and creative inspiration.']
  ], links: [{label:'Music on Suno', href:'https://suno.com/s/JwxHfnS6IWD0exoW', icon:'♫'}, {label:'Facebook', href:'https://www.facebook.com/share/1EXJvJchHu/', icon:'f'}, {label:'Stripagram', href:'https://party.wildcarddev.com/stripagram/?profile=kandy', icon:'◎'}] },
  lucy: { name: 'Lucy', accent: '#ff8a9e', symbol: '♥', headline: 'Design & creative experiments', description: 'A WildCard DEV showcase for design concepts, visual storytelling, and creative experiments.', sections: [
    ['Design', 'Future design projects will be featured here.'], ['Experiments', 'A space for original interactive concepts.'], ['Notes', 'Creative updates and announcements will appear here.']
  ], links: [] },
  erica: { name: 'Erica', accent: '#75e4b3', symbol: '♣', headline: 'Technology & experimentation', description: 'A WildCard DEV showcase for technical ideas, prototypes, and creative exploration.', sections: [
    ['Projects', 'A space for future project showcases.'], ['Experiments', 'Prototype notes and technical concepts.'], ['Updates', 'Announcements and project updates will appear here.']
  ], links: [] },
  ashley: { name: 'Ashley', accent: '#f5b5d5', symbol: '✦', headline: 'In loving memory', description: 'Forever part of our story. A quiet space to celebrate Ashley’s life and the memories worth keeping.', sections: [
    ['Remembrance', 'A place for personal reflections and remembrance.'], ['Memories', 'Family-approved tributes can be shared here in the future.'], ['Connections', 'Remember Ashley through her Facebook profile.']
  ], links: [{label:'Facebook', href:'https://www.facebook.com/profile.php?id=100083462238607', icon:'f'}] },
};
const kandyTracks = [
  { label: 'Latest release', description: 'Hear Kandy’s newest track.', href: 'https://suno.com/s/JwxHfnS6IWD0exoW' },
  { label: 'Previous release', description: 'Revisit the previous track.', href: 'https://suno.com/song/34d73d33-56ab-4beb-adab-cde275ca1ad3?sh=HRAX1Ir73RfDIBmF' },
  { label: 'Music collection', description: 'Explore more of Kandy’s music.', href: 'https://suno.com/s/8wuDm8yj3GZIab9M' },
];
const kandyTabs = [
  ['music', 'Music'], ['art', 'Art'], ['tarot', 'Tarot'], ['about', 'About'],
];

function KandyCreativeProfile() {
  const [tab, setTab] = useState('music');
  return (
    <section className="kandy-creative" aria-label="Kandy fan profile">
      <header className="kandy-creative__header">
        <span className="wc-showcase__eyebrow">WILDCARD DEV / CREATOR EDITION</span>
        <h2>Kandy's creative collection</h2>
        <p>Music, art and tarot. Follow the diamonds.</p>
      </header>
      <nav className="kandy-creative__tabs" aria-label="Kandy collection sections">
        {kandyTabs.map(([id, label]) => (
          <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>
      <div className="kandy-creative__content" aria-live="polite">
        {tab === 'music' && <>
          <h3>Music collection</h3>
          <div className="kandy-creative__grid">
            {kandyTracks.map((track, index) => <article key={track.href} className="kandy-creative__tile">
              <div className="kandy-creative__cover" aria-hidden="true"><span>♫</span><small>0{index + 1} / MUSIC</small></div>
              <h4>{track.label}</h4><p>{track.description}</p>
              <a href={track.href} target="_blank" rel="noopener noreferrer">Listen on Suno ↗</a>
            </article>)}
          </div>
        </>}
        {tab === 'art' && <>
          <h3>Art gallery</h3>
          <div className="kandy-creative__empty"><span aria-hidden="true">♦</span><p>Reserved for Kandy’s original artwork. New exhibits will appear here when available.</p></div>
        </>}
        {tab === 'tarot' && <>
          <h3>Tarot & inspiration</h3>
          <div className="kandy-creative__empty"><span aria-hidden="true">✦</span><p>Explore the creative tarot exhibit in the display orbit above.</p><a href="#kandy-exhibits">Explore exhibits ↑</a></div>
        </>}
        {tab === 'about' && <>
          <h3>About Kandy</h3>
          <p>A WildCard DEV creative space for music, original art, storytelling and tarot-inspired reflection.</p>
          <h4>Connect with Kandy</h4>
          <div className="kandy-creative__links">
            <a href="https://www.facebook.com/share/1EXJvJchHu/" target="_blank" rel="noopener noreferrer">Facebook ↗</a>
            <a href="https://party.wildcarddev.com/stripagram/?profile=kandy" target="_blank" rel="noopener noreferrer">Stripagram ↗</a>
            <a href="https://suno.com/s/8wuDm8yj3GZIab9M" target="_blank" rel="noopener noreferrer">Suno ↗</a>
          </div>
        </>}
      </div>
    </section>
  );
}

const creators = ['kandy','lucy','erica'];
export default function CreatorShowcase({ profileId }) {
  const profile = profiles[profileId];
  const directory = !profile;
  const title = directory ? 'Creator Showcases' : profile.name + ' | ' + (profileId === 'ashley' ? 'In loving memory' : 'Creative showcase');
  useEffect(() => {
    document.title = title + ' | WildCard DEV';
  }, [title]);
  const destinations = directory
    ? creators.map((id) => ({label:profiles[id].name, href:'/'+id+'/showcase', icon:profiles[id].symbol}))
    : [{label:'Home', href:'/', icon:'♠'}, {label:'Showcases', href:'/creators', icon:'✦'}, ...profile.links];
  return (
    <main className="wc-showcase" style={{'--showcase-accent': profile?.accent || '#c5a0ff'}}>
      <header className="wc-showcase__header"><a href="/">← WildCard DEV</a><span>CREATIVE SHOWCASES</span><a href="/creators">Directory</a></header>
      <section className="wc-showcase__hero">
        <p className="wc-showcase__eyebrow">{profileId === 'ashley' ? 'MEMORIAL' : 'WILDCARD DEV / CREATIVE PORTFOLIO'}</p>
        {profileId === 'kandy' ? (
          <video className="wc-showcase__portrait" src="/static/KandyRealTarotHot.webm" controls playsInline preload="metadata" aria-label="Kandy tarot showcase" />
        ) : (
          <div className="wc-showcase__emblem" aria-hidden="true">{profile?.symbol || '♠'}</div>
        )}
        <h1>{directory ? 'Meet the creators' : profile.name}</h1>
        <h2>{directory ? 'Three distinct creative spaces' : profile.headline}</h2>
        <p>{directory ? 'Explore music, design, and technology through the WildCard DEV creative showcases.' : profile.description}</p>
      </section>
      <ShowcaseOrbit label={directory ? 'Creator directory' : profile.name + ' navigation'} items={destinations} />
      {!directory && <div id={profileId === 'kandy' ? 'kandy-exhibits' : undefined}><CreatorDisplayOrbit name={profile.name} symbol={profile.symbol} items={profile.sections.map(([title, description]) => ({
        title, description, icon: profile.symbol,
        ...(profileId === 'kandy' && title === 'Music' ? { href: profile.links[0].href } : {}),
        ...(profileId === 'ashley' && title === 'Connections' ? { href: profile.links[0].href } : {}),
      }))} /></div>}
      {profileId === 'kandy' && <KandyCreativeProfile />}
      <section className="wc-showcase__grid" aria-label={directory ? 'Creators' : 'Creative sections'}>
        {directory ? creators.map((id) => <a className="wc-showcase__card" key={id} href={'/'+id+'/showcase'}>
          <span style={{color:profiles[id].accent}}>{profiles[id].symbol}</span><h2>{profiles[id].name}</h2><p>{profiles[id].headline}</p><strong>Explore →</strong>
        </a>) : profile.sections.map(([heading, copy]) => <article className="wc-showcase__card" key={heading}><span>{profile.symbol}</span><h2>{heading}</h2><p>{copy}</p>{profileId === 'kandy' && heading === 'Music' && <a href={profile.links[0].href}>Listen on Suno →</a>}{profileId === 'ashley' && heading === 'Connections' && <a href={profile.links[0].href}>Visit Facebook →</a>}</article>)}
      </section>
      <footer className="wc-showcase__footer"><a href="/">Return to WildCard DEV</a><span>{profileId === 'ashley' ? 'A memorial space.' : 'Creative showcase · more projects to come.'}</span></footer>
      <AskPenny />
    </main>
  );
}
