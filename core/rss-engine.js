const https = require("https");
const http = require("http");
const { parseString } = require("xml2js");

// Simple fetch wrapper for Termux (no fetch API)
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;

    lib.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

// Parse XML → JSON
function parseRSS(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, { trim: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Normalize RSS item structure
function normalizeItem(item, source) {
  return {
    title: item.title?.[0] || "",
    description: item.description?.[0] || "",
    link: item.link?.[0] || "",
    pubDate: item.pubDate?.[0] || "",
    source
  };
}

module.exports = {
  async fetchFeed(url, sourceName) {
    try {
      const xml = await fetchURL(url);
      const json = await parseRSS(xml);

      const items = json.rss?.channel?.[0]?.item || [];
      return items.map(i => normalizeItem(i, sourceName));
    } catch (err) {
      return [];
    }
  },

  async fetchAllFeeds() {
    const feeds = [
      { url: "https://richmond.craigslist.org/search/sss?format=rss", source: "Craigslist" },
      { url: "https://www.reddit.com/r/Flipping/.rss", source: "Reddit" },
      { url: "https://www.reddit.com/r/RealEstate/.rss", source: "Reddit" },
      { url: "https://www.reddit.com/r/Entrepreneur/.rss", source: "Reddit" }
    ];

    let all = [];

    for (const f of feeds) {
      const items = await this.fetchFeed(f.url, f.source);
      all = all.concat(items);
    }

    // Deduplicate by link
    const seen = new Set();
    const unique = all.filter(i => {
      if (seen.has(i.link)) return false;
      seen.add(i.link);
      return true;
    });

    return unique;
  }
};
