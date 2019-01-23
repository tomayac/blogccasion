const pluginRss = require("@11ty/eleventy-plugin-rss");
//const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginRss);
  //eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy('static');
  eleventyConfig.addPassthroughCopy('images');

  return {
    dir: {
      output: "dist"
    }
  };
};