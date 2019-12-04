---
layout: layouts/post.njk
title: "Animated SVG favicons"
author: "Thomas Steiner"
date: "2019-12-01T13:41:10"
permalink: 2019/12/01/animated-svg-favicons/index.html
tags:
  - Technical
---

When it comes to animating SVGs, there're three options: using
<abbr title="Cascading Style Sheets">CSS</abbr>,
<abbr title="JavaScript">JS</abbr>, or
<abbr title="Synchronized Multimedia Integration Language">SMIL</abbr>.
Each comes with its own pros and cons, whose discussion is beyond the scope of this article,
but [Sara Soueidan](https://www.sarasoueidan.com/) has a great
[article](https://theblog.adobe.com/the-state-of-svg-animation) on the topic.
In this post, I add a repeating *shrink* animation to a circle with all three methods,
and then try to use these SVGs as favicons.

## Animating SVG with CSS

Here's an example of animating an SVG with CSS based on the
[`animation`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) and the
[`transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) properties.
I scale the circle from the center and repeat the animation forever:

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <style>
    svg {
      max-width: 100px;
    }

    circle {
      display: block;
      animation: 2s linear infinite both circle-animation;
      transform-origin: 50% 50%;
    }

    @keyframes circle-animation {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(0);
      }
    }
  </style>
  <circle fill="red" cx="50" cy="50" r="45"/>
</svg>
```

## Animating SVG with JS

The [SVG `<script>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/script)
tag allows to add scripts to an SVG document.
It has some [subtle differences](https://svgwg.org/svg2-draft/interact.html#ScriptElement)
to the regular HTML `<script>`, for example, it uses the `href` instead of the `src` attribute,
but above all it's important to know that any functions defined within any `<script>` tag
have a *global scope* across the entire current document.
Below, you can see an SVG script used to reduce the radius of the circle until it's equal to zero,
then reset it to the initial value, and finally repeat this forever.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle fill="blue" cx="50" cy="50" r="45" />
  <script type="text/javascript"><![CDATA[
    const circle = document.querySelector('circle');
    let r = 45;
    const animate = () => {
      circle.setAttribute('r', r--);
      if (r === 0) {
        r = 45;
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  ]]></script>
</svg>
```

## Animating SVG with SMIL

The last example uses SMIL, where, via the
[`<animate>`](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL)
tag inside of the `<circle>` tag, I declaratively describe that I want to
animate the circle's `r` attribute (that determines the radius) and repeat it indefinitely.

```html
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle fill="green" cx="50" cy="50" r="45">
    <animate attributeName="r" from="45" to="0" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>
```

## Using Animated SVGs as Images

Before using animated SVGs as favicons, I want to briefly discuss
how you can use each of the three examples on a website.
Again there're three options: referenced via the `src` attribute of an `<img>` tag,
in an `<iframe>`, or inlined in the main document.
Again, SVG scripts have access to the *global scope*, so they should definitely be used with care.
Some user agents, for example, Google Chrome, don't run scripts for SVGs in `<img>`.
The [Glitch](https://glitch.com/~animated-svg-favicon) embedded below shows all variants in action.
My recommendation would be to stick with CSS animations whenever you can,
since it's the most compatible and future-proof variant.

<div class="glitch-embed-wrap" style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/animated-svg-favicon?path=icon_js.svg&previewSize=100"
    title="animated-svg-favicon on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;"
    loading="lazy">
  </iframe>
</div>

## Using Animated SVGs as Favicons

Since [crbug.com/29417](https://crbug.com/29417) is fixed, Chrome *finally* supports SVG favicons,
alongside [many other browsers](https://caniuse.com/#feat=link-icon-svg).
I have recently successfully experimented with
[`prefers-color-scheme` in SVG favicons](/2019/09/21/prefers-color-scheme-in-svg-favicons-for-dark-mode-icons/),
so I wanted to see if animated SVGs work, too.
Long story short, it seems only Firefox supports them at the time of writing,
and only favicons that are animated with either CSS or JS.
You can see this working in Firefox in the screencast embedded below.
If you open my [Glitch demo](https://animated-svg-favicon.glitch.me/) in a standalone window,
you can test this yourself with the radio buttons at the top.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/SlesN-eGdIE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

Should you use this in practice?
Probably not, since it can be really distracting.
It might be useful as a progressive enhancement to show activity during a short period of time,
for example, while a web application is busy with processing data.
Before considering to use this, I would definitely recommend taking the user's
[`prefers-reduced-motion`](https://developers.google.com/web/updates/2019/03/prefers-reduced-motion)
preferences into account.
