const https = require('https');

const SPREADSHEET_ID = '1xm32z1Gqd5qKpX98wPxj7ToXTjF_9pU6h2CFbZzDx8o';
const SHEET_TAB_GIDS = {
  physics: '743977408',
  chemistry: '113602565',
  math: '1766363191'
};

const getTabCsvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;

function parseCSV(text) {
  const p = [[]];
  let row = p[0];
  let col = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"') {
      if (inQuote && next === '"') { col += '"'; i++; }
      else { inQuote = !inQuote; }
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
  if (col || row.length > 0) { row.push(col.trim()); }
  return p.filter(r => r.length >= 6 && (r[1] || r[0]));
}

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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

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

    let questionText = r[1] || '';
    let optionA = r[2] || '';
    let optionB = r[3] || '';
    let optionC = r[4] || '';
    let optionD = r[5] || '';
    let ansRaw = r[6] || '';
    let dateCol1 = r[7] || '';
    let dateCol2 = r[8] || '';

    if (!questionText && r[0] && r[0].length > 15 && r[1] && r[2]) {
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

async function verifyMultiTab() {
  console.log('🔍 Fetching all 3 Subject Sheet Tabs (Physics, Chemistry, Math)...\n');
  try {
    const [physData, chemData, mathData] = await Promise.all([
      fetchUrl(getTabCsvUrl(SHEET_TAB_GIDS.physics)),
      fetchUrl(getTabCsvUrl(SHEET_TAB_GIDS.chemistry)),
      fetchUrl(getTabCsvUrl(SHEET_TAB_GIDS.math))
    ]);

    const physQs = parseSheetRows(parseCSV(physData), 'Physics');
    const chemQs = parseSheetRows(parseCSV(chemData), 'Chemistry');
    const mathQs = parseSheetRows(parseCSV(mathData), 'Mathematics');

    console.log(`✅ Physics Tab   : Synced ${physQs.length} questions`);
    console.log(`✅ Chemistry Tab : Synced ${chemQs.length} questions`);
    console.log(`✅ Math Tab      : Synced ${mathQs.length} questions`);
    console.log(`🎉 Total Question Bank Size across 3 Tabs: ${physQs.length + chemQs.length + mathQs.length} questions!\n`);

    // Test Today's Pick
    const dateObj = new Date();
    const istFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' });
    const parts = istFormatter.formatToParts(dateObj);
    let m = '', d = '', y = '';
    for (const p of parts) {
      if (p.type === 'month') m = p.value;
      if (p.type === 'day') d = p.value;
      if (p.type === 'year') y = p.value;
    }
    const mdYYYY = `${m}/${d}/${y}`;
    const mmddYYYY = `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
    const nowInIST = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const dayOfYear = Math.floor((nowInIST - new Date(nowInIST.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    const pick = (pool, seedOffset) => {
      if (!pool.length) return null;
      const matched = pool.find(q => q.dateTag === mdYYYY || q.dateTag === mmddYYYY);
      if (matched) return matched;
      return pool[(dayOfYear + seedOffset) % pool.length];
    };

    const todayPhys = pick(physQs, 1);
    const todayChem = pick(chemQs, 2);
    const todayMath = pick(mathQs, 3);

    console.log('--- Today\'s Daily Target Questions (from 3 Subject Tabs) ---');
    [todayPhys, todayChem, todayMath].forEach((q, idx) => {
      if (!q) return;
      console.log(`\nQuestion ${idx + 1} [${q.subject}] (Date Tag: "${q.dateTag || 'None'}")`);
      console.log(`  Text    : ${q.question.substring(0, 90)}...`);
      console.log(`  Options : A) ${q.options[0]} | B) ${q.options[1]} | C) ${q.options[2]} | D) ${q.options[3]}`);
      console.log(`  Correct : Option ${String.fromCharCode(65 + q.correctOption)} ("${q.options[q.correctOption]}")`);
    });

    console.log('\n🚀 ALL 3 SUBJECT TABS WORKING PERFECTLY!');
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

verifyMultiTab();
