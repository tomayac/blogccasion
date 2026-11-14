---
layout: layouts/post.njk
title: 'Hello world: a Node.js app on Home Assistant OS'
author: 'Thomas Steiner'
date: '2026-11-14T22:00:00'
permalink: 2026/11/14/hello-world-a-node-js-app-on-home-assistant-os/index.html
tags:
  - Technical
  - Node.js
  - Home Automation
---

For a while now, my [Enphase Solar](https://github.com/tomayac/enphase-solar)
app, a small Node.js server that streams the live production and consumption
data of my solar panels via
[server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events),
has been running on my [Home Assistant](https://www.home-assistant.io/) box and
shows up right on my dashboard. Setting it up was a one-time effort, and of
course I forgot all the details as soon as it worked. This post documents the
"hello world" version of the setup, so future me (and maybe you) can do it again
without having to piece it together from scratch.

The short version: Home Assistant OS runs everything in Docker containers, and
it lets you build your own container from a folder with three or four files in
it. Home Assistant calls these _apps_ (formerly _add-ons_), and an app that you
build from a local folder is a _local app_.

## The files

A local app is a folder in the `/addons` directory of your Home Assistant. The
folder name doesn't matter, but I keep it the same as the app's slug. For the
hello world app, it looks like this:

```text
/addons/hello_node/
├── config.yaml
├── Dockerfile
├── package.json
├── run.sh
└── server.js
```

### `config.yaml`

The `config.yaml` file tells Home Assistant what the app is called, which CPU
architectures it supports, which ports it exposes, and which options it has.

```yaml
name: Hello Node
version: '1.0.0'
slug: hello_node
description: A minimal Node.js app.
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
  greeting: Hello, world
schema:
  greeting: str
```

A few of these deserve a word:

- `slug` is the app's ID. Home Assistant prefixes the slug of local apps with
  `local_`, so this app ends up as `local_hello_node`.
- `ports` maps the container port `3000` to port `3000` on the host. This is
  what makes the app reachable at `http://homeassistant.local:3000/` from the
  rest of your network.
- `webui` adds an **Open web UI** button to the app's page.
- `homeassistant_api: true` gives the app a token to talk to the Home Assistant
  API (more on this below).
- `options` are the defaults for the app's **Configuration** tab, and `schema`
  declares their types. Whatever the user enters there ends up in
  `/data/options.json` inside the container.

### `Dockerfile`

Home Assistant builds the container image from the `Dockerfile` the first time
you install the app. Home Assistant has its own base images, but the official
`node` image works just as well and comes with Node.js and npm preinstalled.

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js run.sh ./
RUN chmod a+x run.sh

CMD ["./run.sh"]
```

### `run.sh`

This is the bootstrapping script I had forgotten about. Apps get their
configuration as a JSON file, while my Node.js apps expect environment
variables, typically from a `.env` file via
[`dotenv`](https://www.npmjs.com/package/dotenv). The script bridges the two: it
reads the options from `/data/options.json`, exports them as environment
variables, and then hands over to Node.js. Using `exec` makes Node.js replace
the shell, so it receives the stop signal directly when Home Assistant shuts
down the app.

```bash
#!/bin/sh
set -e

# Home Assistant writes the app's options to this file.
OPTIONS=/data/options.json

export GREETING="$(node -p "require('$OPTIONS').greeting")"
export PORT=3000
export HOST=0.0.0.0

exec node server.js
```

Node.js is already in the image, so `node -p` does the JSON parsing, and there's
no need to install [`jq`](https://jqlang.org/) just for this. Make sure the
server listens on `0.0.0.0` and not only on `localhost`, or the port mapping
won't reach it.

### `package.json` and `server.js`

The app itself is a regular [Express](https://expressjs.com/) server. To show
that the app can talk to Home Assistant, it reads the state of the `sun.sun`
entity, which every Home Assistant installation has.

```json
{
  "name": "hello-node",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "express": "^5.2.1"
  }
}
```

```js
import express from 'express';

const { GREETING, PORT, HOST, SUPERVISOR_TOKEN } = process.env;

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

Thanks to `homeassistant_api: true`, Home Assistant injects a `SUPERVISOR_TOKEN`
environment variable into the container, and the Home Assistant REST API is
available at `http://supervisor/core/api/`. This is nicer than what my Enphase
Solar app does right now, which is calling the API on the box's LAN IP address
with a
[long-lived access token](https://developers.home-assistant.io/docs/auth_api/#long-lived-access-token)
that I had to create and paste into its `.env` file.

## Copying the files to Home Assistant

The easiest way to get the files onto Home Assistant is the
[Advanced SSH & Web Terminal](https://github.com/hassio-addons/app-ssh) app,
which has the `/addons` directory mounted. Open the terminal, create the folder,
and create each file in it, for example with `nano`:

```bash
mkdir -p /addons/hello_node
cd /addons/hello_node
nano config.yaml
```

If you prefer working from your regular computer, the
[Samba share](https://github.com/home-assistant/addons/tree/master/samba) app
exposes the same directory as a network share named `addons`.

## Installing the app

Home Assistant doesn't notice new local apps on its own. Go to **Settings** >
**Apps** > **App store**, open the three dot menu in the top right corner, and
click **Check for updates**. The app then shows up in a section called **Local
apps**. Click it, click **Install**, and wait while Home Assistant builds the
image. On a small device, the first build can take a few minutes, since
`npm install` runs on the device.

Once it's installed, change the greeting on the **Configuration** tab if you
like, start the app on the **Info** tab, and check the **Log** tab for the
`Listening on 0.0.0.0:3000` line. **Open web UI** then takes you to the app.

When you change `server.js` or the `Dockerfile` later, the app page has a
**Rebuild** button that rebuilds the image from the folder. Changes to
`config.yaml` need a bump of `version` and another **Check for updates** before
Home Assistant picks them up.

## Showing the app on the dashboard

To put the app on a dashboard, edit the dashboard, add a card, and pick the
[Webpage card](https://www.home-assistant.io/dashboards/iframe/). Under the
hood, it's an `<iframe>`. In YAML, the card looks like this:

```yaml
type: iframe
url: http://homeassistant.local:3000/
aspect_ratio: 50%
```

The `aspect_ratio` sets the card's height relative to its width, which for my
Enphase Solar app is enough to show the current numbers and the sparklines
without scrolling.

One thing to watch out for is
[mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content).
If you open your Home Assistant via HTTPS, for example through
[Duck DNS](https://github.com/home-assistant/addons/tree/master/duckdns) and
[Let's Encrypt](https://github.com/home-assistant/addons/tree/master/letsencrypt),
the browser blocks an iframe that loads over plain HTTP, and the card stays
empty. In this case, the app needs to be served over HTTPS, too, for example
through a reverse proxy with its own hostname and certificate. The second
requirement is that the app allows being framed. Express doesn't send an
`X-Frame-Options` header or a `frame-ancestors` content security policy by
default, so this works out of the box. If you add middleware like
[Helmet](https://helmetjs.github.io/), you need to allow your Home Assistant's
origin explicitly.

## From hello world to the real thing

My Enphase Solar app builds on exactly these building blocks. It reads its
configuration (the IP address of the Envoy gateway, my Enlighten credentials,
the gateway's serial number, and so on) from environment variables, so a
`run.sh` that exports the app's options under the same names lets the app run
unchanged on Home Assistant and on my laptop, where the values come from a
`.env` file during development.
