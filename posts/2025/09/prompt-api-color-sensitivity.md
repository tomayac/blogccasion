---
layout: layouts/post.njk
title: 'Prompt API color sensitivity'
author: 'Thomas Steiner'
date: '2025-09-09T16:37:09'
permalink: 2025/09/16/prompt-api-color-sensitivity/index.html
tags:
  - Technical
---

I was playing with stress-testing the
[multimodal capabilities of the Prompt API](https://developer.chrome.com/docs/ai/prompt-api#multimodal_capabilities)
and thought a nice test case might be to have the model read the current time
painted on a `<canvas>`. As with my
[last Prompt API exploration](https://blog.tomayac.com/2025/09/03/for-all-thats-holy-can-you-just-leverage-the-web-please/#bonus),
I'm again using a response constraint, the `HH:mm:ss` regular expression
`/^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/`. The prompt is _"Read the
time that you can see in this image and print it in HH:mm:ss format."_

To my surprise, the model (Gemini Nano in Chrome) seems to be quite
color-sensitive. I found that the model often gets the time wrong in dark mode
when a red font is used to paint on the canvas. (The
[`Canvas` CSS system color](https://developer.mozilla.org/en-US/docs/Web/CSS/system-color#:~:text=color%20of%20controls.-,Canvas,-Background%20of%20application)
is `#121212` in Chrome in dark mode.) I
[checked the contrast](https://webaim.org/resources/contrastchecker/?fcolor=FF0000&bcolor=121212)
between CSS `#ff0000` (that is, red) and CSS `#121212` (that is, black-ish) and
it's `4.68:1`, which for large text passes both WCAG&nbsp;AA and WCAG &nbsp;AAA.

Not something really super actionable, other than maybe a heads up to play with
color-preprocessing if the model's recognition performance is poorer than you
expected.

Oh, and almost forgot the results of my stress test: on my MacBook Pro 16-inch,
Nov 2024 with an Apple M4 Pro and 48&nbsp;GB of RAM, the model was able to keep
up with about one complete (but not necessarily correct) prompt response per
second. (Yes, I know that this machine is not what the average user has.)

![Test case showing the model gets the time wrong in dark mode when a red font is used to paint on the canvas.](/images/canvas-prompt-api.png)

You can play with the
[demo](https://tomayac.github.io/blogccasion-demos/canvas-prompt-api/) embedded
below, or check out the
[source code](https://github.com/tomayac/blogccasion-demos/tree/main/canvas-prompt-api)
on GitHub. Toggle between light mode and dark mode and choose red or
`CanvasText` as the font color.

<iframe src="https://tomayac.github.io/blogccasion-demos/canvas-prompt-api/" allow="language-model" style="border: none; width: 100%; height: 600px;"></iframe>
