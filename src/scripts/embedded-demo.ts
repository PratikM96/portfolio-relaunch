/**
 * Concept-launcher tabs. Hovering or focusing a tab previews that view in the
 * stage (swapping the image, caption and link); clicking follows the link to the
 * live view under /concepts/<project>/. Generic over every .embed on the page.
 */
document.querySelectorAll<HTMLElement>('.embed').forEach((embed) => {
  const tabs = [...embed.querySelectorAll<HTMLAnchorElement>('.etabs .etab')];
  const stage = embed.querySelector<HTMLAnchorElement>('.estage');
  const img = embed.querySelector<HTMLImageElement>('.estage-img');
  const cap = embed.querySelector<HTMLElement>('.estage-cap');

  function activate(tab: HTMLAnchorElement) {
    tabs.forEach((x) => x.classList.remove('on'));
    tab.classList.add('on');
    if (cap) cap.textContent = tab.dataset.cap ?? '';
    if (img) {
      if (tab.dataset.img) img.src = tab.dataset.img;
      img.alt = tab.dataset.cap ?? '';
    }
    const href = tab.getAttribute('href');
    if (stage && href) stage.setAttribute('href', href);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('mouseenter', () => activate(tab));
    tab.addEventListener('focus', () => activate(tab));
  });
});
