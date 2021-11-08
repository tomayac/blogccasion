---
layout: layouts/post.njk
title: 'Things mode and strings mode in Google Trends'
author: 'Thomas Steiner'
date: '2021-11-08T09:31:27'
permalink: 2021/11/08/things-mode-and-stings-mode-in-google-trends/index.html
tags:
  - Technical
---

[Google Trends](https://trends.google.com/trends/) has essentially two modes:

- **Strings:** (["jaguar"](https://trends.google.com/trends/explore?q=jaguar),
  where it doesn't know if you mean the
  [car make](https://en.wikipedia.org/wiki/Jaguar_Cars), the
  [animal](https://en.wikipedia.org/wiki/Jaguar), or even the ancient
  [MacOS X operating system version](https://en.wikipedia.org/wiki/Mac_OS_X_Jaguar)).
- **Things:**
  (["Jaguar (car make)"](https://trends.google.com/trends/explore?q=%2Fm%2F012x34&geo=DE),
  where you tell it very clearly that you mean the car make).

A colleague of mine fell for this and was looking at the
[landing page for Progressive Web Apps in _strings_ mode](https://trends.google.com/trends/explore?q=progressive%20web%20apps)
and was confused. The page the colleague should have looked at is the
[landing page for Progressive Web Apps in _things_ mode](https://trends.google.com/trends/explore?q=%2Fg%2F11bzxympx6).
Its URL is `https://trends.google.com/trends/explore?q=%2Fg%2F11bzxympx6`.

You can recognize _things_ mode by looking at the `q` query parameter in the
URL. If it starts with `%2Fg%2F` (URL-decoded: `/g/`), you are in _things_ mode.
The funny code `11bzxympx6` after that is the
[Knowledge Graph identifier](https://www.wikidata.org/wiki/Property:P2671). When
you
[search for `"11bzxympx6"` on Google](https://www.google.com/search?q=%2211bzxympx6%22&oq=%2211bzxympx6%22&aqs=chrome..69i57.994j0j1&sourceid=chrome&ie=UTF-8),
you end up with exactly one search result that points to the
[Wikidata page for Progressive Web Apps](https://www.wikidata.org/wiki/Q23679990).

![Google Trends showing "strings" and "things" mode side by side.](/images/google-trends.png)

Note how Google Trends in the screenshot above even helpfully points out that…

> [t]his comparison contains both Search terms and Topics, which are measured
> differently.

…and directs the reader to a
[help resource](https://support.google.com/trends/answer/4359550#:~:text=Compare%20terms%20and%20topics)
to learn more about the difference.

I happen to know all this because this is what I did my PhD in, and I have
[a paper at the ACM](https://dl.acm.org/doi/pdf/10.1145/2872427.2874809) that
describes the process we used for migrating our proprietary Knowledge Graph
predecessor Freebase to the community-maintained Wikidata.

It's rare that I get to tell anyone about this stuff, so now you know more than
you probably wanted to ever hear about this… You can learn more about this time
of my Google life in my previous
[blog post](</2021/10/02/14-years-at-google/#the-phd-time-(2010%E2%80%932014)>).
My manager back in the days didn't care about any of this, but maybe it's at
least interesting to you… `:-)`
