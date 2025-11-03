---
layout: layouts/post.njk
title: 'Running Node.js in a Hugging Face Space'
author: 'Thomas Steiner'
date: '2025-11-03T06:19:54'
permalink: 2025/11/03/running-nodejs-in-a-hugging-face-space/index.html
tags:
  - Technical
---

Like many developers, I was bummed when I learned about the
[shutdown of Glitch](https://blog.glitch.com/post/changes-are-coming-to-glitch).
While [GitHub Pages](https://pages.github.com/) works great for web apps that
don't need a server, I struggled with finding a drop-in replacement for hosting
server-based apps, and specifically apps using Node.js. Until I found out about
[Hugging Face Spaces](https://huggingface.co/docs/hub/spaces) and that it
supports Docker, which allowed me to create an **evergreen template for running
Node.js in a Hugging Face Space**.

<div style="text-align: center">
  <img src="/images/huggingface-logo.svg" width="95" height="88" alt="Hugging Face">
  <span style="font-size: 4rem; transform: translateY(-10px); display: inline-block;">♥️</span>
  <img src="/images/nodejs-mascot.svg" width="680" height="800" style="height: 88px; width: auto;" alt="Node.js">
</div>

- If all you want is a quick way to fire up your own Space-hosted Node.js
  server, click
  [Duplicate this Space](https://huggingface.co/spaces/tomayac/nodejs-template?duplicate=true).
- If you want to know how the sausage is made or create your own template, read
  on.

## Create a Hugging Face Space

This assumes that you have a (free or paid)
[account on Hugging Face](https://huggingface.co/join). Go to your profile and
[create a new Hugging Face Space](https://huggingface.co/new-space) using
**Docker** as the Space SDK. Go for the **Blank** Docker template. Leave all the
other settings unchanged, so you end up on the free tier. Choose if your Space
should be private or public.

## An evergreen template

The objective is to make this template evergreen, so no concrete version numbers
are hardwired. Instead, the idea is to hardwire the version numbers when you
duplicate the template to create a permanent Space.

### Create a `package.json` file

Next, create the `package.json` file that your template should use. Note that
this uses `"latest"` as the Express.js version, as the template is meant to stay
evergreen.

```json
{
  "name": "nodejs-template",
  "version": "0.0.1",
  "description": "A template for running Node.js in a Hugging Face Space.",
  "keywords": ["Node", "Node.js", "Hugging Face Space"],
  "repository": {
    "type": "git",
    "url": "git@hf.co:spaces/tomayac/nodejs-template"
  },
  "license": "Apache-2.0",
  "author": "Thomas Steiner (tomac@google.com)",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "latest"
  }
}
```

### Create a `Dockerfile`

As the next step, create a `Dockerfile` for your template. Again I'm using an
evergreen approach here with a Node.js Docker tag of `lts-alpine`, which means I
always get the LTS release of Node.js running on the lightweight Alpine Linux.

```docker
# Node base image
FROM node:lts-alpine

# Switch to the "node" user
USER node

# Set home to the user's home directory
ENV HOME=/home/node PATH=/home/node/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Moving file to user's home directory
ADD . $HOME/app

# Copy the current directory contents into the container at $HOME/app setting the owner to the user
COPY --chown=node . $HOME/app

# Loading Dependencies
RUN npm install

# Expose application's default port
EXPOSE 7860

# Entry Point
ENTRYPOINT ["nodejs", "./index.js"]
```

### Create an `index.js` file

Up next, create your default `index.js` file that your template should use when
the Node.js server starts. I went with the battle-proven Express.js server
framework. Note that the port needs to be `7860`.

Now for the smart part: The code dynamically reads out the used Express.js and
Node.js version, so when you duplicate the template, you can hard-wire these
versions. After duplicating the template, in your code, update the highlighted
parts:

- In your `Dockerfile`, replace <code>node:<strong>lts</strong>-alpine</code>
  with, for example, <code>node:<strong>24</strong>-alpine</code>.
- In your `package.json` file, replace <code>"express":
  "<strong>latest</strong>"</code> with, for example, <code>"express":
  "^<strong>5.1.0</strong>"</code>.

```js
import express from 'express';

const app = express();
const port = 7860;

app.get('/', async (req, res) => {
  res.send(
    `Running Express.js ${
      (
        await import('express/package.json', {
          with: { type: 'json' },
        })
      ).default.version
    } on Node.js ${process.version.split('.')[0].replace('v', '')}`
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

### Create a `REAMDE.md` file

To set some metadata for your template, create a `README.md` file with YAML
front matter at the beginning. Hugging Face makes this easy via its Web
interface for the standard parameters, but you can modify
[many more parameters](https://huggingface.co/docs/hub/spaces-config-reference)
as per the documentation.

```md
---
license: apache-2.0
title: Node.js template
sdk: docker
emoji: 🐢
colorFrom: green
colorTo: green
short_description: A template for running Node.js in a Hugging Face Space
---
```

## What's missing?

While you can edit files individually on Hugging Face's Space
[Files](https://huggingface.co/spaces/tomayac/nodejs-template/tree/main) view
with syntax highlighting and editing support, it's not a full-blown IDE, but you
can clone your Space with `git` and work on it locally (or with an online IDE
like [VS Code](https://vscode.dev/)).

```bash
git clone git@hf.co:spaces/tomayac/nodejs-template
```

## See it live and bonus

And this is it really. Now you have a running Node.js app that you can
[duplicate](https://huggingface.co/spaces/tomayac/nodejs-template?duplicate=true)
whenever you need to spin up a Node.js server. The best is that this Space runs
in its own main browser context,
[`https://tomayac-nodejs-template.hf.space/`](https://tomayac-nodejs-template.hf.space/)
in the concrete case, not somewhere in an iframe, which means you can set
headers like
[`COOP`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy)
or
[`COEP`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy)
to get access to powerful features like
[`SharedArrayBuffer` and friends](https://web.dev/articles/why-coop-coep). In
fact, Hugging Face even allows you to set these
<a href="https://huggingface.co/docs/hub/spaces-config-reference#:~:text=)%20is%20acceptable.-,custom_headers,-%3A%20Dict%5Bstring">`custom_headers`</a>
by default in the YAML front matter config at the beginning of the `README.md`.
Note, though, that adding these headers means your app will only run in
standalone mode, but no longer in the default Space iframed view.

```yaml
custom_headers:
  cross-origin-embedder-policy: require-corp
  cross-origin-opener-policy: same-origin
  cross-origin-resource-policy: cross-origin
```

Happy hacking!
