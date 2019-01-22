const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginRss);
};