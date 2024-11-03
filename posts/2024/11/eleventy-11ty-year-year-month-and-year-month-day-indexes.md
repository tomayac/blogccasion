---
layout: layouts/post.njk
title: 'Eleventy (11ty) year, year-month, and year-month-day indexes'
author: 'Thomas Steiner'
date: '2024-11-02T21:52:06'
permalink: 2024/11/02/eleventy-11ty-year-year-month-and-year-month-day-indexes/index.html
tags:
  - Technical
---

I love hackable URLs. A hackable URL is a URL that makes sense to a human reader, and where the human reader can guess what to change to get to another page. For example, if you look at the URL of this very blog post, [`https://blog.tomayac.com/2024/11/02/eleventy-11ty-year-year-month-and-year-month-day-indexes/`](/2024/11/02/eleventy-11ty-year-year-month-and-year-month-day-indexes/), what would you expect happens if you hack the URL to any of the following values?

- [`https://blog.tomayac.com/2024/11/02/`](/2024/11/02/) lists all posts that were published on November 2, 2024.
- [`https://blog.tomayac.com/2024/11/`](/2024/11/) lists all posts that were published in November, 2024.
- [`https://blog.tomayac.com/2024/`](/2024/) lists all posts that were published in 2024.
- [`https://blog.tomayac.com/`](/) leads to this blog's home.

## `.eleventy.js`

If you have a URL structure that's similar to mine, feel free to copy the relevant excerpts quoted in the following snippet from [my `.eleventy.js`](https://github.com/tomayac/blogccasion/blob/main/.eleventy.js) and add them to your `.eleventy.js`. The `_.chain()` is from the [lodash](https://lodash.com/docs/4.17.15#chain) library.

```js
// Year collection
eleventyConfig.addCollection('postsByYear', (collection) => {
  return _.chain(collection.getAllSorted())
    .filter((item) => 'tags' in item.data && item.data.tags.includes('posts'))
    .groupBy((post) => post.date.getFullYear())
    .toPairs()
    .reverse()
    .value();
});

// Year / Month collection
eleventyConfig.addCollection('postsByYearMonth', (collection) => {
  return _.chain(collection.getAllSorted())
    .filter((item) => 'tags' in item.data && item.data.tags.includes('posts'))
    .groupBy((post) => {
      const year = post.date.getFullYear();
      const month = String(post.date.getMonth() + 1).padStart(2, '0');
      return `${year}/${month}`;
    })
    .toPairs()
    .reverse()
    .value();
});

// Year / Month / Day collection
eleventyConfig.addCollection('postsByYearMonthDay', (collection) => {
  return _.chain(collection.getAllSorted())
    .filter((item) => 'tags' in item.data && item.data.tags.includes('posts'))
    .groupBy((post) => {
      const year = post.date.getFullYear();
      const month = String(post.date.getMonth() + 1).padStart(2, '0');
      const day = String(post.date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    })
    .toPairs()
    .reverse()
    .value();
});

// Helper filter to format month names
eleventyConfig.addFilter('monthName', (monthNum) => {
  const date = new Date(2000, parseInt(monthNum) - 1, 1);
  return date.toLocaleString('en-US', { month: 'long' });
});

// Helper filters for parsing date parts
eleventyConfig.addFilter('getYear', (dateStr) => dateStr.split('/')[0]);
eleventyConfig.addFilter('getMonth', (dateStr) => dateStr.split('/')[1]);
eleventyConfig.addFilter('getDay', (dateStr) => dateStr.split('/')[2]);
```

## Nunjucks templates

Then, in your blog's root, add three files:

- `year-index.njk`
- `year-month-index.njk`
- `year-month-day-index.njk`

They're all three pretty similar, but for the sake of completeness, here are all three.

### `year-index.njk`:

```nunjucks
{% raw %}---
pagination:
  data: collections.postsByYear
  size: 1
  alias: year
layout: layouts/home.njk
permalink: /{{ year[0] }}/
---

<h2>{{ year[0] }} Archive</h2>

{% for postedYear, yearPosts in collections.postsByYear %}
  {% if postedYear === year[0] %}
  <ul class="postlist">
    {% for post in yearPosts | reverse %}
      <li class="postlist-item{% if post.url == url %} postlist-item-active{% endif %}">
        <a href="{{ post.url | url }}" class="postlist-link">{% if post.data.title %}{{ post.data.title }}{% else %}<code>{{ post.url }}</code>{% endif %}</a>
        <time class="postlist-date" datetime="{{ post.date | htmlDateString }}">{{ post.date | readableDate }}</time>
      </li>
    {% endfor %}
  </ul>
  {% endif %}
{% endfor %}{% endraw %}
```

### `year-month-index.njk`:

