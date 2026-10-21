const SPREADSHEET_ID = process.env.SHEET_ID || '1xm32z1Gqd5qKpX98wPxj7ToXTjF_9pU6h2CFbZzDx8o';

// Subject Sheet Tab GIDs (Edit these GIDs or set environment variables when splitting into separate tabs)
const SHEET_TAB_GIDS = {
  physics: process.env.SHEET_GID_PHYSICS || process.env.REACT_APP_SHEET_GID_PHYSICS || '743977408',
  chemistry: process.env.SHEET_GID_CHEMISTRY || process.env.REACT_APP_SHEET_GID_CHEMISTRY || '113602565',
  math: process.env.SHEET_GID_MATH || process.env.REACT_APP_SHEET_GID_MATH || '1766363191'
};

const getTabCsvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;

// In-memory cache for sheet data (5 min TTL)
let questionsCache = [];
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Robust CSV parser that handles quotes and line breaks within quotes
 */
function parseCSV(text) {
  const p = [[]];
  let row = p[0];
  let col = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuote && next === '"') {
        col += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (c === ',' && !inQuote) {
      row.push(col.trim());
      col = '';
    } else if ((c === '\r' || c === '\n') && !inQuote) {
      if (c === '\r' && next === '\n') { i++; }
      row.push(col.trim());
      col = '';
      row = [];
      p.push(row);
    } else {
      col += c;
    }
  }
  if (col || row.length > 0) {
    row.push(col.trim());
  }
  return p.filter(r => r.length >= 6 && (r[1] || r[0]));
}

/**
 * Parse correct option index (0, 1, 2, or 3) from Answer column
 */
function parseCorrectOption(ansRaw, options) {
  if (ansRaw === null || ansRaw === undefined || ansRaw === '') return 0;
  const ansStr = String(ansRaw).trim();
  if (!ansStr) return 0;

  const ansUpper = ansStr.toUpperCase();

  // 1. Direct exact text match against options
  for (let i = 0; i < options.length; i++) {
    const optText = (options[i] || '').trim();
    if (optText && optText.toLowerCase() === ansStr.toLowerCase()) {
      return i;
    }
  }

  // 2. Cleaned text exact match against options
  const cleanAns = ansStr.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (cleanAns) {
    for (let i = 0; i < options.length; i++) {
      const cleanOpt = (options[i] || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanOpt && cleanOpt === cleanAns) {
        return i;
      }
    }
  }

  // 3. Option letter labels ('A', 'B', 'C', 'D', 'Option A', 'Option A.', etc.)
  if (ansUpper === 'A' || ansUpper.startsWith('OPTION A') || ansUpper.startsWith('OPTIONA') || ansUpper.startsWith('OPT A')) return 0;
  if (ansUpper === 'B' || ansUpper.startsWith('OPTION B') || ansUpper.startsWith('OPTIONB') || ansUpper.startsWith('OPT B')) return 1;
  if (ansUpper === 'C' || ansUpper.startsWith('OPTION C') || ansUpper.startsWith('OPTIONC') || ansUpper.startsWith('OPT C')) return 2;
  if (ansUpper === 'D' || ansUpper.startsWith('OPTION D') || ansUpper.startsWith('OPTIOND') || ansUpper.startsWith('OPT D')) return 3;

  // 4. Index matching ('0', '1', '2', '3')
  if (['0', '1', '2', '3'].includes(ansStr)) {
    return parseInt(ansStr, 10);
  }

  // 5. Substring match fallback (for long text strings)
  if (cleanAns && cleanAns.length >= 4) {
    for (let i = 0; i < options.length; i++) {
      const cleanOpt = (options[i] || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanOpt && (cleanOpt.includes(cleanAns) || cleanAns.includes(cleanOpt))) {
        return i;
      }
    }
  }

  return 0;
}

/**
 * Parse raw rows from a sheet tab into structured question objects
 */
