---
layout: layouts/post.njk
title: 'Cross platform software frameworks'
author: 'Thomas Steiner'
date: '2023-02-23T19:19:38'
permalink: 2023/02/23/cross-platform-software-frameworks/index.html
tags:
  - Technical
---

# Cross Platform Software Frameworks

The other day, I came across [Elk Native](https://github.com/elk-zone/elk-native), a native version of the rather excellent, if early-stage, Mastodon Web client [Elk](https://elk.zone/). To be honest, I wondered why they would build a native version, if the Web client works so well. I downloaded the 7.8 MB [`Elk_0.4.0_macos_x86_64.dmg`](https://github.com/elk-zone/elk-native/releases/download/elk-native-v0.4.0/Elk_0.4.0_macos_x86_64.dmg) and immediately ran into [Issue #74](https://github.com/elk-zone/elk-native/issues/74), that is, a blank screen.

To better understand the motivation behind the Elk Native developers, I tried the same for one of my apps, with different frameworks. This [repository](https://github.com/tomayac/cross-platform-software-frameworks) contains the same PWA, [SVGcode](https://svgco.de/), wrapped five times with different cross platform software frameworks.

## Running the apps

SVGcode is included as a git submodule in each framework folder. To run the apps, you first need to build SVGcode, and then start the wrapper app. In each subfolder, run the following commands.

```bash
npm run build-svgcode
npm start
```

## Included frameworks

- [Electron.js](https://electronjs.org/) (["Getting started" guide](https://www.electronjs.org/docs/latest/tutorial/quick-start))
- [NW.js](https://nwjs.io/) (["Getting started" guide](https://nwjs.readthedocs.io/en/latest/For%20Users/Getting%20Started/))
- [Tauri](https://tauri.app/) (["Getting started" guide](https://tauri.app/v1/guides/getting-started/setup/html-css-js/))
- [Neutralinojs](https://neutralino.js.org/) (["Getting started" guide](https://neutralino.js.org/docs/getting-started/your-first-neutralinojs-app/))
- [Gluon](https://gluonjs.org/) (["Getting started" guide](https://gluonjs.org/docs/guide/quick-start/))

## Screenshots

- Electron.js
  ![](https://github.com/tomayac/cross-platform-software-frameworks/raw/main/screenshots/svgcode-electron.png)
- NW.js
  ![](https://github.com/tomayac/cross-platform-software-frameworks/raw/main/screenshots/svgcode-nw_js.png)
- Tauri
  ![](https://github.com/tomayac/cross-platform-software-frameworks/raw/main/screenshots/svgcode-tauri.png)
- Neutralinojs
  ![](https://github.com/tomayac/cross-platform-software-frameworks/raw/main/screenshots/svgcode-neutralinojs.png)
- Gluon
  ![](https://github.com/tomayac/cross-platform-software-frameworks/raw/main/screenshots/svgcode-gluon.png)

## Issues

> ⚠️ I'm a Web developer, not a desktop app developer. I simply followed the "Getting started" guides and may well be holding the frameworks wrong.

While I managed to get all apps to run, none of them worked perfectly out of the box, and there was always a strange error I could not explain. SVGcode works fine on Chrome, Safari, and Firefox when run in the standalone browsers. To see what's under the hood of the frameworks, I looked at the user agent data via DevTools.

```js
// If `navigator.userAgentData` is available, use it.
copy(JSON.stringify(await navigator.userAgentData.getHighEntropyValues([
  "architecture",
  "bitness",
  "model",
  "platformVersion",
  "uaFullVersion" ,
  "fullVersionList",
]), null, 2));

// Else use the user agent.
copy(navigator.userAgent);
```

### Electron.js

Clicking the **Copy SVG** button causes an `Uncaught (in promise) ReferenceError: Cannot access 'P' before initialization.` error.

```json
{
  "architecture": "arm",
  "bitness": "64",
  "brands": [
    {
      "brand": "Not A(Brand",
      "version": "24"
    },
    {
      "brand": "Chromium",
      "version": "110"
    }
  ],
  "fullVersionList": [
    {
      "brand": "Not A(Brand",
      "version": "24.0.0.0"
    },
    {
      "brand": "Chromium",
      "version": "110.0.5481.100"
    }
  ],
  "mobile": false,
  "model": "",
  "platform": "macOS",
  "platformVersion": "13.3.0",
  "uaFullVersion": "110.0.5481.100"
}
```

### NW.js

Clicking the **Copy SVG** button causes an `Uncaught (in promise) ReferenceError: Cannot access 'P' before initialization.` error.

```json
{
  "architecture": "arm",
  "bitness": "64",
  "brands": [
    {
      "brand": "Not A(Brand",
      "version": "24"
    },
    {
      "brand": "Chromium",
      "version": "110"
    }
  ],
  "fullVersionList": [
    {
      "brand": "Not A(Brand",
      "version": "24.0.0.0"
    },
    {
      "brand": "Chromium",
      "version": "110.0.5481.97"
    }
  ],
  "mobile": false,
  "model": "",
  "platform": "macOS",
  "platformVersion": "13.3.0",
  "uaFullVersion": "110.0.5481.97"
}
```

### Tauri

Clicking the **Save SVG** button does nothing.

```bash
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)
```

### Neutralinojs

Clicking the **Open Image** button does nothing. Clicking the **Save SVG** button does nothing.

```bash
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)
```

### Gluon

Fails with a `RangeError Failed to execute 'createImageBitmap' on 'Window': The crop rect width is 0.`.

```json
{
  "architecture": "arm",
  "bitness": "64",
  "brands": [
    {
      "brand": "Chromium",
      "version": "110"
    },
    {
      "brand": "Not A(Brand",
      "version": "24"
    },
    {
      "brand": "Google Chrome",
      "version": "110"
    }
  ],
  "fullVersionList": [
    {
      "brand": "Chromium",
      "version": "110.0.5481.177"
    },
    {
      "brand": "Not A(Brand",
      "version": "24.0.0.0"
    },
    {
      "brand": "Google Chrome",
      "version": "110.0.5481.177"
    }
  ],
  "mobile": false,
  "model": "",
  "platform": "macOS",
  "platformVersion": "13.3.0",
  "uaFullVersion": "110.0.5481.177"
}
```

## Building the apps (incomplete)

I started looking into building the apps, but didn't get too far. Electron.js looks like it has the most developed toolchain, but when I ran `electron-forge make`, I ended up with a 332,1 MB executable called `svgcode-electron.app` that only showed a white screen, despite the `electron-forge start` development app working mostly fine.

![](https://github.com/tomayac/cross-platform-software-frameworks/raw/main/screenshots/svgcode-electron-app.png)

To build the apps, run the following command in each subfolder. (So far I have only worked on Electron.js.)

```bash
npm run build
```

I didn't even look into the signing part, which is required for proper distribution.

## Conclusions

I'm not sure what to make of this. To be honest, I didn't see anything that would be more compelling than just browsing to [svgco.de](https://svgco.de/), clicking **Install**, and be good. But then I obviously didn't tap into any of the native features that cross platform frameworks allow you to do. I only noticed how features that I get for free in the Web version, like [Window Controls Overlay](https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API) or [File Handling](https://developer.chrome.com/en/articles/file-handling/) were broken. But again, I may just be holding these frameworks wrong. For now, it was a worthwhile exercise, but I think I'll stick to the Web.