```nunjucks
{% raw %}---
pagination:
  data: collections.postsByYearMonth
  size: 1
  alias: yearMonth
layout: layouts/home.njk
permalink: /{{ yearMonth[0] }}/
---

<h2>{{ yearMonth[0] | getMonth | monthName }} {{ yearMonth[0] | getYear }} Archive</h2>

{% for postedYearMonth, monthPosts in collections.postsByYearMonth %}
  {% if postedYearMonth === yearMonth[0] %}
  <ul class="postlist">
    {% for post in monthPosts | reverse %}
      <li class="postlist-item{% if post.url == url %} postlist-item-active{% endif %}">
        <a href="{{ post.url | url }}" class="postlist-link">{% if post.data.title %}{{ post.data.title }}{% else %}<code>{{ post.url }}</code>{% endif %}</a>
        <time class="postlist-date" datetime="{{ post.date | htmlDateString }}">{{ post.date | readableDate }}</time>
      </li>
    {% endfor %}
  </ul>
  {% endif %}
{% endfor %}{% endraw %}
```

### `year-month-day-index.njk`:

```nunjucks
{% raw %}---
pagination:
  data: collections.postsByYearMonthDay
  size: 1
  alias: yearMonthDay
layout: layouts/home.njk
permalink: /{{ yearMonthDay[0] }}/
---

<h2>{{ yearMonthDay[0] | getMonth | monthName }} {{ yearMonthDay[0] | getDay }}, {{ yearMonthDay[0] | getYear }} Archive</h2>

{% for postedYearMonthDay, dayPosts in collections.postsByYearMonthDay %}
  {% if postedYearMonthDay === yearMonthDay[0] %}
  <ul class="postlist">
    {% for post in dayPosts | reverse %}
      <li class="postlist-item{% if post.url == url %} postlist-item-active{% endif %}">
        <a href="{{ post.url | url }}" class="postlist-link">{% if post.data.title %}{{ post.data.title }}{% else %}<code>{{ post.url }}</code>{% endif %}</a>
        <time class="postlist-date" datetime="{{ post.date | htmlDateString }}">{{ post.date | readableDate }}</time>
      </li>
    {% endfor %}
  </ul>
  {% endif %}
{% endfor %}{% endraw %}
```

## Helped by AI

And here's my dirty, little secret 🤫: I only actually coded `year-index.njk` myself, and then asked [Claude](https://claude.ai/) to code the rest for me.

### Initial prompt

```
I have a blog built with Eleventy. It uses a URL structure
that is https://blog.tomayac.com/$year/$month/$day/$title/.
For example, https://blog.tomayac.com/2024/08/26/my-response-to-the-cma/.

I already have a way to list all posts published in a year by
navigating to https://blog.tomayac.com/$year/. Now I want two
levels deeper and get first https://blog.tomayac.com/$year/$month/,
that is, all posts published in a given month, and
https://blog.tomayac.com/$year/$month/$day/, that is, all posts
published on a given year.

For the year index, this is how I got it to work:

In .eleventy.js:
eleventyConfig.addCollection('postsByYear', (collection) => {
    return _.chain(collection.getAllSorted())
      .filter((item) => 'tags' in item.data && item.data.tags.includes('posts'))
      .groupBy((post) => post.date.getFullYear())
      .toPairs()
      .reverse()
      .value();
  });

And then a Nunjucks file year-index.njk:

{% raw %}---
pagination:
  data: collections.postsByYear
  size: 1
  alias: year
layout: layouts/home.njk
permalink: /{{ year[0] }}/
---
<h2>{{ year[0] }} Archive</h2>
{% for postedYear, yearPosts in collections.postsByYear %}
  {% if postedYear === year[0] %}
  <ul class="postlist">
    {% for post in yearPosts | reverse %}
      <li class="postlist-item{% if post.url == url %} postlist-item-active{% endif %}">
        <a href="{{ post.url | url }}" class="postlist-link">{% if post.data.title %}{{ post.data.title }}{% else %}<code>{{ post.url }}</code>{% endif %}</a>
        <time class="postlist-date" datetime="{{ post.date | htmlDateString }}">{{ post.date | readableDate }}</time>
      </li>
    {% endfor %}
  </ul>
  {% endif %}
{% endfor %}{% endraw %}

Can you create the rest?
```

### Correcting prompt

It worked on the second attempt. In the first attempt, it invented a `split` Nunjucks filter, so I just told it about the error, and after that it just worked.

```
This fails now:
Error: filter not found: split (via Template render error)
```

## Conclusion

There may be more elegant ways to achieve this, but this approach is what worked for me, and, hey, it all happens on the server at build time, so you, dear reader, get just the optimized HTML. Happy URL hacking! Oh, and whatever happened on [March 3, 2009](/2009/03/03)?
