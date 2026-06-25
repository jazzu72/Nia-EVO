#!/data/data/com.termux/files/usr/bin/bash

echo "📡 Installing Craigslist ingestion for NIA‑EVO..."

# Ensure dependencies
npm install rss-parser --prefix ~/nia-capital-os

# Create craigslist-deals.js
cat > ~/nia-capital-os/craigslist-deals.js << 'EOM'
import Parser from "rss-parser";
const parser = new Parser();

export async function fetchCraigslistDeals(city = "norfolk") {
  try {
    const url = `https://${city}.craigslist.org/search/rea?format=rss`;
    const feed = await parser.parseURL(url);

    return feed.items.map(item => ({
      source: "Craigslist",
      title: item.title || "",
      link: item.link || "",
      published: item.pubDate || "",
      description: item.contentSnippet || "",
    }));
  } catch (err) {
    console.error("Craigslist ingestion error:", err);
    return [];
  }
}
EOM

# Patch server.js to import module
sed -i '1s/^/import { fetchCraigslistDeals } from ".\/craigslist-deals.js";\n/' ~/nia-capital-os/server.js

# Add ingestion call
sed -i '/const allDeals = \[/a \
  const craigslist = await fetchCraigslistDeals("norfolk");\
  allDeals.push(...craigslist);' ~/nia-capital-os/server.js

# Add status banner
sed -i '/Real Autonomous Features Active:/a \  • Craigslist: ✅ CONNECTED (RSS)' ~/nia-capital-os/server.js

echo "✅ Craigslist ingestion installed."
echo "Restart with: node ~/nia-capital-os/server.js"
