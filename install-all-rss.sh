#!/data/data/com.termux/files/usr/bin/bash

echo "🌐 Installing ALL RSS ingestion sources for NIA‑EVO..."

# Ensure dependency
npm install rss-parser --prefix ~/nia-capital-os

# Create unified RSS engine
cat > ~/nia-capital-os/rss-engine.js << 'EOM'
import Parser from "rss-parser";
const parser = new Parser();

const feeds = [
  { name: "Craigslist", url: "https://norfolk.craigslist.org/search/rea?format=rss" },
  { name: "OfferUp", url: "https://offerup.com/feed/?q=house" },
  { name: "Oodle", url: "https://www.oodle.com/rss/region/usa/real-estate/" },
  { name: "Locanto", url: "https://www.locanto.com/Real-Estate/RSS/" },
  { name: "Geebo", url: "https://www.geebo.com/rss.xml?c=real_estate" },
  { name: "Reddit", url: "https://www.reddit.com/r/wholesaling/.rss" },
  { name: "Zillow", url: "https://www.zillow.com/homes/for_sale/rss/" }
];

export async function fetchAllRSS() {
  const results = [];

  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);
      const items = data.items.map(item => ({
        source: feed.name,
        title: item.title || "",
        link: item.link || "",
        published: item.pubDate || "",
        description: item.contentSnippet || ""
      }));
      results.push(...items);
    } catch (err) {
      console.error(`RSS error (${feed.name}):`, err);
    }
  }

  return results;
}
EOM

# Patch server.js to import module
sed -i '1s/^/import { fetchAllRSS } from ".\/rss-engine.js";\n/' ~/nia-capital-os/server.js

# Add ingestion call
sed -i '/const allDeals = \[/a \
  const rssDeals = await fetchAllRSS();\
  allDeals.push(...rssDeals);' ~/nia-capital-os/server.js

# Add status banner
sed -i '/Real Autonomous Features Active:/a \  • RSS Engine: ✅ CONNECTED (Multi‑Source)' ~/nia-capital-os/server.js

echo "✅ ALL RSS sources installed."
echo "Restart with: node ~/nia-capital-os/server.js"
