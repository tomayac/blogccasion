---
layout: layouts/post.njk
title: "Re-Colorization for Dark Mode"
description: "A couple of weeks ago, I have collected feedback regarding people’s preferences when it comes to re-colorization of websites for dark mode. The core research question was: “Do people expect images to…"
date: "2019-05-28T09:13:17.800Z"
permalink: 2019/05/28/re-colorization-for-dark-mode/index.html
tags:
  - Technical
---

A couple of weeks ago, I have collected feedback regarding people’s preferences when it comes to re-colorization of websites for dark mode. The core research question was: _“Do people expect images to look different in dark mode than in light mode?”_



#### Survey and Results

I created a little [Dark Mode Colors 🌘 Re-Colorization Playground app](https://dark-mode-colors.glitch.me/) that allows people to toy around with different re-colorization options and report their preferences in a survey. The playground app was shared [on Twitter](https://twitter.com/ChromiumDev/status/1123886638965383168) and also on multiple Google-internal _misc_ mailing lists with both technical and non-technical audiences.

<Embed src="https://glitch.com/embed/#!/embed/dark-mode-colors?path=index.html&previewSize=100&attributionHidden=false&previewFirst=false&sidebarCollapsed=false" aspectRatio={undefined} caption="[https://dark-mode-colors.glitch.me/](https://dark-mode-colors.glitch.me/)" />

I’m now happy to briefly report on the results. All in all, I have collected 137 responses, the [raw results are available in this spreadsheet](https://docs.google.com/spreadsheets/d/1OuvO64dGdGxRFDre5DOLozySfovDH1UXVcB46oZkeaQ/edit?usp=sharing). The majority of people (57.7%) preferred a grayscale filter, 40.9% of people preferred no filter (that is, leaving the colors _as-is_), and a tiny fraction of people (1.5%) preferred a combination of grayscale and inversion filters. No one liked inversion in isolation, which is in accordance with findings from Szpiro _et al._ in their paper [How People with Low Vision Access Computing Devices: Understanding Challenges and Opportunities](https://dl.acm.org/citation.cfm?id=2982168).

![](/images/asset-1_2.png)

Digging down on the 79 responses (the 57.7%) of people who preferred a grayscale filter, the majority opted for a value of 50%, with another small peak at 70%.

![](/images/asset-2_2.png)

In practice, this is what _No Filter_ looks like:

![](/images/asset-3.png)

Compared to _Only Grayscale: 50%_:

![](/images/asset-4.png)

The advantage of a grayscale filter is that the core color information of images is preserved, but some of the brilliance and vibrancy (that can be disturbing in [contexts where people would typically use dark mode](https://medium.com/dev-channel/let-there-be-darkness-maybe-9facd9c3023d)) is reduced.

#### Re-Colorization in Practice

How can you put these findings in practice? One way is to make the amount of grayscaling flexible by leveraging [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties):

```
/* Somewhere in your CSS */

--grayscale-percentage: 50%;

img {
  filter: grayscale(var(--grayscale-percentage));
}
```

You can dynamically control the CSS variable via JavaScript:

```
/* Somewhere in your JavaScript */

const value = '70%';
document.documentElement.style.setProperty(
    '--grayscale-percentage', value);
```

#### Conclusion

As a closing thought, when you implement dark mode for a site, always keep in mind your users. Not everyone may like your default re-colorization choices (which can well be to have no re-colorization). Luckily, modern CSS makes it possible to make this an _easy-to-expose_ preference. Now let there be darkness!