function parseSheetRows(rawRows, defaultSubject = 'Physics') {
  const dataRows = (rawRows[0][1]?.toLowerCase() === 'question' || rawRows[0][0]?.toLowerCase() === 'subject')
    ? rawRows.slice(1)
    : rawRows;

  return dataRows.map((r, index) => {
    let subjectRaw = (r[0] || '').trim().toLowerCase();
    let subject = defaultSubject;
    if (subjectRaw.includes('chem')) subject = 'Chemistry';
    else if (subjectRaw.includes('math')) subject = 'Mathematics';
    else if (subjectRaw.includes('phys')) subject = 'Physics';

    // If col 0 looks like question text instead of subject name in single-subject tab
    let questionText = r[1] || '';
    let optionA = r[2] || '';
    let optionB = r[3] || '';
    let optionC = r[4] || '';
    let optionD = r[5] || '';
    let ansRaw = r[6] || '';
    let dateCol1 = r[7] || '';
    let dateCol2 = r[8] || '';

    if (!questionText && r[0] && r[0].length > 15 && r[1] && r[2]) {
      // 0-indexed tab format: Question, OptA, OptB, OptC, OptD, Ans, Date
      questionText = r[0];
      optionA = r[1];
      optionB = r[2];
      optionC = r[3];
      optionD = r[4];
      ansRaw = r[5] || '';
      dateCol1 = r[6] || '';
      dateCol2 = r[7] || '';
    }

    const options = [optionA, optionB, optionC, optionD];
    const correctOption = parseCorrectOption(ansRaw, options);

    let dateTag = '';
    if (dateCol2 && dateCol2.includes('/')) dateTag = dateCol2.trim();
    else if (dateCol1 && dateCol1.includes('/')) dateTag = dateCol1.trim();

    return {
      id: `${defaultSubject.toLowerCase()}_q_${index + 1}`,
      subject,
      question: questionText,
      options,
      correctOption,
      dateTag,
      rawIndex: index + 1
    };
  }).filter(q => q.question && q.options[0]);
}

/**
 * Fetch and parse all questions from the Google Sheet (Single sheet or multi-tab)
 */
async function fetchQuestionsFromSheet(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && questionsCache.length > 0 && (now - lastFetchTimestamp) < CACHE_TTL_MS) {
    return questionsCache;
  }

  const isMultiTab = (
    SHEET_TAB_GIDS.physics !== SHEET_TAB_GIDS.chemistry ||
    SHEET_TAB_GIDS.physics !== SHEET_TAB_GIDS.math
  );

  try {
    let allParsed = [];

    if (isMultiTab) {
      console.log('[GoogleSheet] Fetching multi-tab question banks (Physics, Chem, Math)...');
      const [physRes, chemRes, mathRes] = await Promise.all([
        axios.get(getTabCsvUrl(SHEET_TAB_GIDS.physics), { timeout: 10000 }).catch(e => ({ data: '' })),
        axios.get(getTabCsvUrl(SHEET_TAB_GIDS.chemistry), { timeout: 10000 }).catch(e => ({ data: '' })),
        axios.get(getTabCsvUrl(SHEET_TAB_GIDS.math), { timeout: 10000 }).catch(e => ({ data: '' }))
      ]);

      const physQs = physRes.data ? parseSheetRows(parseCSV(physRes.data), 'Physics') : [];
      const chemQs = chemRes.data ? parseSheetRows(parseCSV(chemRes.data), 'Chemistry') : [];
      const mathQs = mathRes.data ? parseSheetRows(parseCSV(mathRes.data), 'Mathematics') : [];

      allParsed = [...physQs, ...chemQs, ...mathQs];
    } else {
      const response = await axios.get(getTabCsvUrl(SHEET_TAB_GIDS.physics), { timeout: 10000 });
      allParsed = parseSheetRows(parseCSV(response.data), 'Physics');
    }

    questionsCache = allParsed;
    lastFetchTimestamp = now;
    console.log(`[GoogleSheet] Synced ${allParsed.length} questions from Google Sheet tabs`);
    return allParsed;
  } catch (err) {
    console.error('[GoogleSheet] Error fetching questions:', err.message);
    if (questionsCache.length > 0) return questionsCache;
    return getFallbackQuestions();
  }
}

/**
 * Get current date string in IST format (M/D/YYYY and YYYY-MM-DD)
 */
