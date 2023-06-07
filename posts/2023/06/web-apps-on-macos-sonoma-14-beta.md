---
layout: layouts/post.njk
title: 'Web Apps on macOS Sonoma 14 Beta'
author: 'Thomas Steiner'
date: '2023-06-07T13:39:59'
permalink: 2023/06/07/web-apps-on-macos-sonoma-14-beta/index.html
tags:
  - Work
---

## Executive summary

With macOS Sonoma, **Apple goes all-in on the concept of installable web apps**.
They're highly integrated in the overall macOS experience and don't give away
their web roots by not showing any Safari UI at all.

## Testing environment

Tested on macOS Sonoma 14.0 Beta (`23A5257q`) with Safari version 17.0
(`19616.1.14.11.11`). It probably doesn't matter, but the testing device was a
13-inch, M1, 2020 MacBook Pro.

## Install experience

On macOS Sonoma, you can add a website—any website, not just apps with a
manifest—to your Dock. Go to the **Share** icon and click **Add to Dock**, or
use the menu item **File > Add to Dock**.

![Adding an app via the Share icon.](/images/webappsonmacos--u0q7vo9587s.png)

_Adding an app via the **Share** icon._

![Adding an app via the File menu.](/images/webappsonmacos--9zgyksdtzr.png)

_Adding an app via the **File** menu._

You can adjust the name and icon if desired. The URL is the URL you're on for
pages without a manifest, or the `start_url` for pages with a manifest. It can't
be changed. For pages without an icon, Safari will create a fallback icon based on the first letter of the page's title.

**👀 Observation:** Unlike on iOS/iPadOS, you can't add the same app twice,
unless you rename it.

![App name and icon are adjustable, the URL is not.](/images/webappsonmacos--jbz4jqyyylc.png)

_App name and icon are adjustable, the URL is not._

The web app icon then appears in your Dock. Maskable icons are supported, and
the typical macOS squircle shape is respected. Closing all windows of an app
leaves the app running, aligned with macOS UX paradigms.

**👀 Observation:** Unlike on Chrome, the app doesn't launch immediately and
"morph" from in-tab to in-app, but instead you remain on the tab and need to
launch the app manually.

![Web app added to the Dock.](/images/webappsonmacos--1iikfvhhzcr.png)

_Web app added to the Dock._

## Launch experience

The out-of-the box launch experience of web apps is fantastic. Nowhere does it
give away that this is a web app. For apps with a manifest, there's no Safari UI
whatsoever, and the expectation is that such apps are single-page apps that
provide their own navigation controls. If an app is well made, lay persons
probably wouldn't be able to tell that something is a web app.

![Web app running without any Safari UI.](/images/webappsonmacos--hysefdcnykc.png)

_Web app running without any Safari UI._

**👀 Observation:** Different from iOS/iPadOS, credentials in cookies are copied
over, so if you were logged in when running in the tab, you're logged in when
you launch the app. No other storage means apart from cookies are copied. _"When a user adds a website to their Dock, Safari will copy the website's cookies to the web app. That way, if someone is logged into their account in Safari, they will remain logged in within the web app. This will only work if the authentication state is stored within cookies. Safari does not copy over any other kind of local storage. After a user adds a web app to the Dock, no other website data is shared, which is great for privacy"._

**👀 Observation:** Web Inspector (DevTools) is blocked, even with the **Show features for web developers** checkbox checked. There's no **Develop** menu item nor can you right-click and **Inspect Element**. This looks like a conscious decision.

**👀 Observation:** Extensions don't run and likewise aren't displayed. Also
probably a conscious decision. If a user navigates to an already installed app
in Safari, a prompt is displayed that invites the user to **Open in web app**.

![Prompt inviting the user to Open in web app.](/images/webappsonmacos--k85cr23x5v.png)

_Prompt inviting the user to **Open in web app**._

## macOS integration experience

Web apps on Mac let you focus on the websites you use all the time, separate
from the rest of your browsing. Like all Mac apps, web apps work great with
Stage Manager, Mission Control, and keyboard shortcuts like Command + Tab. Web
apps can be opened from the Dock, Launchpad, and Spotlight Search.

