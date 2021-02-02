const articleBody = document.querySelector('article section');

window.addEventListener('load', () => {
  import('./collect.mjs');
  if ('share' in navigator && articleBody) {
    import('/js/share.mjs');
  }
});

const darkModeToggle = document.querySelector('dark-mode-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const root = document.documentElement;

darkModeToggle.addEventListener('colorschemechange', () => {
  setTimeout(() => {
    themeColor.content = getComputedStyle(root).getPropertyValue(
      '--background-color'
    );
  }, 0);
});
themeColor.content = getComputedStyle(root).getPropertyValue(
  '--background-color'
);

let imgs = [];
const fallback = '/static/fallback.svg';
const ERROR = 'error';
const LOAD = 'load';

if (articleBody) {
  if ('clipboard' in navigator) {
    articleBody
      // ToDo: Use `:is(h1, h2, h3, h4, h5, h6)[id]` once support is better.
      .querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
      .forEach((heading) => {
        heading.addEventListener('click', (ev) => {
          // Don't jump when the '#' is clicked.
          if (ev.target.nodeName === 'A') {
            ev.preventDefault();
          }
          try {
            navigator.clipboard.writeText(
              `${location.origin}${location.pathname}#${heading.id}`,
            );
            const temp = heading.innerHTML;
            heading.innerHTML += '&nbsp;<small>(📋 Copied.)</small>';
            setTimeout(() => {
              heading.innerHTML = temp;
            }, 2000);
          } catch (err) {
            console.warn(err.name, err.message);
          }
        });
      });
  }
   
  imgs = articleBody.querySelectorAll('img');

  const timeouts = {};

  const onError = (e) => {
    const img = e.target;
    img.src = fallback;
  };

  const onLoad = (e) => {
    const img = e.target;
    clearTimeout(timeouts[img.src]);
    delete timeouts[img.src];
    img.removeEventListener(ERROR, onError);
  };

  const once = { once: true };
  imgs.forEach((img) => {
    img.addEventListener(ERROR, onError, once);
    img.addEventListener(LOAD, onLoad, once);

    timeouts[img.src] = setTimeout(() => {
      img.removeEventListener(ERROR, onError);
      img.removeEventListener(LOAD, onLoad);
      img.src = fallback;
    }, 20 * 1000);

    if (img.complete) {
      img.removeEventListener(LOAD, onLoad);
      img.removeEventListener(ERROR, onError);
      clearTimeout(timeouts[img.src]);
      delete timeouts[img.src];
    }
  });
}

export { imgs, fallback };
