import {articleImages, button as buttonTempl} from './share.mjs';
import {fallback} from './script.mjs';

const proxyImage = async (src) => {
  const url = `https://tomayac.com/cors-proxy/index.php?csurl=${src}`;
  try {
    const response = await fetch(url);
    return await response.blob();
  } catch (err) {
    throw new Error(`${err.name} ${err.message}`);
  }
}

const imageToBlob = async (img) => {
  const src = img.getAttribute('src');
  try {
    if (!src.startsWith('/') && !src.startsWith('data:')) {
      return await proxyImage(src);
    }
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        return resolve(blob);
      }, 'image/png');
    });
  } catch (err) {
    throw new Error(`${err.name} ${err.message}`);
  }
};

const share = async (e) => {
  const img = e.target.previousSibling;
  const fileName = img.src.substr(img.src.lastIndexOf('/') + 1);
  try {
    const blob = await imageToBlob(img);
    const data = {
      files: [
        new File([blob], fileName, {
          type: blob.type
        }),
      ],
      title: '',
      text: `👉 Image “${fileName}“ from “${document.title}” by @tomayac:`,
      url: document.querySelector('link[rel=canonical]').href,
    };

    if (!navigator.canShare(data)) {
      throw new Error('Can\'t share data.', data);
    };
    await navigator.share(data);
  } catch (err) {
    console.error(err.name, err.message);
  }
};

[...articleImages].filter((img) => img.src !== fallback);
articleImages.forEach((img) => {
  const button = buttonTempl.cloneNode();
  button.classList.add('share-image');
  button.textContent = 'Share Image';
  button.addEventListener('click', share);
  img.parentNode.insertBefore(button, img.nextSibling);
});
