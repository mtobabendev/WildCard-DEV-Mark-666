const portal = document.querySelector('.portal-trigger');
const cardStage = document.querySelector('.card-stage');
const spinnerStage = document.querySelector('.spinner-stage');
const contentTitle = document.querySelector('[data-content-title]');
const contentCopy = document.querySelector('[data-content-copy]');

const channels = {
  contact: ['Contact', 'Direct operator access for WildCard DEV, Matt, and Penny.'],
  systems: ['Systems', 'Premium web, app, automation, and AI systems built with cinematic precision.'],
  portfolio: ['Portfolio', 'Selected builds, experiments, client systems, and interface work.'],
  penny: ['Penny', 'Concierge guidance, contact routing, and controlled chaos.'],
  automation: ['Automation', 'Workflow logic, task support, and smart execution systems.'],
  interface: ['Interface', 'Distinctive digital experiences built to feel responsive, useful, and alive.']
};

portal?.addEventListener('click', () => {
  portal.setAttribute('aria-pressed', 'true');
  portal.classList.add('is-open');

  document.querySelectorAll('img[data-src]').forEach((image) => {
    image.src = image.dataset.src;
    image.removeAttribute('data-src');
  });

  cardStage.hidden = false;
  spinnerStage.hidden = false;
  requestAnimationFrame(() => {
    cardStage.classList.add('is-active');
    spinnerStage.classList.add('is-active');
  });
});

document.querySelectorAll('.spinner-card').forEach((card) => {
  card.addEventListener('click', () => {
    const [title, copy] = channels[card.dataset.channel] || channels.contact;
    contentTitle.textContent = title;
    contentCopy.textContent = copy;
  });
});
