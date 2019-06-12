---
title: Two HTTP headers related to Service Workers you never may have heard of
description: The second one will make you talk to your webmaster…
date: '2019-03-22T09:51:16.943Z'
categories: []
keywords: []
slug: >-
  /@tomayac/two-http-headers-related-to-service-workers-you-never-may-have-heard-of-c8862f76cc60
---

The other day, one of my former Google Mobile Solutions Consultant colleagues sent an email to an internal mailing list that (paraphrased) went like this:

> “I was shocked that during now more than two years of supporting Service Worker implementations, I only found out about the `service-worker-allowed` header today.” 😳

I suspect at least some of you are the same, so let me explain not just this, but also a second interesting HTTP header related to Service Workers that are both probably _not_ the ones you read about when you follow any of the many Service Worker tutorials out there.

#### **Header** № 1: \`**service-worker-allowed\`**

This is one of the a little more obscure Service Worker features, but it’s very useful. You can see it in action on Google Docs, where the URL you’re on with [multi-account login](https://support.google.com/accounts/answer/1721977?co=GENIE.Platform%3DDesktop&hl=en) is something like `https://docs.google.com/document/u/0/` (the final number determines the active account), but where the actual Service Worker JavaScript file comes from `https://docs.google.com/document/offline/serviceworker.js?ouid=ude32cf1e51077bff&zx=hyah3kexco7d` (your query parameters may differ).

Now why does this matter? Let’s briefly recall the [concept of a Service Worker’s](https://developers.google.com/web/ilt/pwa/introduction-to-service-worker#registration_and_scope) `[scope](https://developers.google.com/web/ilt/pwa/introduction-to-service-worker#registration_and_scope)`: The `scope` of the Service Worker determines which files the Service Worker controls, in other words, from which path the Service Worker will intercept requests. The default `scope` is the location of the Service Worker file, and extends to all directories below. So if `serviceworker.js` is located in the root directory, the Service Worker will control requests from all files at this domain.

Now you may notice that in the case of Google Docs, the default `scope` would be `https://docs.google.com/document/offline/`, which is not enough, as the user is working in `https://docs.google.com/document/u/0/`. This is where finally the `service-worker-allowed` header comes in. It allows Google Docs to ask for a wider `scope` of `https://docs.google.com/document/` instead 🎉. This header is [supported by all browsers](https://wpt.fyi/results/service-workers/service-worker/Service-Worker-Allowed-header.https.html?label=master&product=chrome%5Bexperimental%5D&product=edge&product=firefox%5Bexperimental%5D&product=safari%5Bexperimental%5D&aligned&q=service-worker-allowed) and if you’re interested in all the details, this is the [deep link to the header’s section in the spec](https://w3c.github.io/ServiceWorker/#service-worker-allowed). You can see it in action in the screenshot below.

![HTTP header \`service-worker-allowed\` in action on Google Docs](img/1__DWL0rYFHSUOcbOKP0L9jJQ.png)
HTTP header \`service-worker-allowed\` in action on Google Docs

#### Header № 2: \`**service-worker\`**

As we’re at it, another header you might not have heard of is `service-worker`. It indicates when a request is for a Service Worker’s script resource and helps administrators and webmasters log such requests and detect threats (so talk to them, they’ll probably appreciate it; [Jake Archibald](https://twitter.com/jaffathecake)’s [article](https://jakearchibald.com/2014/launching-sw-without-breaking-the-web/#pros) has all the details). This header as well is [supported by all browsers](https://wpt.fyi/results/service-workers/service-worker/service-worker-header.https.html?label=master&product=chrome%5Bexperimental%5D&product=edge&product=firefox%5Bexperimental%5D&product=safari%5Bexperimental%5D&aligned&q=service-worker), and here is the [deep link to its section in the spec](https://w3c.github.io/ServiceWorker/#service-worker-script-request). You can see it in action when you go to Facebook. Facebook’s Service Worker comes from `[https://www.facebook.com/sw?s=push](https://www.facebook.com/sw?s=push)`, but if you try to open this URL, you’ll not see the JavaScript code, but a Facebook error page. You actually _need_ to send the header in order for Facebook to return the code.

![HTTP header \`service-worker\` in action on Facebook](img/1__yv__O2J0JvC__HHcnS5Q1MTg.png)
HTTP header \`service-worker\` in action on Facebook

This initially caught me when I developed the [👷‍♀️ 👷 Service Worker Detector browser extension](https://github.com/google/service-worker-detector#--installation), but after reading the spec, I was then [sending the correct header](https://github.com/google/service-worker-detector/blob/f257aa9a77951f8ec972bf271093c75e86f73e55/contentscript.js#L71-L75) in the extension’s content script, so that it now works as expected.

![[👷‍♀️ 👷 Service Worker Detector browser extension](https://github.com/google/service-worker-detector#--installation) running on Facebook](img/1__iGs__TUJQylaz__WUJv1CfCg.png)
[👷‍♀️ 👷 Service Worker Detector browser extension](https://github.com/google/service-worker-detector#--installation) running on Facebook

If you encounter this header being required by the server, for quick debugging sessions in the browser or from the terminal, a cool Chrome DevTools tip is to right-click the Service Worker request and then “Copy as cURL” or “Copy as fetch”. 👌

![Fetch a resource exactly as the browser did with “Copy as cURL” or “Copy as fetch”](img/1__lV7wiTSY7NnoOTFve7rCIA.png)
Fetch a resource exactly as the browser did with “Copy as cURL” or “Copy as fetch”

Did _you_ know about these headers? Let me know in the comments or ping me, [@tomayac](https://twitter.com/tomayac), on Twitter. Oh, by the way, while I still have your attention, the Mobile Solutions Consultant team (my former team) are [hiring](https://careers.google.com/jobs/results/?company=Google&company=YouTube&employment_type=FULL_TIME&hl=en_US&jlo=en_US&q=%22Mobile%20Solutions%20Consultant%22&sort_by=relevance), and so is my current team, the Chrome Developer Relations team, where we’re looking for [Developer Advocates](https://careers.google.com/jobs/results/?company=Google&company=YouTube&employment_type=FULL_TIME&hl=en_US&jlo=en_US&q=%22developer%20advocate,%20web%22&sort_by=relevance) and [Developer Programs Engineers](https://careers.google.com/jobs/results/?company=Google&company=YouTube&employment_type=FULL_TIME&hl=en_US&jlo=en_US&q=%22Developer%20Programs%20Engineer,%20Web%22&sort_by=relevance)…