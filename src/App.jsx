import { useCallback, useEffect, useRef, useState } from 'react';
import mattAvatar from '../assets/matt-avatar.png';
import wildCardLogo from '../assets/209000-pinkgothicbatheart.png';
import pennySpadeLogo from '../assets/wildcard-logo-penny.png';
import kandyKandleVideo from '../assets/KandyKandle.mp4';
import pennyKandyAvaVideo from '../assets/PennyKandyAva.webm';
import pennyClubFinalVideo from '../assets/PennyClubFinal.webm';
import pennyNaughtyVideo from '../assets/PennyNahtyAvatar2.webm';
import pennyQueenVideo from '../assets/WitchPennyAndKandy4.webm';
import pennyCardVideo from '../assets/PennyShowsOff.webm';
import pennyCardVideo2 from '../assets/WitchPennyAndKandy6.webm';
import pennyCardVideo3 from '../assets/WitchPennyAndKandy1.webm';
import pennyCardVideo4 from '../assets/WitchPennyAndKandy3.webm';

const CHANNELS = [
  { id: 'contact', number: '01', title: 'Contact', copy: 'Direct operator access for WildCard DEV, Matt, Penny, and Kandy, an accomplished Tarot reader and up-and-coming author.', video: pennyCardVideo },
  { id: 'systems', number: '02', title: 'Systems', copy: 'Premium web, app, automation, and AI systems built with cinematic precision.', video: pennyCardVideo2 },
  { id: 'portfolio', number: '03', title: 'The Grimoire', copy: 'A living archive of WildCard DEV builds, experiments, strange ideas, and systems summoned into existence.', video: pennyCardVideo3 },
  { id: 'penny', number: '04', title: 'Penny', copy: 'Concierge guidance, contact routing, and controlled chaos.', penny: true, video: pennyKandyAvaVideo },
  { id: 'automation', number: '05', title: 'Hell’s Little Helpers', copy: 'Where bold ideas become working systems. Automation, AI, and a little digital sorcery handle the repetitive bullshit, leaving talented women like Kandy free to create, write, read the cards, and build what comes next.', video: pennyCardVideo4 },
  { id: 'interface', number: '06', title: 'Interface', copy: 'Distinctive digital experiences built to feel responsive, useful, and alive.', video: pennyQueenVideo },
];

const STEP = 360 / CHANNELS.length;
const SPADE_URL = 'https://the-spade.wildcarddev.com/';
const KANDY_FACEBOOK_URL = 'https://www.facebook.com/share/1EXJvJchHu/';
const KANDY_SUNO_URL = 'https://suno.com/s/8wuDm8yj3GZIab9M';
const SUNO_ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.suno.android';
const SUNO_IOS_URL = 'https://apps.apple.com/us/app/suno-ai-songs-music-lyrics/id6480136315';

function shortestTurn(current, target) {
  const normalized = ((target - current + 540) % 360) - 180;
  return current + normalized;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined'
      ? window.matchMedia(query).matches
      : false
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener?.('change', handleChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
    };
  }, [query]);

  return matches;
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => (
    typeof document !== 'undefined'
      ? !document.hidden
      : true
  ));

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisible(!document.hidden);
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
    };
  }, []);

  return visible;
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.49 22H3.37l7.25-8.29L2.98 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.44 4.05H6.59L17.8 19.84Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.34 3.5A2.34 2.34 0 1 1 .66 3.5a2.34 2.34 0 0 1 4.68 0ZM1.07 8.07h4.55V22H1.07V8.07Zm7.22 0h4.36v1.9h.06c.61-1.15 2.09-2.36 4.3-2.36 4.6 0 5.45 3.03 5.45 6.97V22h-4.54v-6.57c0-1.57-.03-3.59-2.19-3.59-2.19 0-2.52 1.71-2.52 3.47V22H8.29V8.07Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.19c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.72 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.19A11 11 0 0 1 12 6.09a11 11 0 0 1 2.89.39c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.77.11 3.06.74.81 1.19 1.85 1.19 3.11 0 4.44-2.71 5.42-5.29 5.71.42.36.79 1.07.79 2.16v3.21c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

