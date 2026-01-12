---
layout: layouts/post.njk
title: 'A polyfill for the HTML switch element'
author: 'Thomas Steiner'
date: '2026-01-12T09:21:24'
permalink: 2026/01/12/a-polyfill-for-the-html-switch-element/index.html
tags:
  - Technical
---

In Safari 17.4, the WebKit team at Apple
[shipped a native HTML switch element](https://webkit.org/blog/15054/an-html-switch-control/).
The core idea is that an `<input type="checkbox">` can progressively be enhanced
to become a switch by adding the `switch` attribute. Browsers that don't support
the `switch` attribute will just silently ignore it and render the switch as a
regular checkbox. At the time of this writing, Safari version 17.4 and later is
the only browser to support the new switch element natively. This blog post
introduces a **polyfill** that brings _almost_ native support to browsers that
lack it.

The markup below shows you how you use the switch element. If your browser
doesn't support the element natively and you view this page on my blog directly
(that is, not in your feed reader), the polyfill should have already kicked in
and you should see two switch controls below the code sample: one regular
switch, and one with a red
[`accent-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/accent-color).

```html
<label>Toggle me <input type="checkbox" switch checked /></label>

<style>
  .special {
    accent-color: red;
  }
</style>
<label
  >Toggle me, I'm special <input type="checkbox" switch checked class="special"
/></label>
```

<style>
  @keyframes hideBriefly {
    0%,
    100% {
      visibility: hidden;
    }
  }

  label:has(input[switch]),
  input[switch] {
    animation: hideBriefly 2s;
  }

  label {
    font-weight: bold;
    user-select: none;
  }
</style>

<noscript>
  <style>
    label:has(input[switch]),
    input[switch] {
      animation: none;
    }
  </style>
</noscript>

<script type="module">
  if (!('switch' in HTMLInputElement.prototype))
    await import('/js/input-switch-polyfill.js');
  else 
    document.head.insertAdjacentHTML('beforeend', '<style>label:has(input[switch]),input[switch]{animation:none!important}</style>');
</script>
<label>Toggle me <input type="checkbox" switch checked></label>

<style>
  .special {
    accent-color: red;
  }
</style>

<label>Toggle me, I'm special
<input type="checkbox" switch checked class="special"></label>

## Accessibility

If a checkbox becomes a switch, the browser automatically applies the
[ARIA `switch`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role)
role. This role is functionally identical to the `checkbox` role, except that
instead of representing "checked" and "unchecked" states, which are fairly
generic in meaning, the switch role represents the states "on" and "off". The
polyfill does this for you. Also another exception is that switches don't support an indeterminate/mixed state that checkboxes support.

When your users have the
[`prefers-contrast`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-contrast)
setting enabled to convey that they prefer more contrast, the polyfill adds more
visible borders. Some operating systems like Windows or browsers like Firefox
additionally support a high contrast mode. The polyfill also has support for
that.

The macOS operating system additionally has an accessibility setting to
[Differentiate without color](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/differentiate-without-color-alone-evaluation-criteria/),
which causes switch controls to get rendered with additional visual on/off
indicators. Since there is currently no direct CSS media query for this specific
preference, I opted to display these indicators whenever a high-contrast
preference is detected, ensuring maximum clarity for those who need it.

A common accessibility challenge with switches
[identified in research](https://www.cs.umd.edu/hcil/trs/90-08/90-08.pdf) (that
predates the HTML switch control) is an uncertainty whether the user should tap
or slide the switch to change its state. The polyfill, like the native
counterpart in Safari, supports both. Another challenge is whether the label
"on" indicates the current state of the switch or the resulting state after
interacting with it. I personally think smartphones—most notably the iPhone—have
taught people how to use switches, but I still recommend you do your own
usability research before adding a switch to your site.

## Internationalization and styling

The polyfill supports the various
[`writing-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/writing-mode)
options, like `"vertical-lr"`.

<label style="writing-mode: vertical-lr">I'm vertical
<input type="checkbox" switch checked></label>

It's also aware of the directionality of text via the
[`dir`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/dir)
attribute.

<label dir="rtl">I go from right to left
<input type="checkbox" switch checked></label>

## Status in HTML

The switch element was proposed to be included in HTML in
[Issue #4180](https://github.com/whatwg/html/issues/4180) filed in
November 2018. [PR #9546](https://github.com/whatwg/html/pull/9546) (opened in
July 2023) proposed a fix and was
[approved](https://github.com/whatwg/html/pull/9546#pullrequestreview-1584169867)
by [Anne van Kesteren](https://annevankesteren.nl/) in August 2023. At the time
of this writing, the PR to the HTML spec is still open, with concerns from
several stakeholders, including from Google.

I am not and was not part of the standardization discussion around the element,
I just personally like the progressive enhancement pattern that reminds me of
the pattern used in
[customizable `<select>` elements](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select)
that in the case of non-support just get rendered as regular selects.

## Get the polyfill

You can
[get the polyfill from npm](https://www.npmjs.com/package/input-switch-polyfill)
and [find the code on GitHub](https://github.com/tomayac/input-switch-polyfill).
The
[`README`](https://github.com/tomayac/input-switch-polyfill/blob/main/README.md)
has detailed usage instructions that I won't repeat here, including **important
tips on how to avoid FOUC** (Flash of Unstyled Content). You can also play with
a [demo](https://tomayac.github.io/input-switch-polyfill/) of the polyfill that
shows off more features of the polyfill, like all the various writing modes, and
the different ways to style the switch. And with that: happy switching!

## Thank you

I would like to wholeheartedly thank
[Samuel Proulx](https://fed.interfree.ca/@fastfinge) and
[Curtis Wilcox](https://c.im/@cwilcox808) for their accessibility advice and
testing. I'm also grateful to
[Vadim Makeev](https://mastodon.social/@pepelsbey),
[Luke Warlow](https://toot.wales/@Lukew), and
[Jeffrey Yasskin](https://hachyderm.io/@jyasskin) for their technical and
non-technical feedback. [Thomas Broyer](https://piaille.fr/@tbroyer) has been
crucial for improving support on Firefox. Finally, huge props to
[Barry Pollard](https://mastodon.social/@tunetheweb) for the performance tweaks
to avoid FOUC.
