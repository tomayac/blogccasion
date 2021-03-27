---
layout: layouts/post.njk
title: 'Multi-MIME Type Copying with the Async Clipboard API'
author: 'Thomas Steiner'
date: '2020-03-20T19:24:13'
permalink: 2020/03/20/multi-mime-type-copying-with-the-async-clipboard-api/index.html
tags:
  - Technical
---

## Copying an Image

The [Asynchronous Clipboard API](https://w3c.github.io/clipboard-apis/#async-clipboard-api)
provides direct access to read and write clipboard data.
Apart from _text_, since Chrome&nbsp;76, you can also copy and paste _image_ data with the API.
For more details on this, check out my
[article on web.dev](https://web.dev/image-support-for-async-clipboard/).
Here's the gist of how copying an image blob works:

```js
const copy = async (blob) => {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
  } catch (err) {
    console.error(err.name, err.message);
  }
};
```

Note that you need to pass an array of `ClipboardItem`s to the `navigator.clipboard.write()` method,
which implies that you can place more than one item on the clipboard
(but this is not yet implemented in Chrome as of March&nbsp;2020).

I have to admit, I only used to think of the clipboard as a one-item stack,
so any new item replaces the existing one.
However, for example, Microsoft Office&nbsp;365's clipboard on Windows&nbsp;10 supports
[up to 24&nbsp;clipboard items](https://support.office.com/en-us/article/copy-and-paste-using-the-office-clipboard-714a72af-1ad4-450f-8708-c2931e73ec8a#ID0EAABAAA=Windows).

## Pasting an Image

The generic code for pasting an image, that is, for reading from the clipboard,
is a little more involved.
Also be advised that reading from the clipboard triggers a
[permission prompt](https://web.dev/image-support-for-async-clipboard/#security-permission)
before the read operation can succeed.
Here's the trimmed down
[example from my article](https://web.dev/image-support-for-async-clipboard/#paste-image):

```js
const paste = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        return await clipboardItem.getType(type);
      }
    }
  } catch (err) {
    console.error(err.name, err.message);
  }
};
```

See how I first iterate over all `clipboardItems`
(reminder, there can be just one in the current implementation),
but then also iterate over all `clipboardItem.types` of each individual `clipboardItem`,
only to then just stop at the first `type` and return whatever blob I encounter there.
So far I haven't really payed much attention to what this enables,
but yesterday, I had a sudden epiphany 🤯.

## Content Negotiation

Before I get into the details of multi-MIME type copying,
let me quickly derail to
[server-driven content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation#Server-driven_content_negotiation), quoting straight from MDN:

> In server-driven content negotiation, or proactive content negotiation, the browser
> (or any other kind of user-agent) sends several HTTP headers along with the URL.
> These headers describe the preferred choice of the user.
> The server uses them as hints and an internal algorithm chooses the best content
> to serve to the client.

![Server-driven content negotiation diagram](/images/HTTPNegoServer.png)

## Multi-MIME Type Copying

A similar content negotiation mechanism takes place with copying.
You have probably encountered this effect before
when you have copied rich text, like formatted HTML, into a plain text field:
the rich text is automatically converted to plain text.
(💡 Pro tip: to force pasting into a rich text context _without_ formatting,
use <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>v</kbd> on Windows,
or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>v</kbd> on macOS.)

So back to content negotiation with image copying.
If you copy an SVG image, then open macOS
[Preview](https://support.apple.com/guide/preview/welcome/mac),
and finally click "File"&nbsp;>&nbsp;"New from Clipboard",
you would probably expect an _image_ to be pasted.
However, if you copy an SVG image and paste it into
[Visual Studio Code](https://code.visualstudio.com/)
or into [SVGOMG](https://jakearchibald.github.io/svgomg/)'s "Paste markup" field,
you would probably expect the _source code_ to be pasted.

With multi-MIME type copying, you can achieve exactly that 🎉.
Below is the code of a future-proof `copy` function and some helper methods
with the following functionality:

- For images that are not SVGs, it creates a textual representation
  based on the image's `alt` text attribute.
  For SVG images, it creates a textual representation based on the SVG source code.
- At present, the Async Clipboard API only works with `image/png`,
  but nevertheless the code _tries_ to put a representation in the image's original MIME type
  into the clipboard, apart from a PNG representation.

So in the generic case, for an SVG image, you would end up with three representations:
the source code as `text/plain`, the SVG image as `image/svg+xml`, and a PNG render as `image/png`.

```js
const copy = async (img) => {
  // This assumes you have marked up images like so:
  // <img
  //    src="foo.svg"
  //    data-mime-type="image/svg+xml"
  //    alt="Foo">
  //
  // Applying this markup could be automated
  // (for all applicable MIME types):
  //
  // document.querySelectorAll('img[src*=".svg"]')
  // .forEach((img) => {
  //   img.dataset.mimeType = 'image/svg+xml';
  // });
  const mimeType = img.dataset.mimeType;
  // Always create a textual representation based on the
  // `alt` text, or based on the source code for SVG images.
  let text = null;
  if (mimeType === 'image/svg+xml') {
    text = await toSourceBlob(img);
  } else {
    text = new Blob([img.alt], { type: 'text/plain' });
  }
  const clipboardData = {
    'text/plain': text,
  };
  // Always create a PNG representation.
  clipboardData['image/png'] = await toPNGBlob(img);
  // When dealing with a non-PNG image, create a
  // representation in the MIME type in question.
  if (mimeType !== 'image/png') {
    clipboardData[mimeType] = await toOriginBlob(img);
  }
  try {
    await navigator.clipboard.write([new ClipboardItem(clipboardData)]);
  } catch (err) {
    // Currently only `text/plain` and `image/png` are
    // implemented, so if there is a `NotAllowedError`,
    // remove the other representation.
    console.warn(err.name, err.message);
    if (err.name === 'NotAllowedError') {
      const disallowedMimeType = err.message.replace(
        /^.*?\s(\w+\/[^\s]+).*?$/,
        '$1'
      );
      delete clipboardData[disallowedMimeType];
      try {
        await navigator.clipboard.write([new ClipboardItem(clipboardData)]);
      } catch (err) {
        throw err;
      }
    }
  }
  // Log what's ultimately on the clipboard.
  console.log(clipboardData);
};

// Draws an image on an offscreen canvas
// and converts it to a PNG blob.
const toPNGBlob = async (img) => {
  const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d');
  // This removes transparency. Remove at will.
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return await canvas.convertToBlob();
};

// Fetches an image resource and returns
// its blob of whatever MIME type.
const toOriginBlob = async (img) => {
  const response = await fetch(img.src);
  return await response.blob();
};

// Fetches an SVG image resource and returns
// a blob based on the source code.
const toSourceBlob = async (img) => {
  const response = await fetch(img.src);
  const source = await response.text();
  return new Blob([source], { type: 'text/plain' });
};
```

If you use this `copy` function ([demo](#demo) below ⤵️) to copy an SVG image,
for example, everyone's favorite
[symptoms of coronavirus 🦠 disease diagram](https://cdn.glitch.com/8b0b00bb-4f86-41e8-b428-3d07b2b652a5%2FSymptoms_of_coronavirus_disease_2019_2.0.svg?v=1584617175181),
and paste it in macOS Preview (that does not support SVG) or the "Paste markup" field of
SVGOMG, this is what you get:

<figure>
  <img src="/images/preview.png" alt="The macOS Preview app with a pasted PNG image." width="800" height="623">
  <figcaption>
    The macOS Preview app with a pasted PNG image.
  </figcaption>
</figure>

<figure>
  <img src="/images/svgomg.png" alt="The SVGOMG web app with a pasted SVG image." width="800" height="539">
  <figcaption>
    The SVGOMG web app with a pasted SVG image.
  </figcaption>
</figure>

## Demo

<del>You can play with this code in the embedded example below.</del>
<ins>Unfortunately you can't play with this code in the embedded example below yet,
since [webappsec-feature-policy#322](https://github.com/w3c/webappsec-feature-policy/issues/322)
is still open.</ins>
The demo works if you [open it directly on Glitch](https://async-clipboard-demo.glitch.me/).

<div style="height: 600px; width: 100%; margin-block-end: 2rem;">
  <iframe
    src="https://glitch.com/embed/#!/embed/async-clipboard-demo?path=script.js&previewSize=100"
    title="async-clipboard-demo on Glitch"
    allow="clipboard-write; clipboard-read"
    style="height: 100%; width: 100%; border: 0;"
    loading="lazy">
  </iframe>
</div>

## Conclusion

Programmatic multi-MIME type copying is a powerful feature.
At present, the Async Clipboard API is still limited,
but raw clipboard access is on the radar of the
[🐡 Project Fugu team](/2019/09/21/project-fugu-at-w3c-tpac/#breakout-session-for-a-more-capable-web%E2%80%94project-fugu)
that I am a small part of.
The feature is being tracked as [crbug/897289](https://crbug.com/897289).

All that being said, raw clipboard access has its risks, too, as clearly pointed out in the
[TAG review](https://github.com/w3ctag/design-reviews/issues/406).
I do hope use cases like multi-MIME type copying that I have motivated in this blog post
can help create developer enthusiasm so that browser engineers and security experts can make sure
the feature gets implemented and lands in a secure way.
