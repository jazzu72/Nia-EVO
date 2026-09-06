#!/usr/bin/env node

/**
 * DEAL DISCOVERY ENGINE
 * Autonomous deal sourcing via RSS feeds
 * Filters by Markov scoring, auto-qualifies
 */

const https = require('https');
const http = require('http');
const { parseString } = require('xml2js');

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

function parseRSS(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, { trim: true }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

class DealDiscoveryEngine {
  constructor() {
    this.feeds = [
      { url: 'https://richmond.craigslist.org/search/sss?format=rss', source: 'Craigslist' },
      { url: 'https://www.reddit.com/r/Flipping/.rss', source: 'Reddit Flipping' },
      { url: 'https://www.reddit.com/r/RealEstate/.rss', source: 'Reddit RealEstate' },
      { url: 'https://www.reddit.com/r/Entrepreneur/.rss', source: 'Reddit Entrepreneur' }
    ];

    this.deals = [];
    this.keywords = [
      'house',
      'property',
      'real estate',
      'wholesale',
      'investment',
      'flip',
      'rehab',
      'fixer',
      'motivated seller',
      'quick sale',
      'foreclosure'
    ];
  }

  /**
   * Markov Lead Scoring (0-100)
   * Higher = more likely to convert
   */
  scoreLeadMarkov(text, source) {
    let score = 0;

    // Keyword matching
    const lowerText = text.toLowerCase();
    this.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += 15;
      }
    });

    // Source reliability (from deal data)
    const sourceScores = {
      'Craigslist': 0.75,
      'Reddit Flipping': 0.85,
      'Reddit RealEstate': 0.80,
      'Reddit Entrepreneur': 0.70
    };

    score = Math.min(100, score * (sourceScores[source] || 0.70));

    // Text length signals (too short = low quality)
    if (text.length < 50) score -= 20;
    if (text.length > 2000) score -= 10; // Too long = probably not focused

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Extract deal parameters from text
   */
  extractDealData(title, description) {
    const deal = {
      title,
      description,
      price: null,
      location: null,
      condition: null,
      contact: null
    };

    // Try to extract price
    const priceMatch = description.match(/\$[\d,]+/);
    if (priceMatch) {
      deal.price = parseInt(priceMatch[0].replace(/[\$,]/g, ''));
    }

    // Try to extract location (Baltimore, MD region)
    const locationPatterns = [
      /Baltimore|Canton|Hampden|Fells Point|Remington|Downtown/i,
      /(\d+\s+[\w\s]+(?:St|Ave|Rd|Blvd|Drive))/i
    ];

    for (const pattern of locationPatterns) {
      const match = description.match(pattern);
      if (match) {
        deal.location = match[1] || match[0];
        break;
      }
    }

    // Assess condition from keywords
    if (/needs work|fixer|rehab|renovation/i.test(description)) {
      deal.condition = 'needs_work';
    } else if (/move-in|renovated|updated/i.test(description)) {
      deal.condition = 'move_in_ready';
    } else {
      deal.condition = 'unknown';
    }

    return deal;
  }

  /**
   * Fetch all feeds and score leads
   */
  async discoverDeals() {
    console.log('\n🔍 DEAL DISCOVERY ENGINE - Scanning RSS feeds...\n');

    let allItems = [];

    for (const feed of this.feeds) {
      try {
        console.log(`📡 Fetching: ${feed.source}`);
        const xml = await fetchURL(feed.url);
        const json = await parseRSS(xml);

        const items = json.rss?.channel?.[0]?.item || [];
        for (const item of items) {
          allItems.push({
            title: item.title?.[0] || '',
            description: item.description?.[0] || '',
            link: item.link?.[0] || '',
            pubDate: item.pubDate?.[0] || '',
            source: feed.source
          });
        }
      } catch (err) {
        console.log(`⚠️  Error fetching ${feed.source}: ${err.message}`);
      }
    }

    // Deduplicate
    const seen = new Set();
    const unique = allItems.filter(i => {
      if (seen.has(i.link)) return false;
      seen.add(i.link);
      return true;
    });

    console.log(`\n✅ Found ${unique.length} unique listings\n`);

    // Score and filter
    const scored = unique.map(item => {
      const score = this.scoreLeadMarkov(
        item.title + ' ' + item.description,
        item.source
      );

      const dealData = this.extractDealData(item.title, item.description);

      return {
        ...item,
        ...dealData,
        leadScore: score,
        quality: score > 70 ? 'HOT' : score > 50 ? 'WARM' : 'COLD'
      };
    });

    // Sort by score
    const sorted = scored.sort((a, b) => b.leadScore - a.leadScore);

    // Display top deals
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎯 TOP SCORED DEALS (Real-Time Discovery)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const topDeals = sorted.slice(0, 10);
    topDeals.forEach((deal, i) => {
      console.log(`${String(i + 1).padStart(2, '0')}. [${deal.quality}] ${deal.title.substring(0, 60)}`);
      console.log(`    Score: ${deal.leadScore.toFixed(0)}/100`);
      console.log(`    Source: ${deal.source}`);
      if (deal.price) console.log(`    Price: $${deal.price.toLocaleString()}`);
      if (deal.location) console.log(`    Location: ${deal.location}`);
      console.log(`    Link: ${deal.link.substring(0, 80)}`);
      console.log('');
    });

    this.deals = sorted;
    return sorted;
  }

  /**
   * Filter deals by Markov thresholds
   */
  filterQualifiedDeals() {
    return this.deals.filter(d => d.leadScore > 70 && d.location);
  }

  /**
   * Export for API
   */
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
      link: d.link,
      pubDate: d.pubDate
    }));
  }
}

module.exports = DealDiscoveryEngine;

// Run if called directly
if (require.main === module) {
  const engine = new DealDiscoveryEngine();
  engine.discoverDeals();
}
