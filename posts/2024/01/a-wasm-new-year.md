---
layout: layouts/post.njk
title: 'Wasm meetup Munich: A Wasm New Year! trip report'
author: 'Thomas Steiner'
date: '2024-01-17T11:04:26'
permalink: 2024/01/17/a-wasm-new-year/index.html
tags:
  - Work
---

## Background

The WebAssembly meetup in Munich has a history that
[reaches back to 2018](https://www.meetup.com/en-US/webassembly/events/?type=past).
After a long Covid-related hiatus and a lack of organizers to pick up the ball
again, _A Wasm New Year!_ was the first event under the new organizing team.
Google always had a strong presence at the events, so to continue the tradition
I happily agreed to offer a talk at the first post-Covid meetup.

![image](/images/a-wasm-new-year.png)

## Talks

### Compiling to and Optimizing Wasm with Binaryen

**Speaker:** Thomas Steiner

In the first half of the talk, I showed at the example of a toy programming
language that I called ExampleScript how to write a compiler with Binaryen that
compiles the toy programming language to WebAssembly. In the second half, I then
demonstrated various optimization techniques in Binaryen and ways to use them
from JavaScript with Binaryen.js and from the command line with tools like
`wasm-opt` and `wasm-merge`.

**Resources:**

- [Compiling to and optimizing Wasm with Binaryen](https://docs.google.com/presentation/d/1W7CQK8E8iV0fkTBeJWOTysd-KzOLLGKaTVJWy4dZH6g/edit?usp=drivesdk)

### LLM inference with WebAssembly

**Speaker:** [Sven Pfennig](https://www.linkedin.com/in/sven-pfennig/)

In this talk, Sven showed three ways of how Wasm helps with interacting with
large language models (LLM): in the browser, on the command line, and in the
cloud. His running example was the task of creating a bedtime story from the PAW
Patrol ecosystem for his daughter. First, the speaker demonstrated
[WebLLM](https://webllm.mlc.ai/) running variants of
[Llama 2](https://ai.meta.com/llama/) and
[Mistral-7B](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2) right in
the browser. He mentioned the challenges of keeping large models cached, and
also showed how these models have trouble with seemingly simple tasks like
creating a list of the
[PAW Patrol members](https://en.wikipedia.org/wiki/PAW_Patrol#PAW_Patrol), where
the model would plain hallucinate a member that never existed. Second, Sven
showed how to use the
[`run-llm.sh` script](https://www.secondstate.io/articles/run-llm-sh/) to get an
LLM running on-device with [WasmEdge](https://wasmedge.org/). He noted the
usefulness of this approach to mock an OpenAI API response due to the
compatibility of the responses. Finally, he showed
[Fermyon's Spin](https://www.fermyon.com/spin) solution to
[create serverless WebAssembly apps](https://developer.fermyon.com/spin/index),
run them locally, and finally deploy them to the
[Fermyon cloud](https://developer.fermyon.com/cloud/index).

**Resources:**

- [WebLLM](https://webllm.mlc.ai/)
- [`run-llm.sh` script](https://www.secondstate.io/articles/run-llm-sh/)
- [Fermyon Spin](https://www.fermyon.com/spin)

# Observations

There was huge interest for Wasm on the server. People were particularly curious
about
[WASI](https://github.com/bytecodealliance/wasmtime/blob/main/docs/WASI-intro.md),
the WebAssembly System Interface. It's an API in the process of standardization
that provides access to several operating-system-like features, including files
and filesystems, Berkeley sockets, clocks, and random numbers. (There's also a
proposal for [wasi-nn](https://github.com/WebAssembly/wasi-nn), a WASI API for
performing ML inference modeled closely after
[WebNN](https://webmachinelearning.github.io/webnn-intro/).)

The company that hosted the meetup,
[Liquid Reply](https://www.reply.com/liquid-reply/en/), is pitching WebAssembly
as a solution for creating production-grade Wasm apps on Kubernetes and hosting
a workshop titled
[Create Production-Grade Wasm Applications on Kubernetes](https://2024.wasmio.tech/sessions/create-production-grade-wasm-applications-on-kubernetes-workshop/)
at the upcoming [Wasm I/O conference](https://2024.wasmio.tech/) in March 2024
(where Thomas Nattestad and I are going to present on
[WebAssembly at Google](https://2024.wasmio.tech/sessions/webassembly-at-google/),
alongside with Kevin Moore, who's going to present
[Flutter, Dart, and WASM: Shipping a new model for Web applications](https://2024.wasmio.tech/sessions/flutter-dart-and-wasm-shipping-a-new-model-for-web-applications/)).

I also got a fair amount of questions on
[WasmGC](https://github.com/WebAssembly/gc) and what it means for compiling new
programming languages to Wasm. The strategy of writing a higher-level article
([WebAssembly Garbage Collection (WasmGC) now enabled by default in Chrome](https://developer.chrome.com/blog/wasmgc))
and a lower-level article
([A new way to bring garbage collected programming languages efficiently to WebAssembly](https://v8.dev/blog/wasm-gc-porting))
really paid off and I could point developers at either of the two, dependent on
how deep they wanted to go.
