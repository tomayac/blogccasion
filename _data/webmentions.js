import fs from 'fs';
import unionBy from 'lodash/unionBy.js';
import metadata from './metadata.js';

// Define Cache Location and API Endpoint
const domain = metadata.domain;
const CACHE_FILE_PATH = '.cache/webmentions.json';
const API = 'https://webmention.io/api';
const TOKEN = metadata.webmention_io_token;

async function fetchWebmentions(since, perPage = 10000) {
  // If we don't have a domain name or token, abort
  if (!domain || !TOKEN) {
    console.warn('>>> unable to fetch webmentions: missing domain or token');
    return false;
  }
  let url = `${API}/mentions.jf2?domain=${domain}&token=${TOKEN}&per-page=${perPage}`;
  if (since) {
    url += `&since=${since}`; // only fetch new mentions
  }
  const response = await fetch(url);
  if (response.ok) {
    const feed = await response.json();
    console.log(
      `>>> ${feed.children.length} new webmentions fetched from ${API}`
    );
    return feed;
  } else {
    console.error('Could not fetch ' + url);
  }
  return null;
}

// Merge fresh webmentions with cached entries, unique per id
function mergeWebmentions(a, b) {
  return unionBy(a.children, b.children, 'wm-id');
}

// Save combined webmentions in cache file
function writeToCache(data) {
  const dir = '_cache';
  const fileContent = JSON.stringify(data, null, 2);
  // Create cache folder if it doesn't exist already
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  // Write data to cache json file
  fs.writeFile(CACHE_FILE_PATH, fileContent, (err) => {
    if (err) throw err;
    console.log(`>>> webmentions cached to ${CACHE_FILE_PATH}`);
  });
}
// Get cache contents from json file
function readFromCache() {
  if (fs.existsSync(CACHE_FILE_PATH)) {
    const cacheFile = fs.readFileSync(CACHE_FILE_PATH);
    return JSON.parse(cacheFile);
  }
  // no cache found.
  return {
    lastFetched: null,
    children: [],
  };
}

export default async function () {
  console.log('>>> Reading webmentions from cache...');
  const cache = readFromCache();
  if (cache.children.length) {
    console.log(`>>> ${cache.children.length} webmentions loaded from cache`);
  }
  // Only fetch new mentions in production
  if (process.env.NODE_ENV === 'production') {
    console.log('>>> Checking for new webmentions...');
    const feed = await fetchWebmentions(cache.lastFetched);
    if (feed) {
      const webmentions = {
        lastFetched: new Date().toISOString(),
        children: mergeWebmentions(cache, feed),
      };
      writeToCache(webmentions);
      return webmentions;
    }
  }
  return cache;
}
