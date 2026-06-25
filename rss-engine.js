import Parser from "rss-parser";
const parser = new Parser();

const feeds = [
  { name: "Craigslist", url: "https://norfolk.craigslist.org/search/rea?format=rss" },
  { name: "OfferUp",    url: "https://offerup.com/feed/?q=house" },
  { name: "Oodle",      url: "https://www.oodle.com/rss/region/usa/real-estate/" },
  { name: "Locanto",    url: "https://www.locanto.com/Real-Estate/RSS/" },
  { name: "Geebo",      url: "https://www.geebo.com/rss.xml?c=real_estate" },
  { name: "Reddit",     url: "https://www.reddit.com/r/wholesaling/.rss" },
  { name: "Zillow",     url: "https://www.zillow.com/homes/for_sale/rss/" }
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
