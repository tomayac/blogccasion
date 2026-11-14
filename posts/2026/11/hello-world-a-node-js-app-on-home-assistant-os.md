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

[Home Assistant OS](https://www.home-assistant.io/installation/) is an
appliance. There's no Node.js on it, no `npm`, and no way to install either on
the host. Everything that runs on it, Home Assistant itself included, runs in a
Docker container managed by the Home Assistant Supervisor. So if you want to run
your own Node.js app on the box, like I do with my
[Enphase Solar](https://github.com/tomayac/enphase-solar) app, you need to wrap
it in a container that the Supervisor builds and runs for you. Home Assistant
calls these containers _apps_ (formerly _add-ons_), and one that you build from
a folder on the box itself is a _local app_.

I set this up once, and of course I forgot all the details as soon as it worked.
This post documents the "hello world" version, so future me (and maybe you) can
get any Node.js app running on Home Assistant OS and show it on a dashboard.

## The container environment

Before looking at the files, it helps to know what the Supervisor gives your
container, since this is what your app has to work with:

- **An image built on the box.** The Supervisor runs `docker build` on your Home
  Assistant device, so the image is automatically built for the device's CPU
  architecture. Any multi-arch base image works, including the official
  [`node`](https://hub.docker.com/_/node) image.
- **Configuration in `/data/options.json`.** Whatever you enter on the app's
  **Configuration** tab ends up as JSON in this file.
- **Persistent storage in `/data`.** Everything else in the container is
  ephemeral and gets thrown away when the app is rebuilt or updated. Only
  `/data` survives, so this is where your app keeps its state.
- **Its own network.** Apps run on an internal Docker network. Ports you list in
  the configuration get mapped to the host, which makes them reachable from your
  LAN. Outgoing connections, for example to devices on your LAN or to cloud
  APIs, work without any extra setup.
- **Logs from standard output.** Whatever your app writes to `stdout` and
  `stderr` shows up on the app's **Log** tab.
- **An init process.** By default, the Supervisor starts the container with
  Docker's `--init` flag, so a tiny init process forwards the stop signal to
  your app and reaps zombie processes.

## The files

A local app is a folder in the `/addons` directory of your Home Assistant. For
the hello world app, it looks like this:

```text
/addons/hello_node/
├── config.yaml
├── Dockerfile
├── run.sh
├── package.json
└── server.js
```

The first three files make up the container wrapper. The last two are the
Node.js app, and you can replace them with your own.

### `config.yaml`

The `config.yaml` file describes the app to the Supervisor: what it's called,
which CPU architectures it supports, which ports it exposes, and which options
it has.

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
options:
  greeting: Hello, world
schema:
  greeting: str
```

A few of these deserve a word:

- `slug` is the app's ID. Home Assistant prefixes the slug of local apps with
  `local_`, so this app ends up as `local_hello_node`.
- `ports` maps port `3000` in the container to port `3000` on the host. You can
  change the host port on the app's **Configuration** tab later.
- `webui` adds an **Open web UI** button to the app's page.
- `options` are the defaults that show up on the **Configuration** tab, and
  `schema` declares their types. The Supervisor validates the user's input
  against the schema before it writes `/data/options.json`.

### `Dockerfile`

The `Dockerfile` is a regular one. The official `node` image comes with Node.js
and `npm` preinstalled, and the Alpine variant keeps the image small, which
matters on a device with limited storage.

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js run.sh ./
RUN chmod a+x run.sh

CMD ["./run.sh"]
```

Copying `package.json` and installing the dependencies before copying the source
code lets Docker cache the dependency layer, so a rebuild after a code change
skips `npm install`. If your app has a `package-lock.json`, copy it, too, and
use `npm ci --omit=dev` for reproducible installs. If your app needs a build
step, for example with [Vite](https://vite.dev/), run it here as well.

### `run.sh`

This is the bootstrapping script I had forgotten about. The Supervisor hands the
app its configuration as a JSON file, while Node.js apps typically expect
environment variables, often from a `.env` file via
[`dotenv`](https://www.npmjs.com/package/dotenv). The script bridges the two: it
reads the options from `/data/options.json`, exports them as environment
variables, and then hands over to Node.js.

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

Three details matter here:

- Node.js is already in the image, so `node -p` does the JSON parsing, and
  there's no need to install [`jq`](https://jqlang.org/) just for this.
- `exec` replaces the shell with Node.js, so the stop signal reaches Node.js
  directly, and the app shuts down immediately when you stop it.
- The server needs to listen on `0.0.0.0`. If it only listens on `localhost`,
  it's unreachable from outside the container, and the port mapping has nothing
  to connect to.

Since an app that uses `dotenv` simply finds no `.env` file in the container, it
falls back to the environment variables from `run.sh`. This way, the same app
runs unchanged in the container and on your laptop during development.

### `package.json` and `server.js`

The app itself is a regular [Express](https://expressjs.com/) server. To show
the container environment in action, it greets you with the greeting from the
configuration and counts visits in a file in `/data`.

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
import { readFile, writeFile } from 'node:fs/promises';

const { GREETING, PORT, HOST } = process.env;

// Only `/data` survives restarts, rebuilds, and updates of the app.
const STATE_FILE = '/data/visits.json';

async function countVisit() {
  let visits = 0;
  try {
    visits = JSON.parse(await readFile(STATE_FILE, 'utf8')).visits;
  } catch {
    // No state yet on the very first run.
  }
  visits += 1;
  await writeFile(STATE_FILE, JSON.stringify({ visits }));
  return visits;
}

const app = express();

app.get('/', async (req, res) => {
  const visits = await countVisit();
  res.send(`<!doctype html>
<title>Hello Node</title>
<meta name="color-scheme" content="dark light">
<h1>${GREETING}</h1>
<p>Node.js ${process.version}, visit number ${visits}.</p>`);
});

app.listen(PORT, HOST, () => console.log(`Listening on ${HOST}:${PORT}`));
```

## Testing the container locally

Since the app is a regular Docker container, you can test it on your laptop
before copying anything to Home Assistant. Create a `data` folder with an
`options.json` file that mimics what the Supervisor would write, then build and
run the image much like the Supervisor does:

```bash
mkdir -p data
echo '{"greeting": "Hello from my laptop"}' > data/options.json
docker build -t local/hello_node .
docker run --rm --init -p 3000:3000 -v "$PWD/data:/data" local/hello_node
```

Open `http://localhost:3000/`, reload a couple of times, then stop and restart
the container. The visit counter keeps counting, since it lives in the mounted
`/data` folder.

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

The Supervisor doesn't notice new local apps on its own. Go to **Settings** >
**Apps** > **App store**, open the three dot menu in the top right corner, and
click **Check for updates**. The app then shows up in a section called **Local
apps**. Click it, click **Install**, and wait while the Supervisor builds the
image. On a small device, the first build can take a few minutes, since
`npm install` runs on the device.

Once it's installed, change the greeting on the **Configuration** tab if you
like, start the app on the **Info** tab, and check the **Log** tab for the
`Listening on 0.0.0.0:3000` line. **Open web UI** then takes you to the app at
`http://homeassistant.local:3000/`.

When you change `server.js` or the `Dockerfile` later, the app page has a
**Rebuild** button that rebuilds the image from the folder. Changes to
`config.yaml` need a bump of `version` and another **Check for updates** before
the Supervisor picks them up.

## Showing the app on the dashboard

To put the app on a dashboard, edit the dashboard, add a card, and pick the
[Webpage card](https://www.home-assistant.io/dashboards/iframe/). Under the
hood, it's an `<iframe>`. In YAML, the card looks like this:

```yaml
type: iframe
url: http://homeassistant.local:3000/
aspect_ratio: 50%
```

The `aspect_ratio` sets the card's height relative to its width.

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

## From hello world to a real app

To run your own Node.js app, replace `package.json` and `server.js` with your
app's files, add your app's settings to `options` and `schema` in `config.yaml`,
and export each of them in `run.sh` under the name your app expects. For my
Enphase Solar app, these are things like the IP address of the Envoy gateway and
the gateway's serial number. Everything else stays the same.
