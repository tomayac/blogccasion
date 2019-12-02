import './dark-mode-toggle.min.mjs';

const darkModeToggle = document.querySelector('dark-mode-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const root = document.documentElement;

darkModeToggle.addEventListener('colorschemechange', () => {
  themeColor.content = getComputedStyle(root).getPropertyValue('--background-color');
});
themeColor.content = getComputedStyle(root).getPropertyValue('--background-color');

const main = document.querySelector('main');
const imgs = main.querySelectorAll('img');

const fallback = '/static/fallback.svg';

const timeouts = {};

const onError = e => {
  const img = e.target;
  img.src = fallback;
};

const onLoad = e => {
  const img = e.target;
  clearTimeout(timeouts[img.src]);
  delete timeouts[img.src];
  img.removeEventListener("error", onError);
};

imgs.forEach(img => {
  img.addEventListener("error", onError, { once: true });
  img.addEventListener("load", onLoad, { once: true });

  timeouts[img.src] = setTimeout(() => {
    img.removeEventListener("error", onError);
    img.removeEventListener("load", onLoad);
    img.src = fallback;
  }, 10 * 1000);

  if (img.complete) {
    img.removeEventListener("load", onLoad);
    img.removeEventListener("error", onError);
    clearTimeout(timeouts[img.src]);
    delete timeouts[img.src];
  }
});
