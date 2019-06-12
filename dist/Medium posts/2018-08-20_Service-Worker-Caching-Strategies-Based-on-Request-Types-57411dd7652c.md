---
title: Service Worker Caching Strategies Based on Request Types
description: ''
date: '2018-08-20T16:25:08.586Z'
categories: []
keywords: []
slug: >-
  /@tomayac/service-worker-caching-strategies-based-on-request-types-57411dd7652c
---

### TL;DR

Instead of purely relying on URL-based pattern matching, also consider leveraging the lesser-known — but super useful — `[Request.destination](https://developer.mozilla.org/en-US/docs/Web/API/Request/destination)` property in your service worker to determine the type and/or caching strategy of requests. Note, though, that `Request.destination` gets set to the non-informative empty string default value for `XMLHttpRequest` or `fetch()` calls. You can play with the `[Request.destination](https://request-destination-playground.glitch.me/)`[playground app](https://request-destination-playground.glitch.me/) to see `Request.destination` in action.

### Different Caching Strategies for Different Types of Resources

When it comes to establishing caching strategies for Progressive Web Apps, not all resources should be treated equally. For example, for a shopping PWA, your API calls that return live data on some items’ availabilities might be configured to use a [Network Only](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-only) strategy, your self-hosted company-owned web fonts might be configured to use a [Cache Only](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#cache-only) strategy, and your other HTML, CSS, JavaScript, and image resources might use a [Network Falling Back to Cache](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#network-falling-back-to-cache) strategy.

### URL-based Determination of the Request Type

Commonly, developers have relied on the known URL structure of their PWAs and regular expressions to determine the appropriate caching strategy for a given request. For example, here’s an excerpt of a modified code snippet courtesy of [Jake Archibald](https://twitter.com/jaffathecake)’s [offline cookbook](https://jakearchibald.com/2014/offline-cookbook/):

// In serviceworker.js  
self.addEventListener('fetch', (event) => {  
  // Parse the URL  
  const requestURL = new URL(event.request.url);

  // Handle article URLs  
  if (/^**\\/**article**\\/**/.test(requestURL.pathname)) {  
    event.respondWith(/\* some response strategy \*/);  
    return;  
  }  
  if (/**\\.**webp$/.test(requestURL.pathname)) {  
    event.respondWith(/\* some other response strategy \*/);  
    return;  
  }  
  /\* … \*/  
});

This approach allows developers to deal with their [WebP images](https://developers.google.com/speed/webp/) (_i.e._, requests that match the regular expression `/\.webp$/`) differently than with their HTML articles (_i.e._, requests that match `/^\/article\//`). The downside of this approach is that it makes hard-coded assumptions about the URL structure of a PWA or the used MIME types’ file extensions, which creates a tight coupling between app and service worker logic. Should you move away from WebP to a future superior image format, you would need to remember to update your service worker’s logic as well.

### `Request.destination`\-based Determination of the Request Type

It turns out, the platform has a built-in way for determining the type of a request: it’s called `[Request.destination](https://fetch.spec.whatwg.org/#concept-request-destination)` as specified in the [Fetch Standard](https://fetch.spec.whatwg.org/). Quoting straight from the spec:

> _“A request has an associated destination, which is the empty string,_ `_"audio"_`_,_ `_"audioworklet"_`_,_ `_"document"_`_,_ `_"embed"_`_,_ `_"font"_`_,_ `_"image"_`_,_ `_"manifest"_`_,_ `_"object"_`_,_ `_"paintworklet"_`_,_ `_"report"_`_,_ `_"script"_`_,_ `_"serviceworker"_`_,_ `_"sharedworker"_`_,_ `_"style"_`_,_ `_"track"_`_,_ `_"video"_`_,_ `_"worker"_`_, or_ `_"xslt"_`_. Unless stated otherwise it is the empty string.”_

The empty string default value is the biggest caveat. Essentially, you can’t determine the type of resources that are requested via the following methods:

> `[_navigator.sendBeacon()_](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)`_,_ `[_EventSource_](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)`_, HTML’s_ `[_<a ping="">_](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-ping)` _and_ `[_<area ping="">_](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/area#attr-ping)`_,_ `[_fetch()_](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)`_,_ `[_XMLHttpRequest_](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)`_,_ `[_WebSocket_](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)`_, \[and the\]_ [_Cache API_](https://developer.mozilla.org/en-US/docs/Web/API/Cache)

In practice having `Request.destination` get set to the non-informative empty string default value matters the most for `fetch()` and `XMLHttpRequest`, so at least for resources requested through these techniques, it’s oftentimes back to URL-based pattern handling inside your service worker.

On the bright side, you can determine the type of everything else perfectly fine. I have built a little `[Request.destination](https://request-destination-playground.glitch.me/)`[playground app](https://request-destination-playground.glitch.me/) that shows some of these destinations in action. Note that for the sake of the to-be-demonstrated effect it also contains some anti-patterns like [registering the service worker](https://developers.google.com/web/fundamentals/primers/service-workers/registration) as early as possible and actively circumventing the browser’s preloading heuristics (never do this in production).

![`_Request.destination_` _playground app showing different request types_](img/0__p48NZ4RlIY12313C.jpg)
`_Request.destination_` _playground app showing different request types_

When you think about it, there are a huge number of ways a page can request resources to load. A `<video>` can load an image as its poster frame and a timed text track file via `<track>`, apart from the video bytes it obviously loads. A stylesheet can cause images to load that are used somewhere on the page as background images, as well as web fonts. An `<iframe>` loads an HTML document. Oh, and the HTML document itself can load manifests, stylesheets, scripts, images, and a ton of other elements like `<object>` that was quite popular in the past to load Flash movies.

![_An_ `_<img>_`_, two_ `_<p>_`_s with background images and triggers for_ `_XMLHttpRequest_` _or_ `_fetch()_`_, an_ `_<iframe>_`_, and a_ `_<video>_` _with poster image and timed text track_](img/0____mNfZCkVVBwp6TD2.jpg)
_An_ `_<img>_`_, two_ `_<p>_`_s with background images and triggers for_ `_XMLHttpRequest_` _or_ `_fetch()_`_, an_ `_<iframe>_`_, and a_ `_<video>_` _with poster image and timed text track_

Coming back to the initial example of the shopping PWA, we could come up with a simple service worker router as outlined in the code below. This router is completely agnostic of the URL structure, so there’s no tight coupling at all.

// In serviceworker.js  
self.addEventListener('fetch', (event) => {  
  const destination = event.request.destination;  
  switch (destination) {  
    case 'style':  
    case 'script':  
    case 'document':  
    case 'image': {  
      event.respondWith(  
          /\* "Network Falling Back to Cache" strategy \*/);  
      return;  
    }  
    case 'font': {  
      event.respondWith(/\* "Cache Only" strategy \*/);  
      return;  
    }  
    // All \`XMLHttpRequest\` or \`fetch()\` calls where  
    // \`Request.destination\` is the empty string default value  
    default: {  
      event.respondWith(/\* "Network Only" strategy \*/);  
      return;  
    }  
  }  
});

### Browser Support for `Request.destination`

`Request.destination` is universally supported by Chrome, Opera, Firefox, Safari, and Edge. For Chrome, support was added in Chrome 65, so for the unlikely case where your target audience uses older browsers than that, you might want to be careful with fully relying on this feature for your router. Other than that, `Request.destination` is ready for business. You can see the full details on the corresponding [Chrome Platform Status page](https://www.chromestatus.com/feature/5629697845100544).

### When `Request.destination` isn’t Enough

If you have more complex caching needs, you will soon realize that _purely_ relying on `Request.destination` is _not_ enough. For example, all your stylesheets may indeed use the same response strategy (and thus be good candidates for `Request.destination`), however, your HTML documents or API requests might still require different caching logic the more advanced your app gets.

Fortunately, you can freely combine `Request.destination` with URL-based pattern matching, there’s absolutely no harm in doing so. A basic example could be to use `Request.destination` for dealing with all kinds of images to return a default offline fallback placeholder, and to use `Request.url` with URL-based pattern matching for other resources. You can likewise decide to have different behavior based on the `Request.mode` of the request, for instance to check if you are dealing with a navigational request (`Request.mode === 'navigate'`) in single-page apps.

### Conclusion

Coming up with a reasonable caching strategy for a PWA is hard enough. Having ways to tame this complexity is definitely welcome, so whenever feasible — given your PWA’s structure — in addition to URL-based pattern handling, also consider leveraging `Request.destination` for your service worker’s routing logic. It may not be able to handle all routes and there are important exceptions and corner cases, but it’s definitely a good idea to reduce the coupling of service worker logic and URL structure as much as possible.

### Acknowledgements

Thanks to [Mathias Bynens](https://twitter.com/mathias), [Jeff Posnick](https://twitter.com/jeffposnick), [Addy Osmani](https://twitter.com/addyosmani), [Rowan Merewood](https://twitter.com/rowan_m), and [Alberto Medina](https://twitter.com/ialbmedina) for reviewing this article, and again Mathias for his help with debugging emoji encoding in Edge!