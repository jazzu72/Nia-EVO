'use strict';

const https = require('https');
const http = require('http');
const discovery = require('./funding-discovery-engine');
const { PDFParse } = require('pdf-parse');

function htmlToVisibleText(value) {
  return String(value ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/section|\/article|\/h[1-6]|\/tr|\/td|\/th)[^>]*>/gi, '\\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanText(value) {
  return htmlToVisibleText(value);
}

function extractEvidence(text, keywords) {
  const body = cleanText(text);
  const lower = body.toLowerCase();
  const results = [];

  for (const keyword of keywords) {
    const k = String(keyword).toLowerCase();
    let index = lower.indexOf(k);

    while (index !== -1 && results.length < 10) {
      const start = Math.max(0, index - 180);
      const end = Math.min(
        body.length,
        index + k.length + 320
      );

      results.push(cleanText(body.slice(start, end)));
      index = lower.indexOf(k, index + k.length);
    }
  }

  return [...new Set(results)];
}

function extractOpportunityIdentifiers(text, url) {
  const body = cleanText(text);
  const identifiers = [];

  const patterns = [
    /\b(?:funding\s+)?opportunity\s*(?:number|no\.?|id)\s*[:#-]\s*([A-Z]{1,8}[-_][A-Z0-9]{2,30})\b/gi,
    /\b(?:funding\s+)?opportunity\s*(?:number|no\.?|id)\s*[:#-]\s*(\d{4,12})\b/gi,
    /\b(?:grant|funding)\s+(?:opportunity|program)\s*(?:number|no\.?|id)\s*[:#-]\s*([A-Z0-9]{3,30})\b/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(body)) !== null) {
      if (match[1]) identifiers.push(match[1]);
    }
  }

  if (url) {
    const urlPatterns = [
      /[?&](?:opportunityNumber|opportunityId|opp|opportunity)=([A-Za-z0-9_-]{3,80})/i
    ];

    for (const pattern of urlPatterns) {
      const match = url.match(pattern);
      if (match?.[1]) identifiers.push(match[1]);
    }
  }

  const blocked = new Set([
    'provides','provide','providing','funding','grant','grants',
    'opportunity','opportunities','program','programs',
    'application','applications','apply','applying',
    'deadline','deadlines','amount','award','awards',
    'eligible','eligibility','small','business'
  ]);

  const unique = [
    ...new Set(
      identifiers
        .map(cleanText)
        .filter(x =>
          x.length >= 3 &&
          !blocked.has(x.toLowerCase()) &&
          !/^(zone-benefits|benefits|apply|application|funding|grant)$/i.test(x)
        )
    )
  ];

  return {
    opportunityId:
      unique.find(x => /^\d{4,12}$/.test(x)) || null,

    opportunityNumber:
      unique.find(x => !/^\d{4,12}$/.test(x)) || null,

    identifiers: unique
  };
}

async function extractOfficialPdfEvidence(rawHtml, sourceUrl) {
  const html = String(rawHtml ?? '');
  const links = [];
  const hrefPattern = /href\s*=\s*["']([^"']+)["']/gi;

  let match;
  while ((match = hrefPattern.exec(html)) !== null) {
    const href = match[1];
    if (!href || /^javascript:/i.test(href) || /^mailto:/i.test(href)) continue;

    try {
      const absolute = new URL(href, sourceUrl).href;

      if (
        /\.pdf(?:[?#]|$)/i.test(absolute) ||
        /download\?attachment/i.test(absolute) ||
        /(solicitation|guideline|funding|application)/i.test(absolute)
      ) {
        links.push(absolute);
      }
    } catch {}
  }

  const unique = [...new Set(links)];

  const sourceHost = (() => {
    try {
      return new URL(sourceUrl).hostname.toLowerCase();
    } catch {
      return '';
    }
  })();

  const officialLinks = unique.filter(url => {
    try {
      const host = new URL(url).hostname.toLowerCase();

      return (
        host === sourceHost ||
        host.endsWith('.gov') ||
        /(^|\.)grants\.gov$/i.test(host) ||
        /(^|\.)sbir\.gov$/i.test(host)
      );
    } catch {
      return false;
    }
  });

  const documents = [];

  for (const url of officialLinks.slice(0, 8)) {
    try {
      const page = await fetchPage(url);

      const isPdf =
        /application\/pdf/i.test(page.contentType || '') ||
        /\.pdf(?:[?#]|$)/i.test(url);

      if (!isPdf || !page.body) continue;

      const parser = new PDFParse({
        data: Buffer.from(page.body)
      });

      const result = await parser.getText();
      await parser.destroy();

      const text = cleanText(result?.text || '');

      if (text.length > 100) {
        documents.push({
          url,
          text
        });
      }
    } catch (error) {
      documents.push({
        url,
        text: '',
        error: error.message
      });
    }
  }

  return documents;
}


function extractSolicitationIdentifiers(text) {
  const body = cleanText(text);
  const identifiers = [];

  const patterns = [
    /\bFY\s*\d{4}\s+Incentive\s+Program\s+Solicitation\b/gi,
    /\bFY\s*\d{4}\s+Matching\s+Program\s+Solicitation\b/gi,
    /\bFY\s*\d{4}\s+STTR\s+Matching\s+Program\s+Solicitation\b/gi,
    /\b(?:RFP|RFA|NOFO|FOA)[-_ ]?[A-Z0-9][A-Z0-9._-]{2,60}\b/gi,
    /\b(?:Notice|Request)\s+for\s+(?:Funding|Applications|Proposals)\b/gi
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(body)) !== null) {
      const value = cleanText(match[0]);

      if (
        value.length >= 8 &&
        value.length <= 160 &&
        !identifiers.includes(value)
      ) {
        identifiers.push(value);
      }
    }
  }

  return identifiers;
}

function extractApplicationPath(text, sourceUrl) {
  const body = cleanText(text);
  const links = [];

  const hrefPattern =
    /href\s*=\s*["']([^"']+)["']/gi;

  let match;

  while ((match = hrefPattern.exec(body)) !== null) {
    const href = match[1];

    if (
      /apply|application|submit|register|funding|grant/i
        .test(href)
    ) {
      links.push(href);
    }
  }

  const absoluteUrls =
    body.match(/https?:\/\/[^\s"'<>]+/gi) || [];

  for (const url of absoluteUrls) {
    if (
      /apply|application|submit|register|funding|grant/i
        .test(url)
    ) {
      links.push(url);
    }
  }

  const unique = [...new Set(links)];

  return unique[0] || null;
}

function extractOfficialSource(text, candidateUrl) {
  const urls =
    cleanText(text).match(
      /https?:\/\/[^\s"'<>]+/gi
    ) || [];

  const all = [
    candidateUrl,
    ...urls
  ].filter(Boolean);

  const official = all.find(url =>
    /\.gov(?:\/|$)/i.test(url) ||
    /\.edu(?:\/|$)/i.test(url) ||
    /grants\.gov/i.test(url) ||
    /sbir\.gov/i.test(url)
  );

  return official || null;
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    let parsed;

    try {
      parsed = new URL(url);
    } catch {
      return reject(
        new Error('INVALID_URL')
      );
    }

    const client =
      parsed.protocol === 'https:'
        ? https
        : http;

    const req = client.get(
      parsed,
      {
        timeout: 15000,
        headers: {
          'User-Agent':
            'NIA-CAPITAL-OS-Funding-Research/1.0'
        }
      },
      res => {
        let data = '';

        res.setEncoding('utf8');

        res.on('data', chunk => {
          data += chunk;

          if (data.length > 1500000) {
            req.destroy(
              new Error('PAGE_TOO_LARGE')
            );
          }
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            contentType:
              res.headers['content-type'] || '',
            body: data
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(
        new Error('PAGE_TIMEOUT')
      );
    });

    req.on('error', reject);
  });
}


function extractOfficialDocumentLinks(rawHtml, sourceUrl) {
  const body = String(rawHtml || '');
  const links = [];
  const hrefPattern = /href\s*=\s*["']([^"']+)["']/gi;

  let match;

  while ((match = hrefPattern.exec(body)) !== null) {
    const href = match[1];

    if (!href || /^javascript:/i.test(href)) continue;

    let absolute;

    try {
      absolute = new URL(href, sourceUrl).href;
    } catch {
      continue;
    }

    const lower = absolute.toLowerCase();

    if (
      /\.pdf(?:[?#]|$)/i.test(lower) ||
      /solicitation|guideline|funding|application|download\?attachment/i.test(lower)
    ) {
      links.push(absolute);
    }
  }

  return [...new Set(links)];
}

function isOfficialDocumentUrl(url, sourceUrl) {
  try {
    const documentHost = new URL(url).hostname.toLowerCase();
    const sourceHost = new URL(sourceUrl).hostname.toLowerCase();

    return (
      documentHost === sourceHost ||
      documentHost.endsWith('.gov') ||
      documentHost === 'grants.gov' ||
      documentHost.endsWith('.grants.gov') ||
      documentHost === 'sbir.gov' ||
      documentHost.endsWith('.sbir.gov')
    );
  } catch {
    return false;
  }
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    let parsed;

    try {
      parsed = new URL(url);
    } catch {
      return reject(new Error('INVALID_URL'));
    }

    const client =
      parsed.protocol === 'https:'
        ? https
        : http;

    const req = client.get(
      parsed,
      {
        timeout: 20000,
        headers: {
          'User-Agent':
            'NIA-CAPITAL-OS-Funding-Research/1.0'
        }
      },
      res => {
        const chunks = [];
        let total = 0;
        const maxBytes = 5000000;

        res.on('data', chunk => {
          total += chunk.length;

          if (total > maxBytes) {
            req.destroy(
              new Error('DOCUMENT_TOO_LARGE')
            );
            return;
          }

          chunks.push(chunk);
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            contentType:
              res.headers['content-type'] || '',
            body: Buffer.concat(chunks)
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('DOCUMENT_TIMEOUT'));
    });

    req.on('error', reject);
  });
}

async function fetchPdfText(url) {
  const response = await fetchBinary(url);

  if (
    response.statusCode < 200 ||
    response.statusCode >= 400
  ) {
    throw new Error(
      'DOCUMENT_HTTP_' + response.statusCode
    );
  }

  const parser = new PDFParse({
    data: response.body
  });

  try {
    const result = await parser.getText();
    return String(result.text || '');
  } finally {
    await parser.destroy();
  }
}

async function enrichPageWithOfficialDocuments(
  candidate,
  page
) {
  const links = extractOfficialDocumentLinks(
    page.body,
    candidate.url
  ).filter(url =>
    isOfficialDocumentUrl(url, candidate.url)
  );

  const documents = [];

  for (const url of links.slice(0, 5)) {
    try {
      const response = await fetchBinary(url);

      const contentType =
        String(response.contentType || '').toLowerCase();

      const isPdf =
        /\.pdf(?:[?#]|$)/i.test(url) ||
        contentType.includes('application/pdf');

      if (!isPdf) continue;

      if (
        response.statusCode < 200 ||
        response.statusCode >= 400
      ) {
        throw new Error(
          'DOCUMENT_HTTP_' + response.statusCode
        );
      }

      const parser = new PDFParse({
        data: response.body
      });

      let text = '';

      try {
        const result = await parser.getText();
        text = String(result.text || '');
      } finally {
        await parser.destroy();
      }

      if (text.trim()) {
        documents.push({
          url,
          contentType,
          text
        });
      }
    } catch (error) {
      documents.push({
        url,
        error: error.message
      });
    }
  }

  if (!documents.some(x => x.text)) {
    return page;
  }

  const pdfText = documents
    .filter(x => x.text)
    .map(x => x.text)
    .join('\n\n');

  return {
    ...page,
    body:
      String(page.body || '') +
      '\n\n' +
      pdfText,
    officialDocuments: documents
  };
}

function collectCandidate(candidate, page) {
  const text = cleanText(page.body);

  const eligibilityEvidence =
    extractEvidence(text, [
      'eligibility',
      'eligible applicants',
      'eligible organizations',
      'small business',
      'for-profit',
      'nonprofit'
    ]);

  const deadlineEvidence =
    extractEvidence(text, [
      'deadline',
      'application deadline',
      'closing date',
      'due date',
      'applications close',
      'applications due'
    ]);

  const fundingAmountEvidence =
    extractEvidence(text, [
      'award',
      'funding',
      'grant amount',
      'up to $',
      'maximum award',
      'amount available'
    ]);

  const applicationEvidence =
    extractEvidence(text, [
      'apply',
      'application',
      'how to apply',
      'submit an application',
      'application process'
    ]);

  const identifiers =
    extractOpportunityIdentifiers(
      text,
      candidate.url
    );

  const solicitationIdentifiers = extractSolicitationIdentifiers(text);

  const applicationPath =
    extractApplicationPath(
      text,
      candidate.url
    );

  const officialSource =
    extractOfficialSource(
      text,
      candidate.url
    );

  const source =
    candidate.sourceProvider ||
    candidate.source ||
    null;

  const sourceVerified = Boolean(
    candidate.url &&
    page.statusCode >= 200 &&
    page.statusCode < 400
  );

  const hasEligibility =
    eligibilityEvidence.length > 0;

  const hasDeadline =
    deadlineEvidence.length > 0;

  const hasFunding =
    fundingAmountEvidence.length > 0;

  const hasApplication =
    applicationEvidence.length > 0 ||
    Boolean(applicationPath);

  const hasFederalOpportunity =
    Boolean(
      identifiers.opportunityId ||
      identifiers.opportunityNumber
    );

  const hasSolicitation =
    solicitationIdentifiers.length > 0;

  const hasOpportunity =
    hasFederalOpportunity ||
    hasSolicitation;

  /*
   * A generic grant-listing page is NOT an opportunity.
   *
   * We require an identifiable opportunity before
   * the candidate can become VERIFIED.
   */

  let verificationStatus =
    'INSUFFICIENT_EVIDENCE';

  if (
    sourceVerified &&
    hasOpportunity &&
    hasEligibility &&
    hasDeadline &&
    hasApplication &&
    hasFunding
  ) {
    verificationStatus =
      'EVIDENCE_FOUND_REQUIRES_REVIEW';
  } else if (
    sourceVerified &&
    (
      hasOpportunity ||
      hasEligibility ||
      hasDeadline ||
      hasApplication ||
      hasFunding
    )
  ) {
    verificationStatus =
      'SOURCE_FOUND_REQUIRES_VERIFICATION';
  } else if (sourceVerified) {
    verificationStatus =
      'SOURCE_VERIFIED_EVIDENCE_MISSING';
  }

  return {
    id:
      identifiers.opportunityId ||
      identifiers.opportunityNumber ||
      null,

    name:
      candidate.title ||
      candidate.name ||
      null,

    source,

    discoveryUrl:
      candidate.url || null,

    officialUrl:
      officialSource ||
      candidate.url ||
      null,

    applicationPath,

    searchQuery:
      candidate.query || null,

    discoveryProvider:
      candidate.sourceProvider || null,

    opportunityId:
      identifiers.opportunityId,

    opportunityNumber:
      identifiers.opportunityNumber,

    opportunityIdentifiers:
      identifiers.identifiers,

    
    solicitationIdentifiers,

    opportunityIdentityType:
      hasFederalOpportunity
        ? 'FEDERAL_OPPORTUNITY'
        : hasSolicitation
          ? 'OFFICIAL_SOLICITATION'
          : null,
eligibilityEvidence:
      eligibilityEvidence.join(' | '),

    deadlineEvidence:
      deadlineEvidence.join(' | '),

    fundingAmountEvidence:
      fundingAmountEvidence.join(' | '),

    applicationEvidence:
      applicationEvidence.join(' | '),

    officialSourceEvidence:
      officialSource,

    evidence: {
      opportunityId:
        identifiers.opportunityId,

      opportunityNumber:
        identifiers.opportunityNumber,      solicitationIdentifiers,
      opportunityIdentityType:
        hasFederalOpportunity
          ? 'FEDERAL_OPPORTUNITY'
          : hasSolicitation
            ? 'OFFICIAL_SOLICITATION'
            : null,


      opportunityVerified:
        hasOpportunity,

      eligibility:
        hasEligibility,

      eligibilityEvidence:
        eligibilityEvidence.join(' | '),

      deadline:
        hasDeadline,

      deadlineEvidence:
        deadlineEvidence.join(' | '),

      fundingAmount:
        hasFunding,

      fundingAmountEvidence:
        fundingAmountEvidence.join(' | '),

      applicationPath:
        Boolean(applicationPath),

      applicationEvidence:
        applicationEvidence.join(' | ')
    },

    verificationStatus,

    ownerReviewOnly: true,
    submissionAllowed: false,
    signingAllowed: false,
    financialExecutionAllowed: false,
    moneyMovementAllowed: false,
    automaticApprovalAllowed: false,
    ownerApprovalRequired: true,
    ownerSignatureRequired: true,

    httpStatus:
      page.statusCode,

    contentType:
      page.contentType
  };
}

async function collect(candidates) {
  const profile =
    discovery.loadProfile();

  const results = [];

  for (const candidate of candidates) {
    if (!candidate?.url) continue;

    try {
      const page =
                                    await fetchPage(candidate.url);

                                const enrichedPage =
                                    await enrichPageWithOfficialDocuments(
                                        candidate,
                                        page
                                    );

                                results.push(
                                    collectCandidate(
                                        candidate,
                                        enrichedPage
                                    )
                                );
    } catch (error) {
      results.push({
        name:
          candidate.title ||
          candidate.name ||
          null,

        source:
          candidate.sourceProvider ||
          null,

        discoveryUrl:
          candidate.url ||
          null,

        officialUrl:
          candidate.url ||
          null,

        verificationStatus:
          'SOURCE_FETCH_FAILED',

        error:
          error.message,

        ownerReviewOnly: true,
        submissionAllowed: false,
        signingAllowed: false,
        financialExecutionAllowed: false,
        moneyMovementAllowed: false,
        automaticApprovalAllowed: false,
        ownerApprovalRequired: true,
        ownerSignatureRequired: true
      });
    }
  }

  return {
    organization:
      profile.organization.name,

    mode:
      profile.ownerControls.mode,

    candidateCount:
      results.length,

    evidenceFoundCount:
      results.filter(
        x =>
          x.verificationStatus ===
          'EVIDENCE_FOUND_REQUIRES_REVIEW'
      ).length,

    partialEvidenceCount:
      results.filter(
        x =>
          x.verificationStatus ===
          'PARTIAL_EVIDENCE_REQUIRES_REVIEW' ||
          x.verificationStatus ===
          'SOURCE_FOUND_REQUIRES_VERIFICATION'
      ).length,

    results
  };
}

module.exports = {
  collect,
  collectCandidate,
  extractEvidence,
  extractOpportunityIdentifiers,
  extractApplicationPath,
  extractOfficialSource,
  extractSolicitationIdentifiers,
  cleanText
};
