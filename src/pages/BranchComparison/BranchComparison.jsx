import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import './BranchComparison.scss';
import { fetchBranchCatalog, compareBranches } from '../../services/branchIntelApi';
import catalogStatic from '../../data/institutionBranchCatalog.json';
import BranchComparisonResults from './BranchComparisonResults';
import BranchComparisonLoadingOverlay from './BranchComparisonLoadingOverlay';

const INSTITUTION_TYPES = ['IIT', 'NIT', 'IIIT','BITS','VIT','SRM','Amrita'];

function staticCatalog() {
  const byType = {};
  for (const t of INSTITUTION_TYPES) {
    const m = catalogStatic[t]?.branchesByCollege || {};
    byType[t] = {
      colleges: Object.keys(m).sort(),
      branchesByCollege: m,
    };
  }
  return { types: [...INSTITUTION_TYPES], byType };
}

/**
 * Merge API catalog with bundled JSON. Production APIs sometimes omit branches or
 * return keys that differ slightly — static data keeps dropdowns working after deploy.
 */
function mergeCatalogs(api, fallback) {
  const out = { types: [...INSTITUTION_TYPES], byType: {} };
  for (const t of INSTITUTION_TYPES) {
    const fbMap = fallback?.byType?.[t]?.branchesByCollege || {};
    const apiMap = api?.byType?.[t]?.branchesByCollege || {};
    const merged = {};
    // IIIT: bundled catalog uses short canonical names; APIs often still serve PDF-scrape garbage keys.
    if (t === 'IIIT') {
      for (const college of Object.keys(fbMap)) {
        const a = apiMap[college];
        const f = fbMap[college];
        const pick =
          Array.isArray(a) && a.length > 0 ? a : Array.isArray(f) && f.length > 0 ? f : [];
        if (pick.length) merged[college] = pick;
      }
    } else {
      const allKeys = new Set([...Object.keys(fbMap), ...Object.keys(apiMap)]);
      for (const college of allKeys) {
        const a = apiMap[college];
        const f = fbMap[college];
        const pick =
          Array.isArray(a) && a.length > 0 ? a : Array.isArray(f) && f.length > 0 ? f : [];
        if (pick.length) merged[college] = pick;
      }
    }
    out.byType[t] = {
      colleges: Object.keys(merged).sort(),
      branchesByCollege: merged,
    };
  }
  return out;
}

