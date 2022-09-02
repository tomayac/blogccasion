---
layout: layouts/post.njk
title: 'Things not available when someone blocks all cookies'
author: 'Thomas Steiner'
date: '2022-08-30T12:56:58'
permalink: 2022/08/30/things-not-available-when-someone-blocks-all-cookies/index.html
tags:
  - Work
---

The other day, I received a harmless-looking
[Issue](https://github.com/tomayac/SVGcode/issues/86) for my app
[SVGcode](https://svgco.de/)
([announcement blog post](/2021/11/22/releasing-svgcode/index.html)). The Issue
read:

> **Crash when opened with cookies blocked**
>
> Hey I block cookies by default. Unfortunately your website doesn’t handle that
> nicely despite it not needing (IMO) cookies to operate. I'm getting this
> error, because blocking cookies also blocks localStorage.
>
> `Uncaught DOMException: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.`
> Please add fallback to js provided localStorage, because it makes the app
> unusable.

I don't use cookies in the app at all, but for sure, when I disabled cookies in
Chrome, the app wasn't usable.

![Chrome Settings with all cookies blocked.](/images/chrome-block-cookies.png)

All I _am_ using is some innocent `localStorage` and IndexedDB to persist user
settings like the values of the sliders or the chosen color scheme.

Turns out, with all cookies blocked, Chrome disables a lot of (all?) APIs that
can be used to persist data and thus potentially profile users. Here are the
ones that I found:

- [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
- [Web SQL](https://www.w3.org/TR/webdatabase/) (obsolete)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Origin Private File System](https://web.dev/file-system-access/#accessing-the-origin-private-file-system)
- [`webkitRequestFileSystem()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestFileSystem)
  (obsolete)

The code sample below shows all these APIs and the error messages they throw
when you try to use them with cookies blocked.

```js
localStorage;
// Uncaught DOMException: Failed to read the 'localStorage' property from Window: Access is denied for this document.

sessionStorage;
// Uncaught DOMException: Failed to read the 'sessionStorage' property from 'Window: Access is denied for this document.

await caches.open('test');
// Uncaught DOMException: An attempt was made to break through the security policy of the user agent.

const openRequest = indexedDB.open('test', 1);
openRequest.onerror = function () {
  console.error(openRequest.error);
};
// DOMException: The user denied permission to access the database.

openDatabase('test', '1', 'test', 1);
// Uncaught DOMException: An attempt was made to break through the security policy of the user agent.

await navigator.serviceWorker.register('.');
// Uncaught DOMException: Failed to register a ServiceWorker for scope ('https://example.com/') with script ('https://example.com/'): The user denied permission to use Service Worker.

await navigator.storage.getDirectory();
// Uncaught DOMException: Storage directory access is denied.

webkitRequestFileSystem(
  window.PERSISTENT,
  1,
  () => {},
  (err) => console.error(err)
);
// DOMException: An ongoing operation was aborted, typically with a call to abort().

webkitRequestFileSystem(
  window.TEMPORARY,
  1,
  () => {},
  (err) => console.error(err)
);
// DOMException: An ongoing operation was aborted, typically with a call to abort().
```

Did I miss anything? If so, please let me know!

![Console errors when trying to access localStorage, sessionStorage, the Cache API, IndexedDB, and Web SQL.](/images/chrome-cookie-errors.png)

The fix for the Issue was annoying, but simple. Always
[`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
any potentially blocked calls:

- [Commit `b9d2c59`](https://github.com/tomayac/SVGcode/commit/b9d2c59bc579c103b8ac154432d65eec9688e853)
- [Commit `036ddd2`](https://github.com/tomayac/SVGcode/commit/036ddd27cbcc7923b0f8da7072a34a0e3de764b1)

![SVGcode app with blocked cookies working and showing caught exceptions in the DevTools console.](/images/svgcode-errors.png)

Please [report](https://github.com/tomayac/SVGcode/issues/) any other errors you
encounter (I don't care for the analytics script failing). And thanks,
[@JakubekWeg](https://github.com/JakubekWeg) for caring enough to having opened
this Issue! Jakub is the proof that users exist who block any and all cookies.
Check your error logs, you might be losing users, too!

(On a tangent, [MDN](https://developer.mozilla.org/en-US/) is completely broken
with cookies blocked, too. I was about to report this problem (because I care
and love MDN 😍), when I discovered a
[PR](https://github.com/mdn/yari/pull/6352) is already under way that fixes the
[Issue](https://github.com/mdn/yari/issues/6758). Thanks,
[@bershanskiy](https://github.com/bershanskiy)!)

![MDN with blocked cookies](/images/mdn-error.png)

## Amendment: `document.cookie` and the Cookie Store API

Since the user blocks cookies, I assumed cookies would of course not work, but I
was made aware of an interesting interoperability case by
[@Semmel_Of_Nine](https://twitter.com/Semmel_Of_Nine/status/1565386373355421696?s=20&t=u3q_x3gPj3mYfKcu1KCXeg)
when comparing the behavior of `document.cookie` and the
[Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API):

```js
// All cookies are blocked in browser settings.

document.cookie = 'silently=ignored';
// > 'silently=ignored'
document.cookie;
// > ''

await cookieStore.set('throws', 'on-write');
// > Uncaught DOMException: An unknown error occured while writing the cookie.
await cookieStore.getAll();
// > []
```

The reading behavior is the same, both act as if there were no cookies by
returning an empty string or an empty array respectively. The writing behavior
is different, though. To align with `document.cookie`'s write behavior, should
write operations for the Cookie Store API fail silently when cookies are
blocked? Asked this question in an
[Issue](https://github.com/WICG/cookie-store/issues/209) in the Cookie Store
API's repo… Fun fact: spelling "occurred" is hard, double 'c' and double 'r'
([crbug/1359247](https://crbug.com/1359247)).
