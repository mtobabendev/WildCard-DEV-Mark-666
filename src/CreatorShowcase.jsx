import { useEffect } from 'react';
import ShowcaseOrbit from './components/ShowcaseOrbit.jsx';
import './CreatorShowcase.css';

const profiles = {
  kandy: { name: 'Kandy', accent: '#c5a0ff', symbol: '♦', headline: 'Music, writing & tarot', description: 'A creative corner for original music, storytelling, and tarot-inspired reflection.', sections: [
    ['Music', 'Explore Kandy’s music on Suno.'], ['Writing', 'A space for future writing projects and announcements.'], ['Tarot', 'A home for tarot reflections and creative inspiration.']
  ], links: [{label:'Music on Suno', href:'https://suno.com/s/JwxHfnS6IWD0exoW', icon:'♫'}, {label:'Facebook', href:'https://www.facebook.com/share/1EXJvJchHu/', icon:'f'}] },
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
        <div className="wc-showcase__emblem" aria-hidden="true">{profile?.symbol || '♠'}</div>
        <h1>{directory ? 'Meet the creators' : profile.name}</h1>
        <h2>{directory ? 'Three distinct creative spaces' : profile.headline}</h2>
        <p>{directory ? 'Explore music, design, and technology through the WildCard DEV creative showcases.' : profile.description}</p>
      </section>
      <ShowcaseOrbit label={directory ? 'Creator directory' : profile.name + ' navigation'} items={destinations} />
      <section className="wc-showcase__grid" aria-label={directory ? 'Creators' : 'Creative sections'}>
        {directory ? creators.map((id) => <a className="wc-showcase__card" key={id} href={'/'+id+'/showcase'}>
          <span style={{color:profiles[id].accent}}>{profiles[id].symbol}</span><h2>{profiles[id].name}</h2><p>{profiles[id].headline}</p><strong>Explore →</strong>
        </a>) : profile.sections.map(([heading, copy]) => <article className="wc-showcase__card" key={heading}><span>{profile.symbol}</span><h2>{heading}</h2><p>{copy}</p>{profileId === 'kandy' && heading === 'Music' && <a href={profile.links[0].href}>Listen on Suno →</a>}{profileId === 'ashley' && heading === 'Connections' && <a href={profile.links[0].href}>Visit Facebook →</a>}</article>)}
      </section>
      <footer className="wc-showcase__footer"><a href="/">Return to WildCard DEV</a><span>{profileId === 'ashley' ? 'A memorial space.' : 'Creative showcase · more projects to come.'}</span></footer>
    </main>
  );
}
