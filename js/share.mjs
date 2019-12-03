import {articleBody, imgs as articleImages} from '/js/script.mjs';

const share = async () => {
  try {
    navigator.share({
      title: '',
      text: `“${document.title}” by @tomayac 👉`,
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
articleBody.appendChild(paragraph);

if ('canShare' in navigator && articleImages.length) {
  import('./share-image.mjs');
}

export {articleImages, button};