'use strict';
const fs = require('fs');
const file = 'nia-grant-application-packages.json';
if (!fs.existsSync(file)) throw new Error('Application packages not found.');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(data.packages)) throw new Error('Unexpected package format.');

const commonEvidence = [
  ['legal_identity', 'Verify legal business name, entity type, state registration and EIN documentation.'],
  ['ownership', 'Verify owners, control, and authorized applicant/signatory.'],
  ['ueI_sam', 'Check whether UEI and active SAM.gov registration are required; verify from official records.'],
  ['financials', 'Attach verified financial statements, funding history and revenue figures, if required.'],
  ['project_budget', 'Build an itemized budget from documented costs and verify allowability against the solicitation.'],
  ['project_plan', 'Document objectives, milestones, timeline, deliverables and measurable outcomes.'],
  ['supporting_evidence', 'Collect product evidence, intellectual property records, quotes, letters and other required attachments.'],
  ['certifications', 'Identify required certifications and obtain owner review before signing.']
];

function checklist(items) {
  return items.map(([id, requirement]) => ({
    id, requirement, status: 'MISSING_OR_UNVERIFIED', evidence: null
  }));
}

function enrich(p) {
  const id = String(p.grant || p.applicationId || p.id || '');
  const isNSF = /NSF-SBIR-26-510|NSF SBIR|America.s Seed Fund/i.test(
    id + ' ' + (p.name || '')
  );
  const isVIPC = /VIPC-LAUNCH-CYCLE-7|VIPC Launch Grant/i.test(
    id + ' ' + (p.name || '')
  );

  p.completionPlan = {
    version: 1,
    generatedAt: new Date().toISOString(),
    status: 'INCOMPLETE_REQUIRES_EVIDENCE',
    instructions: 'Replace prompts only with owner-confirmed facts and supporting evidence.',
    narrativeFields: [
      { id: 'problemStatement', prompt: 'Describe the specific problem, who experiences it, and evidence of the problem.', status: 'OWNER_INPUT_REQUIRED' },
      { id: 'targetCustomers', prompt: 'Identify intended customers, users, and how demand has been validated.', status: 'OWNER_INPUT_REQUIRED' },
      { id: 'innovationSummary', prompt: 'Explain the technical or program innovation and how it differs from existing alternatives.', status: 'OWNER_INPUT_REQUIRED' },
      { id: 'solution', prompt: 'Describe the proposed solution, current development stage, and work still required.', status: 'OWNER_INPUT_REQUIRED' },
      { id: 'workPlan', prompt: 'Specify research or development tasks, milestones, deliverables, and responsible people.', status: 'OWNER_INPUT_REQUIRED' },
      { id: 'commercializationPlan', prompt: 'Explain the route to market, competitors, pricing assumptions, and evidence of demand.', status: 'OWNER_INPUT_REQUIRED' },
      { id: 'teamQualifications', prompt: 'Provide verified applicant and team qualifications relevant to the project.', status: 'OWNER_INPUT_REQUIRED' },
      { id: 'impactMetrics', prompt: 'Define measurable outcomes and explain how each will be tracked.', status: 'OWNER_INPUT_REQUIRED' }
    ],
    evidenceChecklist: checklist(commonEvidence),
    budgetPlan: {
      status: 'REQUIRES_VERIFIED_COSTS',
      requiredFields: ['costCategory', 'description', 'amount', 'calculation', 'sourceEvidence', 'solicitationAllowability'],
      items: [],
      rule: 'Do not invent amounts, matching funds, quotes, salaries, or committed resources.'
    },
    milestonePlan: {
      status: 'OWNER_INPUT_REQUIRED',
      items: [],
      requiredFields: ['milestone', 'deliverable', 'targetDate', 'estimatedCost', 'verificationMethod']
    },
    ownerReview: [
      'Verify opportunity is open and deadline/time zone against the official solicitation.',
      'Confirm applicant, project and funding eligibility from primary sources.',
      'Check every factual claim and budget figure against evidence.',
      'Review all required attachments and certifications.',
      'Owner must approve the final application and personally authorize any submission.'
    ]
  };

  if (isNSF) {
    p.completionPlan.programSpecificChecks = checklist([
      ['solicitation', 'Confirm the current NSF solicitation, submission window, topic fit and required registrations.'],
      ['technical_merit', 'Document a specific, testable R&D question and technical uncertainty; ordinary product development alone may not qualify.'],
      ['research_plan', 'Specify research aims, methods, technical risks, success criteria and Phase I deliverables.'],
      ['principal_investigator', 'Verify PI eligibility, required time commitment and applicable company ownership/control rules.'],
      ['commercial_potential', 'Provide evidence-backed customer need, competitive analysis and commercialization path.'],
      ['prior_pitch', 'Check the official NSF Project Pitch portal/email for the prior pitch outcome and any invitation requirement.']
    ]);
  } else if (isVIPC) {
    p.completionPlan.programSpecificChecks = checklist([
      ['official_cycle', 'Verify Cycle 7 is open, the exact deadline, award amount and all current program rules on VIPC’s official page.'],
      ['stage_fit', 'Verify required company/product stage and revenue restrictions against current rules.'],
      ['match', 'Verify required cash or in-kind match, eligible sources, valuation rules and documentary proof.'],
      ['virginia_connection', 'Document the required Virginia business presence and project impact with evidence.'],
      ['use_of_funds', 'Map each requested expense to an eligible program cost and a verified quote or calculation.']
    ]);
  } else {
    p.completionPlan.programSpecificChecks = [];
  }

  p.status = 'DRAFT_REQUIRES_OWNER_REVIEW';
  p.submission = {
    ...(p.submission || {}),
    allowed: false,
    verifiedSubmitted: false,
    evidence: null
  };
  return p;
}

data.packages = data.packages.map(enrich);
data.safety = {
  ...(data.safety || {}),
  autoSubmit: false,
  ownerApprovalRequired: true,
  ownerSignatureRequired: true,
  eligibilityMustBeVerified: true,
  submissionRequiresPortalEvidence: true
};
const tmp = file + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
JSON.parse(fs.readFileSync(tmp, 'utf8'));
fs.renameSync(tmp, file);

console.log('COMPLETION LAYER: PASS');
console.log('Packages enriched:', data.packages.length);
console.log('NSF checklist:', data.packages.filter(p => /NSF-SBIR-26-510|NSF SBIR|America.s Seed Fund/i.test(String(p.grant)+' '+String(p.name))).length);
console.log('VIPC checklist:', data.packages.filter(p => /VIPC-LAUNCH-CYCLE-7|VIPC Launch Grant/i.test(String(p.grant)+' '+String(p.name))).length);
console.log('Auto-submit:', data.safety.autoSubmit);
console.log('Owner approval required:', data.safety.ownerApprovalRequired);
console.log('No applications submitted.');
