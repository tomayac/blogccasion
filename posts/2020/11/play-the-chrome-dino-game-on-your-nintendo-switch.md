---
layout: layouts/post.njk
title: "Play the Chrome dino game on your Nintendo Switch"
author: "Thomas Steiner"
date: "2020-11-04T12:31:32"
permalink: 2020/11/04/play-the-chrome-dino-game-on-your-nintendo-switch/index.html
tags:
  - Technical
---

I have landed an article over on [web.dev](https://web.dev/)
that [talks about the Gamepad API](https://web.dev/gamepad/).
One piece of information from this article that our editorial board was not comfortable
with having in there was instructions on how to play the Chrome dino game on a Nintendo Switch.
So, here you go with the steps right here on my private blog instead.

<figure>
  <img src="/images/nintendo-switch.jpg" width="800" height="240" alt="The hands of a person playing the Chrome dino game on a Nintendo Switch.">
  <figcaption>
    Press any of the Nintendo Switch's buttons to play!
  </figcaption>
</figure>

The Nintendo Switch contains a
[hidden browser](https://switchbrew.org/wiki/Internet_Browser#WifiWebAuthApplet),
which serves for logging in to Wi-Fi networks behind a captive portal.
The browser is pretty barebones and does not have a URL bar,
but, once you have navigated to a page, it is fully usable.
When doing a connection test in system settings, the Switch will detect that the captive portal
is present and display an error for it when the response for
[http://conntest.nintendowifi.net/](http://conntest.nintendowifi.net/)
does not include the `X-Organization: Nintendo` HTTP header.
I can make creative use of this by pointing the Switch to a DNS server
that simulates a captive portal that then redirects to a search engine.

1. Go to **System Settings** and then **Internet Settings** and
   find the Wi-Fi network that your Switch is connected to. Tap **Change Settings**.
1. Find the section with the **DNS Settings** and add
   [45.55.142.122](http://45.55.142.122) as a new **Primary DNS**.
   Note that this DNS server is *not operated by me*
   but a [third-party](https://www.switchbru.com/dns/), so proceed at your own risk.
1. **Save** the settings and then tap **Connect to This Network**.
1. The Switch will tell you that **Registration is required to use this network**. Tap **Next**.
1. On the page that opens, make your way to **Google**.
1. Search for **"chrome dino tomayac"**. This should lead you to
   [https://github.com/tomayac/chrome-dino-gamepad](https://github.com/tomayac/chrome-dino-gamepad).
1. On the right-hand side in the **About** section, find the link to
   [https://tomayac.github.io/chrome-dino-gamepad/](https://tomayac.github.io/chrome-dino-gamepad/).
   Enjoy!
1. 🚨 For regular Switch online services to work again,
   turn your DNS settings back to **Automatic**.
   Conveniently, the Switch remembers previous manual DNS settings,
   so you can easily toggle between **Automatic** and **Manual**.

For the [Chrome dino gamepad](https://tomayac.github.io/chrome-dino-gamepad/) demo to work,
I have ripped out the Chrome dino game from the core Chromium project
(updating an [earlier effort](https://github.com/arnellebalane/trex-runner) by
[Arnelle Ballane](https://arnellebalane.com/)),
placed it on a standalone site, extended the existing gamepad API implementation by adding ducking
and vibration effects, created a full screen mode,
and [Mehul Satardekar](https://github.com/mehulsatardekar)
contributed a dark mode implementation.
Happy gaming!

You can also play
[Chrome dino](https://tomayac.github.io/chrome-dino-gamepad/)
with your gamepad on this very site.
The source code is available
[on GitHub](https://github.com/tomayac/chrome-dino-gamepad).
Check out the gamepad polling implementation in
[`trex-runner.js`](https://github.com/tomayac/chrome-dino-gamepad/blob/885eb6134805345bf31eeb9971830adeb84747ab/trex-runner.js#L529-L571)
and note how it is emulating key presses.

<div style="height: 420px; width: 100%;">
  <iframe
    src="https://tomayac.github.io/chrome-dino-gamepad/"
    title="Chrome dino gamepad"
    allow="gamepad; fullscreen"
    style="height: 100%; width: 100%; border: 0;">
  </iframe>
</div>
