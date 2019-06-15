---
layout: layouts/post.njk
title: "Why Build Progressive Web Apps: If It’s Just a Bookmark, It’s not a PWA!—Video Write-Up"
description: "(This is the write-up of the third episode of my new YouTube show “Why Build Progressive Web Apps.” If you prefer watching, the video is embedded below.) (Also check out the write-up of the first…"
date: "2018-12-11T11:13:43.612Z"
categories:
  - Web Development
  - Add To Home Screen
  - A2hs
  - Add To Homescreen
  - Progressive Web App
---

_(This is the write-up of the third episode of my new YouTube show “Why Build Progressive Web Apps.” If you prefer watching, the_ [_video_](https://youtu.be/kENeCdS3fzU) _is embedded below.)_

_(Also check out the_ [_write-up of the first episode_](https://medium.com/dev-channel/why-build-progressive-web-apps-never-lose-a-click-out-video-write-up-74cbbc466afd) _and the_ [_write-up of the second episode_](https://medium.com/dev-channel/why-build-progressive-web-apps-push-but-dont-be-pushy-video-write-up-aa78296886e)_, or watch the_ [_first episode video_](https://www.youtube.com/watch?v=4UK_TDTTWnQ) _and the_ [_second episode video_](https://www.youtube.com/watch?v=vRsVx8_94UQ)_.)_

<Embed src="https://www.youtube.com/embed/kENeCdS3fzU?feature=oembed" aspectRatio={undefined} caption="“Why Build Progressive Web Apps,” episode 3: If It’s Just a Bookmark, It’s not a PWA!" />

_Add to Home Screen_ is a concept almost as old as the original iPhone. In fact, it was introduced in February 2008 with [iPhone OS version 1.1.3](https://www.macworld.com/article/1131616/iphone_update.html). Today, more than 10 years later, the feature has come a really long way. What started as a mere bookmark, has now turned into a PWA super power.

![Add to Home Screen on iPhone OS 1.1.3.](/images/asset-1____.png)

Chrome first introduced Add to Home Screen banners [in Chrome 42](https://www.youtube.com/watch?v=vl4-WMImj6I&feature=youtu.be&t=52)—we are talking May 2015. We have heard from developers like Alibaba, that [users re-engage 4 times more often](https://developers.google.com/web/showcase/2016/alibaba) with their site added to home screen. So in the early days, it seemed like getting users to install a PWA was an immediate recipe for success. In consequence, we tuned the heuristics for add to home screen to prompt users sooner, which yielded to [48% more installs](https://medium.com/dev-channel/the-new-and-improved-add-to-home-screen-1f79bdd464b0).

![Alibaba users re-engage four times more often with their site added to home screen (Source: [https://developers.google.com/web/showcase/2016/alibaba](https://developers.google.com/web/showcase/2016/alibaba)).](/images/asset-2____.png)

In hindsight, this alone was not directly correlated with other app success metrics that you as a developer would care about, such as conversions. We introduced an improved variant of the feature in Chrome Beta 57 called [WebAPK](https://developers.google.com/web/fundamentals/integration/webapks), with better integration into Android, so apps were no longer just better bookmarks. Other new features included the ability to _change the app icon_ and _app name_ by changing the values in the Web App Manifest, and also to register a _scope of URLs_ where the app would be launched for directly.

But we have heard one thing loud and clear: **developers want more control as to when their apps show the banner**. For example, if you are an _airline site_ and you have a PWA for storing boarding passes, it only makes sense to ask people to install it after they have actually bought a ticket. If you are a _news site_ and your users are logged in, it might make sense to show the prompt immediately. And in some cases, even if you have a fully qualifying PWA, you might not even want to show the prompt at all. But most probably, you would want to define your own criteria in your app to determine who’s a loyal enough user to show the banner to.

Let us see how we can do that in our good old friend [🐈 AffiliCats](https://googlechromelabs.github.io/affilicats/) that we have introduced in our last two episodes. It simulates a comparison site where you can get great offers for cats. _AffiliCats makes money when someone clicks through to view one of the deals_. The app meets the PWA installability quality bar in Lighthouse but we want to _hold back the prompt until someone has actually viewed at least two deals_.

![🐈 AffiliCats meets the PWA installability quality bar in Lighthouse.](/images/asset-3____.png)

Should the user then come back to the app — which they hopefully do — we can then show them a customized button that would trigger the browser’s prompt. We are in full control.

```
window.addEventListener('beforeinstallprompt', (event) => {
  let previouslyEngaged = localStorage.getItem('engagement');
  if (!previouslyEngaged) {
    console.log('Install button hidden due to no prior engagement');
    return;
  }
  previouslyEngaged = parseInt(previouslyEngaged, 10);
  if ((isNaN(previouslyEngaged)) ||
      (previouslyEngaged < INSTALL_THRESHOLD)) {
    console.log('Install button hidden due to too low engagement');
    return;
  }
  event.preventDefault();
  installPromptEvent = event;
  install.disabled = false;
  install.hidden = false;
});
```

⚠️ Note that in Google Chrome currently there also is a temporary [mini-infobar](https://developers.google.com/web/updates/2018/06/a2hs-updates#the_mini-infobar) that you _cannot_ control. The manually controlled “Install” button in the screenshot below is fully customizable. This is the behavior this article and the accompanying video are talking about.

![🐈 AffiliCats with a customized “Install” button that only gets shown once the [app engagement threshold](https://github.com/GoogleChromeLabs/affilicats/blob/b56aa28227b83366f696de27267ff4b69819a206/src/js/main.js#L351-L366) has been reached.](/images/asset-4____.png)

Add to home screen is a [🦸](https://emojipedia.org/superhero/) superpower that, if used wisely, can indeed have a massive impact on how users use your PWA, and if they perceive it as a real app worth a precious space on their home screen. As always, you are invited to [play with this app](https://googlechromelabs.github.io/affilicats/) yourself and read the [source code](https://github.com/GoogleChromeLabs/affilicats).

This is the final episode of _“Why build Progressive Web Apps”_ in 2018. Looking forward to reading our seeing you in 2019! Do let us know in the comments on any of the videos or write-ups what you want us to cover next. In order not to miss future episodes, **_subscribe_** to our [Medium Dev Channel](https://medium.com/dev-channel), the Chrome Developers [YouTube channel](https://www.youtube.com/channel/UCnUYZLuoy1rq1aVMwx4aTzw), follow [@ChromiumDev](https://twitter.com/ChromiumDev) on Twitter — and if you like, I am [@tomayac](https://twitter.com/tomayac) almost universally on the World Wide Internet.
