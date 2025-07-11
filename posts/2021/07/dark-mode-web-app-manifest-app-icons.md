---
layout: layouts/post.njk
title: 'Dark Mode Web App Manifest App Icons'
author: 'Thomas Steiner'
date: '2021-07-21T10:52:37'
permalink: 2021/07/21/dark-mode-web-app-manifest-app-icons/index.html
tags:
  - Technical
---

I was asked if one could use SVG web app manifest app icons that are reactive to
[`prefers-color-scheme`](https://web.dev/prefers-color-scheme/). To illustrate
what this means, here is an excerpt of a manifest where I set the icon to an SVG
that is reactive to the color scheme. You can play with it by navigating
directly to
[icon.svg](https://tomayac.github.io/blogccasion-demos/dark-mode-favicon/icon.svg)
and toggling your operating system's color scheme setting.

```json
{
  "icons": [
    {
      "src": "https://tomayac.github.io/blogccasion-demos/dark-mode-favicon/icon.svg",
      "sizes": "144x144",
      "type": "image/svg+xml"
    }
  ]
}
```

The icon itself is just an SVG with embedded CSS. You may remember it from my
post
[`prefers-color-scheme` in SVG favicons for dark mode icons](/2019/09/21/prefers-color-scheme-in-svg-favicons-for-dark-mode-icons/).

(Side remark about a little gotcha: Note how I need to "lie" about the icon's
dimensions in the web app manifest, where I say it's `144x144` pixels compared
to the `width` and `height` in the source code. This won't be necessary once
[crbug/1107123](https://crbug.com/1107123) is fixed.)

```html
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

So, to close this, the answer to the above question is _yes_, app icons will
respect your preferred color scheme, but _no_, app icons won't update
dynamically when you change your color scheme. Instead, they will keep their
initial dark or light mode look from whatever you had your system set to at
install time.

![macOS Settings shows the system is set to light mode, but the app icon is still presented in dark mode, since it was installed when dark mode was enabled.](/images/dark-mode-app-icons.png)

You can test it for yourself by installing the app embedded below
([launch it in its own window](https://tomayac.github.io/blogccasion-demos/general-sly-olive/)).

<div style="height: 420px; width: 100%;">
  <iframe
    src="https://tomayac.github.io/blogccasion-demos/general-sly-olive/"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>

<strong>Update:</strong> [Alexey Rodionov](https://twitter.com/alexey_rodionov)
has let me know that this even works for
[app shortcut icons](https://web.dev/app-shortcuts/#icons-%28optional%29). Check
out the screenshot below.

<img src="/images/app-shortcut-icons.png" alt="App shortcut icons displayed in dark mode." width="613" height="605" />
