---
layout: layouts/post.njk
title: "Why Build Progressive Web Apps: Push, but Don’t be Pushy! — Video Write-Up"
description: "(This is the write-up of the second episode of my new YouTube show “Why Build Progressive Web Apps.” If you prefer watching, the video is embedded below.) (Also check out the the write-up of the…"
date: "2018-12-04T13:20:36.707Z"
categories:
  - Mobile
  - Progressive Web App
  - Push Notification
  - Web Push Notifications
  - Service Worker
---

_(This is the write-up of the second episode of my new YouTube show “Why Build Progressive Web Apps.” If you prefer watching, the_ [_video_](https://www.youtube.com/watch?v=vRsVx8_94UQ) _is embedded below.)_

_(Also check out the the_ [_write-up of the first episode_](https://medium.com/dev-channel/why-build-progressive-web-apps-never-lose-a-click-out-video-write-up-74cbbc466afd) _and the_ [_write-up of the third episode_](https://medium.com/dev-channel/why-build-progressive-web-apps-if-its-just-a-bookmark-it-s-not-a-pwa-video-write-up-7ccca1c58034)_, or watch the_ [_first episode video_](https://www.youtube.com/watch?v=4UK_TDTTWnQ) _and the_ [_third episode video_](https://youtu.be/kENeCdS3fzU)_.)_

Let’s face it, on the web, push notifications have become a bit of an omnipresent annoyance. The reason for the bad reputation of push notifications—in my opinion—is that we have been, well, a bit too _“pushy”_ in trying to get people to allow them.

<Embed src="https://www.youtube.com/embed/vRsVx8_94UQ?feature=oembed" aspectRatio={undefined} caption="“Why Build Progressive Web Apps,” episode 2: Push, but Don’t Be Pushy!" />

The folks over at Mozilla have phrased it like this in a [blog post](https://blog.mozilla.org/firefox/no-notifications/):

> “Online, your attention is priceless. That’s why every site in the universe wants permission to send you notifications about new stuff. It can be distracting at best and annoying at worst.”

![Blog post by Mozilla announcing the option to block push notifications globally.](/images/asset-1_copy.jpeg)

A particularly _bad practice_ is to pop up the permission dialog on page load, without any context at all. Several high traffic sites have been caught doing this. To subscribe people to push notifications, you use the the `[PushManager](https://developer.mozilla.org/en-US/docs/Web/API/PushManager)` [interface](https://developer.mozilla.org/en-US/docs/Web/API/PushManager). Now to be fair, this does not allow the developer to specify the context or the to-be-expected frequency of notifications. So where does this leave us?

```
const options = {
  userVisibleOnly: true,
  applicationServerKey: APPLICATION_SERVER_KEY,
  // No way to specify context or frequency ¯\_(ツ)_/¯
};
const subscription = await reg.pushManager.subscribe(options);
```

First, maybe let’s take one step back and brainstorm why we would want push notifications in the first place. If done right, **_push notifications are actually pretty great_**. For example, they can inform you if you have been _outbid_ on an auction site. They can alert you about _severe weather conditions_ in your hometown. On a less serious note, they can notify you when you have a _match on a dating site_. Or they can let you know if there’s a significant _price drop_ for something you’re interested in. And yes, of course push notifications can also _inform you of new content_ on a news site.

As I wrote above, there is no way on the API-level to inform users about the context of push notifications. All you can do with the options parameter is set a flag whether the notifications should be `userVisibleOnly`, and provide the `applicationServerKey`. In consequence, it’s crucial that we as application developers provide the context for our notifications ourselves.

Maybe you remember the [🐈 AffiliCats](https://googlechromelabs.github.io/affilicats/) sample app from the [first episode](https://www.youtube.com/watch?v=4UK_TDTTWnQ) of “Why Build Progressive Web Apps.” It’s a simple app that simulates a comparison site where you can get great offers for cats. What’s new this time is a **_button for getting price drop_** alerts.

![🐈 AffiliCats app with price drop alerts (Source: [https://googlechromelabs.github.io/affilicats/](https://googlechromelabs.github.io/affilicats/)).](/images/asset-2__copy.png)

When you press it for the _very_ first time, the notifications permissions prompt pops up, and it’s immediately clear that it’s related to the price drop alerts.

![Permission prompt after signing up for Price Alerts.](/images/asset-3_copy.jpeg)

If you grant permission, the app subscribes you to a push notification endpoint that is configured to send out dummy notifications, and after a couple of seconds after subscribing, you should receive your first notification.

![Push notification announcing that prices for cats are going down.](/images/asset-4_copy_2.png)

So you can see, prices for cats are dropping, you better get one while they last. And there we have it, an actually useful push notification. It was _contextual_, _meaningful_, and _timely_. The [🐈 AffiliCats](https://googlechromelabs.github.io/affilicats/) app is open source, go check out the [source code](https://github.com/googlechromelabs/affilicats) if you want to see how it’s implemented. Push notifications are a great power, and with great power comes great responsibility. If you remember one thing from this write-up, I hope it’s **_context matters_**!

In the next episode of _“Why build Progressive Web Apps,”_ we look at another PWA super power: _Add to Home Screen_! Looking forward to reading our seeing you! In order not to miss it, **_subscribe_** to our [Medium Dev Channel](https://medium.com/dev-channel), the Chrome Developers [YouTube channel](https://www.youtube.com/channel/UCnUYZLuoy1rq1aVMwx4aTzw), follow [@ChromiumDev](https://twitter.com/ChromiumDev) on Twitter — and if you like, I am [@tomayac](https://twitter.com/tomayac) almost universally on the World Wide Internet.
