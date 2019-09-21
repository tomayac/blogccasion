---
layout: layouts/post.njk
title: "Project Fugu 🐡 at W3C TPAC"
author: "Thomas Steiner"
date: "2019-09-21T16:03:15"
permalink: 2019/09/21/project-fugu-at-w3c-tpac/index.html
tags:
  - Technical
---

This week, I attended my now third <abbr title="World Wide Web Consortium">W3C</abbr>
<abbr title="Technical Plenary and Advisory Committee">TPAC</abbr>.
After [TPAC&nbsp;2017](https://www.w3.org/2017/11/TPAC/Overview.html)
in Burlingame,&nbsp;CA, United States of America and
[TPAC&nbsp;2018](https://www.w3.org/2018/10/TPAC/) in Lyon, France,
[TPAC&nbsp;2019](https://www.w3.org/2019/09/TPAC/Overview.html) was held in Fukuoka, Japan.
For the first time, I felt like I could *somewhat meaningfully* contribute and
had at least a *baseline understanding* of the underlying W3C mechanics.
As each year, the [TPAC agenda](https://www.w3.org/2019/09/TPAC/schedule.html) was crammed
and overlaps were unavoidable.
Below is the write-up of the meetings I had time to attend.

#### Day 1

On Monday, I attended the [Service Workers Working Group](https://www.w3.org/sw/)
(WG) meeting.
The [agenda](https://github.com/w3c/ServiceWorker/issues/1460#issue-482168365) this time
was a mix of implementor updates, new proposals, and a lot of discussion of special cases.
I know [Jake Archibald](https://twitter.com/jaffathecake) is working on a summary post,
so I leave it to him to summarize the day.
The
[raw meeting minutes](https://docs.google.com/document/d/1q090ovJ4gd8wSfVtvuoZLMZ51YkiFDsEZ0Jiqi41Iys/edit)
are available in case you're interested.

#### Day 2

On Tuesday, I visited the
[Web Application Security Working Group](https://www.w3.org/2011/webappsec/)
meeting as an observer.
I was mostly interested in this WG because the
[agenda](https://github.com/w3c/webappsec/blob/master/meetings/2019/2019-09-TPAC-agenda.md)
promised interesting proposals like Apple's
[`/.well-known/change-password`](https://wicg.github.io/change-password-url/index.html)
that was met with universal agreement.
Some interesting discussion also sparked around again Apple's
[`isLoggedIn()`](https://lists.w3.org/Archives/Public/public-webappsec/2019Sep/0004.html)
API proposal.
I was reminded of why on the web we can't have nice things through an attack vector
that leverages <abbr title="HTTP Strict Transport Security">HSTS</abbr> for tracking purposes.
Luckily there is
[browser mitigation](https://webkit.org/blog/8146/protecting-against-hsts-abuse/)
in place to prevent this.
The
[meeting minutes](https://github.com/w3c/webappsec/blob/master/meetings/2019/2019-09-TPAC-minutes.md)
cover the entire day.

#### Day 3

Wednesday was unconference day with
[59(!) breakout sessions](https://w3c.github.io/tpac-breakouts/sessions.html).
Other than the at times tedious working group sessions,
I find breakout sessions to be oftentimes more interesting and an opportunity to learn new things.

##### Breakout Session JS Built-in Modules

The first breakout session I attended was on
[JS built-in modules](https://w3c.github.io/tpac-breakouts/sessions.html#jsbuiltin),
a <abbr title="Technical Committee 39">TC39</abbr> proposal by Apple for a
[JavaScript Built-in Library](https://github.com/tc39/proposal-javascript-standard-library).
The [session's minutes](https://www.w3.org/2019/09/18-jsbuiltin-minutes.html) are available,
in general there was a lot of discussion and disagreement around namespaces and
how built-in modules should be governed.

##### Breakout Session New Module Types: JSON, CSS, and HTML

The next session was on
[new module types for JSON, CSS, and HTML](https://w3c.github.io/tpac-breakouts/sessions.html#new-modules).
As the developer of
[`<dark-mode-toggle>`](https://github.com/GoogleChromeLabs/dark-mode-toggle),
I'm fully in favor of getting rid of the clumsy
[`innerHTML` all the things!!!1!](https://github.com/GoogleChromeLabs/dark-mode-toggle/blob/bf737bed7a7d3ba5086585a94578ed814500bb6c/src/dark-mode-toggle.mjs#L75-L249)
approach that vanilla JS custom elements currently make the programmer to follow.
If you're likewise interested, subscribe to the
[CSS Modules issue](https://github.com/w3c/webcomponents/issues/759) and the
[HTML Modules issue](https://github.com/w3c/webcomponents/issues/645)
in the Web Components WG repo.
The discussion circulated mostly around details how `@imports` would work and
how to convey the type of the import to avoid security issues,
for example following the `<link rel="preload">` way.
The [meeting minutes](https://www.w3.org/2019/09/18-new-modules-minutes.html)
have the full details.

```js
// Non-working example
import styles from 'styles.css' as stylesheet;
import settings from 'settings.json' as json;
```

##### Breakout Session Mini App Standardization

The [Mini App Standardization](https://w3c.github.io/tpac-breakouts/sessions.html#miniapp)
session, organized by the [Chinese Web Interest Group](https://www.w3.org/2018/chinese-web-ig/),
was super interesting to me.
In preparation of the
[Google Developer Days in Shanghai, China](https://events.google.cn/intl/zh-CN/developerdays2019/),
that I spoke at right before TPAC, I have
[looked at WeChat mini programs](https://blog.tomayac.com/2019/08/15/a-quick-look-at-wechats-mini-programs/)
and documented the developer experience and how close to and yet how far from the web they are.
A couple of days before TPAC, the Chinese Web Interest Group had released a
[white paper](https://www.w3.org/TR/mini-app-white-paper/) that documents their ideas.
The success the various mini apps platforms have achieved deserves our full respect.
There were, however, various voices—including from the
<abbr title="Technical Advisory Group">TAG</abbr>—that urged the various stakeholders
to converge their work with efforts made in the area of
Progressive Web Apps, for example around the [Web App Manifest](https://w3c.github.io/manifest/)
rather than create yet another manifest-like format.
Read the [full session minutes](https://www.w3.org/2019/09/18-miniapp-minutes.html) for all details.
One of the results of the session was the creation of the
[MiniApps Ecosystem Community Group](https://www.w3.org/community/miniapps/)
that I hope to join.

##### Breakout Session For a More Capable Web—Project Fugu

Together with [Anssi Kostiainen](https://twitter.com/anssik) from Intel and
[John Jansen](https://twitter.com/thejohnjansen) from Microsoft,
I organized a breakout session
[for a more capable web](https://w3c.github.io/tpac-breakouts/sessions.html#capable-web)
under the umbrella of Project Fugu 🐡.
You can see our slides embedded below.
In the session we argue that to remain relevant with native, hybrid, or mini apps, web apps, too,
need access to a comparable set of APIs.
We briefly touched upon the APIs being worked on by the cross-company project partners,
and then opened the floor for an open discussion on why we see the browser-accessible web in danger
if we don't move it forward now,
despite all fully acknowledged challenges around privacy, security, and compatibility.
You can follow the discussion in the excellent(!)
[session minutes](https://www.w3.org/2019/09/18-capable-web-minutes.html), courtesy of Anssi.

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSBOBqz_UiNBce-HxpS8EC2lVSeAbzn2lrreesUhhnNaF-3zSieO8A5RaqVc-YhbuuZN0MFKOBsKf7g/embed?start=false&loop=false&delayms=3000" frameborder="0" width="800" height="477" style="max-width: 100%; width: 800px;" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

#### Day 4 and Day 5

Thursday and Friday were dedicated to the [Devices and Sensor WG](https://www.w3.org/das/).
The [agenda](https://github.com/w3c/devicesensors-wg/issues/24) was not too packed,
but still kept us busy for one and a half days.
We discussed almost from the start about permissions and how they should be handled.
Permissions are a big topic in Project Fugu 🐡 and I'm happy
that there's work ongoing in the TAG to improve the situation, including efforts around the
[Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
that is unfortunately not universally supported, leading to inconsistencies
with some APIs having a static method for getting permission,
[others](https://github.com/w3c/sensors/issues/388#issuecomment-532942477)
asking for permission upon the first usage attempt,
and yet others to integrate with the Permissions API.
For the [Geolocation Sensor API](https://w3c.github.io/geolocation-sensor/),
we agreed to try retrofitting expressive configuration
of foreground tracking into the [Geolocation API](https://w3c.github.io/geolocation-api/)
specification instead of doing it in Geolocation Sensor, which should improve vendor adoption.
For geofencing and background geolocation tracking, we decided to explore
[Notification Triggers](https://github.com/beverloo/notification-triggers) and
[Wake Locks](https://w3c.github.io/wake-lock/) respectively,
which both weren't options when the work on Geolocation Sensor was started initially.

[Maryam Mehrnezhad](https://sites.google.com/view/maryammjd/home),
an invited expert in the working group whose research is focused on privacy and security,
presented on and discussed with us the implications on both fields that sensors potentially have
and whether mitigation like accuracy bucketing or frequency capping are effective.
The [minutes](https://www.w3.org/2019/09/19-dap-minutes.html#x18) capture the conversation well.

Finally, we
[changed the surface of the Wake Lock API](https://github.com/w3c/wake-lock/issues/226#issuecomment-533032056)
hopefully for the last time.
The previous changes just didn't feel right from a developer experience point of view,
so better change the API while it's behind a flag than be sorry forever.
I reckon I do feel sorry for the implementors [Rijubrata Bhaumik](https://twitter.com/rijubrata)
and [Raphael Kubo da Costa](https://github.com/rakuco)… 🙇

```js
partial interface Navigator {
  [SameObject] readonly attribute WakeLock wakeLock;
};

partial interface WorkerNavigator {
  [SameObject] readonly attribute WakeLock wakeLock;
};

[Exposed=(Window,DedicatedWorker)]
interface WakeLock {
  Promise<unsigned long long> request(WakeLockType type);
  Promise<void> release(unsigned long long wakeLockID);
};

dictionary WakeLockEventInit {
  required unsigned long long wakeLockID;
};

[Exposed=(Window,DedicatedWorker)]
interface WakeLockEvent : Event {
  constructor(DOMString type, WakeLockEventInit init);
  readonly attribute unsigned long long wakeLockID;
};
```

As a general theme, we "hardened" a number of APIs, for example decided to integrate geolocation
with [Feature Policy](https://w3c.github.io/webappsec-feature-policy/)
and now require a secure connection for the [Battery Status API](https://w3c.github.io/battery/).
The chairs Anssi and [Reilly Grant](https://twitter.com/reillyeon)
have scribed the one and a half days brilliantly,
the minutes for [day&nbsp;1](https://www.w3.org/2019/09/19-dap-minutes.html) and
[day&nbsp;2](https://www.w3.org/2019/09/20-dap-minutes.html) are both online.

#### Conclusion

As I wrote in the beginning, TPAC *slowly* starts to feel like a venue
where I can make some valuable contributions.
[Rowan Merewood](https://twitter.com/rowan_m) put it like this in a
[tweet](https://twitter.com/rowan_m/status/1173808373436862464):

> The biggest thing I'm learning at
  [[#W3Ctpac](https://twitter.com/hashtag/w3ctpac?src=hashtag_click)]
  is if you want to change the web,
  it's a surprisingly small group of people you need to convince.
  The surrounding appearance of the W3C and all its language is intimidating,
  but underneath it's just other human beings you can talk to.

To which [Mariko Kosaka](https://twitter.com/kosamari) fittingly
[responds](https://twitter.com/kosamari/status/1173811848518356993):

> [Y]]eah, but let's not forget getting to talk to that small set of people
  most often comes with being very, very, very privileged. […]

It's indeed a *massive privilege* to work for a company that has the money
to take part in W3C activities, fly people across the world, and let them
stay in five star conference hotels.
With all the love for the web and all the great memories of a fantastic TPAC,
let's not forget: the web is threatened from multiple angles,
and being able to work in the standards bodies on defending it is a privilege of the few.
Both shouldn't be the case.