function normCollegeKey(s) {
  return String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Resolve branches for a college; handles whitespace / case mismatches vs catalog keys. */
function branchesForCollege(catalog, type, college) {
  if (!college || !catalog?.byType?.[type]?.branchesByCollege) return [];
  const m = catalog.byType[type].branchesByCollege;
  if (Array.isArray(m[college]) && m[college].length) return m[college];
  const n = normCollegeKey(college);
  const key = Object.keys(m).find((k) => normCollegeKey(k) === n);
  return key && Array.isArray(m[key]) ? m[key] : [];
}

function collegeOptionsList(catalog, type) {
  const colleges = catalog?.byType?.[type]?.colleges || [];
  return colleges.map((c) => ({ value: c, label: c }));
}

const BranchComparison = () => {
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [type1, setType1] = useState('IIT');
  const [type2, setType2] = useState('IIT');
  const [college1, setCollege1] = useState('');
  const [college2, setCollege2] = useState('');
  const [branch1, setBranch1] = useState('');
  const [branch2, setBranch2] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);
  const [result, setResult] = useState(null);

  const branchesFor1 = useMemo(
    () => branchesForCollege(catalog, type1, college1),
    [college1, type1, catalog]
  );

  const branchesFor2 = useMemo(
    () => branchesForCollege(catalog, type2, college2),
    [college2, type2, catalog]
  );

  const options1 = useMemo(() => collegeOptionsList(catalog, type1), [catalog, type1]);
  const options2 = useMemo(() => collegeOptionsList(catalog, type2), [catalog, type2]);

  useEffect(() => {
    setCollege1('');
    setBranch1('');
  }, [type1]);

  useEffect(() => {
    setCollege2('');
    setBranch2('');
  }, [type2]);

  useEffect(() => {
    setBranch1((prev) => (prev && branchesFor1.includes(prev) ? prev : ''));
  }, [college1, branchesFor1]);

  useEffect(() => {
    setBranch2((prev) => (prev && branchesFor2.includes(prev) ? prev : ''));
  }, [college2, branchesFor2]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError('');
      setLoadingLists(true);
      try {
        const data = await fetchBranchCatalog();
        if (!cancelled) setCatalog(mergeCatalogs(data, staticCatalog()));
      } catch (e) {
        if (!cancelled) {
          setCatalog(staticCatalog());
          setLoadError(
            e.message
              ? `${e.message} Using built-in catalog from the last import.`
              : 'Using built-in IIT/NIT/IIIT catalog (offline).'
          );
        }
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!type1 || !college1 || !branch1 || !type2 || !college2 || !branch2) {
      setSubmitError('Please choose institution type, college, and branch for both sides.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        institutionType1: type1,
        college1,
        branch1,
        institutionType2: type2,
        college2,
        branch2,
      };
      const q = userQuery.trim();
      if (q) payload.user_query = q;
      const data = await compareBranches(payload);
      setResult(data);
      try {
        sessionStorage.setItem('branchintel_compare_result', JSON.stringify(data));
      } catch {
        /* ignore */
      }
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewComparison = useCallback(() => {
    setResult(null);
    setSubmitError('');
    try {
      sessionStorage.removeItem('branchintel_compare_result');
    } catch {
      /* ignore */
    }
  }, []);

  const selectStyles = useMemo(
    () => ({
      menuPortal: (base) => ({ ...base, zIndex: 10002 }),
      control: (base, state) => ({
        ...base,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: state.isFocused ? '#10c3bc' : 'rgba(16, 195, 188, 0.35)',
        minHeight: 44,
        boxShadow: state.isFocused ? '0 0 0 1px #10c3bc' : 'none',
        '&:hover': { borderColor: '#10c3bc' },
      }),
      menu: (base) => ({ ...base, borderRadius: 10, zIndex: 10002 }),
    }),
    []
  );

  if (result) {
    return (
      <div className="branch-comparison-bg branch-comparison-bg--results">
        <div className="branch-comparison-container branch-comparison-container--wide">
          <BranchComparisonResults data={result} onNewComparison={handleNewComparison} />
        </div>
      </div>
    );
  }

  // Do not tie branch dropdowns to loadError: on deploy the catalog API may 404 while the
  // catch path still sets full data from staticCatalog() — branches must stay usable.
  const branch1Disabled = loadingLists || !catalog || !college1;
  const branch2Disabled = loadingLists || !catalog || !college2;

  const summaryLine =
    college1 && branch1 && college2 && branch2
      ? `${branch1} · ${college1} (${type1})  vs  ${branch2} · ${college2} (${type2})`
      : '';

  return (
    <div className="branch-comparison-bg">
      <BranchComparisonLoadingOverlay active={loading} compareSummary={summaryLine} />

      <div className="branch-comparison-container branch-comparison-container--form-wide">
        <header className="branch-comparison-page-head">
          <h2>Branch Comparision</h2>
          <p className="branch-comparison-page-sub">
            Pick two branches — we&apos;ll help you see how they stack up.
          </p>
        </header>

        {loadError ? (
          <p className="branch-intel-form-error branch-intel-form-error--soft" role="status">
            {loadError}
          </p>
        ) : null}

        <form className="branch-intel-form" onSubmit={handleSubmit} noValidate>
          <div className="branch-intel-grid branch-intel-grid--compare">
            <div className="branch-intel-field">
              <label htmlFor="inst-type-1">Institution 1</label>
              <select
                id="inst-type-1"
                value={type1}
                onChange={(e) => setType1(e.target.value)}
                disabled={loadingLists}
              >
                {INSTITUTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="branch-intel-field">
              <label htmlFor="inst-type-2">Institution 2</label>
              <select
                id="inst-type-2"
                value={type2}
                onChange={(e) => setType2(e.target.value)}
                disabled={loadingLists}
              >
                {INSTITUTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="branch-intel-field">
              <label htmlFor="college-select-1" className="branch-intel-sublabel">
                College — search
              </label>
              <Select
                inputId="college-select-1"
                className="branch-intel-react-select"
                classNamePrefix="branch-intel-rs"
                isDisabled={loadingLists || !catalog}
                options={options1}
                value={college1 ? { value: college1, label: college1 } : null}
                onChange={(opt) => setCollege1(opt ? opt.value : '')}
                placeholder="Search college…"
                isClearable
                isSearchable
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                styles={selectStyles}
                noOptionsMessage={() => 'No colleges match'}
              />
            </div>
            <div className="branch-intel-field">
              <label htmlFor="college-select-2" className="branch-intel-sublabel">
                College — search
              </label>
              <Select
                inputId="college-select-2"
                className="branch-intel-react-select"
                classNamePrefix="branch-intel-rs"
                isDisabled={loadingLists || !catalog}
                options={options2}
                value={college2 ? { value: college2, label: college2 } : null}
                onChange={(opt) => setCollege2(opt ? opt.value : '')}
                placeholder="Search college…"
                isClearable
                isSearchable
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                styles={selectStyles}
                noOptionsMessage={() => 'No colleges match'}
              />
            </div>

            <div className="branch-intel-field">
              <label htmlFor="branch1">Branch 1</label>
              <select
                id="branch1"
                value={branch1}
                onChange={(e) => setBranch1(e.target.value)}
                disabled={branch1Disabled}
                required
              >
                <option value="">{college1 ? 'Choose branch' : 'Choose college first'}</option>
                {branchesFor1.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="branch-intel-field">
              <label htmlFor="branch2">Branch 2</label>
              <select
                id="branch2"
                value={branch2}
                onChange={(e) => setBranch2(e.target.value)}
                disabled={branch2Disabled}
                required
              >
                <option value="">{college2 ? 'Choose branch' : 'Choose college first'}</option>
                {branchesFor2.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="branch-intel-field branch-intel-field--full">
            <label htmlFor="user_query">Your question (optional)</label>
            <textarea
              id="user_query"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g. Which is better for a very good job?"
              rows={3}
            />
          </div>

          {submitError ? (
            <p className="branch-intel-form-error" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="branch-intel-actions">
            <button
              type="submit"
              className="branch-intel-btn"
              disabled={loading || loadingLists || !catalog}
            >
              Compare branches
            </button>
          </div>
          <p className="branch-intel-hint">
            IIT / NIT / IIIT lists come from JoSAA-style PDFs (dropdowns only). You can compare any
            combination across types.
          </p>
        </form>
      </div>
    </div>
  );
};

export default BranchComparison;
