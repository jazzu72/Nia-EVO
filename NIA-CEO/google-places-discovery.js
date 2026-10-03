'use strict';

async function searchBusinesses({
  apiKey,
  query,
  location,
  radius = 25000,
  pageSize = 20
} = {}) {
  if (!apiKey || !query || !location?.lat || !location?.lng) return [];

  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.googleMapsUri',
          'places.websiteUri',
          'places.nationalPhoneNumber',
          'places.rating',
          'places.userRatingCount',
          'places.businessStatus',
          'places.types'
        ].join(',')
      },
      body: JSON.stringify({
        textQuery: query,
        pageSize: Math.min(Number(pageSize) || 20, 20),
        locationBias: {
          circle: {
            center: {
              latitude: Number(location.lat),
              longitude: Number(location.lng)
            },
            radius: Number(radius)
          }
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Google Places HTTP ${response.status}`);
  }

  const data = await response.json();

  return (data.places || []).map(place => ({
    source: 'google_places',
    sourceId: place.id || null,
    company: place.displayName?.text || null,
    opportunityType: 'LOCAL_BUSINESS',
    title: place.displayName?.text || 'Local business',
    description: [
      place.formattedAddress,
      place.types?.join(', ')
    ].filter(Boolean).join(' — '),
    url: place.googleMapsUri || null,
    website: place.websiteUri || null,
    phone: place.nationalPhoneNumber || null,
    address: place.formattedAddress || null,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    evidence: {
      businessStatus: place.businessStatus || null,
      types: place.types || []
    },

    // Discovery evidence only — NOT commercial qualification.
    qualificationScore: Math.min(
      100,
      Math.round(
        (Number(place.rating) || 0) * 10 +
        Math.min(Number(place.userRatingCount) || 0, 50)
      )
    ),

    readOnly: true,
    persisted: false,
    mutation: false,
    outreachSent: false,
    authorizationRequired: true,
    externalExecution: 'BLOCKED'
  }));
}

module.exports = { searchBusinesses };
