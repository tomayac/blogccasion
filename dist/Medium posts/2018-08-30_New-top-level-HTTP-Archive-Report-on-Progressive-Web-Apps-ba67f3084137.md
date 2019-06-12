---
title: New top-level HTTP Archive Report on Progressive Web Apps
description: >-
  As a follow-up from the Progressive Web Apps study from a couple of weeks ago,
  we’re now happy to announce that we’ve landed a new…
date: '2018-08-30T07:26:53.130Z'
categories: []
keywords: []
slug: >-
  /@tomayac/new-top-level-http-archive-report-on-progressive-web-apps-ba67f3084137
---

As a follow-up from the [Progressive Web Apps study](https://medium.com/dev-channel/progressive-web-apps-in-the-http-archive-614d4bcf81fe) from a couple of weeks ago, we’re now happy to announce that we’ve landed a new top-level [HTTP Archive report on Progressive Web Apps](https://httparchive.org/reports/progressive-web-apps) 🎉 based on the study’s raw data.

This report currently encompasses two sections: _(i)_ [PWA Scores](https://httparchive.org/reports/progressive-web-apps#pwaScores) and _(ii)_ [Service Worker Controlled Pages](https://httparchive.org/reports/progressive-web-apps#swControlledPages), which translates roughly to [Approach 1](https://medium.com/dev-channel/progressive-web-apps-in-the-http-archive-614d4bcf81fe#fd02) and [Approach 2](https://medium.com/dev-channel/progressive-web-apps-in-the-http-archive-614d4bcf81fe#df00) of the [PWA study](https://medium.com/dev-channel/progressive-web-apps-in-the-http-archive-614d4bcf81fe) mentioned above.

You can use this data for example to see the [percentages of pages that were controlled by a service worker](https://httparchive.org/reports/progressive-web-apps?start=2017_08_01&end=latest&view=list#swControlledPages) over time based on Chrome `[ServiceWorkerControlledPage](https://cs.chromium.org/chromium/src/third_party/blink/public/platform/web_feature.mojom?l=651)` [use counter](https://cs.chromium.org/chromium/src/third_party/blink/public/platform/web_feature.mojom?l=651) statistics. Good news: the trend is going up 📈.

![[Percentages of pages that were controlled by a service worker](https://httparchive.org/reports/progressive-web-apps?start=2017_08_01&end=latest&view=list#swControlledPages)](img/1__wNNhlBF00KO6Y7gBh2lXzw.png)
[Percentages of pages that were controlled by a service worker](https://httparchive.org/reports/progressive-web-apps?start=2017_08_01&end=latest&view=list#swControlledPages)

As a result of [Rick Viscomi](https://twitter.com/rick_viscomi)’s new 🧐 [lenses](https://twitter.com/HTTPArchive/status/1031941537293205506) feature, you can now also dive into the data in an even more fine-grained manner, for example, to see the development of [median Lighthouse scores of just the **Wordpress** universe](https://httparchive.org/reports/progressive-web-apps?lens=wordpress&start=2017_08_01&end=latest&view=list#pwaScores). Note that while there was a switch in the Lighthouse scoring algorithm from [v2](https://developers.google.com/web/tools/lighthouse/scoring#pwa) to [v3](https://developers.google.com/web/tools/lighthouse/v3/scoring#pwa) of the tool, the chart shows the [median](https://en.wikipedia.org/wiki/Median) score, which naturally is more robust in the presence of outliers.

![[Median Lighthouse scores of the **Wordpress** universe](https://httparchive.org/reports/progressive-web-apps?lens=wordpress&start=2017_08_01&end=latest&view=list#pwaScores)](img/1__4JmzRLo3NVVLY2GDPEUP0w.png)
[Median Lighthouse scores of the **Wordpress** universe](https://httparchive.org/reports/progressive-web-apps?lens=wordpress&start=2017_08_01&end=latest&view=list#pwaScores)

Next steps entail also getting the data from [Approach 3](https://medium.com/dev-channel/progressive-web-apps-in-the-http-archive-614d4bcf81fe#6d5e) of the study into the `httparchive.technologies.*` tables, so that we can allow everyone to run [BigQuery analyses](https://github.com/HTTPArchive/legacy.httparchive.org/blob/master/docs/bigquery-gettingstarted.md) on top of these in a cost-efficient manner, without having to go through the massive (70+ TB) `httparchive.response_bodies.*` tables!

Big thanks to [Rick](https://twitter.com/rick_viscomi) again, whose guidance and leadership were essential to make this happen. We’re looking forward to this data being put to good use.