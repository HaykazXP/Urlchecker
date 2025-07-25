require('dotenv').config();
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const SITEMAP_URL = process.env.SITEMAP_URL;
const AUTH = {
  username: process.env.SITEMAP_USERNAME,
  password: process.env.SITEMAP_PASSWORD,
};

const FORBIDDEN_LOG = path.join(__dirname, 'forbidden_urls.txt');
const EXAMINED_LOG = path.join(__dirname, 'examined_urls.txt');

// Clear the forbidden log file at the start
fs.writeFileSync(FORBIDDEN_LOG, '');
fs.writeFileSync(EXAMINED_LOG, '');

async function fetchXml(url) {
  const response = await axios.get(url, {
    auth: AUTH,
    headers: { 'Accept': 'application/xml' },
  });
  return response.data;
}

async function parseSitemap(xml) {
  const result = await xml2js.parseStringPromise(xml);
  let sitemapUrls = [];
  let pageUrls = [];

  // Collect nested sitemap URLs
  if (result.sitemapindex && result.sitemapindex.sitemap) {
    sitemapUrls = result.sitemapindex.sitemap.map(s => s.loc[0]);
  }
  // Collect page URLs
  if (result.urlset && result.urlset.url) {
    pageUrls = result.urlset.url.map(u => u.loc[0]);
  }
  // Some sitemaps may have both
  return { sitemapUrls, pageUrls };
}

function hasForbiddenChars(url) {
  return /[A-Z]/.test(url) || /\s/.test(url) || /[^a-zA-Z0-9\/\-\.\:\_]/.test(url);
}

async function getAllUrlsAndCheck(sitemapUrl, visited = new Set()) {
  if (visited.has(sitemapUrl)) {
    return;
  }
  visited.add(sitemapUrl);

  const xml = await fetchXml(sitemapUrl);
  const { sitemapUrls, pageUrls } = await parseSitemap(xml);

  // Recursively process nested sitemaps
  for (const nestedSitemap of sitemapUrls) {
    await getAllUrlsAndCheck(nestedSitemap, visited);
  }

  // Process page URLs
  for (const entry of pageUrls) {
    console.log(`Checking: ${entry}`);
    fs.appendFileSync(EXAMINED_LOG, entry + '\n');
    if (hasForbiddenChars(entry)) {
      console.log(`FORBIDDEN: ${entry}`);
      fs.appendFileSync(FORBIDDEN_LOG, entry + '\n');
    }
  }
}

(async () => {
  console.log(`Checking sitemap: ${SITEMAP_URL}`);
  await getAllUrlsAndCheck(SITEMAP_URL);
  console.log(`Forbidden URLs have been logged to ${FORBIDDEN_LOG}`);
})();