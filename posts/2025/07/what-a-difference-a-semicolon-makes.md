---
layout: layouts/post.njk
title: "What a diff'rence a semicolon makes"
author: 'Thomas Steiner'
date: '2025-07-26T00:32:20'
permalink: 2025/07/26/what-a-difference-a-semicolon-makes/index.html
tags:
  - Technical
---

The other day, I was hit by a baffling
`TypeError: console.log(...) is not a function`. Like, WTF 🤔? Turns out, I was
sloppily adding a quick `console.log('here')` statement for debugging purposes
(as one does 🙈), which happened to be right before an
[IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE). I didn't put a
`;`, as it was a throwaway statement I'd remove after finding the bug, but turns
out that's the issue. StackOverflow contributor
[Sebastian Simon](https://stackoverflow.com/users/4642212/sebastian-simon) had
the [explanation](https://stackoverflow.com/a/31013390):

> It's trying to pass `function(){}` as an argument to the return value of
> `console.log()` which itself is not a function but actually undefined (check
> `typeof console.log();`). This is because JavaScript interprets this as
> `console.log()(function(){})`. `console.log` however is a function.

Minimal repro:

```js
console.log()(function () {});
```

[Andre](https://fedi.jaenis.ch/@andre) on Mastodon
[reminded me](https://fedi.jaenis.ch/@andre/statuses/01K10C5PY7JBYVXYG8T6J4SP4B)
of [Chris Coyier](https://front-end.social/@chriscoyier)'s excellent
[Web Development Merit Badges](https://css-tricks.com/web-development-merit-badges/),
so I'm now proudly wearing mine: _"Debugged something for over one hour where
the fix was literally one character"_:

![Debugged something for over one hour where the fix was literally one character](/images/merit-badge-onechar.svg)
