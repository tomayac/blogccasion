import './dark-mode-toggle.min.mjs';

const articleBody = document.querySelector('article section');

if ('share' in navigator && articleBody) {
  import('/js/share.mjs');
}

const darkModeToggle = document.querySelector('dark-mode-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const root = document.documentElement;

darkModeToggle.addEventListener('colorschemechange', () => {
  setTimeout(() => {
    themeColor.content = getComputedStyle(root).getPropertyValue('--background-color');
  }, 0);
});
themeColor.content = getComputedStyle(root).getPropertyValue('--background-color');

let imgs = [];
const fallback = '/static/fallback.svg';

if (articleBody) {
  imgs = articleBody.querySelectorAll('img');

  const timeouts = {};

  const onError = e => {
    const img = e.target;
    img.src = fallback;
  };

  const onLoad = e => {
    const img = e.target;
    clearTimeout(timeouts[img.src]);
    delete timeouts[img.src];
    img.removeEventListener('error', onError);
  };

  imgs.forEach(img => {
    img.addEventListener('error', onError, {once: true});
    img.addEventListener('load', onLoad, {once: true});

    timeouts[img.src] = setTimeout(() => {
      img.removeEventListener('error', onError);
      img.removeEventListener('load', onLoad);
      img.src = fallback;
    }, 20 * 1000);

    if (img.complete) {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      clearTimeout(timeouts[img.src]);
      delete timeouts[img.src];
    }
  });
}

export {articleBody, imgs, fallback};
