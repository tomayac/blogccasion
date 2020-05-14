import { imgs } from '/js/script.mjs';

const share = async () => {
  try {
    await navigator.share({
      title: '',
      text: `“${document.title}” by @tomayac:`,
      url: document.querySelector('link[rel=canonical]').href,
    });
  } catch (err) {
    console.warn(err.name, err.message);
  }
};

const button = document.createElement('button');
button.type = 'button';
button.textContent = 'Share Article';
const isAppleBrowser = /Apple/.test(navigator.vendor);
button.classList.add('share', isAppleBrowser ? 'share-ios' : 'share-others');
button.addEventListener('click', share);
const paragraph = document.createElement('p');
paragraph.appendChild(button);
const footer = document.querySelector('article > footer');
footer.insertBefore(paragraph, footer.firstChild);

if ('canShare' in navigator && imgs.length) {
  import('./share-image.mjs');
}

export { imgs, button };
