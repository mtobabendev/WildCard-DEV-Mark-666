import { useCallback, useEffect, useRef, useState } from 'react';
import wildCardLogo from '../../assets/209000-pinkgothicbatheart.png';
import pennySpadeLogo from '../../assets/wildcard-logo-penny.png';

function shortestTurn(current, target) {
  const normalized = ((target - current + 540) % 360) - 180;
  return current + normalized;
}

function Spinner({
  channels,
  compact = false,
  open,
  activeIndex,
  onSelect,
  isWatch,
  pageVisible,
  reducedMotion,
}) {
  const STEP = 360 / channels.length;
  const stageRef = useRef(null);
  const deckRef = useRef(null);
  const rotationRef = useRef(-activeIndex * STEP);
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
      || compact
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
    compact,
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
        && ((!isWatch && !compact) || index === activeIndex)
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
  }, [activeIndex, compact, isWatch, open, pageVisible]);

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
        + channels.length
      ) % channels.length;

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
        + channels.length
      ) % channels.length,
    );
  };

  return (
    <section
      ref={stageRef}
      className={`spinner-stage${open ? ' is-active' : ''}${compact ? ' is-compact' : ''}${settled ? ' is-settled' : ''}${engaged ? ' is-engaged' : ''}`}
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
        style={{ '--rotation': `${rotationRef.current}deg` }}
      >
        {channels.map((channel, index) => {
          const shouldMountVideo = (
            channel.video
            && open
            && (!isWatch || index === activeIndex)
          );

          return (
            <button
              key={channel.id}
              data-index={index}
              data-channel={channel.id}
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
                  index === channels.length - 1
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

export default Spinner;
