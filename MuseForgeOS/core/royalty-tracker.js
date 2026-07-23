// Royalty Tracker — Streaming Revenue Dashboard

class RoyaltyTracker {
  constructor() {
    this.platforms = ['Spotify', 'Apple Music', 'YouTube', 'Tidal'];
    this.rates = {
      Spotify: 0.004,
      'Apple Music': 0.0075,
      YouTube: 0.0002,
      Tidal: 0.012
    };
  }

  calculateRoyalties(streams, platform = 'Spotify') {
    const rate = this.rates[platform] || 0.004;
    const revenue = streams * rate;
    const split = revenue * 0.5; // 50% to artist

    return {
      platform,
      streams,
      grossRevenue: revenue,
      netToArtist: split
    };
  }

  generateReport(tracks) {
    const report = {};
    for (const track of tracks) {
      const platform = track.platform || 'Spotify';
      report[track.title] = this.calculateRoyalties(track.streams, platform);
    }
    return report;
  }
}

module.exports = RoyaltyTracker;
