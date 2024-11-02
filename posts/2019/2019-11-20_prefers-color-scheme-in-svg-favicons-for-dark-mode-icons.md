---
layout: layouts/post.njk
title: 'prefers-color-scheme in SVG favicons for dark mode icons'
author: 'Thomas Steiner'
date: '2019-11-20T09:26:04'
permalink: 2019/09/21/prefers-color-scheme-in-svg-favicons-for-dark-mode-icons/index.html
tags:
  - Technical
---

🎉 Chrome finally accepts SVG favicons now that
[crbug.com/294179](https://crbug.com/294179), where this feature was demanded on
September 18, 2013(!), was fixed. This means that you can style your icon with
inline [`prefers-color-scheme`](https://web.dev/prefers-color-scheme) and you'll
get two icons for the price of one!

```html
<!-- icon.svg -->
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <style>
    circle {
      fill: yellow;
      stroke: black;
      stroke-width: 3px;
    }
    @media (prefers-color-scheme: dark) {
      circle {
        fill: black;
        stroke: yellow;
      }
    }
  </style>
  <circle cx="50" cy="50" r="47" />
</svg>
```

```html
<!-- index.html -->
<link rel="icon" href="/icon.svg" />
```

You can see a demo of this in action at 🌒
[dark-mode-favicon.glitch.me](https://dark-mode-favicon.glitch.me/) ☀️. Until
this feature will have landed in Chrome Stable/Beta/Dev/Canary, be sure to test
it with the last Chromium build that you can download from François Beaufort's
[Chromium Downloader](https://download-chromium.appspot.com/).

![Demo app running in dark mode, showing the dark mode favicon being used.](/images/dark.png)

![Demo app running in light mode, showing the light mode favicon being used.](/images/light.png)

Full credits to [Mathias Bynens](https://twitter.com/mathias), who
[independently](https://bugs.chromium.org/p/chromium/issues/detail?id=294179#c72)
has created almost the same [demo](https://numerous-sulfur.glitch.me) as me that
I didn't check, but whose link to
[Jake Archibald](https://twitter.com/jaffathecake)'s post
[SVG &amp; media queries](https://jakearchibald.com/2016/svg-media-queries/) I
did follow. Mathias has now filed the follow-up bug
[crbug.com/1026539](https://crbug.com/1026539) that will improve the favicon
update behavior (now you still need to reload the page after a color scheme
change).
