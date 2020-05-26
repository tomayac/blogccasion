import './collect.mjs';

const articleBody = document.querySelector('article section');

if ('share' in navigator && articleBody) {
  import('/js/share.mjs');
}

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
