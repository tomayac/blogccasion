---
layout: layouts/post.njk
title: "Why Build Progressive Web Apps: Never Lose a Click-Out!—Video Write-Up"
description: "(This is the write-up of the first episode of my new YouTube show “Why Build Progressive Web Apps.” If you prefer watching, the video is embedded below.) (Also check out the the write-up of the…"
date: "2018-12-03T14:03:09.463Z"
categories:
  - Web Development
  - Progressive Web App
  - Offline First
  - Affiliate Marketing
  - Service Worker
---

_(This is the write-up of the first episode of my new YouTube show “Why Build Progressive Web Apps.” If you prefer watching, the_ [_video_](https://www.youtube.com/watch?v=4UK_TDTTWnQ) _is embedded below.)_

_(Also check out the the_ [_write-up of the second episode_](https://medium.com/dev-channel/why-build-progressive-web-apps-push-but-dont-be-pushy-video-write-up-aa78296886e) _and the_ [_write-up of the third episode_](https://medium.com/dev-channel/why-build-progressive-web-apps-if-its-just-a-bookmark-it-s-not-a-pwa-video-write-up-7ccca1c58034)_, or watch the_ [_second episode video_](https://www.youtube.com/watch?v=vRsVx8_94UQ) _and the_ [_third episode video_](https://youtu.be/kENeCdS3fzU)_.)_

On the Google Chrome Developers [YouTube channel](https://www.youtube.com/channel/UCnUYZLuoy1rq1aVMwx4aTzw), we have been pushing the concept of Progressive Web Apps (PWA) a fair bit, and there have been some great [success](https://youtu.be/Xryhxi45Q5M) [stories](https://youtu.be/SJiKWwBtQaU) of companies building PWAs. But you might wonder, what may have worked for the mentioned partners, might not necessarily work for your company. In my new video series called _“Why build Progressive Web Apps,”_ I want to show you common **_use-case driven patterns for applying PWA features_** that set _you_ up for success. In the first episode, I look at affiliate sites and how they can manage to never lose a click-out.

<Embed src="https://www.youtube.com/embed/4UK_TDTTWnQ?feature=oembed" aspectRatio={undefined} caption="“Why Build Progressive Web Apps,” episode 1: Never Lose a Click-Out!" />

You have maybe seen or even used a **_comparison site_** in the past. For example, to find out what is the cheapest internet provider, or to get the best hotel offer for your next vacation. Many of these comparison sites rely on **_commission-based affiliate marketing_**: when you click out to a third-party vendor site and end up converting, the referring comparison site earns a small fee. In consequence, such sites want you to click through to the best offer, and under no circumstances do they want to risk losing a click-out.

![Screenshots of exemplary comparison sites.](/images/asset-1___.png)

Many sessions with comparison sites happen “on the go,” say, on the commute to work. And while in the majority of cases you might be connected, there are definitely situations where you lose your connection, like in a tunnel or when your signal strength drops to just one or two bars, and you end up being _de facto_ offline. Having an architecture that gives the network some time to respond, but that gracefully degrades to cached content or fallback placeholder content, can help improve the user’s experience drastically.

![About to lose your mobile connection (Credits: [https://unsplash.com/photos/wVcQqwNeDj8](https://unsplash.com/photos/wVcQqwNeDj8)).](/images/asset-2__.png)

In order to demonstrate how to deal with such situations, I have created my own sample comparison site called  [**🐈 AffiliCats**](https://googlechromelabs.github.io/affilicats/) with purely dummy content, but coming from _real APIs_ like the [Wikimedia API](https://github.com/GoogleChromeLabs/affilicats/blob/895c27b2f87f377049d477ea90c8927ce52f1fb5/src/js/main.js#L64-L74), the [Google Static Maps API](https://github.com/GoogleChromeLabs/affilicats/blob/895c27b2f87f377049d477ea90c8927ce52f1fb5/src/js/main.js#L183-L189), the [Random Number API](https://github.com/GoogleChromeLabs/affilicats/blob/895c27b2f87f377049d477ea90c8927ce52f1fb5/src/js/main.js#L202-L204), the [Bacon Ipsum API](https://github.com/GoogleChromeLabs/affilicats/blob/895c27b2f87f377049d477ea90c8927ce52f1fb5/src/js/main.js#L202-L204), and the [Place Kittens API](https://github.com/GoogleChromeLabs/affilicats/blob/895c27b2f87f377049d477ea90c8927ce52f1fb5/src/js/main.js#L270).

![🐈 AffiliCats sample app (Source: [https://googlechromelabs.github.io/affilicats/](https://googlechromelabs.github.io/affilicats/)).](/images/asset-3__.png)

The app has a big search bar on top where you can search for items, like cats. Each item has an image and a title, as well as offers and a _“View Deal”_ button that leads to the third-party vendor’s site. Then we have three tabs with more _photos_, _reviews_, and the _location_ of the item.

![🐈 AffiliCats tabs: photos, reviews, location (Source: [https://googlechromelabs.github.io/affilicats/](https://googlechromelabs.github.io/affilicats/)).](/images/asset-4__.png)

Each tab’s content is _lazily loaded_ on-demand with one, or multiple, fetch request. So in each case, the request can either _succeed_, _time out_ if the network is too slow, or _fail_ from the start if we’re entirely offline.

![Waterfall diagram showing lazy-loading.](/images/asset-5__.png)

In the latter two cases, we want to respond with _fallback content_, for example, a “reviews took too long to load” message, or a timeout image. When the network comes back, or the slow request eventually goes through, we can then dynamically replace the fallback or placeholder content with real content. The user can also decide to press “reload” and refresh the complete page. This is called “navigation request”. If we’re offline, we can then show a fallback page with skeleton content.

![Fallback content in case loading takes too long, offline placeholders, and dynamic loading.](/images/asset-6__.png)

Finally, let’s see how we can make sure not to lose the click-out. What happens if the user clicks on the “View Deal” button when they are offline? Notice how most of the page is disabled, but the money-making button is still active?

![While the app is offline and most interactive features are disabled, the “View Deal” button can still be clicked.](/images/asset-7__.png)

A _precached forwarding page_ opens that waits for the connection to come back, and once online again, it then eventually still realizes the click-out, and drops our imaginary affiliate cookie… 💸

![The precached forwarding page loads—even when offline—and waits for the connection to come back, to then eventually still realize the click-out.](/images/asset-8__.png)

You are invited to [play with this app](https://googlechromelabs.github.io/affilicats/) yourself and read the [source code](https://github.com/GoogleChromeLabs/affilicats). I hope this has been useful, and maybe you can apply some of these patterns to your own websites. Thanks for reading, and see or read you for the next episode of “Why build Progressive Web Apps,” where we will look at push notifications.

In order not to miss it, **_subscribe_** to our [Medium Dev Channel](https://medium.com/dev-channel), the Chrome Developers [YouTube channel](https://www.youtube.com/channel/UCnUYZLuoy1rq1aVMwx4aTzw), follow [@ChromiumDev](https://twitter.com/ChromiumDev) on Twitter—and if you like, I am [@tomayac](https://twitter.com/tomayac) almost universally on the World Wide Internet.
