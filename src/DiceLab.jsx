import { useEffect, useState } from 'react';
import DiceTray from './components/DiceTray.jsx';

const STORE_KEY = 'wildcard-dice-lab-rolls-v1';

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(stored) ? stored.slice(0, 8).filter(
      x => x && Array.isArray(x.values) && Number.isFinite(x.total),
    ) : [];
  } catch {
    return [];
  }
}

export default function DiceLab() {
  const [history, setHistory] = useState(readHistory);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history)); } catch { /* private mode */ }
  }, [history]);

  const onRoll = ({ values, total }) => {
    setHistory(prev => [{
      values, total, id: Date.now() + Math.random(),
    }, ...prev].slice(0, 8));
  };

  return (
    <div className="dice-lab">
      <header className="dice-lab__header">
        <a href="/grimoire" className="dice-lab__back">← The Grimoire</a>
        <span className="dice-lab__brand">♠ WILDCARD DEV / LABS</span>
      </header>

      <main className="dice-lab__main">
        <div className="dice-lab__intro">
          <p className="dice-lab__eyebrow">RESURRECTION CHAMBER · EXPERIMENT 001</p>
          <h1>THE DICE <span>CHAMBER</span></h1>
          <p>Real 3D dice. Real random rolls. Your browser is the table.</p>
        </div>

        <DiceTray onRoll={onRoll} />

        <details className="dice-lab__history" aria-label="Roll history">
          <summary className="dice-lab__history-summary">
            <span>ROLL HISTORY <small>({history.length})</small></span>
            <span className="dice-lab__history-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="dice-lab__history-body">
            <div className="dice-lab__history-header">
              <span>Recent rolls</span>
              <button type="button" onClick={() => setHistory([])} disabled={!history.length}>Clear history</button>
            </div>
            {history.length ? (
              <ol>
                {history.map(entry => (
                  <li key={entry.id}>
                    <span>{entry.values.length}d6</span>
                    <span>{entry.values.join(' + ')}</span>
                    <strong>{entry.total}</strong>
                  </li>
                ))}
              </ol>
            ) : <p>No rolls yet. Every legend starts somewhere.</p>}
          </div>
        </details>

        <footer className="dice-lab__footer">
          <span>♠ WILDCARD DEV · NO BACKEND · HISTORY STAYS IN THIS BROWSER</span>
          <a href="/grimoire">Return to The Grimoire ↗</a>
        </footer>
      </main>
    </div>
  );
}
