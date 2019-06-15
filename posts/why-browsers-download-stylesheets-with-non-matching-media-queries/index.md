---
layout: layouts/post.njk
title: "Why Browsers Download Stylesheets With Non-Matching Media Queries"
description: "(Originally posted on blog.tomayac.com/2018/11/08/why-browsers-download-stylesheets-with-non-matching-media-queries-180513.) The other day, I read an article by Dario Gieselaar on Optimizing CSS by…"
date: "2018-12-12T08:30:20.383Z"
categories:
  - Web Development
  - Lazy Loading
  - CSS
  - Cascading Style Sheets
  - Browsers
---

(Originally posted on [blog.tomayac.com/2018/11/08/why-browsers-download-stylesheets-with-non-matching-media-queries-180513](https://blog.tomayac.com/2018/11/08/why-browsers-download-stylesheets-with-non-matching-media-queries-180513).)

The other day, I read an article by [Dario Gieselaar](https://github.com/dgieselaar) on [Optimizing CSS by removing unused media queries](https://medium.com/zoover-engineering/optimizing-css-by-removing-unused-media-queries-80b5508c6de9). One of the core ideas is that you can use the `[media](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media)` [attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media) when including your stylesheets like so:

```
<link href="print.css" rel="stylesheet" media="print">
<link href="mobile.css" rel="stylesheet"
    media="screen and (max-width: 600px)"
>
```

In the article, Dario links to [Scott Jehl](https://github.com/scottjehl)’s [CSS Downloads by Media Query](http://scottjehl.github.io/CSS-Download-Tests/) test suite where Scott shows how _browsers would still download stylesheets even if their media queries are non-matching_.

I [pointed out](https://github.com/scottjehl/CSS-Download-Tests/issues/11#issue-378471829) that the priority of these downloads is `Lowest`, so they're at least not competing with core resources on the page:

![](/images/asset-1__.png)

At first sight this still seemed suboptimal, and I thought that even if the priority is `Lowest`, maybe the browser shouldn't trigger downloads at all. So I did some research, and, surprise, it turns out that the CSS spec writers and browser implementors are actually pretty darn smart about this:

The thing is, the user _could_ always decide to resize their window (impacting [width](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/width), [height](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/height), [aspect ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/aspect-ratio)), to [print](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries#Media_types) the document, _etc._, and even things that at first sight _seem_ static (like the [resolution](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/resolution)) can change when a user with a multi-screen setup moves a window from say a _Retina_ laptop screen to a bigger desktop monitor, or the user can unplug their [mouse](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/any-pointer), and so on.

Truly static things that can’t change (a TV device can’t suddenly turn into something else) are actually being _deprecated_ in [Media Queries Level 4](https://drafts.csswg.org/mediaqueries) (see the [yellow note box](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries#Media_types)); and the recommendation is to rather target [media features](https://drafts.csswg.org/mediaqueries/#media-feature) instead (see the text under the [red issue box](https://drafts.csswg.org/mediaqueries/#media-types)).

Finally, even invalid values like `media="nonsense"` still need to be considered, according to the [ignore rules](https://www.w3.org/TR/CSS2/conform.html#ignore) in the spec.

So long story short, browsers try to be as smart as possible by applying priorities, and `Lowest` is a reasonable value for the cases in Scott's [test](http://scottjehl.github.io/CSS-Download-Tests/).
