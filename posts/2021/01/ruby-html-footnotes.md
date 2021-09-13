---
layout: layouts/post.njk
title: '<ruby> HTML footnotes'
author: 'Thomas Steiner'
date: '2021-01-24T18:48:57'
permalink: 2021/01/24/ruby-html-footnotes/index.html
tags:
  - Technical
---

It is sometimes surprising to me to see what kind of use cases HTML has a
dedicated element for. Something that comes to mind is
[`<output>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output),
a container element into which a site or app can inject the results of a
calculation or the outcome of a user action. For another use case that is
arguably more common and which is also the topic of this blog post, HTML has
nothing specific to offer:
<ruby tabindex="0">**footnotes**<rt><strong>Footnotes</strong> are notes at the
foot of the page while endnotes are collected under a separate heading at the
end of a chapter, volume, or entire work. Unlike footnotes,
<strong>endnotes</strong> have the advantage of not affecting the layout of the
main text, but may cause inconvenience to readers who have to move back and
forth between the main text and the endnotes.</rt></ruby>.

## Footnotes in HTML, then and now

Despite several
[proposals](https://www.w3.org/Search/Mail/Public/advanced_search?keywords=&hdr-1-name=subject&hdr-1-query=footnote+footnotes&hdr-2-name=from&hdr-2-query=&hdr-3-name=message-id&hdr-3-query=&period_month=&period_year=&index-grp=Public__FULL&index-type=t&type-index=www-html&resultsperpage=20&sortby=date-asc)
to deal with footnotes at the language level,
[HTML&nbsp;3.0 Draft](https://www.w3.org/MarkUp/html3/) was the last version of
HTML that offered the [`FN`](https://www.w3.org/MarkUp/html3/footnotes.html)
element. It was designed for footnotes, and when practical, footnotes were to be
rendered as pop-up notes. You were supposed to use the element as in the code
sample below (the inconsistent character casing _sic_).

```html
<dl>
  <dt>Hamlet:</dt>
  <dd>
    You should not have believed me, for virtue cannot so
    <a href="#fn1">inoculate</a> our old stock but we shall
    <a href="#fn2">relish of it</a>. I loved you not.
  </dd>

  <dt>Ophelia:</dt>
  <dd>I was the more deceived.</dd>

  <dt>Hamlet:</dt>
  <dd>
    Get thee to a nunnery. Why wouldst thou be a breeder of sinners? I am myself
    <a href="#fn2">indifferent honest</a> …
  </dd>
</dl>

<fn id="fn1"><i>inoculate</i> - graft</fn>
<fn id="fn2"><i>relish of it</i> - smack of it (our old sinful nature)</fn>
<fn id="fn3"><i>indifferent honest</i> - moderately virtuous</fn>
```

The current HTML Living Standard (snapshot from January&nbsp;22, 2021) remarks
that HTML does not have a dedicated mechanism for marking up footnotes and
[recommends](https://html.spec.whatwg.org/multipage/semantics-other.html#footnotes)
the following options for footnotes. For short inline annotations, the `title`
attribute could be used.

```html
<p><b>Customer</b>: Hello! I wish to register a complaint. Hello. Miss?</p>
<p>
  <b>Shopkeeper</b>:
  <span title="Colloquial pronunciation of 'What do you'">Watcha</span> mean,
  miss?
</p>

<p>
  <b>Customer</b>: Uh, I'm sorry, I have a cold. I wish to make a complaint.
</p>
<p>
  <b>Shopkeeper</b>: Sorry,
  <span title="This is, of course, a lie.">we're closing for lunch</span>.
</p>
```

Using `title` comes with an important downside, though, as the spec rightly
notes.

> Unfortunately, relying on the `title` attribute is currently discouraged as
> many user agents do not expose the attribute in an accessible manner as
> required by this specification (e.g. requiring a pointing device such as a
> mouse to cause a tooltip to appear, which excludes keyboard-only users and
> touch-only users, such as anyone with a modern phone or tablet).

For longer annotations, the `a` element should be used, pointing to an element
later in the document. The convention is that the contents of the link be a
number in square brackets.

```html
<p>Announcer: Number 16: The <i>hand</i>.</p>
<p>
  Interviewer: Good evening. I have with me in the studio tonight Mr Norman St
  John Polevaulter, who for the past few years has been contradicting people. Mr
  Polevaulter, why <em>do</em> you contradict people?
</p>

<p>
  Norman: I don't. <sup><a href="#fn1" id="r1">[1]</a></sup>
</p>
<p>Interviewer: You told me you did! …</p>

<section>
  <p id="fn1">
    <a href="#r1">[1]</a> This is, naturally, a lie, but paradoxically if it
    were true he could not say so without contradicting the interviewer and thus
    making it false.
  </p>
</section>
```

This approach is what most folks use today, for example,
[Alex Russell](https://infrequently.org/2020/09/the-pursuit-of-appiness/#fnref-the-pursuit-of-appiness-1)
or the
[HTML export](https://docs.google.com/document/d/e/2PACX-1vRoZ2f7zuM362x3VzU0qs2WRH4tybO8Mf0Ybbf1PV83aYPJF9azkubMTvfpcKNj62jhGsdT5SCzWPcN/pub?embedded=true#ftnt_ref1)
of Google Docs documents.

## The `ruby` element

The other day, I came across a
[tweet](https://twitter.com/justmarkup/status/1352528677892972545) by
[Michael Scharnagl](https://justmarkup.com/), whose website and Twitter handle
are aptly named _Just Markup_ and who runs a Twitter campaign this year called
[`#HTMLElementInATweet`](https://twitter.com/hashtag/HTMLElementInATweet?src=hash&ref_src=twsrc%5Etfw):

<blockquote><p lang="en" dir="ltr">Day 22: &lt;ruby&gt;<br><br>Represents small annotations <br><br>ℹ️ The term ruby originated as a unit of measurement used by typesetters, representing the smallest size that text can be printed on newsprint while remaining legible. <br/><br/><a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby
">developer.mozilla.org/en-US/docs/Web…</a> <br/><br/><a href="https://twitter.com/hashtag/HTMLElementInATweet?src=hash&amp;ref_src=twsrc%5Etfw">#HTMLElementInATweet</a></p>&mdash; Michael Scharnagl (@justmarkup) <a href="https://twitter.com/justmarkup/status/1352528677892972545?ref_src=twsrc%5Etfw">January 22, 2021</a></blockquote>

I had heard about
[`ruby`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby) in the
past, but it was one of these elements that I tend to look up and forget
immediately. This time, for some reason, I looked closer and even consulted the
[spec](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-ruby-element).

> The `ruby` element allows one or more spans of phrasing content to be marked
> with ruby annotations. Ruby annotations are short runs of text presented
> alongside base text, primarily used in East Asian typography as a guide for
> pronunciation or to include other annotations. In Japanese, this form of
> typography is also known as _furigana_.

> The `rt` element marks the ruby text component of a ruby annotation. When it
> is the child of a `ruby` element, it doesn't represent anything itself, but
> the `ruby` element uses it as part of determining what _it_ represents.

You are supposed to use it like so.

```html
<ruby> 明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp> </ruby>
```

The [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby)
describe the `ruby` element as follows.

> The HTML `<ruby>` element represents small annotations that are rendered
> above, below, or next to base text, usually used for showing the pronunciation
> of East Asian characters. It can also be used for annotating other kinds of
> text, but this usage is less common.

> The term _ruby_ originated
> [as a unit of measurement used by typesetters](<https://en.wikipedia.org/wiki/Agate_(typography)>),
> representing the smallest size that text can be printed on newsprint while
> remaining legible.

Hmm 🤔, this sounds like it could fit the footnotes use case. So I went and
tried my luck in creating `ruby` HTML footnotes.

## Using `ruby` for footnotes

The markup is straightforward, all you need are
[`ruby`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ruby) for the
footnote, and
[`rt`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/rt) for the
footnote text. I like that the footnote is just part of the flow text, so I do
not need to mentally switch context when writing. I also do not have to manually
number my footnotes and come up with and remember the value of `id`s. Another
small advantage is that footnotes are not part of copied text, so when you copy
content from my site, you do not end up with "text [2] like this". The snippet
below shows the markup of a footnote.

```html
<body tabindex="0">
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur
    dictum fermentum. Vivamus non fringilla dolor, in scelerisque massa. Quisque
    mattis elit quam, eu hendrerit diam ultricies ut. Nunc sit amet velit
    posuere, malesuada diam in, congue diam. Integer quis venenatis velit. Donec
    quis nunc
    <ruby tabindex="0"
      >vel purus<rt
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </rt></ruby
    >
    maximus dictum. Sed nec tempus odio. Vestibulum et lobortis ante. Duis
    blandit pulvinar lectus non sollicitudin. Nulla non imperdiet diam. Fusce
    varius ultricies sapien id pretium. Praesent ut pellentesque massa. Nunc eu
    tellus hendrerit risus maximus porta. Maecenas in molestie erat.
  </p>
</body>
```

The CSS to make the automatic footnote numbering work is based on a
[CSS counter](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Lists_and_Counters/Using_CSS_counters).
The `rt` is styled in a way that it is not displayed by default, and only gets
shown when the `ruby`'s `:after`, which holds the footnote number, is focused.
For this to function properly, it is important to make the `<ruby>` element
focusable by setting
[`tabindex="0"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex#content:~:text=tabindex%3D%220%22,-means).
On mobile devices, the `body` needs to be focusable as well, so the footnote can
be closed again by clicking/tapping anywhere in the page. The `rt` element can
contain
[phrasing content](https://html.spec.whatwg.org/multipage/dom.html#phrasing-content-2),
so links and images are all fine. Another thing to remember is to make sure the
`rt` element remains visible on `:hover`, so links can be clicked even when the
`ruby` element loses focus. I have moved the CSS `display` value of `rt` into a
CSS custom property, so I could easily play with different values. The CSS below
is all it takes to make the footnotes work.

```css
/* Behavior */

/* Set up the footnote counter and display style. */
body {
  counter-reset: footnotes;
}

/* Make footnote text appear as `inline-block`. */
ruby {
  --footnote-display: inline-block;
}

/* Display the actual footnote [1]. */
ruby:after {
  counter-increment: footnotes;
  /* The footnote is separated with a thin space. 🤓 */
  content: ' [' counter(footnotes) ']';
}

/* Remove the focus ring. */
ruby:focus {
  outline: none;
}

/* Display the footnote text. */
ruby:focus rt {
  display: var(--footnote-display);
}

/* Hide footnote text by default. */
rt {
  display: none;
}

/**
 * Make sure the footnote text remains visible,
 * so contained links can be clicked.
 */
rt:hover {
  display: var(--footnote-display);
}
```

The following CSS snippet determines the look and feel of the footnotes.

```css
/* Look and feel */

/* Footnote text styling. */
rt {
  background-color: #eee;
  color: #111;
  padding: 0.2rem;
  margin: 0.2rem;
  max-width: 30ch;
}

/* Images in footnote text styling. */
rt img {
  width: 100%;
  height: auto;
  display: block;
}

/* Footnote styling */
ruby:after {
  color: red;
  cursor: pointer;
  font-size: 0.75rem;
  vertical-align: top;
}
```

Something I could not get to work (yet) is to make the `rt`'s CSS `position` to
be `absolute`. I got the best results so far by making the `rt` an inline block
by setting the CSS property `--footnote-display: inline-block`. I am well aware
of [`ruby-align`](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-align)
and
[`ruby-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/ruby-position).
The former does not have great browser support at the moment but seems relevant,
and the latter seems to have no effect when I change the `display` value of `rt`
to anything other than the UA stylesheet default, which is `block`. If you
manage to get it to work such that footnote texts open inline, floating right
under the footnote and not affecting the surrounding paragraph text, your help
would be very welcome. I also still need to look into supporting printable
footnotes, screen reader support, and fixing the RSS feed. If you are
interested, you can reach me and
[discuss this idea on Twitter](https://twitter.com/search?q=from%3A%40tomayac%20url%3Ahttps%3A%2F%2Fblog.tomayac.com%2F2021%2F01%2F24%2Fruby-html-footnotes%2F&src=typed_query&f=live).

## Demo

I have enabled `ruby` footnotes right on my <ruby tabindex="0">blog <rt>This is
the second footnote, the other is at the [top](#top).</rt></ruby>, but you can
also play with a standalone [demo](https://ruby-footnotes.glitch.me/) on Glitch
and remix its
[source code](https://glitch.com/edit/#!/ruby-footnotes?path=style.css%3A18%3A11).

<div style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/ruby-footnotes?path=style.css&previewSize=100"
    title="ruby-footnotes on Glitch"
    style="height: 100%; width: 100%; border: 0;"
    loading="lazy">
  </iframe>
</div>

⚠️ Please note that this is not production ready. Support seems decent on
Blink/WebKit-based browsers, but
[not so great](https://github.com/tomayac/blogccasion/issues/27) on Gecko-based
browsers like Firefox. I have opened an
[Issue](https://github.com/w3c/csswg-drafts/issues/5891) with the CSS Working
Group to hear their opinion on the idea, and the response was:

> Although ruby was introduced to HTML & CSS primarily because of its use in
> Asian languages, nothing about it is specific to that. Similarly, although it
> is often used to give a phonetic pronunciation, ruby is not specific to that
> so other uses are okay.

> And yes it is really odd that HTML has nothing for directly expressing an
> inline note (a footnote is just one presentation possibility, more suitable to
> paginated content).

> So I would not say it is an abuse. It is a bit creative, but mostly because
> people only think of the most common use cases.

## Other approaches

The "standards nerd and technology enthusiast"
[Terence Eden](https://shkspr.mobi/blog/about/) proposed to use `details` in a
blog post titled
[A (terrible?) way to do footnotes in HTML](https://shkspr.mobi/blog/2020/12/a-terrible-way-to-do-footnotes-in-html/).
Next, [Peter-Paul Koch](https://www.quirksmode.org/about/), web developer,
consultant, and trainer, runs a side project named
[The Thidrekssaga and footnotes](https://www.quirksmode.org/blog/archives/2020/10/side_project_th.html)
where for the [current iteration of the site](https://www.quirksmode.org/ths/)
he just notes that his "_implementation of footnotes is mostly shit_". If you
have yet another approach apart from what is listed here and above, please
[reach out](https://twitter.com/search?q=from%3A%40tomayac%20url%3Ahttps%3A%2F%2Fblog.tomayac.com%2F2021%2F01%2F24%2Fruby-html-footnotes%2F&src=typed_query&f=live)
and I am happy to add it. And as I wrote before, I am looking for help from CSS
experts to make `rt` positioned absolutely. Sorry for the nerd-snipe.
