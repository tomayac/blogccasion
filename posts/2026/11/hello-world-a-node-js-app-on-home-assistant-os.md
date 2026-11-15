---
layout: layouts/post.njk
title: 'Hello world: a Node.js app on Home Assistant OS'
author: 'Thomas Steiner'
date: '2026-11-15T12:00:00'
permalink: 2026/11/15/hello-world-a-node-js-app-on-home-assistant-os/index.html
tags:
  - Technical
  - Node.js
  - Home Automation
---

[Home Assistant OS](https://www.home-assistant.io/installation/) is an
appliance. There's no Node.js on it, no `npm`, and no way to install either on
the host. Everything that runs on it, Home Assistant itself included, runs in a
Docker container managed by the Home Assistant Supervisor. Home Assistant calls
these containers _apps_ (formerly _add-ons_), and one that you build from a
folder on the box itself is a _local app_.

My [Enphase Solar](https://github.com/tomayac/enphase-solar) app, a small
Node.js server that streams the live production and consumption data of my solar
panels, runs as such a local app and shows up right on my dashboard. I set it up
once, and of course I forgot all the details as soon as it worked. This post
documents the "hello world" version of the setup, so future me (and maybe you)
can get any Node.js app running on Home Assistant OS and show it on a dashboard.

## The approach

The setup has two parts:

- **The app** lives in its own GitHub repository. It's a regular Node.js app
  that you can develop and run on your laptop with `npm start`.
- **A wrapper** of three small files lives on Home Assistant. It describes the
  container, and its startup script clones the app from GitHub, installs its
  dependencies, and starts it.

Since the wrapper fetches the app's latest code every time the app starts,
updating the app is a `git push` followed by a restart of the app in Home
Assistant. The wrapper itself hardly ever changes, so you can reuse it for any
Node.js app.

## The hello world app

The hello world app is an [Express](https://expressjs.com/) server that prints a
configurable greeting and the state of the `sun.sun` entity, which every Home
Assistant installation has. It consists of a `package.json` file:

```json
{
  "name": "hello-node",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.2.1"
  }
}
```

And a `server.js` file:

```js
import express from 'express';

const {
  GREETING = 'Hello, world',
  PORT = 3000,
  HOST = '0.0.0.0',
  SUPERVISOR_TOKEN,
} = process.env;

const app = express();

app.get('/', async (req, res) => {
  let sun = 'unknown';
  try {
    const response = await fetch('http://supervisor/core/api/states/sun.sun', {
      headers: { Authorization: `Bearer ${SUPERVISOR_TOKEN}` },
    });
    sun = (await response.json()).state;
  } catch (error) {
    console.error('Could not reach Home Assistant:', error.message);
  }
  res.send(`<!doctype html>
<title>Hello Node</title>
<meta name="color-scheme" content="dark light">
<h1>${GREETING}</h1>
<p>The sun is <strong>${sun}</strong>.</p>`);
});

app.listen(PORT, HOST, () => console.log(`Listening on ${HOST}:${PORT}`));
```

Run `npm install` once to create a `package-lock.json` file, and push all three
files to a GitHub repository. Locally, `npm start` runs the app at
`http://localhost:3000/`, where the sun is `unknown`, since there's no Home
Assistant to ask. The app reads all its settings from environment variables, and
it listens on `0.0.0.0`. The latter matters in a container: an app that only
listens on `localhost` is unreachable from outside the container.

## The container environment

Before looking at the wrapper, it helps to know what the Supervisor gives your
container:

- **An image built on the box.** The Supervisor runs `docker build` on your Home
  Assistant device, so the image matches the device's CPU architecture.
- **Configuration in `/data/options.json`.** Whatever you enter on the app's
  **Configuration** tab ends up as JSON in this file.
- **Persistent storage in `/data`.** The Supervisor recreates the container
  every time the app starts, so everything outside of `/data` is gone after a
  restart.
- **Its own network.** Ports you list in the configuration get mapped to the
  host, which makes them reachable from your LAN. Outgoing connections, for
  example to devices on your LAN or to GitHub, work without any extra setup.
- **Access to Home Assistant.** On request, the Supervisor injects a
  `SUPERVISOR_TOKEN` environment variable, and the Home Assistant REST API is
  available at `http://supervisor/core/api/`.
- **Logs from standard output.** Whatever your app writes to `stdout` and
  `stderr` shows up on the app's **Log** tab.

## The wrapper

The wrapper is a folder in the `/addons` directory of your Home Assistant:

```text
/addons/hello_node/
├── config.yaml
├── Dockerfile
└── run.sh
```

### `config.yaml`

The `config.yaml` file describes the app to the Supervisor: what it's called,
which CPU architectures it supports, which ports it exposes, and which options
it has.

```yaml
name: Hello Node
version: '1.0.0'
slug: hello_node
description: A Node.js app cloned from GitHub.
arch:
  - aarch64
  - amd64
startup: application
boot: auto
ports:
  3000/tcp: 3000
ports_description:
  3000/tcp: Web interface
webui: http://[HOST]:[PORT:3000]/
homeassistant_api: true
options:
  repository: https://github.com/your-name/hello-node.git
  ref: main
  greeting: Hello, world
schema:
  repository: url
  ref: str
  greeting: str
```

A few of these deserve a word:

- `slug` is the app's ID. Home Assistant prefixes the slug of local apps with
  `local_`, so this app ends up as `local_hello_node`.
- `ports` maps port `3000` in the container to port `3000` on the host. You can
  change the host port on the app's **Configuration** tab later.
- `webui` adds an **Open web UI** button to the app's page.
- `homeassistant_api: true` gives the app the `SUPERVISOR_TOKEN` for the Home
  Assistant API. This saves you from creating a
  [long-lived access token](https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token)
  and hardcoding the IP address of your Home Assistant in the app.
- `options` are the defaults that show up on the **Configuration** tab, and
  `schema` declares their types. `repository` and `ref` tell the wrapper which
  app to run, and every other option is for the app itself. For secrets, use the
  `password` type, which masks the value in the user interface.

### `Dockerfile`

The `Dockerfile` builds on the Home Assistant base image, an Alpine Linux image
that the Home Assistant project keeps up to date for all supported
architectures. It adds Node.js, `npm`, and `git` from Alpine's package
repository and copies the startup script.

```dockerfile
FROM ghcr.io/home-assistant/base:latest

RUN apk add --no-cache git nodejs npm

COPY run.sh /
RUN chmod a+x /run.sh

ENTRYPOINT []
CMD ["/run.sh"]
```

The `ENTRYPOINT []` line needs an explanation. Every container needs an init
process that forwards the stop signal to the app and cleans up exited child
processes. By default, the Supervisor starts apps with Docker's built-in,
lightweight init process. The Home Assistant base image brings its own init
system, [s6-overlay](https://github.com/just-containers/s6-overlay), as its
entrypoint, and s6-overlay refuses to start unless it's the very first process.
Clearing the entrypoint removes s6-overlay from the picture and leaves the job
to Docker's init process, which is all a single Node.js process needs.

### `run.sh`

The startup script does the actual work. It turns the options into environment
variables, fetches the app from GitHub, installs the dependencies if needed, and
starts the app.

```bash
#!/bin/sh
set -e

# Export every option from the Configuration tab as an environment variable
# with an uppercase name, for example `greeting` as `GREETING`.
eval "$(node <<'JS'
const options = require('/data/options.json');
for (const [key, value] of Object.entries(options)) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  console.log('export ' + key.toUpperCase() + "='" +
    text.replaceAll("'", "'\\''") + "'");
}
JS
)"

# The checkout lives in `/data`, the only folder that survives restarts.
mkdir -p /data/app
cd /data/app
[ -d .git ] || git init --quiet
git remote remove origin 2>/dev/null || true
git remote add origin "$REPOSITORY"

# Get the latest commit of `REF`, which can be a branch or a tag. Without
# a network connection, run whatever was checked out last time.
if git fetch --quiet --depth 1 origin "$REF"; then
  git reset --quiet --hard FETCH_HEAD
  echo "Running $REPOSITORY at $REF ($(git rev-parse --short HEAD))"
elif git rev-parse --quiet --verify HEAD > /dev/null; then
  echo "Could not fetch $REPOSITORY, running the previous checkout"
else
  echo "Could not fetch $REPOSITORY, and there is no previous checkout"
  exit 1
fi

# Install the dependencies only when they changed since the last start.
LOCK=package-lock.json
[ -f "$LOCK" ] || LOCK=package.json
if [ ! -d node_modules ] || ! cmp -s "$LOCK" /data/installed.lock; then
  echo "Installing dependencies"
  if [ -f package-lock.json ]; then npm ci; else npm install; fi
  cp "$LOCK" /data/installed.lock
fi

npm run build --if-present
exec npm start
```

Some details worth pointing out:

- Node.js is already in the image, so a few lines of JavaScript do the JSON
  parsing. The single quotes around each value, with any single quotes inside it
  escaped, make sure that values with spaces, quotes, or dollar signs arrive
  unchanged.
- Since the checkout lives in `/data/app`, a restart only needs to fetch the
  latest commit, and `npm ci` only runs when the lockfile changed. If GitHub is
  unreachable when Home Assistant boots, the app still starts with the code from
  last time.
- `npm run build --if-present` runs the app's `build` script if it has one, for
  example a [Vite](https://vite.dev/) build.
- `exec` replaces the shell with `npm`, which passes the stop signal on to
  Node.js, so the app shuts down right away when you stop it.
- If your app keeps state, it should write it to `/data`, outside of
  `/data/app`. The `git reset` on every start discards changes inside the
  checkout.

## Installing the app

The easiest way to get the wrapper onto Home Assistant is the
[Advanced SSH & Web Terminal](https://github.com/hassio-addons/app-ssh) app,
which has the `/addons` directory mounted. Open the terminal, create the folder,
and create the three files in it, for example with `nano`:

```bash
mkdir -p /addons/hello_node
cd /addons/hello_node
nano config.yaml
```

The Supervisor doesn't notice new local apps on its own. Go to **Settings** >
**Apps** > **App store**, open the three dot menu in the top right corner, and
click **Check for updates**. The app then shows up in a section called **Local
apps**. Click it, click **Install**, and wait while the Supervisor builds the
image.

Once it's installed, enter the URL of your GitHub repository on the
**Configuration** tab, start the app on the **Info** tab, and follow along on
the **Log** tab. The first start takes a while, since `npm ci` runs on the
device. As soon as the `Listening on 0.0.0.0:3000` line appears, **Open web UI**
takes you to the app at `http://homeassistant.local:3000/`.

## Updating

The three parts of the setup update in different ways:

- **The app** updates with every restart: push to GitHub, then click **Restart**
  on the app's **Info** tab. This is convenient, but it also means that whatever
  is on the branch goes live at the next restart, including after a reboot of
  Home Assistant. For an app you depend on, tag a known good version and set
  `ref` to the tag, for example `v1.0.0`. Updating is then a matter of changing
  the tag on the **Configuration** tab.
- **Node.js** and the base image are part of the container image, so they only
  change when the image gets built again, which happens when you click
  **Rebuild** on the app's **Info** tab.
- **The wrapper** needs a bump of `version` in `config.yaml` and another **Check
  for updates** before the Supervisor picks up changes to it.

Fetching code at startup is the pragmatic choice for a personal app on a single
box. Apps that you publish for others to install bake the code into the image
and ship a new image for every version, so each version is reproducible.

## Showing the app on the dashboard

To put the app on a dashboard, use the
[Webpage card](https://www.home-assistant.io/dashboards/iframe/), which is an
`<iframe>` under the hood. Pointing it at `http://homeassistant.local:3000/`
works as long as you open Home Assistant over plain HTTP. If you open Home
Assistant over HTTPS, though, the browser blocks the plain HTTP iframe as
[mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content),
and the card stays empty. The app needs to be served over HTTPS, too.

I solved this with an extra hostname for the app and the
[NGINX Home Assistant SSL proxy](https://github.com/home-assistant/addons/tree/master/nginx_proxy)
app, which most likely already serves your Home Assistant over HTTPS if you
reach it from outside your home. The setup has three steps:

1. **A hostname.** Create a hostname for the app that points to your home's IP
   address, just like the one for Home Assistant. I use subdomains from
   [FreeDNS](https://freedns.afraid.org/), for example
   `enphase-solar.strangled.net` for my Enphase Solar app.
2. **A certificate.** Add the hostname to the `domains` list of the
   [Let's Encrypt](https://github.com/home-assistant/addons/tree/master/letsencrypt)
   app and run it once. I keep all my FreeDNS hostnames in a single certificate.
3. **A server block.** On the NGINX app's **Configuration** tab, enable
   `customize`, which makes it load every file that matches
   `/share/nginx_proxy/*.conf`. Then create such a file, for example
   `/share/nginx_proxy/hello-node.conf`, with a server block that forwards the
   new hostname to the app's port:

```nginx
server {
  server_name hello-node.example.com;
  listen 80;
  return 301 https://$host$request_uri;
}

server {
  server_name hello-node.example.com;
  listen 443 ssl;
  http2 on;

  ssl_certificate /ssl/fullchain.pem;
  ssl_certificate_key /ssl/privkey.pem;
  ssl_dhparam /data/dhparams.pem;

  proxy_buffering off;
  include /share/nginx_proxy_default*.conf;

  location / {
    proxy_pass http://homeassistant.local.hass.io:3000;
    proxy_set_header Host $http_host;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

`homeassistant.local.hass.io` is the address at which the NGINX app reaches the
ports of the Home Assistant host. `proxy_buffering off` makes NGINX pass
responses on as they arrive, which streaming responses like the
[server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
of my Enphase Solar app depend on. The `Upgrade` and `Connection` headers do the
same for WebSockets. After restarting the NGINX app, the app is available at
`https://hello-node.example.com/`.

Now edit the dashboard, add a Webpage card, and point it at the new URL. In
YAML, the card looks like this:

```yaml
type: iframe
url: https://hello-node.example.com/
aspect_ratio: 50%
```

The `aspect_ratio` sets the card's height relative to its width. If the app
needs browser features that iframes only get on request, the `allow` option sets
the iframe's
[`allow` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#allow).
My Enphase Solar card has `allow: usb`, since the app talks to a
[WebLight](https://github.com/sowbug/weblight) via WebUSB. Express doesn't send
an `X-Frame-Options` header or a `frame-ancestors` content security policy by
default, so the app allows being framed out of the box.

## From hello world to a real app

To run your own Node.js app, point `repository` at your app's repository and add
your app's settings to `options` and `schema`. Since the wrapper uppercases the
option names, an app that reads `LOCAL_IP` and `PASSWORD` from a `.env` file via
[`dotenv`](https://www.npmjs.com/package/dotenv) gets them from options named
`local_ip` and `password`. In the container, there's no `.env` file, so the app
uses the environment variables as they are. This way, the same app runs
unchanged on Home Assistant and on your laptop.
