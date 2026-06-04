import { branchMatchesPresets } from './branchPresets';

export const MAIN_QUOTA = {
  OPEN: { AI: 'AIOPEN', HS: 'HSOPEN' },
  EWS: { AI: 'AIEWS', HS: 'HSEWS' },
  'OBC-NCL': { AI: 'AIOBC-NCL', HS: 'HSOBC-NCL' },
  SC: { AI: 'AISC', HS: 'HSSC' },
  ST: { AI: 'AIST', HS: 'HSST' },
};

/** Legacy JoSAA NIT PDFs often list OS* (other state) instead of AI* — treat as All India pool. */
const MAIN_QUOTA_OS = {
  OPEN: 'OSOPEN',
  EWS: 'OSEWS',
  'OBC-NCL': 'OSOBC-NCL',
  SC: 'OSSC',
  ST: 'OSST',
};

/** Hard cap on number of programmes returned. */
export const MAX_PREDICTOR_RESULTS = 75;

export const CATEGORY_OPTIONS = [
  { value: 'OPEN', label: 'OPEN' },
  { value: 'EWS', label: 'EWS' },
  { value: 'OBC-NCL', label: 'OBC-NCL' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'OPEN (PwD)', label: 'OPEN (PwD)' },
  { value: 'EWS (PwD)', label: 'EWS (PwD)' },
  { value: 'OBC-NCL (PwD)', label: 'OBC-NCL (PwD)' },
  { value: 'SC (PwD)', label: 'SC (PwD)' },
  { value: 'ST (PwD)', label: 'ST (PwD)' },
];

/** Derive base category + PwD flag from dropdown value (supports legacy pwd boolean). */
export function resolveCategoryFilters(category, pwd = false) {
  const raw = String(category || 'OPEN');
  const isPwd = pwd || raw.includes('(PwD)');
  const baseCategory = isPwd ? raw.replace(' (PwD)', '') : raw;
  return { category: baseCategory, pwd: isPwd, quota: isPwd ? `${baseCategory} (PwD)` : baseCategory };
}

export function matchesEntry(entry, filters) {
  const { exam, genderFemale, seatPool, institutionTypes } = filters;
  const { category, pwd, quota } = resolveCategoryFilters(filters.category, filters.pwd);
  if (!entry || entry.exam !== exam) return false;

  if (institutionTypes?.length) {
    if (!institutionTypes.includes(entry.institutionType)) return false;
  } else if (exam === 'JEE_ADVANCED' && entry.institutionType !== 'IIT') return false;
  else if (exam === 'JEE_MAIN' && !['NIT', 'IIIT'].includes(entry.institutionType)) return false;

  if (genderFemale) {
    if (!String(entry.gender || '').includes('Female-only')) return false;
  } else {
    const g = String(entry.gender || '');
    if (g.includes('Female-only')) return false;
    if (!g.includes('Gender-Neutral')) return false;
  }

  if (exam === 'JEE_ADVANCED') {
    return entry.quota === quota;
  }

  if (seatPool === 'HOME_STATE') {
    const expected = MAIN_QUOTA[category]?.HS;
    const expectedQuota = pwd && expected ? `${expected} (PwD)` : expected;
    return Boolean(expectedQuota && entry.quota === expectedQuota);
  }
  const ai = MAIN_QUOTA[category]?.AI;
  const os = MAIN_QUOTA_OS[category];
  const expectedAI = pwd && ai ? `${ai} (PwD)` : ai;
  const expectedOS = pwd && os ? `${os} (PwD)` : os;
  if (expectedAI && entry.quota === expectedAI) return true;
  if (expectedOS && entry.quota === expectedOS) return true;
  return false;
}

/**
 * @param {object[]} entries
 * @param {object} filters — matchesEntry fields + rank, maxResults, preferredBranchIds (preset ids)
 */
export function predictCutoffs(entries, filters) {
  const rank = Number(filters.rank);
  if (!Number.isFinite(rank) || rank < 1) return [];

  const max = Math.min(
    Number(filters.maxResults) > 0 ? Number(filters.maxResults) : MAX_PREDICTOR_RESULTS,
    MAX_PREDICTOR_RESULTS
  );

  const preferredBranchIds = filters.preferredBranchIds || [];

  const out = [];
  for (const e of entries) {
    if (!matchesEntry(e, filters)) continue;
    if (preferredBranchIds.length && !branchMatchesPresets(e.branch, preferredBranchIds)) continue;
    const cr = e.closingRank;
    if (typeof cr !== 'number') continue;
    // Only programmes you could get by last year's closing rank (rank ≤ closing).
    // Omits unreachable rows where your rank is worse than the published closing rank.
    if (rank > cr) continue;
    out.push({
      ...e,
      _sort: Math.abs(cr - rank),
    });
  }

  out.sort((a, b) => a._sort - b._sort || a.closingRank - b.closingRank);
  return out.slice(0, max).map(({ _sort, ...row }) => row);
}
