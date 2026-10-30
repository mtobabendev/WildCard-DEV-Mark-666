import { useEffect, useRef, useState } from 'react';
import './DiceTray.css';
import PolyDie from './PolyDie.jsx';

const PATTERNS = {
  1: [4], 2: [0, 8], 3: [0, 4, 8],
  4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
const FACES = [
  ['front', 1], ['back', 6], ['right', 3],
  ['left', 4], ['top', 2], ['bottom', 5],
];
const ORIENT = {
  1: [0, 0], 2: [90, 0], 3: [0, -90],
  4: [0, 90], 5: [-90, 0], 6: [0, 180],
};
const TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

function randomDie(sides) {
  const limit = Math.floor(4294967296 / sides) * sides;
  if (globalThis.crypto?.getRandomValues) {
    const random = new Uint32Array(1);
    do { globalThis.crypto.getRandomValues(random); } while (random[0] >= limit);
    return (random[0] % sides) + 1;
  }
  return Math.floor(Math.random() * sides) + 1;
}

function initialDice(count) {
  return Array.from({ length: count }, (_, id) => ({
    id, value: 1, rx: 0, ry: 0, rollKey: 0,
  }));
}

function Die({ die, dieType, rolling, hasRolled }) {
  const result = hasRolled && !rolling ? die.value : null;
  return (
    <div
      className={'dice-lab__die' + (dieType === 'd100' ? ' dice-lab__die--percentile' : '')}
      role="group"
      aria-label={'Die ' + (die.id + 1) + ', ' + dieType + ': '
        + (rolling ? 'rolling' : result ?? 'ready')}
    >
      <div className="dice-lab__frostfire-shell">
        {dieType === 'd6' ? (
        <div className="dice-lab__cube-scene" aria-hidden="true">
          <div className="dice-lab__cube" style={{
            transform: 'rotateX(' + die.rx + 'deg) rotateY(' + die.ry + 'deg)',
          }}>
            {FACES.map(([face, number]) => (
              <div className={'dice-lab__face dice-lab__face--' + face} key={face}>
                {Array.from({ length: 9 }, (_, n) => (
                  <span key={n} className={
                    PATTERNS[number].includes(n)
                      ? 'dice-lab__pip' : 'dice-lab__pip dice-lab__pip--blank'
                  } />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : dieType === 'd100' ? (
        <div className="dice-lab__percentile">
          <div className="dice-lab__percentile-face">
            <PolyDie sides={10} value={Math.floor((die.value % 100) / 10)}
              rollKey={die.rollKey} tens />
            <span aria-hidden="true">TENS</span>
          </div>
          <div className="dice-lab__percentile-face">
            <PolyDie sides={10} value={die.value % 10} rollKey={die.rollKey} />
            <span aria-hidden="true">ONES</span>
          </div>
        </div>
      ) : (
        <PolyDie sides={Number(dieType.slice(1))}
          value={dieType === 'd10' ? die.value % 10 : die.value}
          rollKey={die.rollKey} />
      )}
      </div>
      <span className="dice-lab__die-label">
        {rolling ? 'Rolling…' : result ?? 'Ready'}
      </span>
    </div>
  );
}

export default function DiceTray({ compact = false, onRoll }) {
  const [dice, setDice] = useState(() => initialDice(2));
  const [count, setCount] = useState(2);
  const [dieType, setDieType] = useState('d6');
  const [rolling, setRolling] = useState(false);
  const [last, setLast] = useState(null);
  const turns = useRef(0);
  const busy = useRef(false);
  const timer = useRef(null);
  const touch = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const changeCount = (next) => {
    if (busy.current || next < 1 || next > 5) return;
    setCount(next);
    setDice(initialDice(next));
    setLast(null);
  };

  const changeType = (next) => {
    if (busy.current || dieType === next || !TYPES.includes(next)) return;
    setDieType(next);
    setDice(initialDice(count));
    setLast(null);
  };

  const roll = () => {
    if (busy.current) return;
    busy.current = true;
    const sides = Number(dieType.slice(1));
    const numbers = Array.from({ length: count }, () => randomDie(sides));
    const total = numbers.reduce((a, b) => a + b, 0);
    const spin = ++turns.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setRolling(true);
    setLast(null);
    setDice(prev => prev.map((die, index) => {
      const [x, y] = ORIENT[dieType === 'd6' ? numbers[index] : 1];
      return {
        ...die,
        value: numbers[index],
        rollKey: spin,
        rx: (spin * 1080) + (index * 360) + x,
        ry: (spin * 720) + (index * 360) + y,
      };
    }));
    if (navigator.vibrate && !reduced) navigator.vibrate(18);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRolling(false);
      setLast({ values: numbers, total });
      onRoll?.({ values: numbers, total, dieType });
      busy.current = false;
    }, reduced ? 0 : 1150);
  };

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse') return;
    touch.current = [event.clientX, event.clientY];
  };
  const onPointerUp = (event) => {
    if (!touch.current || event.pointerType === 'mouse') return;
    const distance = Math.hypot(event.clientX - touch.current[0], event.clientY - touch.current[1]);
    touch.current = null;
    if (distance > 45) roll();
  };

  return (
    <section className={`dice-lab__panel${compact ? ' dice-lab__panel--compact' : ''}`} aria-label="Three-dimensional dice tray">
              <div className="dice-lab__panel-top">
                <span>THE ROLLING TABLE</span>
                <span>FULL POLYHEDRAL SET · OFFLINE READY</span>
              </div>
    
              <div className="dice-lab__typebar" role="group" aria-label="Select dice type">
                {TYPES.map(type => (
                  <button key={type} type="button" aria-pressed={dieType === type}
                    disabled={rolling} onClick={() => changeType(type)}>
                    {type === 'd100' ? 'd%' : type.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="dice-lab__tray" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
                <div className="dice-lab__tray-glow" aria-hidden="true" />
                <div className="dice-lab__dice" data-count={count}>
                  {dice.map(die => (
                    <Die key={dieType + '-' + die.id} die={die} dieType={dieType} rolling={rolling} hasRolled={last !== null} />
                  ))}
                </div>
                <span className="dice-lab__swipe-note">Swipe the tray or press Roll</span>
              </div>
    
              <div className="dice-lab__result" aria-live="polite" aria-atomic="true">
                <div>
                  <small>LAST ROLL · {dieType.toUpperCase()}</small>
                  <strong>{rolling ? 'Rolling…' : last ? last.values.join(' + ') : 'Ready when you are'}</strong>
                </div>
                <div className="dice-lab__total">
                  <small>TOTAL</small>
                  <strong>{rolling ? '· · ·' : last ? last.total : '–'}</strong>
                </div>
              </div>
    
              <div className="dice-lab__controls">
                <div className="dice-lab__quantity">
                  <span>{dieType === 'd100' ? 'PERCENTILE PAIRS' : 'NUMBER OF DICE'}</span>
                  <div className="dice-lab__stepper">
                    <button type="button" disabled={rolling || count === 1} onClick={() => changeCount(count - 1)} aria-label="Remove one die">−</button>
                    <output aria-label="Dice count">{count}</output>
                    <button type="button" disabled={rolling || count === 5} onClick={() => changeCount(count + 1)} aria-label="Add one die">+</button>
                  </div>
                </div>
                <button className="dice-lab__roll" type="button" onClick={roll} disabled={rolling}>
                  <span aria-hidden="true">⚄</span> {rolling ? 'ROLLING…' : 'ROLL DICE'}
                </button>
              </div>
            </section>
  );
}
