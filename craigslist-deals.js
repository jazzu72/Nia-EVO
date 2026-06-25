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
      description: item.contentSnippet || ""
    }));
  } catch (err) {
    console.error("Craigslist ingestion error:", err);
    return [];
  }
}
