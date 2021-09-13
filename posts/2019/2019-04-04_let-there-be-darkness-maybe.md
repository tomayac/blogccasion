---
layout: layouts/post.njk
title: 'Let there be darkness! 🌚 Maybe…'
description:
  'With Dark Mode, Apple in macOS Mojave introduced what they call “a dramatic
  new look that’s easy on your eyes and helps you focus on your work. [It] uses
  a dark color scheme that works system wide…'
date: '2019-04-04T10:57:58.763Z'
permalink: 2019/04/04/let-there-be-darkness-maybe/index.html
tags:
  - Technical
---

## Dark Theme Developer Survey Results

With [Dark Mode](https://support.apple.com/en-us/HT208976), Apple in
[macOS Mojave](https://www.apple.com/lae/macos/mojave/) introduced what they
call _“a dramatic new look that’s easy on your eyes and helps you focus on your
work. \[It\] uses a dark color scheme that works system wide, including with the
apps that come with your Mac.”_ The Safari browser doesn’t allow Dark Mode to
_automatically_ change the appearance of web pages, but in
[Safari Technology Preview 68](https://webkit.org/blog/8475/release-notes-for-safari-technology-preview-68/),
Apple added support for the
[`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
user preference media query that allows developers to _manually_ style their
content for Dark Mode. There also is a
[meta tag](https://medium.com/dev-channel/what-does-dark-modes-supported-color-schemes-actually-do-69c2eacdfa1d)
[`<meta name="supported-color-schemes">`](https://medium.com/dev-channel/what-does-dark-modes-supported-color-schemes-actually-do-69c2eacdfa1d)
[and corresponding CSS property](https://medium.com/dev-channel/what-does-dark-modes-supported-color-schemes-actually-do-69c2eacdfa1d)
[`supported-color-schemes`](https://medium.com/dev-channel/what-does-dark-modes-supported-color-schemes-actually-do-69c2eacdfa1d)
that are currently being standardized so that sites can explicitly express that
they fully support a dark theme and that the browser should load a different
user agent stylesheet and not ever apply transformations. The media query is
supported in
[Firefox since version 67](https://bugzilla.mozilla.org/show_bug.cgi?id=1494034)
and
[Chrome started work](https://bugs.chromium.org/p/chromium/issues/detail?id=889087)
on it. This media query enables (and also requires!) CSS designers to craft
special CSS rules for Dark Mode, however, not everyone will do this! So where
does this leave us? We ran a survey to find out.

### Dark Theme in Chrome

In Chrome, we’re trying to go one step further and to come up with an
intelligent way to automatically darken pages that _haven’t_ specified tailored
Dark Theme CSS rules—building on what some other
[Android browsers](https://play.google.com/store/search?q=dark+mode+browser&c=apps)
and
[Chrome extensions](https://chrome.google.com/webstore/search/dark%20mode?_category=extensions)
are doing, but also inspired by features like
[Smart Invert on iOS](https://support.apple.com/en-us/HT207025). The astute
reader may be aware of a feature flag `#enable-android-web-contents-dark-mode`,
that was
[added](https://chromium-review.googlesource.com/c/chromium/src/+/1478106) to
Chromium. It allows for an early preview of this feature in Canary builds on
Android (not on desktop for the time being). The screenshots below give an
impression of an early version.

![](/images/asset-1.jpeg)![Source: 9to5Google ([https://9to5google.com/2019/02/19/android-chrome-webview-web-dark-mode/](https://9to5google.com/2019/02/19/android-chrome-webview-web-dark-mode/))](/images/asset-2.jpeg)

### Developer survey design

Automatically darkening web pages may or may not be what end users want. In
order to get a feeling for _some_ of the opinions on the matter, a couple of
days ago I started collecting developer feedback in a survey that was shared on
Twitter. The survey announcement tweet (embedded below) gained 41,836
impressions and 461 clicks on the included link to the survey, resulting in 243
survey responses, which means 0.58% of people who saw the tweet responded, and
52.71% of people who clicked through to the survey.

There were two opening yes/no questions and one drill down yes/no question, all
three with a required free form text field to provide some background on the
given answer. I wanted to give people enough room to express their thoughts, and
not limit them to a preselected list of options. When interpreting the free form
answers, I have grouped similar opinions together, taking maximum care to keep
friction losses to a minimum. Sometimes people expressed several opinions at
once (_e.g._, “I use Dark Mode because A, B, and C”), in such cases I have
counted all individual points separately, which is why if you sum up the numbers
in the bar charts below, you will count more than the number of respondents.

Let’s get this out of the way: the data is definitely biased. The survey was
only shared on Twitter and the audience was more on the tech side. Given the
emotional topic, there was also some bias toward more people responding that
feel strongly about Dark Mode. And of course 243 responses also isn’t a massive
number, although the survey was running for an entire week. Nonetheless, the
percentages were mostly stable after just one day. With this imperfection in
mind and without further ado, let’s have a look at the results.

### Survey results

![](/images/asset-3_copy.png)![macOS Mojave and Windows 10 Dark Mode settings](/images/asset-4_copy.png)

#### Question № 1: Do you use your operating system’s Dark Mode?

The opening question was whether the participants use their operating system’s
Dark Mode at all. A surprising majority of 82.7% said they used it, but again,
there is bias in the data toward people who feel passionate about the topic.
Presumably the general public’s Dark Mode activation rate is way lower. More
interesting are thus the free form answers, where people could express why they
use or don’t use Dark Mode.

![](/images/asset-5_copy.png)

Of the 82.7% of people (201 in total) who actually do use Dark Mode, a massive
majority said Dark Mode was easier on their eyes, interestingly without
specifying whether they use Dark Mode exclusively in dark environments or
permanently all the time (also see the drill down question). A lot of
participants also said Dark Mode was simply elegant and beautiful (reminder,
people would frequently write both: that it was easier on the eyes, as well as
elegant and beautiful). Some people also mentioned they used Dark Mode because
it
[consumes less battery on AMOLED screens](https://www.anandtech.com/show/9394/analysing-amoled-power-efficiency).
The rest of the meaningful answers focused on reduced screen brightness,
improved legibility and contrast, better focus on content, and the fact that
switching between dark and light causes eye strain.

![](/images/asset-6.png)

Of the 17.3% of people (42 in total) who don’t use Dark Mode, a majority said it
didn’t look “right”, which is somewhat of a vague answer, but suggests they gave
it a try but were disappointed. Likewise, several people said Dark Mode text was
hard to read, again suggesting they at least tried it. Some people were using
operating systems where Dark Mode either isn’t available yet or not supported at
all. You can see all other answers in the bar chart below.

![](/images/asset-7_copy.png)

#### Question № 2: Would you expect Dark Mode to affect web pages, e.g., by automatically applying a dark theme for them?

The focus of the second question was on the automatic darkening of web pages
that don’t ship CSS rules specific for Dark Mode. 64.6% of participants said
they would expect Dark Mode to affect web pages automatically, and 35.4% said
they wouldn’t expect this to happen. It’s eye-opening to look at the reasons
they mentioned.

![](/images/asset-8.png)

Among the people who said Dark Mode should automatically affect web pages, the
vast majority said the user choice expressed at the operating system level
should be universally respected, or even enforced. However, multiple respondents
did acknowledge that doing so would go against the sovereignty of the designer.
People again highlighted the issue of switches between dark and light causing
eye strain. An interesting point was made by some people who explicitly talked
about Progressive Web Apps and how they—through an enforced Dark Mode—could be
even better integrated into the operating system.

![](/images/asset-9.png)

From the people who didn’t expect Dark Mode to automatically affect web pages,
the vast majority said a website’s design was the sole sovereignty of the
original designer. Respondents were also skeptical that automatic darkening
could be done right universally, and the same number of people said it should be
a user choice, but not automatically enforced. Some people said it was a “nice
to have” feature, and some participants also saw issues around branding and
corporate identity, for example, when logo colors would be modified. The rest of
the responses are also interesting, but only mentioned a few times.

![](/images/asset-10.png)

#### Drill Down Question: Do you toggle your Dark Mode setting depending on the environment you’re in (dark, light) or based on the time of day (night time, day time)?

The final question was only visible to users who said in the first question that
they use Dark Mode (201 persons in total). Of these participants, 25.4% said
they toggled Dark Mode based on environmental factors or time of day, and 74.6%
said they don’t. Let’s have a look at the mentioned reasons.

![](/images/asset-11.png)

Many respondents said Dark Mode looked bad during day time or that they needed
to adapt to environmental light, mentioning it was easier on the eyes. Some
people said it should be easier to toggle the setting, or that they used another
color filter like
[f.lux](https://justgetflux.com/news/pages/macquickstart/#color-effects) that
toggles Dark Mode based on sunset, or that they only toggled the setting for
special tasks.

![](/images/asset-12.png)

Very interesting are the results of the people who don’t toggle their Dark Mode
setting. The vast majority said they just always wanted Dark Mode to be on,
which correlates with people who said they find Dark Mode elegant and beautiful
in the first question. Several participants said they were too lazy and that
their operating system didn’t offer an automatic option to toggle the setting,
which suggests there is potential for operating systems to add this natively, so
people don’t have to rely on tools like f.lux. Apart from that, a few people
also said they always work indoors or that they preferred consistency.

![](/images/asset-13.png)

### Conclusions

Getting Dark Mode right for everyone is tricky. Some people say they absolutely
need it and they are fine with web pages to not look like their designers
created them, and others say it’s an elegant feature, but at best they want web
pages to be darkened on an opt-in basis, or maybe not even that. Apple in their
[Dark Mode developer documentation](https://developer.apple.com/documentation/appkit/supporting_dark_mode_in_your_interface)
explicitly write the following: _“The choice of whether to enable a light or
dark appearance is an aesthetic one for most users, and might not relate to
ambient lighting conditions.”_ In the Chrome team, too, there are people with
different opinions, and other teams within Google that leverage Chrome as a
surface for web content through Android Web Views or Chrome Custom Tabs add
another level of complexity. The present survey is thus _one_ factor in the
equation, but definitely not the only one.

One possible solution could be _(i)_ for operating systems to add an option to
automatically toggle Dark Mode based on environmental conditions or time of day,
and _(ii)_ for web browsers to allow their users to globally enable or disable
automatic darkening (which may well be in contradiction with the system-level
setting for people who like their operating system dark, but not web content),
with an additional per-site override so they can choose individually if they
want to.

What do you think? If you haven’t had the chance to respond to the survey,
please feel free to comment on the article, or hit me up on Twitter, where I
tweet as [@tomayac](https://twitter.com/tomayac). You can follow the progress of
the Chrome engineering team implementing Chrome’s Dark Theme by subscribing to
the
[Chromium bugs that are labeled dark-web-content](https://bugs.chromium.org/p/chromium/issues/list?q=label:dark-web-content).

### Related Links

- The
  [“A Color-Theme Media Query and System Colors” discussion](https://discourse.wicg.io/t/proposal-a-color-theme-media-query-and-system-colors/2844)
  in the Web Incubator Community Group.
- The original `prefers-color-scheme`
  [GitHub Issue](https://github.com/w3c/csswg-drafts/issues/2735) (closed) in
  the CSS W3C Working Group and the related
  [Chromium bug](https://crbug.com/889087).
- The `<meta name="supported-color-schemes">`
  [GitHub Issue](https://github.com/w3c/csswg-drafts/issues/3299) in the CSS W3C
  Working Group and the related [Chromium bug](https://crbug.com/925935).
- The
  [Chrome Platform Status](https://www.chromestatus.com/features#color-scheme)
  pages for the media query and the meta tag.
- The `supported-color-schemes` meta tag and CSS property
  [article](https://medium.com/dev-channel/what-does-dark-modes-supported-color-schemes-actually-do-69c2eacdfa1d).

#### Acknowledgements

Thanks to [Lukasz Zbylut](https://www.linkedin.com/in/lukasz-zbylut/),
[Adam Read](https://www.linkedin.com/in/adam-read-912ab9a),
[Mark Chang](https://twitter.com/mchang),
[Dominic Mazzoni](http://dominic-mazzoni.com/),
[Paul Irish](https://twitter.com/paul_irish), and
[Chirag Desai](http://linkedin.com/in/chiragd) for their helpful feedback and
for reviewing this article.
