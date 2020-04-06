#!/usr/bin/env node

const fs = require('fs').promises;
const xml2js = require('xml2js');
const puppeteer = require('puppeteer');

const parseSitemap = async () => {
  const sitemap = await fs.readFile('_site/sitemap.xml', {encoding: 'utf-8'});
  try {
    const xml = await xml2js.parseStringPromise(sitemap);
    const urls = [];
    if (xml.urlset && xml.urlset.url) {
      xml.urlset.url.forEach((url, i) => {
        urls[i] = url.loc[0];
      });
    }
    return urls;
  } catch (err) {
    console.error(err.name, err.message);
  }
};

const createScreenshots = async (page, url, output) => {
  url = url.replace('https://blog.tomayac.com', 'http://localhost:8080');
  try {
    console.log('Creating screenshots for', url);
    await page.goto(url);
    // Create Light Mode screenshot
    await page.emulateMediaFeatures([{
      name: 'prefers-color-scheme', value: 'light',
    }]);
    await page.waitFor(250);
    await page.screenshot({path: `${output}-light.png`});
    // Create Dark Mode screenshot
    await page.emulateMediaFeatures([{
      name: 'prefers-color-scheme', value: 'dark',
    }]);
    await page.waitFor(250);
    await page.screenshot({path: `${output}-dark.png`});
  } catch (err) {
    console.error(err.name, err.message);
  }
};

const start = async () => {
  const browser = await puppeteer.launch({
    // The macOS firewall might complain, see
    // https://github.com/GoogleChrome/puppeteer/issues/4752.
    headless: true,
  });
  const page = await browser.newPage();

  const urls = await parseSitemap();
  for (const url of urls) {
    const output =
        `./_site/${url.replace('https://blog.tomayac.com/', '')}screenshot`;
    await createScreenshots(page, url, output);
  }
  await browser.close();
};

start();
