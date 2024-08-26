---
layout: layouts/post.njk
title: 'My response to the UK Competition and Markets Authority'
author: 'Thomas Steiner'
date: '2024-08-26T10:38:47'
permalink: 2024/08/26/my-response-to-the-cma/index.html
tags:
  - Work
---

The [Open Web Advocacy](https://open-web-advocacy.org/) (OWA) initiative in their recent blog post
[Apple adopts 6 of OWA's Choice Architecture Recommendations](https://open-web-advocacy.org/blog/apple-adopts-6-owa-choice-architecture-recommendations/) highlighted the six recommendations that Apple has adopted from the group's recommendations to comply with the EU's Digital Markets Act in relation to browser defaults and choice screens.

In parallel, the UK Competition and Markets Authority (CMA) launched a Market Investigation Reference into mobile browsers and cloud gaming and have recently published their list of remedies. While a great step in the right direction, the [OWA aren't completely happy with the list](https://open-web-advocacy.org/blog/uk-browser-and-cloud-investigation-may-fail-to-allow-web-app-competition/). As a Web developer who addresses people across all platforms and regions, including iOS/macOS users in the UK, I followed the [OWA's pledge](https://open-web-advocacy.org/blog/uk-browser-and-cloud-investigation-may-fail-to-allow-web-app-competition/#we-need-your-help!-act-today!) and sent the following email to the CMA. I am sharing it here for transparency and encourage you to contact them, too, if you're concerned about the future of the Web.

<hr>

<pre>
MIME-Version: 1.0
Date: Thu, 22 Aug 2024 00:21:47 +0200
Message-ID: <CABscCcNuWtJYg5v9MGc2nQ9FUEhjR_QwjJRfewN0N0i6_-oXWg@mail.gmail.com>
Subject: Thoughts on the CMA's list of remedies
From: Thomas Steiner <steiner.thomas@gmail.com>
To: browsersandcloud@cma.gov.uk
Cc: Thomas Steiner <tomac@google.com>
</pre>

<hr>

Dear CMA,

First, a disclosure: I work for Google's Chrome team (tomac@google.com), but in this email, I fully speak as the private Web developer that I am in my non-work life (I run, for example, [SVGcode](https://svgco.de/) or [WasmOptim](https://wasmoptim.com/)). Wholehearted congratulations on the remedies that you have listed in your [document](https://assets.publishing.service.gov.uk/media/66b484020808eaf43b50dea8/Working\_paper\_7\_Potential\_Remedies\_8.8.24.pdf); they are a great step in the right direction. I would like to encourage you to consider two more aspects, though:

If a browser vendor can bring their own browser engine to the operating system, there should be a guarantee that said browser engine would also run a Web app after it's installed. As you can see if you run [How Fugu is My Browser](https://howfuguismybrowser.dev/) on different browsers, there's a huge difference between the platforms. If we imagine a full Chrome on iOS based on the Blink engine with a set of supported APIs similar to Chrome on Android, apps relying on these APIs will break if they're only available in a Chrome tab, but not after installation in a non-Blink Safari version.

Furthermore, installation on iOS in particular, but also macOS Safari, is really a challenge for discovery. While native apps can show banners in webpages so users can install the app, the Web has no way of doing so on Apple platforms. It would be fantastic if there were some legally required way for Web browsers to expose the feature of app installation in a programmatically triggerable way. The in-progress [Web Install API](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/WebInstall/explainer.md) is a good step toward this goal.

Happy to answer any questions you have.

Cheers,<br>
Tom