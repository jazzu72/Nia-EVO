#!/usr/bin/env node

const https = require('https');
const http = require('http');

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

class DealDiscoveryEngine {
  constructor() {
    this.feeds = [
      { url: 'https://richmond.craigslist.org/search/sss?format=rss', source: 'Craigslist' },
      { url: 'https://www.reddit.com/r/Flipping/.rss', source: 'Reddit Flipping' }
    ];
    this.deals = [];
    this.keywords = ['house', 'property', 'wholesale', 'flip', 'rehab', 'fixer', 'motivated seller', 'foreclosure'];
  }

  scoreLeadMarkov(text, source) {
    let score = 0;
    const lowerText = text.toLowerCase();
    
    this.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) score += 15;
    });

    const sourceScores = { 'Craigslist': 0.75, 'Reddit Flipping': 0.85 };
    score = Math.min(100, score * (sourceScores[source] || 0.70));

    if (text.length < 50) score -= 20;
    if (text.length > 2000) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  extractDealData(title, description) {
    const deal = { title, description, price: null, location: null, condition: null };

    const priceMatch = description.match(/\$[\d,]+/);
    if (priceMatch) deal.price = parseInt(priceMatch[0].replace(/[\$,]/g, ''));

    const locationPatterns = [/Baltimore|Canton|Hampden|Fells Point/i, /(\d+\s+[\w\s]+(?:St|Ave|Rd|Blvd))/i];
    for (const pattern of locationPatterns) {
      const match = description.match(pattern);
      if (match) { deal.location = match[1] || match[0]; break; }
    }

    if (/needs work|fixer|rehab/i.test(description)) deal.condition = 'needs_work';
    else if (/move-in|renovated/i.test(description)) deal.condition = 'move_in_ready';
    else deal.condition = 'unknown';

    return deal;
  }

  async discoverDeals() {
    console.log('\n🔍 DEAL DISCOVERY ENGINE - Scanning RSS feeds...\n');

    let allItems = [];

    for (const feed of this.feeds) {
      try {
        console.log(`📡 Fetching: ${feed.source}`);
        const xml = await fetchURL(feed.url);

        // Simple regex-based XML parsing
        const titleRegex = /<title>([^<]+)<\/title>/g;
        const descRegex = /<description>([^<]+)<\/description>/g;
        const linkRegex = /<link>([^<]+)<\/link>/g;

        const titles = [...xml.matchAll(titleRegex)].map(m => m[1]).slice(1);
        const descs = [...xml.matchAll(descRegex)].map(m => m[1]).slice(1);
        const links = [...xml.matchAll(linkRegex)].map(m => m[1]).slice(1);

        for (let i = 0; i < Math.min(titles.length, 20); i++) {
          allItems.push({
            title: titles[i],
            description: descs[i] || titles[i],
            link: links[i],
            source: feed.source
          });
        }
      } catch (err) {
        console.log(`⚠️  Error fetching ${feed.source}: ${err.message}`);
      }
    }

    const seen = new Set();
    const unique = allItems.filter(i => {
      if (seen.has(i.link)) return false;
      seen.add(i.link);
      return true;
    });

    console.log(`\n✅ Found ${unique.length} unique listings\n`);

    const scored = unique.map(item => {
      const score = this.scoreLeadMarkov(item.title + ' ' + item.description, item.source);
      const dealData = this.extractDealData(item.title, item.description);

      return { ...item, ...dealData, leadScore: score, quality: score > 70 ? 'HOT' : score > 50 ? 'WARM' : 'COLD' };
    });

    const sorted = scored.sort((a, b) => b.leadScore - a.leadScore);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎯 TOP SCORED DEALS');
    console.log('═══════════════════════════════════════════════════════════\n');

    sorted.slice(0, 10).forEach((deal, i) => {
      console.log(`${String(i + 1).padStart(2, '0')}. [${deal.quality}] ${deal.title.substring(0, 60)}`);
      console.log(`    Score: ${deal.leadScore.toFixed(0)}/100`);
      console.log(`    Source: ${deal.source}`);
      if (deal.price) console.log(`    Price: $${deal.price.toLocaleString()}`);
      if (deal.location) console.log(`    Location: ${deal.location}`);
      console.log('');
    });

    this.deals = sorted;
    return sorted;
  }

  getDealsForAPI() {
    return this.deals.map(d => ({
      id: d.link,
      title: d.title,
      description: d.description.substring(0, 200),
      price: d.price,
      location: d.location,
      condition: d.condition,
      leadScore: d.leadScore,
      quality: d.quality,
      source: d.source,
      link: d.link
    }));
  }
}

module.exports = DealDiscoveryEngine;

if (require.main === module) {
  const engine = new DealDiscoveryEngine();
  engine.discoverDeals();
}
