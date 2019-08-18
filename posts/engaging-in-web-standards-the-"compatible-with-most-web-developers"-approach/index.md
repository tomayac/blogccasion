---
layout: layouts/post.njk
title: "Engaging in Web Standards—The “Compatible with Most Web Developers” Approach"
description: "At Google, we have a humbling 👌(!) team of amazing Google Developer Experts that specialize on Web Technologies. The other day, one of them on a mailing list suggested the following feature…"
date: "2019-02-05T17:02:06.441Z"
permalink: 2019/02/05/engaging-in-web-standards-the-compatible-with-most-web-developers-approach/index.html
tags:
  - Technical
---

> 😨📖 **tl;dr:** Whether you want to add something new to an already existing feature or propose a completely new one, it all starts with finding out in what organization the standardization process for this kind of feature happens and where this organization’s discussions take place. This post suggests a possible approach to engaging in standardization work in a meaningful way for regular web developers whose day job is not standards by following along a step-by-step real-world example that takes you through the journey and encourages you to make your voice heard.

At Google, we have a humbling 👌(!) team of amazing [Google Developer Experts that specialize on Web Technologies](https://developers.google.com/experts/all/technology/web-technologies). The other day, one of them on a mailing list suggested the following feature (paraphrased from the email thread): “Consider adding support for a `titlecase` keyword for the CSS `[text-transform](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform)` property”. They explained:

> “Some time ago, I wanted to unify the capitalization of all titles in my app and thought of using CSS `text-transform`. It supports `capitalize`, `uppercase`, and `lowercase` \[among others\]. Upon further investigation, I found not all words are capitalized in English in title case. For example, ‘a’, ‘an’, ‘the’, ‘and’, ‘in’, ‘of’, ‘as’, ‘to’, etc. are not capitalized. So using the `capitalize` keyword of CSS `text-transform` does not match the English convention, and developers need to write the conversion by hand.”

At first sight, `text-transform: titlecase` sounds like a reasonable thing for CSS to have. It would take a heading markup like `<h1>Ten things CSS can do, the eighth will make you cry</h1>` and render it as…

#### Ten Things CSS Can Do, the Eighth Will Make You Cry

Note how the article _“the”_ is lower case, everything else upper case. According to the (randomly chosen) [title casing service](https://titlecase.com/) that I have used to do the conversion, this style is called [_Associated Press (AP)_ Style](https://www.apstylebook.com/). Just sad 😕 that the _AP Stylebook_ Twitter account some time ago tweeted the following:



🤔 This already smells like trouble. Are there no simple rules after all maybe? The person who suggested the feature continued their email (again paraphrased and emphasis mine):

> “I am not familiar with the W3C standards process, this is just a suggestion I thought of. **Most web developers don’t participate in the standards development process. I think they just don’t know how to provide feedback**.”

![World Wide Web Consortium (W3C) logo](/images/asset-1_3.png)

### Contributing to Web Standards as Someone Who Self-Identifies as “Most Web Developers”

It would probably get a `[[citation needed]](https://en.wikipedia.org/wiki/Wikipedia:Citation_needed)` tag on Wikipedia, but the statement stands: “Most web developers just do not know how to provide feedback”. I ([Tom](https://twitter.com/tomayac), Google Web Developer Advocate 🥑) thought maybe I could attempt to address this challenge and try to come up with an answer. While I am _definitely not_ the most authoritative source for standards works, I have landed a few minor changes in various W3C specs. With that out of the way, let me guide you through **_my personal approach_** to potentially landing a feature request like “correct” title case support.

#### Understanding the Status Quo of Existing Features

There is a clear use case (“correct” title capitalization) and an existing CSS feature (`text-transform`) that somewhat does the desired thing, but not exactly. Now where to go from here as someone who self-identifies as “most web developers” and who is new to standards?

> ⚠️ **Note:** The bullet list below is modeled along the running example of `text-transform`, follow the 🔗 link after each bullet to see where I am at in my process. This is not meant to be a generic “contributing to standards” guide, but with the help of a concrete example shows how one possible approach can look like.

-   ① Mozilla Developer Network (MDN) has become my go-to location for information about Open Web technologies, so my journey to see if `text-transform` could potentially support `titlecase` begins with a search for the **feature in question on MDN**. First, I want to see if the feature or a similar one was maybe already implemented, but mostly to get a spec link that I can dive into. (🔗 [link](https://www.google.de/search?q=mdn+css+text-transform&oq=mdn+css+text-transform&aqs=chrome..69i57.877j0j1&sourceid=chrome&ie=UTF-8))
-   ② I want to understand the status quo of the feature as it is specified. At the end of the documentation page, I find links to the **appropriate specs**, typically I begin with the latest. (🔗 [link](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform#Specifications))
-   ③ Next, I find the **details of the feature in question** somewhere in the spec. Typically MDN already has the correct deep link, and if not, it is a Wiki that everyone signed in to MDN can edit 😉. (🔗 [link](https://drafts.csswg.org/css-text-3/#propdef-text-transform))

> ☝️**Side Note:** My colleague [Surma](https://twitter.com/DasSurma) has written an excellent guide on [how to read web specs](https://dassur.ma/things/reading-specs/) at the example of WebVR.

-   ④ As hard as it may initially seem if you are new to spec prose (I am), personally, I always strive to **read (at least enough of) the spec** to understand the complete background (your browser’s full text search feature helps). I fully reckon this is not everybody’s cup of tea, so feel free to skip this. Here, it turns out the CSS spec already says something about “titlecasing” (emphasis mine):

> “Authors should not expect `capitalize` to follow language-specific 👉 **titlecasing** conventions (such as skipping articles in English) \[…\]”—(🔗 [link](https://drafts.csswg.org/css-text-3/#text-transform-property))

-   ⑤ So it looks like the designers of CSS had at least thought about title casing, but decided against it. However, the spec did not give their reasons, so I go in search of the history and find the **GitHub issues** linked at the top in the spec’s front matter where discussions might have happened regarding this design decision. (🔗 [link](https://github.com/w3c/csswg-drafts/issues))
-   ⑥ I search for the relevant keywords in **closed and open issues** (note that by default GitHub search covers just open issues). (🔗 [link](https://github.com/w3c/csswg-drafts/issues?utf8=%E2%9C%93&q=is%3Aissue++text-transform++capitalize))
-   ⑦ In this case, I do not find anything super promising `¯\_(ツ)_/¯` , so I **go back** to the [appropriate spec options list](https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform#Specifications) from bullet ② and recall that the `text-transform` feature has been in earlier versions of CSS, that is, before CSS3. (🔗 [CSS2 link](https://www.w3.org/TR/CSS2/text.html#caps-prop), 🔗 [CSS1 link](https://www.w3.org/TR/CSS1/#text-transform))
-   ⑧ By reading the older specs’ front matters, I realize that discussions happened on **mailing lists** before GitHub became a thing 😲. (🔗 [link](http://lists.w3.org/Archives/Public/www-style/))
-   ⑨ With the previous keywords and variations thereof (this is not fuzzy search), I **search the mailing list archive** for evidence of the discussion. (🔗 [link](https://www.w3.org/Search/Mail/Public/search?type-index=www-style&index-type=t&keywords=text-transform+capitalize&search=Search))
-   ⑩ I find an **old discussion** from 2015 where people talk about title capitalization. (🔗 [link](https://lists.w3.org/Archives/Public/www-style/2015Jan/0422.html))
-   ⑪ Next, I trace back the argumentation history by following the **“Next in thread”** navigation of the mailing list archive. (🔗 [link](https://lists.w3.org/Archives/Public/www-style/2015Jan/0423.html))
-   ⑫ After a while, I **find** [Tab Atkins](https://twitter.com/tabatkins) chime in the discussion at one point:

> “It’s a ton of effort and complication for something that won’t even work for most content (since most content isn’t language-tagged), and so not really worth pursuing.”_—(_🔗 [_link_](https://lists.w3.org/Archives/Public/www-style/2015Jan/0451.html)_)_

-   ⑬ Ultimately, I **read** Tab’s final resolution:

> “I agree that that’s not great, but as others in this thread have said, it’s really not possible to do better without very high levels of domain knowledge, and even then manual tweaks are necessary (for example, for acronyms that look like real words). CSS’s auto-capitalization is pretty dumb; don’t rely on it if you want high-quality capitalization.”—(🔗 [link](https://lists.w3.org/Archives/Public/www-style/2015Jan/0467.html))

So in this case, there is a clear and reasonable explanation why we can’t have (what initially seemed like) nice things. This is what makes standards work so fascinating to me. Someone somewhere on this planet 🌍🌎🌏 will definitely think of—or have thought of in the past—something that I would have never realized myself. Standards are about finding a compromise—and finding one might take a while sometimes.

#### Challenging the Status Quo of Existing Features

Now this does not mean that the discussion has to stop here, there can always be a “bullet ⑭” (to symbolically continue the numbering scheme from above), where I disagree and bring forward a counter argument for the use case behind `text-transform: titlecase`, but maybe for the sake of the running example in 2019 not in CSS land, but in the form of a to-be-newly-proposed property `Intl.TitleFormat` in the [Internationalization API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl), which brings me to the next parts on suggesting new JavaScript and Web Platform features.

> ⚠️ **Note:** I am not actually arguing for `Intl.TitleFormat`, this is an illustrative example to show how to propose new JavaScript and Web Platform features.

![Ecma International, Technical Committee 39 (TC39) logo](/images/asset-2_3.png)

#### New JavaScript Features

If an idea is about new JavaScript features like the fictive (at least at the time of writing 🙂) proposed property `Intl.TitleFormat` from the running example around title capitalization, you are dealing with _Ecma International, Technical Committee 39_ ([TC39](https://www.ecma-international.org/memento/tc39-rf-tg.htm)). Proposals go through a four-stage process which is documented in the [TC39 process document](https://tc39.github.io/process-document/). Personally, I cannot really say too much about this, as I have not followed the process yet, but again—as a first step—I always [search through the list of existing proposals](https://github.com/tc39/proposals) to see if maybe someone else has had the same or a similar idea in the past. If the idea is new, I make the case for the addition, describe the shape of a solution, and identify challenges by following the [creating a new proposal](https://github.com/tc39/ecma262/blob/master/CONTRIBUTING.md#creating-a-new-proposal) guidelines.

![Web Incubator Community Group (WICG) logo](/images/asset-3_3.png)

#### New Web Platform Features

If an idea does not fall in the category of things that already exist (like adding new allowed keywords to a CSS property or proposing a new property for an existing JavaScript API), but is more exploratory (like, say, suggesting a whole [new API for getting the list of installed fonts](https://discourse.wicg.io/t/api-to-get-list-of-available-fonts/1197), so I can not only capitalize titles following preferred title case rules, but also performantly format them in function of the user’s installed fonts), I check if the _Web Incubator Community Group_ ([WICG](https://github.com/WICG)) is the right forum for the proposal. The group runs a [**discussion forum**](https://discourse.wicg.io/) where one can get initial feedback on an idea. As a first step, I also always [search the forum](https://discourse.wicg.io/search) to see if maybe someone else has thought about my feature before. After posting an idea or chiming in on someone else’s idea, I will then be pointed in the right direction regarding next steps.

#### Conclusion

With all that said, do not let yourself be discouraged from engaging in web standards work. In many cases, [searching for past discussions](https://github.com/w3c/csswg-drafts/issues?utf8=%E2%9C%93&q=is%3Aissue++text-transform++capitalize) (bullet ⑤ above) will already reveal something useful, and you can then engage in the discussion by commenting on GitHub. Do your own research and due diligence, and you should be good to go. **All of us are learners**, me included. What approach works best for you? Do you work on standards and are you aware of a better way? I would definitely love to learn from you!

For another take on getting started with standards work, I also highly recommend watching my colleague [Mariko Kosaka](https://twitter.com/kosamari)’s talk “_What is/Who Makes ‘The Platform’”_.

<Embed src="https://www.youtube.com/embed/xzzQWc-IqZI?feature=oembed" aspectRatio={undefined} caption="Mariko Kosaka’s talk “What is/Who Makes ‘The Platform’” on YouTube" />

For yet another take (and probably the most holistic one) ranging from identifying the issue to writing a Web Platform Test to proposing the actual spec change, watch [Jake Archibald](https://twitter.com/jaffathecake)’s and [Surma](https://twitter.com/DasSurma)’s episode _Changing Web Standards_ of their _HTTP 203_ series, embedded below.

<Embed src="https://www.youtube.com/embed/y1TEPQz02iU?feature=oembed" aspectRatio={undefined} caption="Jake Archibald and Surma on “Changing Web Standards” on YouTube" />

#### 🙏 Acknowledgements

I would like to thank [Jake Archibald](https://twitter.com/jaffathecake) (💯), as well as [Sam Dutton](https://twitter.com/sw12), [Sam Thorogood](https://twitter.com/samthor), [Phil Walton](https://twitter.com/philwalton), [Yoav Weiss](https://twitter.com/yoavweiss), and [Rowan Merewood](https://twitter.com/rowan_m) for their helpful comments and for reviewing this article.
