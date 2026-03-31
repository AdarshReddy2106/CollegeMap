import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './CollegePredictor.scss';
import { predictCutoffs, MAX_PREDICTOR_RESULTS } from './predictorFilter';
import { BRANCH_PRESETS } from './branchPresets';

const DATA_URL = `${process.env.PUBLIC_URL || ''}/data/josaaCutoffs.json`;

export default function CollegePredictor() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const [exam, setExam] = useState('JEE_ADVANCED');
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('OPEN');
  const [genderFemale, setGenderFemale] = useState(false);
  const [seatPool, setSeatPool] = useState('ALL_INDIA');
  /** JEE Main: which institutions to include */
  const [mainInstitutions, setMainInstitutions] = useState('BOTH');
  /** Branch preset ids — empty means all branches */
  const [preferredBranchIds, setPreferredBranchIds] = useState([]);

  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setEntries(Array.isArray(data.entries) ? data.entries : []);
      })
      .catch(() => {
        if (!cancelled) setLoadError('unavailable');
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const institutionTypes = useMemo(() => {
    if (exam === 'JEE_ADVANCED') return ['IIT'];
    if (mainInstitutions === 'NIT') return ['NIT'];
    if (mainInstitutions === 'IIIT') return ['IIIT'];
    return ['NIT', 'IIIT'];
  }, [exam, mainInstitutions]);

  const toggleBranch = useCallback((id) => {
    setPreferredBranchIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const run = useCallback(
    (e) => {
      e.preventDefault();
      setSubmitError('');
      const r = parseInt(String(rank).replace(/\s/g, ''), 10);
      if (!Number.isFinite(r) || r < 1) {
        setSubmitError('Enter rank');
        return;
      }
      const rows = predictCutoffs(entries, {
        exam,
        rank: r,
        category,
        genderFemale,
        seatPool,
        institutionTypes,
        maxResults: MAX_PREDICTOR_RESULTS,
        preferredBranchIds,
      });
      navigate('/college-predictor/results', {
        state: {
          predictorPayload: {
            rank: r,
            exam,
            category,
            genderFemale,
            seatPool,
            mainInstitutions: exam === 'JEE_MAIN' ? mainInstitutions : null,
            preferredBranchIds,
            results: rows,
          },
        },
      });
    },
    [
      entries,
      exam,
      rank,
      category,
      genderFemale,
      seatPool,
      institutionTypes,
      mainInstitutions,
      preferredBranchIds,
      navigate,
    ]
  );

  return (
    <div className="cp-page">
      <div className="cp-card">
        <h1 className="cp-title">College predictor</h1>

        <form className="cp-form" onSubmit={run}>
          <div className="cp-row">
            <label htmlFor="cp-exam">Exam</label>
            <select
              id="cp-exam"
              value={exam}
              onChange={(ev) => setExam(ev.target.value)}
              disabled={loadingData}
            >
              <option value="JEE_ADVANCED">JEE Advanced</option>
              <option value="JEE_MAIN">JEE Main</option>
            </select>
          </div>
          <div className="cp-row">
            <label htmlFor="cp-rank">Rank</label>
            <input
              id="cp-rank"
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="CRL / category rank"
              value={rank}
              onChange={(ev) => setRank(ev.target.value)}
              disabled={loadingData}
            />
          </div>
          <div className="cp-row">
            <label htmlFor="cp-cat">Category</label>
            <select
              id="cp-cat"
              value={category}
              onChange={(ev) => setCategory(ev.target.value)}
              disabled={loadingData}
            >
              <option value="OPEN">OPEN</option>
              <option value="EWS">EWS</option>
              <option value="OBC-NCL">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
          <div className="cp-row">
            <label htmlFor="cp-gen">Gender</label>
            <select
              id="cp-gen"
              value={genderFemale ? 'f' : 'n'}
              onChange={(ev) => setGenderFemale(ev.target.value === 'f')}
              disabled={loadingData}
            >
              <option value="n">Neutral</option>
              <option value="f">Female</option>
            </select>
          </div>
          {exam === 'JEE_MAIN' ? (
            <>
              <div className="cp-row">
                <label htmlFor="cp-pool">Pool</label>
                <select
                  id="cp-pool"
                  value={seatPool}
                  onChange={(ev) => setSeatPool(ev.target.value)}
                  disabled={loadingData}
                >
                  <option value="ALL_INDIA">All India</option>
                  <option value="HOME_STATE">Home state</option>
                </select>
              </div>
              <div className="cp-row cp-row--top">
                <span id="cp-main-lbl" className="cp-label-span">
                  Institutes
                </span>
                <div className="cp-seg" role="group" aria-labelledby="cp-main-lbl">
                  <label className="cp-seg-opt">
                    <input
                      type="radio"
                      name="cp-main-inst"
                      checked={mainInstitutions === 'BOTH'}
                      onChange={() => setMainInstitutions('BOTH')}
                      disabled={loadingData}
                    />
                    Both NIT &amp; IIIT
                  </label>
                  <label className="cp-seg-opt">
                    <input
                      type="radio"
                      name="cp-main-inst"
                      checked={mainInstitutions === 'NIT'}
                      onChange={() => setMainInstitutions('NIT')}
                      disabled={loadingData}
                    />
                    NIT only
                  </label>
                  <label className="cp-seg-opt">
                    <input
                      type="radio"
                      name="cp-main-inst"
                      checked={mainInstitutions === 'IIIT'}
                      onChange={() => setMainInstitutions('IIIT')}
                      disabled={loadingData}
                    />
                    IIIT only
                  </label>
                </div>
              </div>
            </>
          ) : null}
          <div className="cp-row cp-row--top">
            <span className="cp-label-span" id="cp-branch-label">
              Branches
            </span>
            <div className="cp-branch-field">
              <p className="cp-hint" id="cp-branch-hint">
                Optional — tick any branches you care about. Leave all unchecked to include every branch.
                Up to {MAX_PREDICTOR_RESULTS} results.
              </p>
              <div
                className="cp-branch-list"
                role="group"
                aria-labelledby="cp-branch-label"
                aria-describedby="cp-branch-hint"
              >
                {BRANCH_PRESETS.map((p) => (
                  <label key={p.id} className="cp-branch-row">
                    <input
                      type="checkbox"
                      className="cp-branch-checkbox"
                      checked={preferredBranchIds.includes(p.id)}
                      onChange={() => toggleBranch(p.id)}
                      disabled={loadingData}
                    />
                    <span className="cp-branch-text">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="cp-btn" disabled={loadingData || !!loadError}>
            Predict
          </button>
        </form>

        {loadError ? <p className="cp-err">Data unavailable</p> : null}
        {submitError ? <p className="cp-err">{submitError}</p> : null}
      </div>
    </div>
  );
}
