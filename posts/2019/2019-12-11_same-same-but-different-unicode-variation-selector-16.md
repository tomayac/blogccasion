---
layout: layouts/post.njk
title: 'Same same but different: Unicode Variation Selector-16'
author: 'Thomas Steiner'
date: '2019-12-12T12:55:16'
permalink: 2019/12/12/same-same-but-different-unicode-variation-selector-16/index.html
tags:
  - Technical
---

The other day, I did an
[analysis of Facebook's WebView](/2019/12/09/inspecting_facebooks_webview/),
which you are kindly invited to read. They have a code path in which they check
whether a given page is using [AMPHTML](https://amp.dev/), where `\u26A1` is the
[Unicode code point escape](https://mathiasbynens.be/notes/javascript-escapes#unicode-code-point)
of the [⚡ High Voltage emoji](https://emojipedia.org/high-voltage-sign/).

```js
var nvtiming__fb_html_amp =
  nvtiming__fb_html.hasAttribute('amp') ||
  nvtiming__fb_html.hasAttribute('\u26A1');
console.log('FBNavAmpDetect:' + nvtiming__fb_html_amp);
```

## An undetected fake AMP page

I was curious to see if they did something special when they detect a page is
using AMP (spoiler alert: they do not), so I quickly hacked together a fake AMP
page that _seemingly_ fulfilled their simple test.

```html
<html ⚡️>
  <body>
    Fake AMP
  </body>
</html>
```

I am a big emoji fan, so instead of the
[`<html amp>`](https://amp.dev/documentation/guides-and-tutorials/start/create/basic_markup/#required-mark-up)
variant, I went for the `<html ⚡>` variant and entered the `⚡` via the macOS
emoji picker. To my surprise, Facebook logged `"FBNavAmpDetect: false"`. Huh 🤷‍♂️?

## ⚡️ High Voltage sign is a valid attribute name

My first reaction was: `<html ⚡️>` does not quite look like what the founders of
HTML had in mind, so maybe
[`hasAttribute()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/hasAttribute)
is [specified](https://dom.spec.whatwg.org/#dom-element-hasattribute) to return
`false` when an attribute name is invalid. But what even is a valid attribute
name? I consulted the
[HTML spec](https://html.spec.whatwg.org/multipage/syntax.html#attributes-2)
where it says (emphasis mine):

> Attribute names must consist of one or more characters other than controls,
> U+0020 SPACE, U+0022 ("), U+0027 ('), U+003E (>), U+002F (/), U+003D (=), and
> noncharacters. **In the HTML syntax, attribute names, even those for foreign
> elements, may be written with any mix of ASCII lower and ASCII upper alphas.**

I was on company chat with [Jake Archibald](https://twitter.com/jaffathecake) at
that moment, so I confirmed my reading of the spec that `⚡` is not a valid
attribute name. Turns out, it is a valid name, but the spec is formulated in an
ambiguous way, so Jake filed
["HTML syntax" attribute names](https://github.com/whatwg/html/issues/5144). And
my lead to a rational explanation was gone.

## Perfect Heisenbug?

Luckily a valid [AMP boilerplate example](https://amp.dev/boilerplate/) was just
a quick Web search away, so I copy-pasted the code and Facebook, as expected,
reported `"FBNavAmpDetect: true"`. I reduced the AMP boilerplate example until
it looked like my fake AMP page, but still Facebook detected the modified
boilerplate as AMP, but did not detect mine as AMP. Essentially my experiment
looked like the below code sample. Perfect Heisenbug?

![JavaScript console showing the code sample from this post](/images/heisenbolt.png)

## The Unicode Variation Selector-16

Jake eventually traced it down to the Unicode
[Variation Selector-16](https://emojipedia.org/variation-selector-16/):

> An invisible code point which specifies that the preceding character should be
> displayed with emoji presentation. Only required if the preceding character
> defaults to text presentation.

You may have seen this in effect with the Unicode snowman that appears in a
textual &#x2603;&#xfe0e; as well as in an emoji representation &#x2603;&#xfe0f;
(depending on the device you read this on, they may both look the same). As far
as I can tell, Chrome DevTools prefers to always render the textual variant, as
you can see in the screenshot above. But with the help of the
[`length()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length)
and the
[`charCodeAt()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt)
functions, the difference gets visible.

```js
document.querySelector('html').hasAttribute('⚡');
// false
document.querySelector('html').hasAttribute('⚡️');
// true
'⚡️'.length;
// 2
'⚡'.length;
// 1
'⚡'.charCodeAt(0) + ' ' + '⚡'.charCodeAt(1);
// "9889 NaN"
'⚡️'.charCodeAt(0) + ' ' + '⚡️'.charCodeAt(1);
// "9889 65039"
```

## The AMP Validator and ⚡️

The macOS emoji picker creates the variant ⚡️, which includes the Variation
Selector-16, but AMP requires the variant without, which I have also confirmed
in the
[validator code](https://github.com/ampproject/amphtml/blob/a561d0e8be10c8996d9f3db6920f69ffffafd5d8/validator/engine/validator.js#L5366-L5395).
You can see in the screenshot below how the
[AMP Validator](https://validator.ampproject.org/) rejects one of the two High
Voltage symbols.

![AMP Validator rejecting the emoji variant with Variation Selector-16](/images/amp-validator.png)

## Making this actionable

I have filed [crbug.com/1033453](https://crbug.com/1033453) against the Chrome
DevTools asking for rendering the characters differently, depending on whether
the Variation Selector-16 is present or not. Further, I have opened a feature
request on the AMP Project repo demanding that
[AMP should respect ⚡️ apart from ⚡](https://github.com/ampproject/amphtml/issues/25990).
Same same, but different.