![Multitasking experience.](/images/webappsonmacos--6e18tk2ywgl.png)

_Multitasking experience._

![Spotlight search experience.](/images/webappsonmacos--gyygf94lo0l.png)

_Spotlight search experience._

![Launchpad experience.](/images/webappsonmacos--cwy5ftpy4qi.png)

_Launchpad experience._

![Stage Manager experience.](/images/webappsonmacos--wg589k8r7mh.png)

_Stage Manager experience._

![All web apps have an About dialog.](/images/webappsonmacos--n1elzn6cq9n.png)

_All web apps have an **About** dialog._

## Settings and permissions

Web apps work with AutoFill credentials from iCloud Keychain and from
third-party apps that have adopted the
[Credential Provider Extension API](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_authentication-services_autofill-credential-provider).
Users can grant permission to a web app to use their camera, microphone and
location in the same way they grant such permissions to other Mac apps through
system prompts and the Privacy & Security section of System Settings.

![System settings with Camera permissions.](/images/webappsonmacos--2rirguybc3w.png)

_System settings with Camera permissions._

Web apps on Mac support
[web push](https://developer.apple.com/documentation/usernotifications/sending_web_push_notifications_in_web_apps_safari_and_other_browsers?language=objc),
[badging](https://webkit.org/blog/14112/badging-for-home-screen-web-apps/), and
all the usual web standards implemented by WebKit, just like web apps
[on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

**👀 Observation:** There seems to be a bug where the hosting Web App appears as
the app requesting the Notifications permission. Notifications then work as
expected, though, including using the correct icon.

![Notifications permission prompt with the wrong app name and icon.](/images/webappsonmacos--f4adwfi8t1t.png)

_Notifications permission prompt with the wrong app name and icon._

Web apps have their own **Settings** dialog. In **General**, the app name and
icon can be changed and navigation controls can be toggled on or off. The
[theming behavior of the title bar](https://developer.apple.com/documentation/safari-release-notes/safari-15-release-notes#:~:text=Added%20support%20for%20the%20theme%2Dcolor%20meta%20tag%20to%20change%20the%20tab%20bar%20background%20and%20over%2Dscroll%20area%20in%20macOS%20and%20iPadOS%2C%20and%20the%20status%20bar%20in%20iOS.)
can be changed, too.

**👀 Observation:** navigation controls are toggled off when there's a manifest
with `"display": "standalone"`. In all other cases, even if a manifest exists
but with a different `"display"` mode,

![Web app Settings dialog on the General tab.](/images/webappsonmacos--kgsu98ksrqf.png)
_Web app **Settings** dialog on the **General** tab._

With navigation controls enabled, there's an **Open in Safari** icon in the
upper right corner. Despite its label, it actually respects the user's default
browser.

![Open in Safari icon.](/images/webappsonmacos--c95fwgkg6e9.png)

_**Open in Safari** icon._

Web pages get navigation affordances in the form of a back and forward button.
There's no reload button.

![Back and forward buttons.](/images/webappsonmacos--f5jaczcwma.png)

_Back and forward buttons._

**👀 Observation:** with navigation controls toggled to off, the title of the
web app sourced from the manifest is not shown. With navigation controls toggled
to on, the title sourced from the `<title>` is shown.

The **Privacy** tab allows the user to clear website data and links into the
**Privacy & Security Settings** of the System Settings app.

![Web app Settings dialog on the Privacy tab.](/images/webappsonmacos--f37x3wpvl5.png)

_Web app **Settings** dialog on the **Privacy** tab._

## Technical analysis

All apps are stored in `~/Applications/`. The package contents of each apps are:

- a `_CodeSignature` folder with code signature metadata
- a `Resources` folder with just the app icons as a single
  `ApplicationIcon.icns` file
- an `Info.plist` file.

![The package contents of an app.](/images/webappsonmacos--oekactyqlf.png)

_The package contents of an app._

The `Info.plist` file interestingly contains an XML version of key parts of the
manifest and metadata about the app.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>CFBundleIconFile</key>
    <string>ApplicationIcon</string>
    <key>CFBundleIdentifier</key>
    <string
      >com.apple.Safari.WebApp.svgco.de.53298B34-AF7F-4074-9CA9-1EE46B7E3E83</string
    >
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>SVGcode</string>
    <key>CFBundlePackageType</key>
    <string>AAPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleSupportedPlatforms</key>
    <array>
      <string>MacOSX</string>
    </array>
    <key>CFBundleURLTypes</key>
    <array>
      <dict>
        <key>CFBundleURLSchemes</key>
        <array>
          <string>x-webkit-app-launch</string>
        </array>
        <key>LSHandlerRank</key>
        <string>None</string>
      </dict>
    </array>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
    <key>LSTemplateApplication</key>
    <true />
    <key>LSTemplateApplicationParameters</key>
    <dict>
      <key>CFBundleIdentifier</key>
      <string>com.apple.Safari.WebApp</string>
      <key>TemplateAppUUID</key>
      <string>53298B34-AF7F-4074-9CA9-1EE46B7E3E83</string>
      <key>defaultarguments</key>
      <true />
      <key>teamIdentifier</key>
      <string></string>
    </dict>
    <key>Manifest</key>
    <dict>
      <key>description</key>
      <string
        >SVGcode is a Progressive Web App that lets you convert raster images
        like JPG, PNG, GIF, WebP, AVIF, etc. to vector graphics in SVG
        format.</string
      >
      <key>display</key>
      <string>standalone</string>
      <key>icons</key>
      <array>
        <dict>
          <key>purpose</key>
          <string>maskable</string>
          <key>sizes</key>
          <string>1024x1024</string>
          <key>src</key>
          <string>https://svgco.de/favicon.png</string>
          <key>type</key>
          <string>image/png</string>
        </dict>
        <dict>
          <key>purpose</key>
          <string>any</string>
          <key>sizes</key>
          <string>150x150</string>
          <key>src</key>
          <string>https://svgco.de/favicon.svg</string>
          <key>type</key>
          <string>image/svg+xml</string>
        </dict>
        <dict>
          <key>purpose</key>
          <string>monochrome</string>
          <key>sizes</key>
          <string>150x150</string>
          <key>src</key>
          <string>https://svgco.de/favicon-bw.svg</string>
          <key>type</key>
          <string>image/svg+xml</string>
        </dict>
      </array>
      <key>name</key>
      <string>SVGcode</string>
      <key>scope</key>
      <string>https://svgco.de</string>
      <key>short_name</key>
      <string>SVGcode</string>
      <key>start_url</key>
      <string>https://svgco.de/</string>
      <key>theme_color</key>
      <string>#ffffff</string>
    </dict>
    <key>WKPushBundleMetadata</key>
    <dict>
      <key>manifestId</key>
      <string>https://svgco.de/</string>
    </dict>
  </dict>
</plist>
```

Similar to iOS/iPadOS, web apps run in the context of a separate process called
`Web App.app`, which resides in
`/System/Volumes/Preboot/Cryptexes/App/System/Library/CoreServices/Web App.app`.

**👀 Observation:** Separating Safari and Web App allows both to run
independently. You can open a Web app without opening Safari, you can close
Safari without all web apps closing.

![The Web App.app app in Finder.](/images/webappsonmacos--3cd4wjo74qu.png)

_The `Web App.app` app in Finder._

Each web app runs as its own process of kind `Web`, accompanied by a number of
helper processes of kind `Apple`. They can all be seen in Activity Monitor.

![Activity Monitor showing all processes associated with a web app.](/images/webappsonmacos--cln1h5jyf1.png)

_Activity Monitor showing all processes associated with a web app._

## Wish list for Apple

(Also see [Most wanted PWA features on iOS/iPadOS/macOS Safari](https://docs.google.com/document/d/1chkEulpKBNQQfGIgTfQSbJhjw5mtZhvE47PF4tyTEXc/edit#).)

- Add support for the
  [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API),
  so users can install apps and edit files directly, rather than opening them
  and then downloading a copy.
  [[🧭 231706](https://bugs.webkit.org/show_bug.cgi?id=231706)]
- Add support for
  [`DataTransferItem.getAsFileSystemHandle()`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFileSystemHandle),
  so users can drag and drop files into web apps and edit the file.
  [[🧭 257792](https://bugs.webkit.org/show_bug.cgi?id=257792)]
- Add support for the
  [Web Share Target API](https://developer.chrome.com/articles/web-share-target/),
  so you can share data to installed web apps.
  [[🧭 194593](https://bugs.webkit.org/show_bug.cgi?id=194593)]
- Let web apps programmatically trigger the **Add to Dock** flow, since the
  **Share** icon and the **File** menu install ways are hard to discover.
  [[🧭 255716](https://bugs.webkit.org/show_bug.cgi?id=255716)]
- Add support for the
  [Window Controls Overlay API](https://developer.mozilla.org/en-US/docs/Web/API/Window_Controls_Overlay_API),
  so the gorgeous current experience can be made even more gorgeous.
  [[🧭 257782](https://bugs.webkit.org/show_bug.cgi?id=257782)]

![Spotify native app title bar experience.](/images/webappsonmacos--4dq3oazo75q.png)

_Spotify native app title bar experience._

![Spotify web app title bar experience.](/images/webappsonmacos--9bwtu16pbtv.png)

_Spotify web app title bar experience._

- Add support for the
  [File Handling API](https://github.com/WICG/file-handling/blob/main/explainer.md),
  so web apps can open files from Finder by double click if the web app is
  registered as the default file handler for a given file type, or by right
  click and then **Open with** if the web app can handle a file type, but isn't
  the default file handler.
  [[🧭 257783](https://bugs.webkit.org/show_bug.cgi?id=257783)]
- Add support for the
  [Launch Handler API](https://developer.mozilla.org/en-US/docs/Web/API/Launch_Handler_API),
  so web apps can decide how they want to handle launch events.
  [[🧭 257785](https://bugs.webkit.org/show_bug.cgi?id=257785)]
- Reflect the cookie-copying logic on iOS/iPadOS. It's a very frustrating
  experience if you have to log in twice, even more so if two-factor
  authentication is involved.
  [[🧭 257786](https://bugs.webkit.org/show_bug.cgi?id=257786)]
- Allow users to turn off the **Open in web app** prompt.

## Recommendations for Chrome

- Better respect macOS' design paradigms. Currently web app icon handling looks
  not integrated and icon shapes are all over the place. The examples below are
  all web apps installed via Chrome.

![Web app icon shapes installed from Chrome don't respect the squircle.](/images/webappsonmacos--pp6i6yqgm9l.png)

_Web app icon shapes installed from Chrome don't respect the squircle._

- Move the extension puzzle piece and the Window Controls Overlay chevron into
  the three dots menu. Web apps can look so much cleaner without both in plain
  sight.

![Window Controls Overlay chevron and extension puzzle piece clutter the UI of
Chrome-installed apps.](/images/webappsonmacos--gqdtdnumc98.png)

_Window Controls Overlay chevron and extension puzzle piece clutter the UI of
Chrome-installed apps._

## New Fugu API needs

With Chrome and Safari now allowing web apps to be installed on macOS, it would
be fantastic if installed apps could respect macOS UX guidelines and populate
the system-level menu. Ideally Apple and Google engage jointly on the
corresponding Project Fugu 🐡 API request tracked in
[crbug/1295253](https://crbug.com/1295253).

![Web app default menu.](/images/webappsonmacos--gg6jy7x6mg.png)

_Web app default menu._

## Conclusion

Web apps in macOS Sonoma 14 Beta seamlessly integrate into the macOS experience,
with no or very little visible Safari UI and with support for various operating
system features. There is an enormous potential for web apps on macOS to
succeed, and if Apple only works on a third of the items on my wish list, the
potential is even bigger.

## Related links

- [News from WWDC23: WebKit Features in Safari 17 beta](https://webkit.org/blog/14205/news-from-wwdc23-webkit-features-in-safari-17-beta/#web-apps)
- [What's new in web apps](https://developer.apple.com/videos/play/wwdc2023/10120/)
