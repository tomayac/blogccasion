---
layout: layouts/post.njk
title: 'Lenovo ThinkVision P27h-20 screen randomly turns off when connected to MacBook Pro'
author: 'Thomas Steiner'
date: '2024-02-21T09:13:56'
permalink: 2024/02/lenovo-p27h-20-randomly-turns-off/index.html
tags:
  - Technical
---

The [Lenovo ThinkVision P27h-20](https://www.lenovo.com/us/en/p/accessories-and-software/monitors/professional/61e9gar6us?orgRef=https%253A%252F%252Fwww.google.com%252F) screen I get from work is a decent 27 inch screen. Coming from the Retina screen of my laptop that [I worked on for a long time](/2020/03/23/my-working-from-home-setup-during-covid-19/), I was initially (and still am) not impressed by the resolution of 2560×1440. It took some time to get used to the low resolution on such a big screen, but it gets the job done…

My biggest gripe with the screen was that it just **randomly turned off** when connected to my MacBook Pro in clamshell mode. I finally found the culprit after combing through the [Console](https://support.apple.com/guide/console/welcome/mac) system logs for _any_ trace for the longest time. I found out that the MacBook Pro thought the power was changing from grid to battery and _vice versa_ (all while being constantly on-power), and whenever it did that, the screen would turn off.

The solution was to disable the "Smart Power" option in the screen's settings. According to the [manual](https://psref.lenovo.com/syspool/Sys/PDF/datasheet/ThinkVision%20P27h-20_datasheet_EN.PDF), the "Smart Power" option does the following:

> Smart Power intelligently distributes power to connected USB and USB Type-C devices, maximizing power supply efficiency while also reducing overall consumption.

Turns out, it wasn't so smart after all. I saw it range between 65W and 90W, but after turning the option off, the laptop gets a constant 65W, all my USB-C devices still work, and I'm happy to report that the screen no longer randomly turns off. This is the blog post I wish I had found when I was looking for a solution, so I hope it helps someone else.

![Lenovo ThinkVision P27h-20 settings with the Smart Power option circled.](/images/lenovo-p27h-20.jpg)
