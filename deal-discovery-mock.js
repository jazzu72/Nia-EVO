#!/usr/bin/env node

/**
 * DEAL DISCOVERY - MOCK ENGINE
 * Generates realistic Baltimore market deals
 * Perfect for testing Markov scoring + API integration
 */

class DealDiscoveryMock {
  constructor() {
    this.deals = [];
    this.keywords = ['house', 'property', 'wholesale', 'flip', 'rehab', 'fixer', 'motivated seller', 'foreclosure'];
    
    // Real Baltimore neighborhoods
    this.neighborhoods = [
      'Canton', 'Hampden', 'Fells Point', 'Remington', 
      'Downtown', 'Pigtown', 'Federal Hill', 'Highlandtown'
    ];

    // Realistic Baltimore market prices
    this.generateMockDeals();
  }

  generateMockDeals() {
    const deals = [
      {
        title: 'Fixer Upper - Canton - Motivated Seller',
        description: '3830 Brooklyn Ave, Canton. House needs full rehab. Motivated seller wants quick sale. Est. $145K ARV. Contact now.',
        price: 85000,
        location: 'Canton',
        condition: 'needs_work'
      },
      {
        title: 'Wholesale Opportunity - Hampden',
        description: '4110 Reisterstown Rd, Hampden. Great flip opportunity. Move-in ready after basic updates. Foreclosure auction.',
        price: 98000,
        location: 'Hampden',
        condition: 'needs_work'
      },
      {
        title: 'Investment Property - Fells Point',
        description: '1234 Harford Rd, Fells Point. Rental property. Generates $1200/mo income. Move-in ready.',
        price: 130000,
        location: 'Fells Point',
        condition: 'move_in_ready'
      },
      {
        title: 'Quick Cash Deal - Remington',
        description: '5432 Belair Rd, Remington. Wholesale deal. $155K ARV. Seller motivated. 45-day close.',
        price: 93000,
        location: 'Remington',
        condition: 'needs_work'
      },
      {
        title: 'Downtown Rehab - Best Deal',
        description: 'Downtown Baltimore. $200K ARV property. Perfect fix-and-flip. Needs work but solid bones.',
        price: 120000,
        location: 'Downtown',
        condition: 'needs_work'
      },
      {
        title: 'Pigtown Investment - Cashflow Ready',
        description: '2234 Gwynn Oak Ave, Pigtown. Rental property. $1300/mo income. Recently updated.',
        price: 125000,
        location: 'Pigtown',
        condition: 'move_in_ready'
      },
      {
        title: 'Federal Hill Flip - Hot Market',
        description: 'Federal Hill neighborhood. High appreciation area. Needs cosmetic updates only.',
        price: 140000,
        location: 'Federal Hill',
        condition: 'needs_work'
      },
      {
        title: 'Highlandtown Gem - Quick Sale',
        description: '3456 Hickory Ave, Highlandtown. Estate sale. Quick close needed. $1250/mo potential.',
        price: 95000,
        location: 'Highlandtown',
        condition: 'needs_work'
      }
    ];

    this.deals = deals.map((deal, i) => ({
      ...deal,
      link: `mock://deal-${i}`,
      source: 'Mock Baltimore Market',
      pubDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  scoreLeadMarkov(text, source) {
    let score = 50; // Base score

    const lowerText = text.toLowerCase();
    this.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) score += 12;
    });

    const sourceScores = { 'Mock Baltimore Market': 0.90 };
    score = Math.min(100, score * (sourceScores[source] || 0.70));

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async discoverDeals() {
    console.log('\n🔍 DEAL DISCOVERY ENGINE - Baltimore Market\n');
    console.log('📡 Scanning local market data...\n');

    const scored = this.deals.map(deal => ({
      ...deal,
      leadScore: this.scoreLeadMarkov(deal.title + ' ' + deal.description, deal.source),
    })).map(deal => ({
      ...deal,
      quality: deal.leadScore > 75 ? 'HOT' : deal.leadScore > 60 ? 'WARM' : 'COLD'
    }));

    const sorted = scored.sort((a, b) => b.leadScore - a.leadScore);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 DISCOVERED DEALS (Ranked by Markov Score)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    sorted.forEach((deal, i) => {
      const arv = (deal.price / 0.60); // Rough ARV estimation
      const fee = (arv - deal.price) * 0.10;

      console.log(`${String(i + 1).padStart(2, '0')}. [${deal.quality}] ${deal.title}`);
      console.log(`    Markov Score: ${deal.leadScore}/100`);
      console.log(`    Price: $${deal.price.toLocaleString()} | Est. ARV: $${Math.round(arv).toLocaleString()}`);
      console.log(`    Location: ${deal.location} | Condition: ${deal.condition}`);
      console.log(`    Est. Wholesale Fee: $${Math.round(fee).toLocaleString()}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════\n');

    // Summary
    const hotDeals = sorted.filter(d => d.quality === 'HOT');
    const warmDeals = sorted.filter(d => d.quality === 'WARM');
    const totalValue = hotDeals.reduce((sum, d) => sum + d.price, 0);
    const totalFees = hotDeals.reduce((sum, d) => sum + ((d.price / 0.60 - d.price) * 0.10), 0);

    console.log(`📊 SUMMARY:`);
    console.log(`   HOT Deals: ${hotDeals.length} | WARM Deals: ${warmDeals.length}`);
    console.log(`   Total Capital Needed: $${totalValue.toLocaleString()}`);
    console.log(`   Est. Wholesale Fees: $${Math.round(totalFees).toLocaleString()}`);
    console.log(`\n`);

    this.deals = sorted;
    return sorted;
  }

  getDealsForAPI() {
    return this.deals.map(d => ({
      id: d.link,
      title: d.title,
      description: d.description,
      price: d.price,
      location: d.location,
      condition: d.condition,
      leadScore: d.leadScore,
      quality: d.quality,
      source: d.source,
      link: d.link,
      pubDate: d.pubDate,
      estARV: Math.round(d.price / 0.60),
      estFee: Math.round((d.price / 0.60 - d.price) * 0.10)
    }));
  }
}

module.exports = DealDiscoveryMock;

if (require.main === module) {
  const engine = new DealDiscoveryMock();
  engine.discoverDeals().then(() => {
    console.log('✅ Ready to integrate into API\n');
  });
}
