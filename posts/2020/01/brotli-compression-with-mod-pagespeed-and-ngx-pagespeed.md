---
layout: layouts/post.njk
title: "Brotli Compression with mod_pagespeed and ngx_pagespeed"
author: "Thomas Steiner"
date: "2020-01-24T09:58:47"
permalink: 2020/01/24/brotli-compression-with-mod-pagespeed-and-ngx-pagespeed/index.html
tags:
  - Technical
---
The [PageSpeed](https://www.modpagespeed.com/) modules
(not to be confused with the
[PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/)
site analysis service),
are open-source webserver modules that optimize your site automatically.
Namely, there is [mod_pagespeed](https://github.com/apache/incubator-pagespeed-mod)
for the [Apache](https://httpd.apache.org/) server and
[ngx_pagespeed](https://github.com/apache/incubator-pagespeed-ngx)
for the [Nginx](https://www.nginx.com/) server.
For example, PageSpeed can automatically create WebP versions for all your image resources,
and conditionally *only* serve the format to clients that accept `image/webp`.
I use it on this very blog, inspect a request to [any JPEG image](/images/thomas_steiner_small.jpg)
and see how on supporting browsers it gets served as WebP.

![Chrome DevTools showing a request for a JPEG image that gets served as WebP](/images/jpg-to-webp.png)

## The impact of Brotli compression

When it comes to compression, [Brotli](https://github.com/google/brotli) really makes a difference.
Brotli compression is only supported over HTTPS and is requested by clients
by including `br` in the `accept-encoding` header.
In practice, Chrome sends
[`accept-encoding: gzip, deflate, br`](https://source.chromium.org/chromium/chromium/src/+/master:net/url_request/url_request_http_job.cc;l=525-527).
As an example for the positive impact compared to gzip, check out a recent case study shared by
[Addy Osmani](https://twitter.com/addyosmani/status/1220085588948185088)
in which the web team of the hotel company [Treebo](https://www.treebo.com/) share their
[Tale of Brotli Compression](https://tech.treebo.com/a-tale-of-brotli-compression-bcb071d9780a).

## PageSpeed does not support Brotli yet

While both webservers support Brotli compression out of the box,
Apache via [mod_brotli](https://httpd.apache.org/docs/trunk/mod/mod_brotli.html)
and Nginx via [ngx_brotli](https://github.com/google/ngx_brotli),
one thing that PageSpeed is currently missing is native Brotli support,
causing resources that went through any PageSpeed optimization step to not be Brotli-encoded 😔.
PageSpeed is really smart about compression in general, for instance,
it always
[automatically enables `mod_deflate` for compression](https://www.modpagespeed.com/doc/configuration#output_filter),
optionally [adds an `accept-encoding: gzip` header to requests that lack it](https://www.modpagespeed.com/doc/system#fetch_with_gzip),
and [automatically `gzip`s compressable resources as they are stored in the cache](https://www.modpagespeed.com/doc/system#gzip_cache),
but Brotli support is just not there yet.
The good news is that it is being worked on,
[GitHub Issue #1148](https://github.com/apache/incubator-pagespeed-mod/issues/1148)
tracks the effort.

## Making Brotli work with PageSpeed

The even better news is that while we are waiting for native Brotli support in PageSpeed,
we can just outsource Brotli compression to the underlying webserver.
To do so, simply disable PageSpeed's HTTPCache Compression.
Quoting from the [documentation](https://www.modpagespeed.com/doc/system#gzip_cache):

> To configure cache compression, set `HttpCacheCompressionLevel` to values between `-1` and `9`,
  with `0` being off, `-1` being `gzip`'s default compression, and `9` being maximum compression.

📢 So to make PageSpeed work with Brotli, what you want in your
[`pagespeed.conf`](https://github.com/apache/incubator-pagespeed-mod/blob/master/install/common/pagespeed.conf.template)
file is a new line:

```bash
# Disable PageSpeed's gzip compression, so the server's
# native Brotli compression kicks in via `mod_brotli`
# or `ngx_brotli`.
ModPagespeedHttpCacheCompressionLevel 0
```

One thing to have an eye on is server load.
Brotli is more demanding than gzip, so for your static resources, you probably want to
[serve pre-compressed content](https://httpd.apache.org/docs/trunk/mod/mod_brotli.html#precompressed)
wherever possible, and for the odd chance of
[when you are Facebook, maybe disable Brotli for your dynamic resources](https://github.com/mozilla/standards-positions/issues/105#issuecomment-559315997).

![Chrome DevTools Network panel showing traffic for this blog with resources served Brotli-compressed highlighted](/images/pagespeed.png)

Happy Brotli serving, and, by the way, in case you ever wondered,
Brotli is a 🇨🇭 Swiss German word for a bread roll and literally means "small bread".