function Portal({ open, onOpen }) {
  return (
    <section
      className={`portal-stage${open ? ' is-open' : ''}`}
      aria-labelledby="portal-title"
    >
      <button
        className={`portal-trigger${open ? ' is-open' : ''}`}
        type="button"
        aria-describedby="portal-hint"
        aria-expanded={open}
        onClick={onOpen}
      >
        <span
          className="portal-ring portal-ring--outer"
          aria-hidden="true"
        />
        <span
          className="portal-ring portal-ring--middle"
          aria-hidden="true"
        />
        <span
          className="portal-ring portal-ring--inner"
          aria-hidden="true"
        />
        <span
          className="portal-core"
          aria-hidden="true"
        />

        <img
          className="portal-logo"
          src={wildCardLogo}
          alt=""
          aria-hidden="true"
        />

        <span className="portal-copy">
          <span className="eyebrow">WildCard DEV</span>
          <strong id="portal-title">Enter the portal</strong>
          <span id="portal-hint">Experience coming next</span>
        </span>
      </button>
    </section>
  );
}

function Spinner({
  open,
  activeIndex,
  onSelect,
  isWatch,
  pageVisible,
  reducedMotion,
}) {
  const stageRef = useRef(null);
  const deckRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const resumeAtRef = useRef(0);
  const videoRefs = useRef([]);

  const dragRef = useRef({
    active: false,
    pointerId: null,
    cardIndex: null,
    startX: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    moved: false,
  });

  const inertiaRef = useRef(0);
  const suppressClickUntilRef = useRef(0);
  const [engaged, setEngaged] = useState(false);
  const [settled, setSettled] = useState(false);

  const changeRotation = useCallback((updater) => {
    const current = rotationRef.current;
    const next = typeof updater === 'function'
      ? updater(current)
      : updater;

    rotationRef.current = next;
    deckRef.current?.style.setProperty(
      '--rotation',
      `${next}deg`,
    );
  }, []);

  useEffect(() => {
    if (
      !open
      || !pageVisible
      || isWatch
      || reducedMotion
    ) {
      cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
      return undefined;
    }

    const tick = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const elapsed = Math.min(
        time - lastTimeRef.current,
        40,
      );

      lastTimeRef.current = time;

      if (dragRef.current.active) {
        // Pointer movement owns rotation while dragging.
      } else if (Math.abs(inertiaRef.current) > 0.002) {
        changeRotation(
          (current) => (
            current + inertiaRef.current * elapsed
          ),
        );

        inertiaRef.current *= Math.pow(
          0.94,
          elapsed / 16.67,
        );

        if (Math.abs(inertiaRef.current) <= 0.002) {
          inertiaRef.current = 0;
          resumeAtRef.current = time + 1200;
        }
      } else if (time > resumeAtRef.current) {
        changeRotation(
          (current) => current + elapsed * 0.006,
        );
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
    };
  }, [
    changeRotation,
    isWatch,
    open,
    pageVisible,
    reducedMotion,
  ]);

  useEffect(() => {
    if (!isWatch || !open) return;

    inertiaRef.current = 0;
    resumeAtRef.current = Number.POSITIVE_INFINITY;
    changeRotation(-activeIndex * STEP);
  }, [activeIndex, changeRotation, isWatch, open]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      const shouldPlay = (
        open
        && pageVisible
        && (!isWatch || index === activeIndex)
      );

      if (shouldPlay) {
        const playAttempt = video.play();

        if (playAttempt?.catch) {
          playAttempt.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [activeIndex, isWatch, open, pageVisible]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !open) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();

      const amount = Math.max(
        -48,
        Math.min(48, event.deltaY || event.deltaX),
      );

      resumeAtRef.current = performance.now() + 1800;

      changeRotation(
        (current) => current + amount * 0.16,
      );
    };

    stage.addEventListener(
      'wheel',
      handleWheel,
      { passive: false },
    );

    return () => {
      stage.removeEventListener('wheel', handleWheel);
    };
  }, [changeRotation, open]);

  const selectCard = (index) => {
    if (performance.now() < suppressClickUntilRef.current) {
      return;
    }

    inertiaRef.current = 0;
    resumeAtRef.current = isWatch
      ? Number.POSITIVE_INFINITY
      : performance.now() + 2600;

    changeRotation(
      (current) => shortestTurn(
        current,
        -index * STEP,
      ),
    );

    onSelect(index);
  };

  const handlePointerDown = (event) => {
    if (!open || event.button > 0) return;

    const pressedCard = event.target.closest?.(
      '.spinner-card',
    );

    inertiaRef.current = 0;
    resumeAtRef.current = Number.POSITIVE_INFINITY;

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      cardIndex: pressedCard
        ? Number(pressedCard.dataset.index)
        : null,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    setEngaged(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (
      !drag.active
      || drag.pointerId !== event.pointerId
    ) {
      return;
    }

    if (isWatch) {
      if (Math.abs(event.clientX - drag.startX) > 8) {
        drag.moved = true;
      }

      drag.lastX = event.clientX;
      drag.lastTime = performance.now();
      return;
    }

    const now = performance.now();
    const deltaX = event.clientX - drag.lastX;
    const elapsed = Math.max(
      now - drag.lastTime,
      8,
    );

    if (Math.abs(event.clientX - drag.startX) > 8) {
      drag.moved = true;
    }

    changeRotation(
      (current) => current + deltaX * 0.38,
    );

    drag.velocity = (
      drag.velocity * 0.55
    ) + (
      ((deltaX * 0.38) / elapsed) * 0.45
    );

    drag.lastX = event.clientX;
    drag.lastTime = now;
  };

  const handlePointerEnd = (event) => {
    const drag = dragRef.current;

    if (
      !drag.active
      || drag.pointerId !== event.pointerId
    ) {
      return;
    }

    drag.active = false;

    if (drag.moved) {
      suppressClickUntilRef.current = (
        performance.now() + 250
      );
    }

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    if (
      !drag.moved
      && Number.isInteger(drag.cardIndex)
    ) {
      selectCard(drag.cardIndex);
      suppressClickUntilRef.current = (
        performance.now() + 250
      );
      return;
    }

    if (isWatch && drag.moved) {
      const direction = (
        event.clientX < drag.startX ? 1 : -1
      );

      const nextIndex = (
        activeIndex
        + direction
        + CHANNELS.length
      ) % CHANNELS.length;

      inertiaRef.current = 0;
      resumeAtRef.current = Number.POSITIVE_INFINITY;
      changeRotation(-nextIndex * STEP);
      onSelect(nextIndex);
      return;
    }

    inertiaRef.current = Math.max(
      -0.9,
      Math.min(0.9, drag.velocity),
    );

    if (Math.abs(inertiaRef.current) <= 0.002) {
      inertiaRef.current = 0;
      resumeAtRef.current = performance.now() + 1200;
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key !== 'ArrowLeft'
      && event.key !== 'ArrowRight'
    ) {
      return;
    }

    event.preventDefault();

    const direction = (
      event.key === 'ArrowRight' ? 1 : -1
    );

    selectCard(
      (
        activeIndex
        + direction
        + CHANNELS.length
      ) % CHANNELS.length,
    );
  };

  return (
    <section
      ref={stageRef}
      className={`spinner-stage${open ? ' is-active' : ''}${settled ? ' is-settled' : ''}${engaged ? ' is-engaged' : ''}`}
      aria-label="WildCard navigation"
      aria-hidden={!open}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => {
        if (!dragRef.current.active) {
          setEngaged(false);
        }
      }}
      onFocus={() => setEngaged(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setEngaged(false);
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="spinner-center-panel"
        aria-hidden={!settled}
      >
        <img
          src={wildCardLogo}
          alt=""
          aria-hidden="true"
        />
        <strong>WildCard DEV</strong>
      </div>

      <div
        ref={deckRef}
        className="spinner-deck"
        style={{ '--rotation': '0deg' }}
      >
        {CHANNELS.map((channel, index) => {
          const shouldMountVideo = (
            channel.video
            && open
            && (!isWatch || index === activeIndex)
          );

          return (
            <button
              key={channel.id}
              data-index={index}
              className={`spinner-card${channel.penny ? ' spinner-card--penny' : ''}${activeIndex === index ? ' is-selected' : ''}`}
              style={{
                '--i': index,
                '--angle': `${index * STEP}deg`,
              }}
              type="button"
              aria-controls="channel-content"
              aria-pressed={activeIndex === index}
              tabIndex={open ? 0 : -1}
              onAnimationEnd={(event) => {
                if (
                  index === CHANNELS.length - 1
                  && event.animationName === 'card-unfold'
                ) {
                  setSettled(true);
                }
              }}
              onClick={() => selectCard(index)}
            >
              {shouldMountVideo && (
                <video
                  ref={(video) => {
                    videoRefs.current[index] = video;
                  }}
                  className="spinner-card-video"
                  src={channel.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
              )}

              <img
                className="spinner-card-suit spinner-card-suit--top"
                src={pennySpadeLogo}
                alt=""
                aria-hidden="true"
                draggable="false"
              />

              <img
                className="spinner-card-suit spinner-card-suit--bottom"
                src={pennySpadeLogo}
                alt=""
                aria-hidden="true"
                draggable="false"
              />

              {!channel.penny && (
                <>
                  <span>{channel.number}</span>
                  <strong>{channel.title}</strong>
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PennyLoopVideo({ active }) {
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);

  const videos = [
    pennyClubFinalVideo,
    pennyNaughtyVideo,
    pennyKandyAvaVideo,
  ];

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (active) {
      const playAttempt = video.play();

      if (playAttempt?.catch) {
        playAttempt.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [active, videoIndex]);

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      key={videoIndex}
      className="penny-loop-video"
      src={videos[videoIndex]}
      autoPlay
      muted
      playsInline
      preload="metadata"
      onEnded={() => {
        setVideoIndex(
          (current) => (
            (current + 1) % videos.length
          ),
        );
      }}
      aria-label="Penny"
    />
  );
}

function KandyVideo({ active }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (active) {
      const playAttempt = video.play();

      if (playAttempt?.catch) {
        playAttempt.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [active]);

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      className="kandy-video"
      src={kandyKandleVideo}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Kandy"
    />
  );
}

function ContactPanels({
  open,
  showKandy,
  pageVisible,
}) {
  return (
    <section
      className={`card-stage card-stage--contacts${open ? ' is-active' : ''}`}
      aria-hidden={!open}
    >
      <div className="identity-pair">
        <article className="identity-card identity-card--matt">
          <img
            src={mattAvatar}
            alt="Matt Tobaben"
          />

          <p className="eyebrow">Owner</p>
          <h2>Matt Tobaben</h2>
          <p>WildCard DEV</p>

          <a href="mailto:matt@wildcarddev.com">
            matt@wildcarddev.com
          </a>

          <a href="tel:+14029150789">
            402-915-0789
          </a>

          <div
            className="owner-socials"
            aria-label="Matt Tobaben social links"
          >
            <a
              href="https://x.com/WildCardDEV"
              target="_blank"
              rel="noreferrer"
              aria-label="WildCard DEV on X"
            >
              <XIcon />
            </a>

            <a
              href="https://www.linkedin.com/in/matt-tobaben/"
              target="_blank"
              rel="noreferrer"
              aria-label="Matt Tobaben on LinkedIn"
            >
              <LinkedInIcon />
            </a>

            <a
              href="https://github.com/mtobabendev"
              target="_blank"
              rel="noreferrer"
              aria-label="Matt Tobaben on GitHub"
            >
              <GitHubIcon />
            </a>
          </div>
        </article>

        {showKandy && (
          <article className="identity-card identity-card--kandy">
            <div className="kandy-video-shell">
              <KandyVideo
                active={open && pageVisible}
              />
            </div>

            <div className="kandy-copy">
              <h2>Kandy</h2>

              <a href="mailto:Kandy@wildcarddev.com">
                Kandy@wildcarddev.com
              </a>

              <div className="kandy-links">
                <a
                  href={KANDY_FACEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </a>

                <a
                  href={KANDY_SUNO_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Suno
                </a>

                <a
                  href={SUNO_ANDROID_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Suno for Android
                </a>

                <a
                  href={SUNO_IOS_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Suno for iPhone
                </a>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function CombinationDial({
  value,
  position,
  onChange,
}) {
  const pointerStartRef = useRef(null);

  const adjust = (amount) => {
    onChange((value + amount + 10) % 10);
  };

  return (
    <div
      className="combination-dial"
      onWheel={(event) => {
        event.preventDefault();
        adjust(event.deltaY > 0 ? 1 : -1);
      }}
      onPointerDown={(event) => {
        if (event.target.closest('button')) {
          return;
        }

        pointerStartRef.current = event.clientY;

        event.currentTarget.setPointerCapture(
          event.pointerId,
        );
      }}
      onPointerUp={(event) => {
        if (pointerStartRef.current === null) {
          return;
        }

        const distance = (
          event.clientY - pointerStartRef.current
        );

        pointerStartRef.current = null;

        if (Math.abs(distance) >= 16) {
          adjust(distance < 0 ? 1 : -1);
        }
      }}
    >
      <button
        type="button"
        aria-label={`Increase digit ${position}`}
        onClick={() => adjust(1)}
      >
        ▲
      </button>

      <output
        aria-label={`Combination digit ${position}`}
      >
        {value}
      </output>

      <button
        type="button"
        aria-label={`Decrease digit ${position}`}
        onClick={() => adjust(-1)}
      >
        ▼
      </button>
    </div>
  );
}

function CombinationGate({
  open,
  onClose,
}) {
  const [digits, setDigits] = useState([0, 0, 0]);

  const [message, setMessage] = useState(
    'Set the house combination.',
  );

  useEffect(() => {
    if (!open) return undefined;

    setDigits([0, 0, 0]);
    setMessage('Set the house combination.');

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  const setDigit = (index, value) => {
    setDigits((current) => (
      current.map((digit, digitIndex) => (
        digitIndex === index ? value : digit
      ))
    ));
  };

  const unlock = (event) => {
    event.preventDefault();

    if (digits.join('') === '216') {
      setMessage('The door is open.');
      window.location.assign(SPADE_URL);
      return;
    }

    setMessage('Wrong room. Try the card again.');
  };

  return (
    <div
      className="combination-gate"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="combination-lock"
        role="dialog"
        aria-modal="true"
        aria-labelledby="combination-title"
      >
        <button
          className="combination-close"
          type="button"
          onClick={onClose}
          aria-label="Close combination lock"
        >
          ×
        </button>

        <p className="eyebrow">Penny's Office</p>
        <h2 id="combination-title">
          Combination required
        </h2>

        <p>
          Private room. Turn the three dials and unlock the door.
        </p>

        <form onSubmit={unlock}>
          <div
            className="combination-dials"
            aria-label="Three digit combination"
          >
            {digits.map((digit, index) => (
              <CombinationDial
                key={index}
                value={digit}
                position={index + 1}
                onChange={(value) => {
                  setDigit(index, value);
                }}
              />
            ))}
          </div>

          <button
            className="combination-unlock"
            type="submit"
          >
            Unlock
          </button>
        </form>

        <p
          className="combination-message"
          aria-live="polite"
        >
          {message}
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  const isWatch = useMediaQuery('(max-width: 240px)');
  const reducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const pageVisible = usePageVisible();
  const activeChannel = CHANNELS[activeIndex];

  const pennyVideoActive = (
    open
    && pageVisible
    && !isWatch
  );

  return (
    <main className={`landing${open ? ' is-open' : ''}`}>
      <header className="site-header">
        <div className="brand">
          <span
            className="brand-dot"
            aria-hidden="true"
          />
          <span>WildCard DEV</span>
        </div>

        <a
          className="donate"
          href="https://square.link/u/sb0tYH9C"
          target="_blank"
          rel="noreferrer"
        >
          Donate
        </a>
      </header>

      <Portal
        open={open}
        onOpen={() => setOpen(true)}
      />

      <ContactPanels
        open={open}
        showKandy={!isWatch}
        pageVisible={pageVisible}
      />

      <Spinner
        open={open}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        isWatch={isWatch}
        pageVisible={pageVisible}
        reducedMotion={reducedMotion}
      />

      <section
        id="channel-content"
        className={`context-window${open ? ' is-active' : ''}`}
        aria-live="polite"
        aria-hidden={!open}
      >
        <p className="eyebrow">
          Channel {activeChannel.number}
        </p>
        <h2>{activeChannel.title}</h2>
        <p>{activeChannel.copy}</p>
      </section>

      <section
        className={`card-stage card-stage--penny${open ? ' is-active' : ''}`}
        aria-hidden={!open}
      >
        <article className="identity-card identity-card--penny">
          <div className="penny-video-shell">
            <PennyLoopVideo
              active={pennyVideoActive}
            />
          </div>

          <div className="penny-copy">
            <p className="eyebrow">Concierge</p>
            <h2>Penny</h2>
            <p>
              Your first point of contact for WildCard DEV.
            </p>

            <button
              className="penny-office-button"
              type="button"
              onClick={() => setGateOpen(true)}
            >
              Enter Penny’s Office
            </button>
          </div>
        </article>
      </section>

      <CombinationGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
      />
    </main>
  );
}