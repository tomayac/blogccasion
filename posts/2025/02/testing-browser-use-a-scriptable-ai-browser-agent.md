---
layout: layouts/post.njk
title: 'Testing browser-use, a scriptable AI browser agent'
author: 'Thomas Steiner'
date: '2025-02-05T13:56:27'
permalink: 2025/02/05/testing-browser-use-a-scriptable-ai-browser-agent/index.html
tags:
  - Technical
---

I'm not a big LinkedIn user, but the other day, my Google colleague Franziska
Hinkelmann
[posted something](https://www.linkedin.com/posts/fhinkel_got-low-stakes-repetitive-tasks-in-the-browser-activity-7291114697339068419-rd3R?utm_source=share&utm_medium=member_desktop)
about a project called
[browser-use](https://github.com/browser-use/browser-use/) that caught my eye:

> Got low stakes repetitive tasks in the browser? Playwright + LLMs (Gemini 2.0)
> to the rescue! Super easy to make somebody else _cough_ agents _cough_ do the
> work for you, especially if you have to repeat a task for many rows in a
> Google Sheet.

After seeing her demo, I went and tried it out myself. Here are the steps that
worked for me on macOS:

1. Install `uv` following their
   [installation instructions](https://docs.astral.sh/uv/getting-started/installation/#standalone-installer).
   (The usual caveat of first checking the source code before pasting anything
   in the Terminal applies.)
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | less
   ```
1. Create a new Python environment and activate it. This is from browser-use's
   [quickstart](https://docs.browser-use.com/quickstart) instructions.
   ```bash
   uv venv --python 3.11
   source .venv/bin/activate
   ```
1. Install the dependencies and [Playwright](https://playwright.dev/).
   ```bash
   uv pip install browser-use
   playwright install
   ```
1. Create a `.env` file and add your OpenAI API key in the form
   `OPENAI_API_KEY=abc123`.
1. Create an `agent.py` file with the source code of your agent. Here's the one
   I tried. As you can see, I'm tasking the agent with the following job: _"Go
   to developer.chrome.com and find out what built-in AI APIs Chrome supports"._

   ```python
   from langchain_openai import ChatOpenAI
   from browser_use import Agent
   import asyncio
   from dotenv import load_dotenv
   load_dotenv()

   async def main():
       agent = Agent(
           task="Go to developer.chrome.com and find out what built-in AI APIs Chrome supports.",
           llm=ChatOpenAI(model="gpt-4o"),
       )
       result = await agent.run()
       print(result)

   asyncio.run(main())
   ```

The coolest thing is that you can watch the agent do its job in real time and
see the reasoning steps in the command line.

![Headless browser window with all UI elements annotated.](/images/browser-use.png)

Here's an excerpt of the logs.

```bash
INFO     [agent] 🚀 Starting task: Go to developer.chrome.com and find out what built-in AI APIs Chrome supports.
INFO     [agent] 📍 Step 1
INFO     [agent] 🤷 Eval: Unknown - It's the starting state.
INFO     [agent] 🧠 Memory: Start searching for built-in AI APIs supported by Chrome on developer.chrome.com.
INFO     [agent] 🎯 Next goal: Navigate to developer.chrome.com
INFO     [agent] 🛠️  Action 1/1: {"go_to_url":{"url":"https://developer.chrome.com"}}
INFO     [controller] 🔗  Navigated to https://developer.chrome.com
INFO     [agent] 📍 Step 2
INFO     [agent] 👍 Eval: Success - Navigated to the correct URL.
INFO     [agent] 🧠 Memory: Visited developer.chrome.com. Need to search for information on built-in AI APIs supported by Chrome.
INFO     [agent] 🎯 Next goal: Use search input to find information on AI APIs.
INFO     [agent] 🛠️  Action 1/1: {"click_element":{"index":9}}
INFO     [controller] 🖱️  Clicked button with index 9:
INFO     [agent] 📍 Step 3
INFO     [agent] 👍 Eval: Success - The search bar was clicked but no input was entered yet.
INFO     [agent] 🧠 Memory: Need to input search query about AI APIs in Chrome using the search bar.
INFO     [agent] 🎯 Next goal: Enter 'AI APIs' in the search input to find relevant information.
INFO     [agent] 🛠️  Action 1/1: {"input_text":{"index":4,"text":"AI APIs"}}
INFO     [controller] ⌨️  Input AI APIs into index 4
[…]
```

At the end of the log messages is the agent's full response to your task,
formatted in Markdown. FWIW, the answer is exactly correct:

> Chrome supports several built-in AI APIs, including:
>
> 1. **Translator API** - Available in origin trial for early preview
>    participants. Use cases include on-demand translation and supporting
>    multi-language communication.
> 2. **Language Detector API** - Available in Chrome origin trial. It helps
>    detect languages without user input and can label texts for better screen
>    reader pronunciation.
> 3. **Summarizer API** - Allows for local experimentation to preview program
>    participants. It can summarize meeting transcripts, articles, and forum
>    questions.
> 4. **Writer and Rewriter APIs** - Experimental status in early preview
>    program, used for creating and refining text content.
> 5. **Prompt API** - Allows natural language requests to Gemini Nano in Chrome,
>    in an experimental early stage.
>
> Visit developer.chrome.com for complete details and participation in early
> trials.

It's pretty wild what this scriptable agent is capable of doing today. Be sure
to check out some of the other
[demos](https://github.com/browser-use/browser-use?tab=readme-ov-file#demos) and
also try the browser-use [web-ui](https://github.com/browser-use/web-ui), which
adds a nice UI on top.
