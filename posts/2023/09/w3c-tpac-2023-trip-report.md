---
layout: layouts/post.njk
title: 'W3C TPAC 2023 Trip Report'
author: 'Thomas Steiner'
date: '2023-09-25T16:19:45'
permalink: 2023/09/25/w3c-tpac-2023-trip-report/index.html
tags:
  - Work
---

## Background

The 2023 edition of the World Wide Web Consortium (W3C) Technical Plenary and
Advisory Committee (TPAC) meeting took place from September 11 to 15 in the
[Meliã hotel in Seville](https://www.melia.com/en/hotels/spain/seville/melia-sevilla),
Spain. The hotel is located right next to the
[Plaza de España](https://en.wikipedia.org/wiki/Plaza_de_Espa%C3%B1a,_Seville),
a major Spanish tourist destination. The setup of the meeting was hybrid, and on
site, strict Covid precautions were enforced, even though the pandemic was
declared to be "over". Despite these methods, several people caught it. This is
my personal report as a representative of the Chrome DevRel team at Google.

![Panorama of Plaza de España.](/images/w3ctpac2023tri--q5fbcovgd9r.jpg)

![View of the hotel pool with the Glorieta De La Ronda De Capitania in the background.](/images/w3ctpac2023tri--u0djnvaere.jpg)

## Monday, Tuesday

### Web Applications Working Group

I attended the
[Web Applications Working Group](https://www.w3.org/2008/webapps/) meetings on
Monday and Tuesday. After a quick rundown of all the APIs in scope for the
working group, the first topic was the
[Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation),
which was mostly driven by questions and improvement proposals the WebKit folks
had after implementing it.

Next, the group discussed the Badging API, which is
only available after installation, and browsers differ on whether they make the
API detectable when the app is running in a tab.

An interesting corner case was
debated in the context of the joint meeting with the
[Devices and Sensors Working Group](https://www.w3.org/groups/wg/das/). Apple
can't join the group due to its unwillingness to implement some of the APIs and
the sheer volume of proposals the team would have to review. The workaround is
[shared deliverables](https://w3c.github.io/webappswg/charter/draft-charter-2023.html#working-mode),
where the APIs that there _is_ agreement on get cross-delivered by a working
group Apple is part of.

Following this, we talked about whether the
[Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
should use
[transient](https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation)
or
[sticky activation](https://developer.mozilla.org/en-US/docs/Glossary/Sticky_activation).

The group made no progress on François Beaufort's suggestion for a
[Screen Brightness API](https://github.com/w3c/screen-wake-lock/blob/gh-pages/brightness-mode-explainer.md).

On the topic of
[DeviceOrientation API](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Detecting_device_orientation)
vs. [Generic Sensor API](https://www.w3.org/TR/generic-sensor/), the
soft-conclusion was that the new API provides not enough advantage over the
existing API. There's still disagreement about whether using the API should
require a permission, which is mostly used for fraud detection to determine if a
real user is holding a device.

For the
[Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API),
most discussion circulated around limiting its precision by encouraging more
coarse data. On the opposite side, there's also still the open question of
`floorLevel` data, which Safari exposes, but which isn't standardized. The group
briefly discussed a `toJSON()` method for geolocation results, but it probably
would be a breaking change due to `instanceof` checks. The
[background geolocation](https://github.com/w3c/geolocation-api/issues/74)
discussion was taken over repeatedly by trolls, which made proper discussion
partly impossible. It's a solve-worthy problem, albeit it's a heated space.
[Geolocation Sensor](https://www.w3.org/TR/geolocation-sensor/) had promises but
we're not sure it's worth bringing this over, since the callback can easily be
wrapped.

There was a joint meeting with the
[Internationalization Working Group](https://www.w3.org/International/core/) to
discuss long-standing
[open questions regarding translations of the Web App Manifest](https://github.com/w3c/manifest/issues/1045)
were investigated, which resulted in a
[potential solution](https://github.com/w3c/manifest/issues/1045#issuecomment-1713866460).
I foresee challenges when looking at the `"shortcuts"` member.

#### Notes and resources

- [WebApps WG TPAC 2023 Meeting (Day 1)](https://docs.google.com/document/d/1RIaeXT_-j8n4iGPI3odZyJTqtHCKqe3oWZTO-j21z9U/edit#heading=h.n0pc0966xlbs)
- [WebApps WG TPAC 2023 Meeting (Day 2)](https://docs.google.com/document/d/1QDqllh8inOcIkTrblERm4HRKYh8Ce9Lu5S7WhOygs_0/edit#heading=h.n0pc0966xlbs)

### Web Platform Incubator Community Group

On Monday afternoon, I switched over to the Web Platform Incubator Community
Group ([WICG](https://www.w3.org/community/wicg/)) meeting. The topics I was
interested in were Low Level Device APIs and First Party Sets (now Related
Website Sets).

In the first part, Vincent Scheib presented on low level device
APIs. Firefox has rolled out
[Web MIDI access based on an ad-hoc extension](https://www.midi.org/forum/1332-web-midi-api-for-firefox),
which didn't seem it would convince Apple people. Apple also had doubts whether
a permission prompt would be enough for people to understand that devices can be
abused to circumvent the same-origin model. Reilly Grant outlined that Chrome
stopped tying WebUSB to websites in an attempt to keep devices usable, even if
the original website disappears.

For First Party Sets, there are currently only a few entries in the
[First Party Sets list](https://github.com/GoogleChrome/first-party-sets/blob/main/first_party_sets.JSON),
following the
[Submission Guidelines](https://github.com/GoogleChrome/first-party-sets/blob/main/FPS-Submission_Guidelines.md).
It's rolling out to Chrome slowly. Other browser vendors do not implement First
Party Sets at the moment.

On Tuesday, the big topic was installable web apps
where Dan Murphy presented our existing solutions around
[Launch Handling](https://developer.chrome.com/docs/web-platform/launch-handler/).
Marcos from Apple and Olli from Mozilla questioned the queue model vs. an event
model and suggested to replace `LaunchParams` with `DataTransferItem`. Apple
noted that a launch handling feature is something that they would probably need.

> Apple's questioning of Chrome's established solution caused me to raise a meta
> question: Chromium already asked for input years ago and got no meaningful
> feedback and then shipped a solution that was proven to be successful. Now other
> vendors are interested, but want to change the fundamental design (and perhaps
> together we can all agree on a better design). What is the process here? Are we
> as Chrome supposed to unship ours?

Sangwhan Moon provided the Technical
Architecture Group ([TAG](https://tag.w3.org/)) perspective that Chrome makes
sure other vendors provide input before Chrome ships. Chrome can't wait until
vendors have an active interest. The group agreed to discuss next steps.

Diego from Microsoft then presented the
[Install API proposal](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/WebInstall/explainer.md).
There was general interest in a solution, but a lot of skepticism when it comes
to cross-origin installations, which would be an important use case for app
stores or search engines.

The group further discussed the standardization of
[iOS' proprietary `navigator.standalone](https://github.com/w3c/manifest/issues/1092)`.

After that, we looked at the
[update algorithm](https://www.w3.org/2022/09/13-webapps-minutes.html#t03)
discussed at the last TPAC and confirmed an update token would be the way to go.

The group briefly touched upon isolation of installed apps from the running
browser context and the challenges it introduces with OAuth etc.

Next was
[protocol handling](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/protocol_handlers)
which Apple mostly opposed,
[window controls overlay](https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API)
and [tabbed application mode](https://web.dev/tabbed-application-mode/) which
Apple was neutral-ish to, and my [app menu proposal](https://crbug.com/1295253)
which Apple committed to coming up with a proposal for. Mozilla notably was in
the room, but had no opinion on almost all topics close to PWA.

Apple then
dropped a
[proposal for declarative push notifications](https://github.com/WebKit/explainers/blob/main/DeclarativeWebPush/README.md).
I filed a
[number of questions](https://github.com/WebKit/explainers/blob/main/DeclarativeWebPush/README.md)
to the proposal.

#### Notes and resources

- [Web Apps and Handling Data for TPAC (public)](https://docs.google.com/document/d/1zZp6fY0JV7nt4IHZczCSQw2SqYsGednpU2kAO95rJbU/edit#heading=h.b1lo9cy1ham)
- [WICG TPAC 2023 Low Level Device APIs](https://docs.google.com/document/d/1PVkuF0g0pUj5NTQzUcpglSsOfwoOa_AZM-S7EJ5ZAbU/edit)
  ([2022 TPAC Device APIs](https://docs.google.com/presentation/d/1Nf64QLI-lkyqJ7UoDUPefrLJU7zcTUJKvTYV8L7ZAaY/edit?resourcekey=0-Bf69ilULrcA4qBZb7ZHdkA#slide=id.p))
- [TPAC 2023 - Web Platform Incubator CG (WICG) - Isolated Web Apps - Notes](https://docs.google.com/document/d/1edq0k9yGtTgcR4NViu0sibUkCcRHHTCBQXGCK759jLY/edit#heading=h.703ew5rbvdo3)
- [First Party Sets](https://github.com/WICG/first-party-sets/blob/main/meetings/09-11-2023-TPAC-minutes.md)
  ([[Public] TPAC 2023: Related Website Sets (fka First-Party Sets)](https://docs.google.com/presentation/d/1K6surspD72-sdkVdRy6KxOA3uipj6XXB9lF_ynOaeX4/edit?usp=sharing))
- [Web Install API TPAC 23 discussion](https://onedrive.live.com/edit.aspx?resid=8D8B723D008546BD!949334&ithint=file%2cdocx&wdo=2&authkey=!APpYdHqZA56dkBU)

## Wednesday

Wednesday was the breakout session day. As always, there were some sessions that
I wish I could have attended, but due to scheduling conflicts I couldn't. Below
is the list of the sessions I attended.

### Accelerating the Web performance by compiling Javascript code to WASM

This session introduced JWST, a JavaScript to WebAssembly static translator
(compiler) co-developed by Huawei and a professor from a university in Beijing,
after claiming the (somewhat [citation needed]) problem of slowness of
JavaScript being a problem for web apps and the lack of DOM access of Wasm as a
major challenge. The presented compiler in their example converted a ~1.6MB
JavaScript app (which is already big) into a >20MB Wasm app that under _certain_
conditions slightly outperformed the JavaScript solution in their benchmark. I
asked for more details about the compiler, but there wasn't any and the Huawei
representatives said they weren't entirely sure about open-sourcing it. As it
stands, my current evaluation of the solution is that it's technology
feasibility demonstration at best.

#### Notes and resources

- [Minutes](https://www.w3.org/2023/09/13-js2wasm-minutes.html)
- [Slides web for apps](https://lists.w3.org/Archives/Public/www-archive/2023Sep/att-0021/TPCA_2023_-_Web_for_Apps_v1.pdf)
- [Slides for JWST](https://lists.w3.org/Archives/Public/www-archive/2023Sep/att-0021/W3C-TPAC-JWST-Beihang-ShiXiaohua-final.pdf)

### Page Embedded Permission Control (Permission Element)

In this session, the Chrome team introduced our current thinking of a
`permission` element. The reaction from both Apple and Mozilla was that they
both "don't immediately hate it". Many questions remain to be answered, mainly
around how this would deal with multiple permissions, whether it should allow
blocking permissions, the spoofability of its UI and whether that poses a risk,
the customizability of its UI, and how revoking permissions would look like with
it.

#### Notes and resources

- [TPAC Permission Control (public)](https://docs.google.com/presentation/d/1fzMEeyWbdpBS7HN9WumIOSbqB3pl-MG2DTo_5-lvgus/edit#slide=id.g27df7eff9c5_0_226)
- [(public) Page Embedded Permission Control (Permission Element) - TPAC 2023 Breakout](https://docs.google.com/document/d/1pJFCADgasiqojESz2VePkVwaDdlfDqpN5JSqo4T4mMs/edit#heading=h.ocs3ne1w3v4g)

### The Future of Powerful APIs on the Web Platform

This TAG-initiated session stated the problem of powerful APIs on the Web,
leading to permission fatigue and browsers simply not implementing certain APIs
as a consequence, and motivated something like an extended trust mode for the
Web. Sangwhan Moon said that without all browser vendors agreeing, the situation
would not improve. Mozilla sort of soft-excluded the browser from the effort by
stating that they were not thinking of messing with the origin model and to not
assume that all capabilities were on the table. They also said as a community,
we shouldn't let envy of native capabilities drive this.

#### Notes and resources

- [The Future of Powerful APIs on the Web Platform](https://docs.google.com/presentation/d/1-1Q-2206wTjWadU0NtXozEWyGZbnaz1ABHCWL_MCNaM/edit#slide=id.p)
- [Powerful APIs TPAC 2023 Breakout minutes](https://docs.google.com/document/d/1vRO6xher_AiHDOkQIClgz4wCI8tEAJdHifLU-M2epOI/edit#heading=h.xxa48zxk3cpj)

### Privacy Principles

This session introduced the
[privacy principles](https://www.w3.org/TR/privacy-principles/) jointly
developed by TAG and Privacy Interest Group
([PING](https://www.w3.org/Privacy/IG/)) and solicited feedback from the persons
in the room. The document is currently in wide review and seeks to be both
aspirational and practical. Each member of the author group outlined their
favorite sections of the document, like data minimization, device owners and
administrators, or execution context. I asked about a conscious opt-in for
objectively hard to understand things like `requestStorageAccess()` to which the
answer was to abstract as much as possible in the permission prompt.

#### Notes and resources

- [Slides](https://raw.githack.com/w3ctag/privacy-principles/main/meetings/2023-09-tpac/breakout/slides.html)
- [Minutes](https://www.w3.org/2023/09/13-privacy-principles-minutes.html)

### The cross-browser future of Installable Web Apps

This was a session I had organized together with Apple, Microsoft, and Intel. We
discussed a number of approaches to installability taken by the various
browsers, including new surfaces like sidebars and widgets—a currently
proprietary approach based on Microsoft's
[Adaptive Card](https://adaptivecards.io/) format. Of special interest was
whether criteria should be required before a Web app can be installed. Chrome
talked about the no longer required service worker. Apple insisted no
requirements at all should be made, not even a title or icon. Apple's
requirements for installable experiences are focused on ensuring consistent
experiences. Users should know exactly where to go in their device settings to,
for example, turn off Web push notifications, which require installation on iOS.
We ended talking about extensions and whether they should be exposed in
installed apps. Currently, Chrome and Edge expose extensions, Safari doesn't.

#### Notes and resources

- [The cross-browser future of Installable Web Apps](https://docs.google.com/presentation/d/1t_0WsgKFy2VmFY9lzpdLy00FgXK3Z9d0XJybOtCl-Tk/edit#slide=id.p)
- [The cross-browser future of Installable Web Apps](https://docs.google.com/document/d/1QzHTKGDxHol7KybdqY-rll1VGd1FIirvW-mtAFxPjC4/edit#heading=h.5wzb241vwwm2)

### Installing Web Apps

This was again a deep-dive in Microsoft's
[Web Install API](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/WebInstall/explainer.md)
proposal. Many points or arguments were already made in the
[WICG session on Tuesday](https://onedrive.live.com/edit?id=8D8B723D008546BD!949334&resid=8D8B723D008546BD!949334)
(same notes document as for the breakout session). A noteworthy new point was
the question if something like sidebar apps should be supported in a sense that
a PWA would be able to express it would like to be installed to the sidebar.
Apple said the baseline assumption of this API should not be that of an app
store; the API should be useful in itself. If stores are involved, how would
stores know if an app was already installed through another store or mechanism?
Could `getInstalledRelatedApps()` be the solution for this? Another point raised
was the trackability of installs, so stores could know if an installation was
triggered by them, and apps what store an install came from. Finally, we
discussed double prompting, first a bootstrap prompt whether a store may install
apps in general, and then a concrete prompt to install a given app.

#### Notes and resources

- [Minutes](https://onedrive.live.com/edit?id=8D8B723D008546BD!949334&resid=8D8B723D008546BD!949334)

## Thursday

## Devices and Sensors

I spent Thursday in the Devices and Sensors Working Group meeting. The first
part of the day was occupied by a charter discussion between Philippe Le Hégaret
from the W3C. The core question that was discussed was cross-deliverables
between the Web Apps WG and the Devices and Sensors WG, since Apple can't commit
to joining the Device and Sensors WG but is interested in some of the things the
group is working on.

Next, we looked at the privacy principles and how they are
applied by some of the specs. Marian Harbach briefly presented the `permission`
element.

In suite, Intel talked about testability improvements they made around
WebDriver.

Regarding Generic Sensors, we made a resolution to ensure Generic
Sensor-based specs have mitigations normatively defined for factory calibration
device fingerprinting, matching
[existing normative mitigations in the DeviceOrientation Events spec](https://w3c.github.io/deviceorientation/#security-and-privacy:~:text=The%20calibration%20of%20accelerometers%2C%20gyroscopes%20and%20magnetometers%20may%20reveal%20persistent%20details%20about%20the%20particular%20sensor%20hardware).

After that, we went through all the APIs in scope of the working group and
looked at their status:

- [Accelerometer](https://www.w3.org/2023/09/14-dap-minutes.html#t09),
  [Gyroscope](https://www.w3.org/2023/09/14-dap-minutes.html#t10), and
  [Magnetometer](https://www.w3.org/2023/09/14-dap-minutes.html#t11), all with
  no issues.
- [Orientation Sensor](https://www.w3.org/2023/09/14-dap-minutes.html#t12) and
  [DeviceOrientation Events](https://www.w3.org/2023/09/14-dap-minutes.html#t13)
  in the context of spatial audio, referring to WebXR as the better home for the
  use case.
- [Ambient Light Sensor](https://www.w3.org/2023/09/14-dap-minutes.html#t14)
  with going through existing use cases.
- [Proximity Sensor](https://www.w3.org/2023/09/14-dap-minutes.html#t15) with no
  issues.
- [Geolocation Sensor](https://www.w3.org/2023/09/14-dap-minutes.html#t16) where
  we went through the existing use cases for background geolocation and
  geofencing again.
- [Screen Brightness API](https://www.w3.org/2023/09/14-dap-minutes.html#t17)
  with no updates since Apple's negative feedback on an imperative API and after
  François Beaufort's
  [proposal](https://github.com/WICG/screen-brightness/issues/1) for an element
  attribute for increasing the screen brightness.
- [Screen Wake Lock API](https://www.w3.org/2023/09/14-dap-minutes.html#t18)
  with some address-worthy implementer feedback from Apple.
- [System Wake Lock API](https://www.w3.org/2023/09/14-dap-minutes.html#t19)
  with a discussion of use cases.
- [Contact Picker API](https://www.w3.org/2023/09/14-dap-minutes.html#t20) with
  no updates.
- [Battery Status API](https://www.w3.org/2023/09/14-dap-minutes.html#t21) which
  might be turned into a user preference media feature.

Next, Intel gave a device market overview followed by an implementation overview
including compelling use case demonstrations for the
[Device Posture API](https://www.w3.org/2023/09/14-dap-minutes.html#t22).
Fine-grained angle information was removed from the spec due to privacy
concerns.

In the following, Intel continued on presenting on the
[Compute Pressure API](https://www.w3.org/2023/09/14-dap-minutes.html#t23), with
a special focus on cross-site tracking mitigations through randomization that
were proven to be effective in experiments, plus showing future extensions for
the API like memory stalls and an "it's you" hint when the current process is
responsible for CPU usage peaks.

The day ended with a look at the
[Geolocation API](https://www.w3.org/2023/09/14-dap-minutes.html#t26), which is
mostly stable but could add improvements around encouraging more coarse location
access.

As a meta remark, I feel like as a working group, we didn't achieve much
new things compared to last year, mostly due to a lack of cross-implementer
support for some of the APIs like the generic sensor APIs, and only a limited
appetite to move on with things vendors at least partially agree on like screen
brightness or ambient light sensor.

#### Notes and resources

- [Minutes](https://www.w3.org/2023/09/14-dap-minutes.html)

## Friday

### WHAT Working Group

On Friday, I saw an interesting
[proposal for a `headinglevelstart`](https://github.com/whatwg/html/issues/5033) attribute that would allow authors to embed content with a heading structure into another context with an already existing heading structure, while overall correctly nesting both heading structures. This was mostly driven by GitHub, who embed`README.md`
files into repository homepages and who wish to adjust heading levels
accordingly.

Next, a
[focus navigation start point proposal](https://github.com/whatwg/html/issues/5326)
was brought forward, which would allow to set the start point for the next focus
point (which is not the same as the focus). Again this was driven by GitHub, who
wanted to make the file tree fully keyboard-navigable.

Noteworthy was also a
[proposal for an Observable API](https://github.com/WICG/observable) presented
by Dominic Farolino , which would allow for more convenient event handling
scenarios and that was greeted with great interest.

#### Notes and resources

- [Minutes: WHATWG session](https://docs.google.com/document/d/1V6_s_VsaWcI9J-ZATbIKKijn59JbVmRMsHXYyH29sho/edit#heading=h.9gswhzv85q2)
- [Observable API Presentation TPAC 2023](https://docs.google.com/presentation/d/1lPLUcm_yqR5couGwouETTkblhqgHfpgUBkm2mnmxegU/edit#slide=id.p)

### Web Platform Incubator Community Group

In the afternoon, I attended Web Incubator Community Group
([WICG](https://wicg.io/)) sessions focused on the Accessibility Object Model
(AOM), the Shape Detection API, and the File System.

Unfortunately the AOM
session was a little confusing and it was not entirely clear what the status of
the AOM was and which parts of it are cross-browser vs. abandoned. The
[AOM explainer](https://github.com/WICG/aom/blob/gh-pages/explainer.md) contains
many abandoned sections and the [AOM spec](https://wicg.github.io/aom/spec/) is
just a barebones skeleton, plus the
[demo](https://wicg.github.io/aom/demos/tictactoe.html) doesn't work (anymore).

For the
[Shape Detection API](https://developer.chrome.com/articles/shape-detection/),
there's some interest from Apple to implement this. They raised questions about
batch processing and synchronization challenges with video, which would likewise
apply to blurring. I pointed at my [demo](https://mediastreamtrack.glitch.me/)
that solves this with
[MediaStreamTrack Insertable Media Processing using Streams](https://alvestrand.github.io/mediacapture-transform/chrome-96.html).
Apple was also worried about the Chrome-specificity of the test suite and the
future venue of the proposal, hinting it could be the
[WebML WG](https://www.w3.org/groups/wg/webmachinelearning). As a final point, I
noted that Apple's implementation works, but only on the main thread and not in
workers. This is a known issue and "for reasons", according to Apple.

The File
System Access session proposed by Austin Sullivan unluckily saw no attendance
from Apple or Mozilla, so the meeting was adjourned since it would have been
Googlers preaching to Googlers (and Google Developer Expert
[Christian Liebel](https://christianliebel.com/)).

#### Notes and resources

- [Minutes](https://www.w3.org/2023/09/15-wicg-minutes.html)
- [[TPAC 2023] WICG File System](https://docs.google.com/presentation/u/1/d/1ouEXjfvkxM9WJmTg22Fb_qwMjXeOrZG1Aa3p97Fj3j0/edit)

### Web App Security Working Group

On the end of the day, I crashed the Web App Security WG meeting and saw Mike
West's proposal for
[purposeful permissions](https://github.com/mikewest/purposeful-permissions). I
made the point for aligning with other efforts in this area in an
[issue](https://github.com/mikewest/purposeful-permissions/issues/1), namely the
W3C MiniApp Manifest and Isolated Web Apps permissions.

#### Notes and resources

- [Minutes](https://cryptpad.w3ctag.org/code/#/2/code/edit/Pq1xOhFZ9oxeI5vrXwx--B3a/)

## Meta observations

### Covid measures

Covid measures were strictly enforced during the indoor sessions with a masking
mandate and encouraged daily testing. All the breaks and lunches were outside or
outside-ish (partially in a well-vented tent). After hours at dinners and drinks
at the hotel bar, everyone partaking in those activities took their masks off.
There were, I think, around 15 documented cases of infections.

### In-person event

It was really, really great to be able to do in-person events again. While the
group meetings worked pretty well with remote attendance (both from across the
world, or from the conference hotel if you caught Covid), the famous hallway
track and spending time with people at dinner or after-hours drinks is just not
replaceable by video conferencing technology.

### Food

Food was boxed lunches with the now infamous soggy potato chips and each day a
variety of pre-packed industrial sandwiches. It felt wasteful, since there was a
lot of food in a lot of packaging. Maybe a buffet-style lunch would have been
better. There was typically an early dinner train, which ended up in one of the
tourist trap-ish restaurants in old town that open early compared to local
Spanish dinner times. My food quality indicator was always to check the bread:
if it's plastic-sealed, the food will be fine; if it's fresh, it will be
amazing.

Coffee was available in the breaks, and either horrible if you got the
milk directly from the machine, or great if you got the milk separately from a
waiter.

### Google attendance

There were (again) a lot of people from Google in attendance. This year, we made
a concerted effort to highlight more closely what team we represent, for
example, Google Chrome, rather than all of Google. More than once, I saw other
people mirror this, and introduce themselves as "from the X team at Y".
