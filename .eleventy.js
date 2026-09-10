import { DateTime } from 'luxon';
import eleventyImage, {
  eleventyImageTransformPlugin,
} from '@11ty/eleventy-img';
import htmlmin from 'html-minifier';
import _ from 'lodash';
import fs from 'fs';
import { minify } from 'terser';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import pluginRss from '@11ty/eleventy-plugin-rss';
import pluginSyntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import filters from './_11ty/filters.js';
import tagList from './_11ty/getTagList.js';

eleventyImage.concurrency = 2;

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    transformOnRequest: false,
    extensions: 'html',
    urlPath: '/images/',
    outputDir: './images/',
    // The image formats to generate, in order of preference
    formats: ['avif', 'webp', 'svg', 'auto'],
    // The images sizes to generate
    widths: [368, 736, 'auto'],
    defaultAttributes: {
      sizes: 'auto',
      loading: 'lazy',
      decoding: 'async',
    },
  });
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'dd LLL yyyy'
    );
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd');
  });

  eleventyConfig.addFilter('getCurrentYear', () => {
    return new Date().getFullYear();
  });

  // Locale-independent ordering: `localeCompare` can vary with the ICU build.
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // The slug of a tag page. Slugified rather than just lowercased, so that
  // tags like "Cross-Origin Storage" don't end up as `cross-origin%20storage`.
  const tagSlug = (tag) => eleventyConfig.getFilter('slugify')(String(tag));

  // The URL of a tag page. Several templates link to these, so the slug lives
  // in one place to keep them from drifting apart.
  eleventyConfig.addFilter('tagUrl', (tag) => `/tags/${tagSlug(tag)}/`);

  // Tags whose URL is not simply the lowercased tag. Those had a different URL
  // before slugs were introduced, so Caddy still redirects the old form.
  eleventyConfig.addFilter('tagRenames', (tags) =>
    (tags || [])
      .map((tag) => ({
        from: `/tags/${String(tag).toLowerCase()}/`,
        to: `/tags/${tagSlug(tag)}/`,
      }))
      .filter(({ from, to }) => from !== to)
      .sort((a, b) => cmp(a.from, b.from))
  );

  // Values the old blog's ViewByCategories.php could have been called with,
  // mapped to the tag slug. Case is preserved as well as folded, because the
  // old URLs used the tag's display casing and the file system is case
  // sensitive.
  eleventyConfig.addFilter('categoryMap', (tags) => {
    const seen = new Map();
    // Sorted, because `collections.tagList` comes out of a Set and its order
    // varies between builds. Unsorted output would make every deploy look
    // like the server config had changed.
    const sorted = [...(tags || [])]
      .map(String)
      .sort((a, b) => cmp(a.toLowerCase(), b.toLowerCase()) || cmp(a, b));
    for (const name of sorted) {
      const slug = tagSlug(name);
      for (const key of [name, name.toLowerCase(), name.toUpperCase()]) {
        if (!seen.has(key)) seen.set(key, slug);
      }
    }
    return [...seen].map(([key, slug]) => ({ key, slug }));
  });

  // The HHMMSS key the pre-2016 blog used in its permalinks, taken from the
  // suffix Eleventy still carries in the URL. Empty for posts that never had
  // one, which is how the legacy redirect map skips them.
  eleventyConfig.addFilter('legacyTimeKey', (url) => {
    const match = /-(\d{6})\/$/.exec(String(url || ''));
    return match ? match[1] : '';
  });

  // Minify JSON, used for Schema.org inline markup
  eleventyConfig.addFilter('jsonMinify', function (code) {
    let json = code;
    try {
      json = JSON.stringify(JSON.parse(code));
    } catch (err) {
      console.error(err.name, err.message, code);
    }
    return json;
  });

  // Minify inline scripts
  eleventyConfig.addNunjucksAsyncFilter(
    'jsmin',
    async function (code, callback) {
      try {
        const minified = await minify(code);
        callback(null, minified.code);
      } catch (err) {
        console.error('Terser error: ', err);
        // Fail gracefully.
        callback(null, code);
      }
    }
  );

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addFilter(filterName, filters[filterName]);
  });

  eleventyConfig.addCollection('tagList', tagList);

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

  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('static');
  eleventyConfig.addPassthroughCopy('images');
  eleventyConfig.addPassthroughCopy('fonts');
  eleventyConfig.addPassthroughCopy('pgp_public_key.asc');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('collect.php');
  eleventyConfig.addPassthroughCopy('feed.php');
  eleventyConfig.addPassthroughCopy('proxy.php');
  eleventyConfig.addPassthroughCopy('privacy-policy.txt');

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    linkify: true,
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      class: 'direct-link',
      symbol: '🔗',
    }),
    level: [1, 2, 3, 4, 5],
    slugify: eleventyConfig.getFilter('slugify'),
  });
  eleventyConfig.setLibrary('md', markdownLibrary);

  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      },
    },
  });

  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (outputPath.endsWith('.html')) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
      });
      return minified;
    }

    return content;
  });

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
}
