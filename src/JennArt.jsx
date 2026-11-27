import { useEffect } from 'react';
import './jenn-art.css';
import AskPenny from './components/AskPenny.jsx';
import ShowcaseOrbit from './components/ShowcaseOrbit.jsx';
import CreatorDisplayOrbit from './components/CreatorDisplayOrbit.jsx';

const exhibits = [
  {title:'HeroClix', description:'HeroClix-inspired character showcase.', icon:'✦', video:'/static/JennHeroClixIntro.webm', caption:'HeroClix character showcase'},
  {title:'Jenn or Treat', description:'Seasonal character art.', icon:'◇', video:'/static/JennOrTreat2.webm'},
  {title:'Jenn’s Toon', description:'✨ A Jenn Original! Check it out! ✨ An AI animation created by Jenn.', icon:'✧', video:'/static/JennToon.webm', poster:'/static/JennToon.webp', caption:'✨ A Jenn Original! Check it out! ✨'}
];

export default function JennArt() {
  useEffect(() => { document.title = 'Jenn’s Art | WildCard DEV'; }, []);
  return (
    <main className="jenn-art">
      <header>
        <a href="/">← WildCard DEV</a>
        <a href="https://www.facebook.com/jennifer.mcbride.946517" target="_blank" rel="noopener noreferrer">Jenn on Facebook ↗</a>
      </header>
      <section>
        <p className="jenn-art__eyebrow">WILDCARD DEV · ART</p>
        <h1>Jenn’s Art</h1>
        <p><a href="mailto:Jenn@WildCardDEV.com">Jenn@WildCardDEV.com</a></p>
        <p>Explore Jenn’s original AI animations, HeroClix-inspired characters and creative artwork.</p>
        <ShowcaseOrbit label="Jenn navigation" items={[{label:'Home',href:'/',icon:'♠'},{label:'Facebook',href:'https://www.facebook.com/jennifer.mcbride.946517',icon:'f'},{label:'Art',href:'#jenn-exhibits',icon:'✦'}]} />
        <div id="jenn-exhibits"><CreatorDisplayOrbit name="Jenn" symbol="✦" slideshow items={exhibits} /></div>
        <div className="jenn-art__grid">
          {exhibits.map(exhibit => (
            <figure key={exhibit.video}>
              <video src={exhibit.video} poster={exhibit.poster} controls playsInline preload={exhibit.poster ? 'none' : 'metadata'} aria-label={exhibit.title} />
              <figcaption>{exhibit.caption || exhibit.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <AskPenny />
    </main>
  );
}
