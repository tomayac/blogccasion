import {articleBody} from '/js/script.mjs';

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
button.textContent = 'Share';
const isIOS = (/\b(iPad|iPhone|iPod)\b/.test(navigator.userAgent));
button.classList.add('share', isIOS ? 'share-ios' : 'share-others');
button.addEventListener('click', share);
const paragraph = document.createElement('p');
paragraph.appendChild(button);
articleBody.appendChild(paragraph);
