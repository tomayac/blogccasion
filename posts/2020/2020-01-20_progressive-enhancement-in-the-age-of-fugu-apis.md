---
layout: layouts/post.njk
title: "Progressive Enhancement In the Age of Fugu APIs"
author: "Thomas Steiner"
date: "2020-01-20T11:00:16"
permalink: 2020/01/20/progressive-enhancement-in-the-age-of-fugu-apis/index.html
tags:
  - Technical
---
Back in March 2003, [Nick Finck](http://nickfinck.com/) and
[Steven Champeon](https://twitter.com/schampeo) stunned the web design world
with the concept of
[progressive enhancement](http://hesketh.com/publications/inclusive_web_design_for_the_future/):

> Rather than hoping for graceful degradation, [progressive enhancement] builds documents
  for the least capable or differently capable devices first,
  then moves on to enhance those documents with separate logic for presentation,
  in ways that don't place an undue burden on baseline devices
  but which allow a richer experience for those users with modern graphical browser software.

While in *2003*, progressive enhancement was mostly about using *presentational* features
like at the time modern CSS properties, unobtrusive JavaScript for improved usability,
and even nowadays basic things like Scalable Vector Graphics; progressive enhancement in *2020*
is about using new *functional* browser capabilities.

## We agree to disagree

Feature support for core JavaScript language features by major browsers is great.
Kangax' [ECMAScript 2016+ compatibility table](https://kangax.github.io/compat-table/es2016plus/)
is almost all green, and browser vendors generally agree and are quick to implement.

In contrast, there is less agreement on what we colloquially call *Fugu 🐡* features.
In [Project Fugu](https://developers.google.com/web/updates/capabilities),
our objective is the following:

> Web apps should be able to do anything native apps can.
  We want to make it possible for you to build and deliver apps
  on the open web that have never been possible before.

You can see all the capabilities we want to tackle in the context of the project
by having a look at our [Fugu API tracker](https://goo.gle/fugu-api-tracker).
I have also written about [Project Fugu at W3C TPAC 2019](/2019/09/21/project-fugu-at-w3c-tpac/).

To get an impression of the debate around these features
when it comes to the different browser vendors, I recommend reading the discussions
around the request for a
[WebKit position on Web NFC](https://lists.webkit.org/pipermail/webkit-dev/2020-January/031006.html)
or the request for a
[Mozilla position on Wake Lock](https://github.com/mozilla/standards-positions/issues/210)
(both discussions contain links to the particular specs in question).
In many cases, the result of these positioning threads might be a "we agree to disagree".
And that's fine.

## Progressive enhancement for Fugu features

Some Fugu features will probably never be implemented by all browser vendors.
But what does this mean for developers?
Now and then, in 2003 just like in 2020,
[feature detection](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Feature_detection)
plays a central role.
Before using a *potentially future* new browser capability like, say, the
[Native File System API](https://web.dev/native-file-system/),
developers need to feature-detect the presence of the API.
For the Native File System API, it might look like this:

```js
if ('chooseFileSystemEntries' in window) {
  // Yay, the Native File System API is available! 💾
} else {
  // Nay, a legacy approach is required. 😔
}
```

In the worst case, there is no legacy approach.
Some Fugu features are so groundbreakingly new that there simply is no replacement.
The [Contact Picker API](https://web.dev/contact-picker/) (that allows users to select contacts
from their device's native contact manager) is such an example.

But in some cases, like with the Native File System API,
developers can fall back to
[`<a download>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-download)
for saving and
[`<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)
for opening files.
The experience will not be the same (while you can open a file, you cannot write back to it,
you will always create a new file that will land in your Downloads folder),
but it is the second-best thing.

A suboptimal way to deal with this situation would be to force users to load both code paths,
the legacy approach and the new approach.
Luckily,
[dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports)
makes differential loading feasible and has
[great browser support](https://caniuse.com/#feat=es6-module-dynamic-import).

## Introducing `browser-nativefs`
