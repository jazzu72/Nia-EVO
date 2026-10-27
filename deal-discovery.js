#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * DEAL DISCOVERY ENGINE
 * Autonomous deal sourcing via RSS feeds
 * Filters by Markov scoring, auto-qualifies
 */

const https = require('https');
const http = require('http');
const { parseString } = require('xml2js');

function fetchURL(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      reject(new Error('Invalid feed URL'));
      return;
    }

    const lib = parsed.protocol === 'https:' ? https :
                parsed.protocol === 'http:' ? http : null;

    if (!lib) {
      reject(new Error('Unsupported URL protocol'));
      return;
    }

    const req = lib.get(parsed, {
      headers: {
        'User-Agent': 'HouseOfJazzu-Nia-DealDiscovery/1.0',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'
      }
    }, res => {
      const status = res.statusCode || 0;
      const location = res.headers.location;

      if ([301, 302, 303, 307, 308].includes(status) && location) {
        res.resume();
        if (redirects >= 5) {
          reject(new Error('Too many redirects'));
          return;
        }
        resolve(fetchURL(new URL(location, parsed).toString(), redirects + 1));
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        data += chunk;
        if (data.length > 5 * 1024 * 1024) {
          req.destroy(new Error('Feed exceeds 5 MB'));
        }
      });

      res.on('end', () => {
        if (status < 200 || status >= 300) {
          reject(new Error('HTTP ' + status));
          return;
        }
        resolve(data);
      });
    });

    req.setTimeout(15000, () => req.destroy(new Error('Feed timeout')));
    req.on('error', reject);
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


// CSV parser supports quoted commas, escaped quotes, and CRLF.
function parseCSVRows(input) {
  const rows = [];
  let row = [], field = "", quoted = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"' && field.length === 0) {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = "";
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(field);
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (quoted) throw new Error("CSV has an unclosed quoted field.");
  row.push(field);
  if (row.some(v => v.trim() !== "")) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows.shift().map(h => h.trim().replace(/^\uFEFF/, "").toLowerCase());
  return rows.map(values => {
    const item = {};
    headers.forEach((header, index) => {
      if (header) item[header] = (values[index] || "").trim();
    });
    return item;
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

  loadLocalCSV() {
    const csvPath = path.join(__dirname, "data", "property-leads.csv");
    if (!fs.existsSync(csvPath)) {
      console.log(`ℹ️  No local CSV yet: ${csvPath}`);
      return [];
    }

    const rows = parseCSVRows(fs.readFileSync(csvPath, "utf8"));
    const leads = rows.filter(r => r.title || r.description).map((r, index) => {
      const title = r.title || "Untitled property lead";
      const description = r.description || "";
      const extracted = this.extractDealData(title, description);
      const numericPrice = Number(String(r.price || "").replace(/[$,\s]/g, ""));

      return {
        ...r,
        ...extracted,
        title,
        description,
        price: Number.isFinite(numericPrice) && numericPrice > 0
          ? numericPrice : extracted.price,
        location: r.location || extracted.location || "",
        condition: r.condition || extracted.condition || "unknown",
        contact: r.contact || null,
        link: r.link || "",
        pubDate: r.pubdate || r.date || "",
        source: r.source || "CSV Import",
        id: r.id || `csv-${index + 1}`,
        verified: false,
        verificationStatus: "UNVERIFIED",
        listingDataSource: "local_csv"
      };
    });

    console.log(`📄 Loaded ${leads.length} local CSV lead(s).`);
    return leads;
  }

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
      /Norfolk|Virginia Beach|Chesapeake|Portsmouth|Suffolk|Hampton|Newport News|Williamsburg|Yorktown|Peninsula|Hampton Roads/i,
      /(\d+\s+[\w\s]+(?:St|Ave|Rd|Blvd|Drive|Dr|Lane|Ln|Court|Ct))/i
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

    // Include authorized local CSV exports when available.
    allItems.push(...this.loadLocalCSV());

    // Deduplicate
    const seen = new Set();
    const unique = allItems.filter(i => {
      const key = i.link || `${i.source || ''}|${i.title || ''}|${i.location || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
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
        price: item.price ?? dealData.price,
        location: item.location || dealData.location || "",
        condition: item.condition || dealData.condition || "unknown",
        contact: item.contact || null,
        verified: item.verified === true,
        verificationStatus: item.verificationStatus || "UNVERIFIED",
        listingDataSource: item.listingDataSource || "feed",
        leadScore: score,
        quality: score > 70 ? "HOT" : score > 50 ? "WARM" : "COLD"
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
      id: d.link || d.id || `${d.source || "lead"}-${d.title || "untitled"}`,
      title: d.title,
      description: (d.description || "").substring(0, 200),
      price: d.price ?? null,
      location: d.location || "",
      condition: d.condition || "unknown",
      leadScore: d.leadScore,
      quality: d.quality,
      source: d.source || "unknown",
      link: d.link || "",
      pubDate: d.pubDate || "",
      verified: d.verified === true,
      verificationStatus: d.verificationStatus || "UNVERIFIED",
      listingDataSource: d.listingDataSource || "feed"
    }));
  }
}

module.exports = DealDiscoveryEngine;

// Run if called directly
if (require.main === module) {
  const engine = new DealDiscoveryEngine();
  engine.discoverDeals();
}
