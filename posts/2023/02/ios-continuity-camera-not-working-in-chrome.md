---
layout: layouts/post.njk
title: 'iOS Continuity Camera not working in Chrome'
author: 'Thomas Steiner'
date: '2023-02-16T11:28:03'
permalink: 2023/02/16/ios-continuity-camera-not-working-in-chrome/index.html
tags:
  - Technical
---

I'm a big fan of the macOS
[Continuity Camera](https://support.apple.com/en-us/HT213244) feature, which
lets me use the camera system of my iPhone (11 Pro Max) as a webcam in macOS,
since the built-in FaceTime HD camera on my MacBook Pro (13-inch, M1, 2020) is,
well, not the greatest.

It used to work just fine everywhere in the past, but at some point it stopped
working in Chrome. It would still find the camera in native apps like
PhotoBooth, FaceTime, etc., but not in the browser. As I'm also a Ventura beta
tester and always on the latest betas, I blamed a bug there. Turns out, this is
a new-ish privacy feature and working as intended. Redditor
[bonnerup](https://www.reddit.com/user/bonnerup/) filed feedback (`FB11639588`)
about the problem with Apple, and got the following response (_sic_):

> Due to privacy concern with unintended camera selection, browser based video
> apps only see the phone when it is in "magic pose" of landscape, screen off,
> locked, motionless (not handheld), and unobstructed camera. This pose is also
> used to trigger Automatic Camera Selection in supporting applications such as
> FaceTime and Photo Booth.

Since this is not documented anywhere apart from a
[Reddit post](https://www.reddit.com/r/MacOSBeta/comments/y4h6ww/continuity_camera_in_browsers_response_from_apple/),
I thought I'd share it here as well. Once I put my phone in the "magic pose", it
worked just fine.

My iPhone model doesn't support all video effects yet, but
[Center Stage](https://support.apple.com/en-us/HT213244#centerstage) works and
is pretty cool. It makes it look like if the camera would move and follow me. I
also use
[Voice Isolation](https://support.apple.com/en-us/HT213244#:~:text=or%20Close%20Window.-,Mic%20modes,-Click%20Control%20Center),
which helps in noisy environments.

![iOS Continuity Camera with applied Center Stage video effect and Voice Isolation mic mode.](/images/continuity-camera.png)
