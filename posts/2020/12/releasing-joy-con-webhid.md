---
layout: layouts/post.njk
title: "Releasing Joy-Con WebHID"
author: "Thomas Steiner"
date: "2020-12-21T14:13:18"
permalink: 2020/12/21/releasing-joy-con-webhid/index.html
tags:
  - Technical
---
The [WebHID API](https://web.dev/hid/) received its
[third LGTM](https://groups.google.com/a/chromium.org/g/blink-dev/c/rL1csFYD1Ms/m/d7y9_OftAQAJ) on December 17,
which means it is approved for shipping in Chrome&nbsp;🎉.
WebHID allows websites to access devices that use the
human interface devices ([HID](https://www.usb.org/hid)) protocol via JavaScript.
Here is a little Christmas present&nbsp;🎄
to the community to celebrate the API approval:
releasing
[Joy-Con WebHID](https://github.com/tomayac/joy-con-webhid),
a WebHID "driver" for
[Nintendo Joy-Con controllers](https://en.wikipedia.org/wiki/Joy-Con)
so you can use them in the browser.
If you have Joy-Cons, be sure to check out the
[demo](https://tomayac.github.io/joy-con-webhid/demo/)
to get a feel for what is possible.

<figure>
  <img src="/images/joy-con-webhid.png" width="2092" height="1694" loading="lazy" alt="Joy-Con WebHID demo showing two Joy-Cons slightly tilted with one of the analog sticks moved to the right on one Joy-Con and the 'A' button pressed on the other.">
  <figcaption>Joy-Con WebHID in action.</figcaption>
</figure>

## Using the library

Getting started is straight-forward.
Make sure you have a pairing button on your page.

```html
<button class="connect" type="button">Connect Joy-Con</button>
```

Import the script and hook up the pairing button.
Then create an interval that waits for Joy-Cons to appear,
which can happen after pairing,
on page load when previously paired Joy-Cons are reconnected,
and when Joy-Cons wake up again after being idle.

```js
import * as JoyCon from './node_modules/dist/index.js';

// For the initial pairing of the Joy-Cons. They need to be paired one by one.
// Once paired, Joy-Cons will be reconnected to on future page loads.
document.querySelector('.connect').addEventListener('click', async () => {
  // `JoyCon.connectJoyCon()` handles the initial HID pairing.
  // It keeps track of connected Joy-Cons in the `JoyCon.connectedJoyCons` Map.
  await JoyCon.connectJoyCon();
});

// Joy-Cons may sleep until touched and fall asleep again if idle, so attach
// the listener dynamically, but only once.
setInterval(async () => {
  for (const joyCon of JoyCon.connectedJoyCons.values()) {
    if (joyCon.eventListenerAttached) {
      continue;
    }
    // Open the device and enable standard full mode and inertial measurement
    // unit mode, so the Joy-Con activates the gyroscope and accelerometers.
    await joyCon.open();
    await joyCon.enableStandardFullMode();
    await joyCon.enableIMUMode();
    // Get information about the connected Joy-Con.
    console.log(await joyCon.getDeviceInfo());
    // Listen for HID input reports.
    joyCon.addEventListener('hidinput', ({ detail }) => {
      // Careful, this fires at ~60fps.
      console.log(`Input report from ${joyCon.device.productName}:`, detail);
    });
    joyCon.eventListenerAttached = true;
  }
}, 2000);
```

Check the file
[`demo/index.js`](https://github.com/tomayac/joy-con-webhid/blob/main/demo/index.js)
to see how to deal with the various signals you receive from the driver.

## Chrome Dino WebHID

A first example that I have built based on the Joy-Con WebHID project is
[Chrome Dino WebHID](https://github.com/tomayac/chrome-dino-webhid).
It allows you to [play the `chrome://dino` game](https://tomayac.github.io/chrome-dino-webhid/)&nbsp;🦖 via WebHID using your Joy-Cons.
Here is a video preview of what to expect:

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/HuhQXXgDnCQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

## Why not use the Gamepad API?

The [Gamepad API](https://w3c.github.io/gamepad/)
supports Joy-Con controllers out-of-the-box,
but since the API (currently) does not have a concept of orientation,
the Joy-Cons' accelerometer and gyroscope data cannot be accessed.
The buttons and analog sticks are fully exposed, though.
If all you need is this, then by all means go for the Gamepad API.

## Credits

Joy-Con WebHID takes heavy inspiration from [@wazho](https://github.com/wazho)'s
[ns-joycon](https://github.com/wazho/ns-joycon),
which in turn is based on [@dekuNukem](https://github.com/dekuNukem)'s
[Nintendo_Switch_Reverse_Engineering](https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering).
Standing on the shoulders of giants…
