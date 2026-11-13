import { useEffect } from 'react';
import './jenn-art.css';
import AskPenny from './components/AskPenny.jsx';
import ShowcaseOrbit from './components/ShowcaseOrbit.jsx';
import CreatorDisplayOrbit from './components/CreatorDisplayOrbit.jsx';

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
        <p>Meet Jenn’s HeroClix-inspired characters and see her artwork come to life.</p>
        <ShowcaseOrbit label="Jenn navigation" items={[{label:'Home',href:'/',icon:'♠'},{label:'Facebook',href:'https://www.facebook.com/jennifer.mcbride.946517',icon:'f'},{label:'Art',href:'#jenn-exhibits',icon:'✦'}]} />
        <div id="jenn-exhibits"><CreatorDisplayOrbit name="Jenn" symbol="✦" slideshow items={[
          {title:'HeroClix',description:'HeroClix-inspired character showcase.',icon:'✦',video:'/static/JennHeroClixIntro.webm'},
          {title:'Jenn or Treat',description:'Seasonal character art.',icon:'◇',video:'/static/JennOrTreat2.webm'}
        ]} /></div>
        <div className="jenn-art__grid">
          <figure><video src="/static/JennHeroClixIntro.webm" controls playsInline preload="metadata" /><figcaption>HeroClix character showcase</figcaption></figure>
          <figure><video src="/static/JennOrTreat2.webm" controls playsInline preload="metadata" /><figcaption>Jenn or Treat</figcaption></figure>
        </div>
      </section>
      <AskPenny />
    </main>
  );
}
