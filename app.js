const portal = document.querySelector('.portal-trigger');

// Baseline only: no media is requested and no animation loop starts on page load.
// The next step will attach the chosen Mark 666 video and Mark III-inspired reveal.
portal?.addEventListener('click', () => {
  portal.setAttribute('aria-pressed', 'true');
});