function getISTDateInfo(dateObj = new Date()) {
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const parts = istFormatter.formatToParts(dateObj);
  let month = '', day = '', year = '';
  for (const p of parts) {
    if (p.type === 'month') month = p.value;
    if (p.type === 'day') day = p.value;
    if (p.type === 'year') year = p.value;
  }

  // Format: M/D/YYYY (e.g. 10/5/2026) and MM/DD/YYYY (e.g. 10/05/2026) and YYYY-MM-DD
  const mPadded = month.padStart(2, '0');
  const dPadded = day.padStart(2, '0');

  const mdYYYY = `${month}/${day}/${year}`;
  const mmddYYYY = `${mPadded}/${dPadded}/${year}`;
  const yyyyMMdd = `${year}-${mPadded}-${dPadded}`;

  // Time remaining until midnight IST
  const nowInIST = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const midnightIST = new Date(nowInIST);
  midnightIST.setHours(24, 0, 0, 0);
  const timeRemainingSeconds = Math.max(0, Math.floor((midnightIST.getTime() - nowInIST.getTime()) / 1000));

  return {
    mdYYYY,
    mmddYYYY,
    yyyyMMdd,
    timeRemainingSeconds,
    dayOfYear: Math.floor((nowInIST - new Date(nowInIST.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  };
}

/**
 * Select today's 3 questions (1 Physics, 1 Chem, 1 Math)
 */
async function getTodayTargetQuestions() {
  const allQuestions = await fetchQuestionsFromSheet();
  const dateInfo = getISTDateInfo();

  const physicsPool = allQuestions.filter(q => q.subject === 'Physics');
  const chemPool = allQuestions.filter(q => q.subject === 'Chemistry');
  const mathPool = allQuestions.filter(q => q.subject === 'Mathematics');

  // Helper to find question matching date tag or fallback to deterministic rotation
  const selectQuestion = (pool, seedOffset) => {
    if (pool.length === 0) return null;
    // 1. Try dateTag match (M/D/YYYY or MM/DD/YYYY)
    const matched = pool.find(q => q.dateTag === dateInfo.mdYYYY || q.dateTag === dateInfo.mmddYYYY);
    if (matched) return matched;

    // 2. Deterministic pick using dayOfYear hash to rotate unserved questions
    const index = (dateInfo.dayOfYear + seedOffset) % pool.length;
    return pool[index];
  };

  const todayPhysics = selectQuestion(physicsPool, 1);
  const todayChem = selectQuestion(chemPool, 2);
  const todayMath = selectQuestion(mathPool, 3);

  const questions = [
    todayPhysics || getFallbackQuestions()[0],
    todayChem || getFallbackQuestions()[1],
    todayMath || getFallbackQuestions()[2]
  ];

  return {
    targetDate: dateInfo.yyyyMMdd,
    dateDisplay: dateInfo.mdYYYY,
    timeRemainingSeconds: dateInfo.timeRemainingSeconds,
    questions: questions.map(q => ({
      id: q.id,
      subject: q.subject,
      question: q.question,
      options: q.options,
      rawIndex: q.rawIndex
      // Note: We hide correctOption when sending to frontend before submission!
    })),
    // Private answer lookup table for scoring
    _answersMap: questions.reduce((acc, q) => {
      acc[q.id] = q.correctOption;
      return acc;
    }, {})
  };
}

/**
 * Hardcoded fallback questions in case Google Sheet is completely unreachable
 */
function getFallbackQuestions() {
  return [
    {
      id: 'q_fb_1',
      subject: 'Physics',
      question: 'A vertical wall is in south-north direction. A current carrying wire is kept in the wall such that to the west of the wall magnetic field due to wire is towards south. Then the wire should be:',
      options: [
        'Vertical and current is downwards',
        'Horizontal and current is towards west',
        'Vertical and current is upwards',
        'Horizontal and current is towards east'
      ],
      correctOption: 0,
      dateTag: '10/5/2026'
    },
    {
      id: 'q_fb_2',
      subject: 'Chemistry',
      question: 'The ionisation potential of "X+" ion is equal to:',
      options: [
        'The electron affinity of "X" atom',
        'The electronegativity of "X" atom',
        'The ionisation energy of "X" atom',
        'The electron affinity of "X2+" ion'
      ],
      correctOption: 2,
      dateTag: '10/5/2026'
    },
    {
      id: 'q_fb_3',
      subject: 'Mathematics',
      question: 'The mean and standard deviation of 100 observations are 40 and 5.1 respectively. By mistake one observation is taken as 50 instead of 40. If the correct mean and standard deviation are µ and σ respectively, then 100(µ+σ) is equal to:',
      options: ['4490', '3692', '4390', '4400'],
      correctOption: 3,
      dateTag: '10/5/2026'
    }
  ];
}

module.exports = {
  fetchQuestionsFromSheet,
  getTodayTargetQuestions,
  getISTDateInfo
};
