---
layout: layouts/post.njk
title: 'iOS Browser Engine Choice'
author: 'Thomas Steiner'
date: '2022-03-25T08:55:53'
permalink: 2022/03/25/ios-browser-engine-choice/index.html
tags:
  - Technical
---

I'm following the
[(Twitter) conversation](<https://twitter.com/search?q=%23applebrowserban%20AND%20(mozilla%20OR%20firefox)&src=typed_query&f=live>)
on browser engines other than WebKit to be allowed on iOS very closely. When the
United Kingdom's Competition and Markets Authority (CMA)
[solicited responses](https://www.gov.uk/cma-cases/mobile-ecosystems-market-study#:~:text=We%20are%20inviting%20comments%20on%20our%20report%20by%205pm%20on%207%20February%202022.)
from Web developers to their
[mobile ecosystems market study interim report](https://www.gov.uk/government/publications/mobile-ecosystems-market-study-interim-report),
I
[sent one](https://assets.publishing.service.gov.uk/media/6227771ee90e0747ae239cfd/Developer_-_Thomas_Steiner__.pdf)
where I spoke as the developer of [SVGcode](https://svgco.de/) and told the CMA
about my experience with making the app performantly available on iOS Safari:

> To whom it may concern,
>
> I'm an employee of Google Germany, but also a hobbyist Web developer.
> Recently, I have built an application, SVGcode (https://svgco.de/), which I
> wanted to be performing well on all browsers, so I have put a lot of time and
> effort into making it as compatible and progressively enhanced as I could.
> Unfortunately, Safari is the one browser that constantly requires the most
> hoops to get to the same baseline experience as on other browsers like
> Firefox, Edge, or Chrome.
>
> For example, it does not offer proper installation support, so rather than use
> my built-in Install button, I need to hope my users are aware of the hidden
> away "Add to Home Screen" feature in Safari.
>
> Another missing feature is OffscreenCanvas, which would greatly improve the
> app's performance, but as is, the performance on Safari leaves to be desired.
> On macOS, I can just tell users that I have made the maximum effort to be
> compatible with all browsers, but if people wish to get the maximum
> performance, they are free to switch their browser to a one with the maximum
> amount of features supported.
>
> On iOS and iPadOS, however, there is nothing I could tell my users, since even
> alternative browsers have to use WebKit's rendering engine under the hood. I
> do hope your legislation can help improve upon the situation and lift Apple's
> browser ban.
>
> Respectfully yours,\
> Thomas Steiner
>
> ——\
> P.S. While I am employed by Google, I am speaking in a personal capacity for
> my work as a hobbyist developer outside of Google.

More impactful and lawyer-approved than mine are the responses from **Mozilla**
and **Google**, though, which I invite you to read in their entirety. Below just
two significant quotes:

> Without regulatory intervention we believe there will be no change to the
> status quo, harming competition in browser engines and browsers, and harming
> innovation
> online.—[Mozilla](https://assets.publishing.service.gov.uk/media/6229acf6e90e0747aa8eb698/Mozilla.pdf)

> Competition between browser engines—and freedom of choice for developers—means
> browser apps on Android can differentiate themselves by incorporating a range
> of features and functionalities that are not available on iOS, where all
> browsers are required to use Apple's WebKit browser
> engine.—[Google](https://assets.publishing.service.gov.uk/media/6229ac568fa8f526d0002b05/Google.pdf)

(It goes without saying but restating again: While I am employed by Google, I am
speaking in a personal capacity for my work as a hobbyist developer outside of
Google.)
