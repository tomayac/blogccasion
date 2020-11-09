---
layout: layouts/post.njk
title: "Submitting and Distributing a Safari App Extension"
author: "Thomas Steiner"
date: "2020-11-09T10:41:29"
permalink: 2020/11/09/submitting-and-distributing-a-safari-app-extension/index.html
tags:
  - Technical
---
Safari 14 has
[added support](https://developer.apple.com/documentation/safari-release-notes/safari-14-release-notes#New-Features:~:text=Added%20Safari%20Web%20Extensions%20support%20for%20macOS.)
for the
[Web Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
standard,
which I consider a clever move on Apple's side that deprecated Safari's previous
[`.safariextz`-style Safari extensions](https://developer.apple.com/documentation/safariextensions).
While there is great documentation for
[creating a Safari Web Extension from scratch](https://developer.apple.com/documentation/safariservices/safari_web_extensions/creating_a_safari_web_extension)
or for
[converting a Web Extension for Safari](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
(and at least the outlines for
[converting a legacy Safari extension to a Safari app extension](https://developer.apple.com/documentation/safariservices/safari_app_extensions/converting_a_legacy_safari_extension_to_a_safari_app_extension)),
the documented path currently ends at
[building and running the application](https://developer.apple.com/documentation/safariservices/safari_app_extensions/building_a_safari_app_extension#2957926).
This post documents the steps for submitting and distributing a Safari App Extension.

The post assumes you already have an Xcode project either created
[manually](https://developer.apple.com/documentation/safariservices/safari_web_extensions/creating_a_safari_web_extension)
or via the
[converter script](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
and that you use Swift.
Here is an
[example build script](https://github.com/google/service-worker-detector/blob/9a1630b002664ca128dd1b2375a4646739cb2320/package.json#L11)
for [one of my extensions](https://github.com/google/service-worker-detector) for reference.
Some of these steps may improve or change over time for new versions of Xcode; this guide was written for Version 12.0 (12A7209).
Caveat: this is my first time interacting with Xcode, so if any of the steps do not make sense, thanks for
[correcting me](https://github.com/tomayac/blogccasion/tree/master/posts/2020/11/submitting-and-distributing-a-safari-app-extension.md).

1. Change the **bundle identifier** of the **extension** from <code>com.example.foo<del>-</del>Extension</code> to
   <code>com.example.foo<ins>.</ins>Extension</code> (that is, replace the '`-`' with a '`.`') and reflect the change in
   `ViewController.swift`. For some reason this is necessary.
   ![Xcode bundle identifier](/images/xcode-bundle-identifier.png)
1. Change the **App Category**.
1. Change the **version number** for app and extension.
1. Update the **build number** in app and extension.
1. Create a new **certificate** [via your developer profile](https://developer.apple.com/account/resources/profiles/add).
1. Create a new **app** via [App Store Connect](https://appstoreconnect.apple.com/apps).
1. In Xcode, run `Product > Build` and then `Product > Archive`.
1. In Xcode, open `Window > Organizer` and then first **validate**, then **distribute** (don't change any of the settings).
1. Hope for the best…

I successfully went through the process with two extensions now:

- <a href="https://apps.apple.com/us/app/service-worker-detector/id1530808337?mt=12&amp;itscg=30200&amp;itsct=apps_box">
    Service Worker Detector
    <div><img alt="Service Worker Detector extension icon" width="64" height="64" src="https://github.com/google/service-worker-detector/blob/master/assets/icon-female-128.png?raw=true"></div>
  </a>
- <a href="https://apps.apple.com/us/app/link-to-text-fragment/id1532224396?mt=12&amp;itscg=30200&amp;itsct=apps_box">
    Link to Text Fragment
    <div><img alt="Link to Text Fragment extension icon" width="64" height="64" src="https://raw.githubusercontent.com/GoogleChromeLabs/link-to-text-fragment/master/assets/icon.svg"></div>
  </a>

(Thanks to [Timothy Hatcher](https://twitter.com/xeenon) who has been very helpful in navigating me through the process.)