---
layout: layouts/post.njk
title: 'Progressive Web App Progress in iOS 12.2 Beta 1 (Build 16E5181f)'
description:
  'As a regular (and passionate) iOS user with a strong belief in the Web, I
  beta-test any and all new iOS builds as soon as I can get my hands on them. My
  main motivation is to see how they do when it…'
date: '2019-01-28T15:27:11.009Z'
permalink: 2019/01/28/progressive-web-app-progress-in-ios-12.2-beta-1-build-16e5181f/index.html
tags:
  - Technical
---

As a regular (and passionate) iOS user with a strong belief in the Web, I
beta-test any and all new iOS builds as soon as I can get my hands on them. My
main motivation is to see how they do when it comes to Progressive Web App
features. Each new iOS version comes with a new version of Safari, yet changes
in Safari tend to almost never get highlighted in the iOS release notes (and the
[12.2 beta 1 release notes](https://developer.apple.com/documentation/ios_release_notes/ios_12_2_beta_release_notes)
were no exception). So my routine is to fire up my
[🕵️‍♂️ PWA Feature Detector](https://tomayac.github.io/pwa-feature-detector/)—a
simple testing tool described in an accompanying
[📄 research paper](https://ai.google/research/pubs/pub46739)—and to look for
potential changes myself.

![[Research paper](https://ai.google/research/pubs/pub46739) “What is in a Web View? An Analysis of Progressive Web App Features When the Means of Web Access is not a Web Browser”.](/images/asset-1.png)

#### Web Share API Support (😃)

For the last couple of releases, there were only
[two checkmarks](https://twitter.com/tomayac/status/1003910651151085568) ‘✔’
for “Offline Capabilities” and “Payment Request,” however 12.2 beta 1 had a
surprise present: the PWA Feature Detector tool reported that now “Web Share” is
supported, too. The [Web Share API — Level 1](https://wicg.github.io/web-share/)
defines an API for sharing text, links, and other content to an arbitrary
destination of the user’s choice. I tested it with the official
[demo](https://wicg.github.io/web-share/demos/share.html) and it worked like a
charm! This is brilliant news, thanks Apple 🎉!

![[🕵️‍♂️ PWA Feature Detector](https://tomayac.github.io/pwa-feature-detector/) running on iOS 12.2 beta 1, showing support for the Web Share API (left) and the Web Share API in action with this [demo](https://wicg.github.io/web-share/demos/share.html) (right).](/images/asset-2.png)

#### Out-of-Scope Links in “Add to Home Screen” Apps (😃)

If you add an app to the home screen on iOS, it runs in an environment called
Web.app. As far as I can tell, there is no public documentation about it, but
Apple engineers alike [use](https://bugs.webkit.org/show_bug.cgi?id=183800#c2)
this term to refer to it. The problem so far was that apps opened in the regular
Safari as soon as an out-of-scope link was clicked, leading to the app
[losing its state completely](https://bugs.webkit.org/show_bug.cgi?id=185400)
(also see the next paragraph).

This has changed now, and links finally open in something that looks like a
customized `SFSafariViewController`, however, without the share sheet, no reload
button, and—even if it would trigger—no reader mode button. I am not an iOS
programmer, but looking at the
[documentation of](https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller/configuration)
`[SFSafariViewController.Configuration](https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller/configuration)`
and judging from how I have seen `SFSafariViewController` be used in the past,
this seems to not be a user-configurable setup.

![Out-of-scope link viewed in _Twitter Lite PWA (left) and_ in the native Twitter app (right). There is no reload button and no share sheet, and also no reader mode button in the new experience on the left.](/images/asset-3.jpeg)

#### Keeping State When Multitasking (😃)

I have kept the maybe biggest change for the end. It seems like there is work
underway to finally **make PWAs that are added to the home screen to keep
state**. For the context, before, when you were multitasking away from an app
that was added to the home screen and then came back, it would always reload and
lose its state completely. I have reported this issue in
[WebKit bug 185400](https://bugs.webkit.org/show_bug.cgi?id=185400), but it was
closed because the core issue is not in WebKit.

This appears to be changing for the better 🎊. I have tried the new experience
with [Twitter Lite](https://mobile.twitter.com/), where I started a tweet,
multitasked to a different app, and then came back to find my previously started
tweet ready to be continued. As a second example in the screenshot series below,
you can see me searching for a hotel in [trivago’s PWA](https://trivago.com/),
then going back to the home screen, and finally switching back to the app to
find my search state preserved.

In many cases the screenshot in Apple’s multitasking UI was still just a white
screen, but in some cases it actually reflected the last state. Hopefully this
will be improved in future betas.

⚠️ Preserving state seems to work sometimes, but not always, and occasionally I
was trapped within a view in Twitter’s app and could not tap on any UI element,
even if a back button was there; or I was brought back to the start screen of
trivago’s app and had to redo my search.

> Side note: for apps that do not provide their own back button and relied on
> Android’s system-level back button (see our
> [related work on a media query to detect this issue](https://github.com/w3c/manifest/issues/693)),
> this behavior can mean that they are now permanently locking in their users.
> So always make sure you provide a back button 🔙 .

![First trivago’s PWA shown at 13:11 o’clock (left), then switching back to the home screen (middle), and finally with restored state at 13:12 o’clock (right).](/images/asset-4.jpeg)

#### Still Not Respecting the Web App Manifest Icons (😕)

Where there is light, there is shadow (but just a little).
[Icons specified in the Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest#icons)
are still being ignored. You have to use the Apple old-school way to
[configure Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
with link relations as outlined in the code sample below (or just use
[Sam Thorogood](https://medium.com/@samthor)’s
[PWACompat](https://github.com/GoogleChromeLabs/pwacompat) library).

```
<link rel="apple-touch-icon" href="touch-icon-iphone.png">
<link rel="apple-touch-icon" sizes="152x152" href="ipad.png">
<link rel="apple-touch-icon" sizes="180x180" href="iphone-2x.png">
<link rel="apple-touch-icon" sizes="167x167" href="ipad-2x.png">
```

I have a little test tool called
[iOS Add to Home Screen](https://ios-a2hs-demo.glitch.me/) that in its
[manifest](https://ios-a2hs-demo.glitch.me/manifest.webmanifest) lists
gazillions (well, almost) of differently sized icons, but the one iOS ends up
using is still the Safari-generated screenshot-based one.

![[iOS Add to Home Screen](https://ios-a2hs-demo.glitch.me/) tool (left) showing iOS still ignores icons specified in [its Web App Manifest](https://ios-a2hs-demo.glitch.me/manifest.webmanifest) (right).](/images/asset-5.png)

#### Media Capabilities API and Intersection Observer As Experimental Features (😃)

I want to continue this post on a positive note, so here are a couple more
surprises: several new APIs made it in Safari’s “Experimental WebKit Features”
list (in the Settings app, navigate to “Safari > Advanced > Experimental
Features” to activate them). I want to highlight the
[Media Capabilities API](https://wicg.github.io/media-capabilities/) that allows
websites to make an optimal decision when picking media content for the user.
The API exposes information about the decoding and encoding capabilities for a
given format, but also output capabilities to find the best match based on the
device’s display. I tested the API with this
[demo](https://googlechrome.github.io/samples/media-capabilities/decoding-info.html)
that on my MacBook Pro says I am good to go, but on my iPhone X tells me the
configuration is not supported.

![Media Capabilities API support is the forth checkmark in [PWA Feature Detector](https://tomayac.github.io/pwa-feature-detector/) (left). The [demo](https://googlechrome.github.io/samples/media-capabilities/decoding-info.html) (right) lets the app know that the media configuration will not be supported, not play smoothly, and not be power efficient.](/images/asset-6.jpeg)

#### Other New Features (😃)

A second (not PWA-related, yet still important in the context) API that was
added as an experiment is `IntersectionObserver`, an API which is essential for
performant
[lazy-loading of images, videos, or iframes](https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/).
Safari is really
[late to the game](https://caniuse.com/#feat=intersectionobserver) on this one,
but after the desktop Safari Technology Previews gained support in
[version 69](https://webkit.org/blog/8479/release-notes-for-safari-technology-preview-69/),
it is finally great to have this API hopefully soon in Mobile Safari, too, once
it graduates from its current experimental status, and to no longer have to rely
on the
[polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill).

What is also new (but is likewise not exactly a PWA feature) is
`input[type=color]` support. Playing with the
[demo](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color), I
would maybe wish for long-press support for more granular color selection, but
the current implementation probably works well enough for most use cases.

![<input type=”color”> in action on this [demo](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color).](/images/asset-7.png)

#### Conclusion and Call to Action (🎉)

Concluding, this is **one heck of a release for Progressive Web Apps**, and I am
really happy that Apple engineers are listening to user feedback. Another
example of this is [Henrik Joreteg](https://medium.com/@henrikjoreteg)’s recent
[positive experience](https://twitter.com/HenrikJoreteg/status/1089059979670089729)
with getting the
`[HTMLAnchorElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download)`[’s](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download)
`[download](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/download)`
attribute added, so one can now easily create downloads dynamically.

While admittedly at times it might feel like shouting into a forrest,
[sending feedback](https://webkit.org/reporting-bugs/) helps, or as  WebKit
engineer [Chris Dumez](https://twitter.com/chris_dumez) put it…

📢 So here is my call to action for universally great PWA support to all Safari
users out there: **let us keep the WebKit team busy by filing bugs and
commenting on existing ones**! They are listening! With experimental features
included,
[🕵️‍♂️ PWA Feature Detector](https://tomayac.github.io/pwa-feature-detector/) now
makes Safari have four checkmarks ‘✔’, here is to the WebKit team to add some
more!

👉 If you want **Push Notifications** support, chime in on
[WebKit Bug 182566](https://bugs.webkit.org/show_bug.cgi?id=182566). 👉 If you
want **Background Sync** support, chime in on
[WebKit Bug 182565](https://bugs.webkit.org/show_bug.cgi?id=182565). 👉 If you
want **Storage Estimation** support, chime in on
[WebKit Bug 185405](https://bugs.webkit.org/show_bug.cgi?id=185405). ✅
**(Fixed)** If you want `**getUserMedia**` support for PWAs, chime in on
[WebKit Bug 185448](https://bugs.webkit.org/show_bug.cgi?id=185448). 👉 If you
want **Web App Manifest icons** for PWAs, chime in on
[WebKit Bug 183937](https://bugs.webkit.org/show_bug.cgi?id=183937). 👉 If you
want **Add to Home Screen** support for PWAs, chime in on
[WebKit bug 193959](https://bugs.webkit.org/show_bug.cgi?id=193959). 👉 If you
want **Web Share Target API** support, chime in on
[WebKit bug 194593](https://bugs.webkit.org/show_bug.cgi?id=194593). 👉 If you
want **Web Share API — Level 2** support (file sharing), chime in on
[WebKit bug 198606](https://bugs.webkit.org/show_bug.cgi?id=198606). 👉 If you
want **Navigation Preload API** support, chime in on
[WebKit bug 182852](https://bugs.webkit.org/show_bug.cgi?id=182852).

☝️ If you **do not see your issue**,
[file a new bug](https://webkit.org/new-bug) 🆕. Duplication is fine according
to the WebKit team. Use a company email address, tell them why and who needs the
feature, and how many of your iOS users are missing out.

**Update:** Apple’s [Maciej Stachowiak](https://twitter.com/othermaciej)
clarified the following points about how the team would like to receive feedback
on their bug tracker:

#### Acknowledgements

There are a couple of like-minded iOS beta nerds 🤓 out there who have helped
unearth or get more details on some of these features. I was in Twitter
discussions with [Mike Hartington](https://twitter.com/mhartington),
[Maximiliano Firtman](https://twitter.com/firt) (🙋‍♂️ read
[Max’ article](https://medium.com/@firt/pwas-on-ios-12-2-beta-the-good-the-bad-and-the-not-sure-yet-if-good-a37b6fa6afbf)
on the same subject), [Šime Vidas](https://twitter.com/simevidas), and
[Sam Thorogood](https://twitter.com/samthor). Thank you!
