---
layout: layouts/post.njk
title: 'The requestVideoFrameCallback API'
author: 'Thomas Steiner'
date: '2020-05-15T13:19:44'
permalink: 2020/05/15/the-requestvideoframecallback-api/index.html
tags:
  - Technical
---

There's a new Web API on the block, defined in the
[HTMLVideoElement.requestVideoFrameCallback()](https://wicg.github.io/video-rvfc/)
specification.
The `requestVideoFrameCallback()` method allows web authors to register a callback,
which runs in the rendering steps when a new video frame 🎞 is sent to the compositor.
This is intended to allow developers to perform efficient per-video-frame operations on video,
such as video processing and painting to a canvas, video analysis,
or synchronization with external audio sources.

Operations like drawing a video frame to a canvas via
[`drawImage()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)
made through this API will be synchronized as a best effort
with the video playing on screen.
Different from
[`window.requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame),
which usually fires about 60 times per second,
`requestVideoFrameCallback()` is bound to the actual video frame rate—with an important
[exception](https://wicg.github.io/video-rvfc/#ref-for-update-the-rendering③:~:text=Note%3A%20The%20effective%20rate%20at%20which,browser%20would%20fire%20callbacks%20at%2060hz.):

> The effective rate at which callbacks are run is the lesser rate between the video's rate
> and the browser's rate.
> This means a 25fps video playing in a browser that paints at 60Hz
> would fire callbacks at 25Hz.
> A 120fps video in that same 60Hz browser would fire callbacks at 60Hz.

Due to its similarity with `window.requestAnimationFrame()`, the API initially
was [proposed as `video.requestAnimationFrame()`](https://discourse.wicg.io/t/proposal-video-requestanimationframe/3691), but I'm happy the new name
`requestVideoFrameCallback()` was agreed on
after a [lengthy discussion](https://github.com/WICG/video-rvfc/issues/44).
Yay, [bikeshedding](https://css-tricks.com/what-is-bikeshedding/) for the win 🙌!

The API is
[implemented in Chromium](https://chromestatus.com/feature/6335927192387584)
already, and
[Mozilla folks like it](https://mozilla.github.io/standards-positions/#requestVideoFrameCallback).
For what it's worth, I have just filed a
[WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=211945) asking for it.
Feature detection of the API works like this:

```js
if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
  // The API is supported! 🎉
}
```

I have created a small
[demo on Glitch](https://requestvideoframecallback.glitch.me/)
that shows how frames are drawn on a canvas at exactly
the frame rate of the video and
where the frame metadata is logged for debugging purposes.
The core logic is just a couple of lines of JavaScript.
As a developer, the API's look and feel does indeed remind of `requestAnimationFrame()`,
but as outlined above, it's still different in what it actually does.

```js
let paintCount = 0;
let startTime = 0.0;

const updateCanvas = (now, metadata) => {
  if (startTime === 0.0) {
    startTime = now;
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const elapsed = (now - startTime) / 1000.0;
  const fps = (++paintCount / elapsed).toFixed(3);
  fpsInfo.innerText = `video fps: ${fps}`;
  metadataInfo.innerText = JSON.stringify(metadata, null, 2);

  video.requestVideoFrameCallback(updateCanvas);
};

video.requestVideoFrameCallback(updateCanvas);
```

<div class="glitch-embed-wrap" style="height: 1200px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/requestvideoframecallback?path=script.js&previewSize=100"
    title="requestvideoframecallback on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>

I have done frame-level processing for a long time—without having access to the actual frames
by approximating through `video.currentTime`.
At one point during my [PhD research](https://tomayac.com/phd/#1),
I implemented video shot segmentation in JavaScript, the
[demo](https://tomayac.com/youpr0n/) is still up (click for a
[screenshot](/images/tomayac.com_youpr0n_.png)).
This work was the topic of a
[research paper](https://www2012.universite-lyon.fr/proceedings/nocompanion/DevTrack_028.pdf)
that was
[presented](/2012/07/16/enabling-on-the-fly-video-shot-detection-on-youtube-113748/)
at the World Wide Web conference 2012 in Lyon, France in the Developers Track.
Had the `requestVideoFrameCallback()` existed back then, my life would have been much simpler…
