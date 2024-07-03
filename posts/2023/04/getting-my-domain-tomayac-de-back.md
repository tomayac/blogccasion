---
layout: layouts/post.njk
title: 'Getting my domain tomayac.de back'
author: 'Thomas Steiner'
date: '2023-04-18T08:26:04'
permalink: 2023/04/18/getting-my-domain-tomayac-de-back/index.html
tags:
  - Life
---

There's this old mantra that
[Cool URIs don't change](https://www.w3.org/Provider/Style/URI) that Tim Berners
Lee has been championing since 1998. And in the subtitle of the linked document
it says:

> What makes a cool URI?<br> A cool URI is one which does not change.<br> What
> sorts of URI change?<br> > **URIs don't change: people change them.**

And that's exactly what happened in my case: I changed them. Tim goes on later
in the document:

> Pretty much the only good reason for a document to disappear from the Web is
> that the company which owned the domain name went out of business or can no
> longer afford to keep the server running.

That latter part (_"or can no longer afford to keep the server running"_) was
me—a person, not a company—in my late, money-saving student days. At the time, I
owned `tomayac.de`, and after making the switch to `tomayac.com`, I let go the
`.de` domain after a while because I didn't want to pay for it anymore.

While I did make sure to redirect everything properly (that is, using a
[permanent 301 redirect](https://developers.google.com/search/docs/crawling-indexing/301-redirects#permanent-server-side-redirects)),
the problem really was that I had referenced the `.de` domain in my printed
[Master's thesis](https://www.cs.upc.edu/~tsteiner/papers/2007/automatic-multi-language-program-library-generation-for-rest-apis-masters-thesis-2007.pdf)
that I couldn't change and in which I wrote about a tool I built called
[REST Describe & Compile](https://tomayac.com/rest-describe/latest/RestDescribe.html).
And of course over the years I had accrued the occasional external link that I
likewise couldn't control.

I think the `.de` domain was parked for a while gathering dust, until it was
taken over by [André Nowak](https://www.linkedin.com/in/anowak2/) who redirected
it to a page on his site called
[Tomayac.de – REST Describe & Compile Tool](https://www.linux-abos.de/vermischtes/rest-describe-compile-tool/).
Many years passed…

For some nostalgic reason a couple of days ago, I decided to see if I could get
my domain back. So I emailed André out of the blue based on the
[imprint of `linux-abos.de`](https://www.linux-abos.de/impressum/) and asked him
how much it would cost to transfer `tomayac.de` back to me, and what happened
next is just the nicest story.

André kindly offered to sell it back to me for the price he originally payed for
the domain, that is 12€, plus 1€ for his tax advisor, since, turns out, domains
are fixed assets. Before I even had a chance to pay him, he sent me the auth
code. I ended up sending him 25€ as a **thank you** after successfully moving
the domain to [Google Domains](https://domains.google/).

![Google Domains admin panel showing the DNS section of the domain tomayac.de being edited.](/images/google-domains.png)

Now all that remains is setting up DNS properly, get a certificate, set up an
`.htaccess`, and all these things I'm not really good at and never know if I'm
looking at the cached version from the DNS server or the live one, but I'll
figure it out eventually and make all those cool URIs work again!

So for the back link, if you ever need to update the operating system on your
smart phone, consider the page
[Linux auf dem Handy » Das Smartphone mit Linux updaten!](https://www.linux-abos.de/spiele/linux-handy-smartphone/)
and for the historical REST Describe and Compile content André created, read
[Tomayac.de – REST Describe & Compile Tool](https://www.linux-abos.de/vermischtes/rest-describe-compile-tool/).
Thanks again, André 🙏, for being the kindest person on the Internet last
Wednesday.
