/**
 * Concept-launcher tabs. Hovering or focusing a tab previews that view in the stage (swapping the image, caption and link); clicking follows the link to the live view under /concepts/<project>/. Generic over every .embed on the page.
 */
document.querySelectorAll<HTMLElement>('.embed').forEach((embed) => {
  const tabs = [...embed.querySelectorAll<HTMLAnchorElement>('.etabs .etab')];
  const stage = embed.querySelector<HTMLAnchorElement>('.estage');
  const img = embed.querySelector<HTMLImageElement>('.estage-img');

  function activate(tab: HTMLAnchorElement) {
    tabs.forEach((x) => x.classList.remove('on'));
    tab.classList.add('on');
    if (img) {
      // srcset first: setting src alone would leave the previous view's srcset in place, and the browser picks from srcset over src.
      if (tab.dataset.srcset) img.srcset = tab.dataset.srcset;
      if (tab.dataset.img) img.src = tab.dataset.img;
      img.alt = tab.dataset.cap ?? '';
    }
    const href = tab.getAttribute('href');
    // The label moves with the href. Updating one without the other leaves the stage announcing the view it USED to point at, which is the failure WCAG 2.4.4 describes: a link whose accessible name no longer matches its destination. The server renders the same string from `active.label`, so the format is kept identical here.
    if (stage && href) {
      stage.setAttribute('href', href);
      stage.setAttribute('aria-label', `Open the ${tab.textContent?.trim() ?? ''} view`);
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('mouseenter', () => activate(tab));
    tab.addEventListener('focus', () => activate(tab));
  });
});
