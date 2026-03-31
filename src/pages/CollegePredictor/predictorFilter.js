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

export function matchesEntry(entry, filters) {
  const { exam, category, genderFemale, seatPool, institutionTypes } = filters;
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
    return entry.quota === category;
  }

  if (seatPool === 'HOME_STATE') {
    const expected = MAIN_QUOTA[category]?.HS;
    return Boolean(expected && entry.quota === expected);
  }
  const ai = MAIN_QUOTA[category]?.AI;
  const os = MAIN_QUOTA_OS[category];
  if (ai && entry.quota === ai) return true;
  if (os && entry.quota === os) return true;
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
