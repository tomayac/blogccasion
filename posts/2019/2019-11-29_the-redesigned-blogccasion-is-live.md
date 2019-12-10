---
layout: layouts/post.njk
title: "The redesigned Blogccasion is live"
author: "Thomas Steiner"
date: "2019-11-29T16:02:43"
permalink: 2019/09/29/the-redesigned-blogccasion-is-live/index.html
tags:
  - Private
---
I started to blog way back in [2005](/2005/10/23/why-i-started-to-blog-010629/),
and while I was skeptical whether it would work out and was worth my time,
I just tried it and danced 💃 and wrote like no one was watching
(which definitely was the case for a while).
Many of these early posts are slightly embarrassing from today's point of view,
but nevertheless I decided to keep them around, since they are a part of me.
Remember, this was before social networks became a thing.
Actually, social networks almost killed my blogging, in both
[2016](/2016/04/22/world-wide-web-conference-www2016-trip-report-004735/)
and [2017](/2017/02/20/service-worker-detector-chrome-extension-released-221400/)
respectively I only wrote one post, but plenty of [tweets](https://tomayac.com/tweets/)
and Facebook posts.
Here's a screenshot of the
[old blog](https://web.archive.org/web/20060214094329/http://blog.tomayac.de/index.php?date=2005-10-23&time=01:06:29&perma=Why+I+started+to+blo.html&):

![The old Blogccasion](https://user-images.githubusercontent.com/145676/69877570-e1d4da80-12c2-11ea-8a5b-34615919751f.png)

One of the reasons why I blogged less was also my hand-rolled stack that the blog was built upon:
A classic LAMP stack, consisting of Linux, Apache, MySQL, and handwritten PHP&nbsp;5.
Since I had (and still have) no clue of MySQL character encoding configuration,
I couldn't store emoji 🤔 in my database, but hey `¯\_(ツ)_/¯`.
The switch to HTTPS then killed my login system (that before on HTTP anyone could have sniffed,
did I mention I was clueless?).
In the end I had to log into phpMyAdmin to enter a new blog post into the database by hand.
It was clearly time for a change.

Luckily this was the time when static site builders became more and more popular.
I had heard good things of [Zach Leatherman](https://www.zachleat.com/)'s
[Eleventy](https://github.com/11ty/eleventy), so I went for it.
It was super helpful to have the
[eleventy-base-blog](https://github.com/11ty/eleventy-base-blog)
repository that shows how to get started with Eleventy.
I took extra care to make sure all my old URLs still worked,
and learned more than I wanted about
[`.htaccess`](https://github.com/tomayac/blogccasion/blob/master/htaccess.njk) files
and [`.htaccess` rewrite maps](https://github.com/tomayac/blogccasion/blob/master/htaccess_rewritemap.njk),
since we all know that [cool URIs don't change](https://www.w3.org/Provider/Style/URI).
There I was with a modern stack, and a 2005 design.

Now, I've finally also updated the design, and, while I'm not a designer, I still quite like it.
Obviously it supports
[`prefers-color-scheme`, aka. Dark Mode](https://web.dev/prefers-color-scheme/)
and also uses the [`<dark-mode-toggle>`](https://github.com/GoogleChromeLabs/dark-mode-toggle)
custom element, but I've also decided to go for a responsive "holy grail" layout
that is based on [CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout).

Here're the resources that helped me build the new Blogccasion:

- The circuit board SVG background is from [Steve Schoger](https://twitter.com/steveschoger)'s
  site [Hero Patterns](https://www.heropatterns.com/).
- The core of my CSS Grid code is from Alligator's article
  [CSS Grid: Holy Grail Layout](https://alligator.io/css/css-grid-holy-grail-layout/).
  I learned about the particularities of Grid's minimum size of an `fr` unit, which is `auto`
  and which caused a Grid blowout described in [Chris Coyier](https://twitter.com/chriscoyier)'s
  aptly named article
  [Preventing a Grid Blowout](https://css-tricks.com/preventing-a-grid-blowout/).
- The Webmentions integration is from [Sia Karamalego](https://sia.codes/)'s article
  [An In-Depth Tutorial of Webmentions + Eleventy](https://sia.codes/posts/webmentions-eleventy-in-depth/).
- Some of the typography is inspired by [Matej Latin](https://twitter.com/matejlatin)'s article
  [5 Keys to Accessible Web Typography](https://betterwebtype.com/articles/2019/06/16/5-keys-to-accessible-web-typography/)
  and the [Tufte CSS](https://github.com/edwardtufte/tufte-css) code.
- The SVG icons are from the [SuperTinyIcons](https://github.com/edent/SuperTinyIcons) project.
- Some of the CSS is based on Mozilla's [CSS Remedy](https://github.com/mozdevs/cssremedy) project.
- Last not least, the *Valid HTML5* badge is inspired by [Bradley Taunt](https://bradleytaunt.com/)'s
  article [Using HTML Validator Badges Again](https://bradleytaunt.com/html5-validator-badge/).
- The *Synthwave '84* code theme for Visual Studio Code originally is from [Robb Owen](https://twitter.com/Robb0wen).
  I'm using the port for [PrismJS](https://prismjs.com/) by [Marc Backes](https://twitter.com/_marcba).

🙏 Thanks everyone for letting me stand on your shoulders!

There're still some rough edges, so if you encounter a problem, please report an
[issue](https://github.com/tomayac/blogccasion/issues).
It's well-known that there're a lot of encoding errors in the older posts.
At some point I broke my database in an attempt to convert it to UTF-8 🤦‍♂️…
If you care, you can also propose an edit straightaway,
the *edit this page on GitHub* link is 👇 at the bottom of each post.
Thanks, and welcome to the new [Blogccasion](/).
