const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { getTodayTargetQuestions, getISTDateInfo } = require('./googleSheetService');

// Public client: only used to validate a user's bearer token.
function getPublicSupabase() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  return (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
}

// Server-only client for database access. Never expose this key in the React
// app; it bypasses RLS after the request has been authenticated above.
function getSupabase() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return (supabaseUrl && serviceRoleKey)
    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
}

// Fallback in-memory store if Supabase is unavailable
const memorySubmissions = [];

// Helper to normalize any date input to strict YYYY-MM-DD
function normalizeDateStr(val) {
  if (!val) return null;
  const s = String(val).trim();
  if (s.includes('T')) return s.split('T')[0];
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    let [part1, part2, y] = s.split('/').map(Number);
    let m = part1, d = part2;
    if (part1 > 12 && part2 <= 12) {
      d = part1;
      m = part2;
    }
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
}

// Helper: calculate user streak & attempt statistics from submission history
function calculateUserStreakStats(userSubs, todayDateStr) {
  if (!userSubs || userSubs.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalDaysAttempted: 0, totalQuestionsAttempted: 0 };
  }

  const dates = [...new Set(userSubs.map(s => normalizeDateStr(s.target_date)).filter(Boolean))].sort().reverse();
  const totalDays = dates.length;
  
  let totalQuestions = 0;
  userSubs.forEach(s => {
    const qCount = Number(s.total_questions) || ((Number(s.correct_answers || 0) + Number(s.incorrect_answers || 0) + Number(s.unattempted || 0))) || 3;
    totalQuestions += qCount;
  });

  const parseDate = (str) => {
    const parts = str.split('-').map(Number);
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  };

  const todayStr = normalizeDateStr(todayDateStr) || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const todayObj = parseDate(todayStr);
  const yesterdayObj = new Date(todayObj.getTime() - 86400000);
  const y = yesterdayObj.getUTCFullYear();
  const m = String(yesterdayObj.getUTCMonth() + 1).padStart(2, '0');
  const d = String(yesterdayObj.getUTCDate()).padStart(2, '0');
  const yesterdayStr = `${y}-${m}-${d}`;

  let currentStreak = 0;
  let startCheck = null;

  if (dates.includes(todayStr)) {
    startCheck = parseDate(todayStr);
  } else if (dates.includes(yesterdayStr)) {
    startCheck = parseDate(yesterdayStr);
  }

  if (startCheck) {
    let curr = startCheck;
    while (true) {
      const cy = curr.getUTCFullYear();
      const cm = String(curr.getUTCMonth() + 1).padStart(2, '0');
      const cd = String(curr.getUTCDate()).padStart(2, '0');
      const formatted = `${cy}-${cm}-${cd}`;
      if (dates.includes(formatted)) {
        currentStreak++;
        curr = new Date(curr.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  let bestStreak = dates.length > 0 ? 1 : 0;
  let tempStreak = 1;
  const ascDates = [...dates].sort();
  for (let i = 1; i < ascDates.length; i++) {
    const prev = parseDate(ascDates[i - 1]);
    const curr = parseDate(ascDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
  }
  if (currentStreak > bestStreak) bestStreak = currentStreak;

  return {
    currentStreak,
    bestStreak,
    totalDaysAttempted: totalDays,
    totalQuestionsAttempted: totalQuestions
  };
}

function registerDailyTargetRoutes(app) {
  const router = express.Router();

  /**
   * GET /api/daily-target
   * Returns today's 3 questions, target date, countdown timer, user submission state, and streak stats
   */
  router.get('/daily-target', async (req, res) => {
    try {
      const userEmail = (req.query.userEmail || req.headers['x-user-email'] || '').trim().toLowerCase();

      // A supplied email requests account-specific state, so verify that the
      // bearer token belongs to the same account before reading it with the
      // server-side Supabase client.
      if (userEmail) {
        const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
        const authClient = getPublicSupabase();
        if (!token || !authClient) {
          return res.status(401).json({ success: false, error: 'Please sign in to access your target history.' });
        }
        const { data: { user: authenticatedUser }, error: authError } = await authClient.auth.getUser(token);
        if (authError || !authenticatedUser?.email || authenticatedUser.email.trim().toLowerCase() !== userEmail) {
          return res.status(403).json({ success: false, error: 'You can only access your own target history.' });
        }
      }

      const targetData = await getTodayTargetQuestions();

      let userSubmission = null;
      let userStreak = { currentStreak: 0, bestStreak: 0, totalDaysAttempted: 0, totalQuestionsAttempted: 0 };
      const supabase = getSupabase();

      if (userEmail) {
        if (supabase) {
          const { data } = await supabase
            .from('jee_daily_submissions')
            .select('*')
            .eq('user_email', userEmail)
            .eq('target_date', targetData.targetDate)
            .maybeSingle();
          if (data) userSubmission = data;

          const { data: allUserSubs } = await supabase
            .from('jee_daily_submissions')
            .select('target_date, correct_answers, incorrect_answers')
            .eq('user_email', userEmail);
          if (allUserSubs) {
            userStreak = calculateUserStreakStats(allUserSubs, targetData.targetDate);
          }
        } else {
          userSubmission = memorySubmissions.find(s => s.user_email === userEmail && s.target_date === targetData.targetDate) || null;
          const userSubs = memorySubmissions.filter(s => s.user_email === userEmail);
          userStreak = calculateUserStreakStats(userSubs, targetData.targetDate);
        }
      }

      res.json({
        success: true,
        targetDate: targetData.targetDate,
        dateDisplay: targetData.dateDisplay,
        timeRemainingSeconds: targetData.timeRemainingSeconds,
        questions: targetData.questions,
        userStreak,
        userSubmission: userSubmission ? {
          score: userSubmission.score,
          correctAnswers: userSubmission.correct_answers,
          incorrectAnswers: userSubmission.incorrect_answers,
          unattempted: userSubmission.unattempted,
          accuracy: userSubmission.accuracy,
          timeTakenSeconds: userSubmission.time_taken_seconds,
          submittedAt: userSubmission.submitted_at,
          answers: userSubmission.answers
        } : null
      });
    } catch (err) {
      console.error('[API] /api/daily-target error:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch daily target questions.' });
    }
  });

  /**
   * POST /api/daily-target/submit
   * Validates, scores (+4, -1, 0), logs response, and saves submission (1 attempt per day restriction)
   */
  router.post('/daily-target/submit', async (req, res) => {
    try {
      const { userEmail, userName, answers, timeTakenSeconds } = req.body;

      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
      const authClient = getPublicSupabase();
      if (!token || !authClient) {
        return res.status(401).json({ success: false, error: 'Please sign in before submitting today\'s target.' });
      }

      const { data: { user: authenticatedUser }, error: authError } = await authClient.auth.getUser(token);
      if (authError || !authenticatedUser?.email) {
        return res.status(401).json({ success: false, error: 'Your login session is invalid or has expired. Please sign in again.' });
      }

      if (!userEmail || !userEmail.includes('@') || userEmail.trim().toLowerCase() === 'user@collegemap.in') {
        return res.status(400).json({ success: false, error: 'Valid student email is required to submit daily target.' });
      }

      const emailClean = userEmail.trim().toLowerCase();
      if (emailClean !== authenticatedUser.email.trim().toLowerCase()) {
        return res.status(403).json({ success: false, error: 'You can only submit a target for your own account.' });
      }
      const nameClean = (userName || emailClean.split('@')[0] || 'Student').trim();
      const targetData = await getTodayTargetQuestions();
      const targetDate = targetData.targetDate;

      // 1. Check if user already submitted today
      let existing = null;
      const supabase = getSupabase();
      if (!supabase) {
        console.error('[API] SUPABASE_SERVICE_ROLE_KEY is not configured. Refusing unauthorised fallback submit.');
        return res.status(503).json({ success: false, error: 'Daily target submissions are temporarily unavailable. Please try again shortly.' });
      }
      if (supabase) {
        const { data } = await supabase
          .from('jee_daily_submissions')
          .select('id')
          .eq('user_email', emailClean)
          .eq('target_date', targetDate)
          .maybeSingle();
        existing = data;
      } else {
        existing = memorySubmissions.find(s => s.user_email === emailClean && s.target_date === targetDate);
      }

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'You have already submitted today\'s JEE Daily Target! Only 1 attempt per day is allowed.'
        });
      }

      // 2. Score calculation engine (JEE Standard: +4 correct, -1 incorrect, 0 unattempted)
      let score = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;
      const feedback = {};

      targetData.questions.forEach(q => {
        const selectedOpt = answers ? answers[q.id] : null;
        const correctOpt = targetData._answersMap[q.id];

        if (selectedOpt === undefined || selectedOpt === null || selectedOpt === '') {
          unattemptedCount++;
          feedback[q.id] = { status: 'unattempted', correctOption: correctOpt, selectedOption: null };
        } else if (Number(selectedOpt) === Number(correctOpt)) {
          correctCount++;
          score += 4;
          feedback[q.id] = { status: 'correct', correctOption: correctOpt, selectedOption: Number(selectedOpt) };
        } else {
          incorrectCount++;
          score -= 1;
          feedback[q.id] = { status: 'incorrect', correctOption: correctOpt, selectedOption: Number(selectedOpt) };
        }
      });

      const totalQuestions = targetData.questions.length;
      const attemptedCount = correctCount + incorrectCount;
      const accuracy = attemptedCount > 0 ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(1)) : 0;
      const timeTaken = Math.max(1, parseInt(timeTakenSeconds || 0, 10));

      const submissionRecord = {
        user_email: emailClean,
        user_name: nameClean,
        target_date: targetDate,
        score,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        incorrect_answers: incorrectCount,
        unattempted: unattemptedCount,
        accuracy,
        time_taken_seconds: timeTaken,
        answers: feedback,
        submitted_at: new Date().toISOString()
      };

      // 3. Save to Supabase (or fallback)
      let savedRecord = null;
      if (supabase) {
        const { data, error } = await supabase
          .from('jee_daily_submissions')
          .insert([submissionRecord])
          .select()
          .single();

        if (error) {
          console.error('[API] Supabase insert submission error:', error);
          // If unique constraint violation
          if (error.code === '23505') {
            return res.status(409).json({
              success: false,
              error: 'You have already submitted today\'s target.'
            });
          }
          // A serverless in-memory fallback is not shared or durable.  If we
          // reported success here, the student would believe they were on the
          // leaderboard while everybody else could never see the entry.
          return res.status(503).json({
            success: false,
            error: 'Unable to save your submission to the shared leaderboard. Please try again.'
          });
        } else {
          savedRecord = data;
        }
      } else {
        memorySubmissions.push(submissionRecord);
        savedRecord = submissionRecord;
      }

      console.log(`[API] ✅ Daily Target Submitted by ${nameClean} (${emailClean}): Score ${score} pts, Accuracy ${accuracy}%`);

      res.json({
        success: true,
        message: 'Daily target submitted successfully!',
        score,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        unattempted: unattemptedCount,
        accuracy,
        timeTakenSeconds: timeTaken,
        feedback,
        submission: savedRecord
      });
    } catch (err) {
      console.error('[API] /api/daily-target/submit error:', err);
      res.status(500).json({ success: false, error: 'Failed to submit daily target.' });
    }
  });

  /**
   * GET /api/leaderboard?type=daily|weekly|monthly&userEmail=...
   * Aggregates and returns top standings and current user rank
   */
  router.get('/leaderboard', async (req, res) => {
    try {
      const type = (req.query.type || 'daily').toLowerCase();
      const userEmail = (req.query.userEmail || req.headers['x-user-email'] || '').trim().toLowerCase();
      const dateInfo = getISTDateInfo();

      let allRecords = [];
      let allHistoryRecords = [];
      const supabase = getSupabase();

      if (supabase) {
        let query = supabase.from('jee_daily_submissions').select('*');

        if (type === 'daily') {
          query = query.eq('target_date', dateInfo.yyyyMMdd);
        } else if (type === 'weekly') {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('submitted_at', sevenDaysAgo);
        } else if (type === 'monthly') {
          const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
          query = query.gte('submitted_at', startOfMonth);
        }

        const { data, error } = await query;
        if (error) {
          console.error('[API] Supabase leaderboard query error:', error);
          // Returning a successful but incomplete in-memory leaderboard
          // prevents the frontend from using its direct Supabase fallback.
          return res.status(503).json({ success: false, error: 'Leaderboard is temporarily unavailable.' });
        }
        if (data) {
          allRecords = data;
        }

        const { data: historyData } = await supabase
          .from('jee_daily_submissions')
          .select('user_email, target_date, total_questions, correct_answers, incorrect_answers, unattempted');
        if (historyData) {
          allHistoryRecords = historyData;
        } else {
          allHistoryRecords = memorySubmissions;
        }
      } else {
        allRecords = memorySubmissions;
        allHistoryRecords = memorySubmissions;
      }

      // Pre-compute user streak map
      const userHistoryMap = {};
      allHistoryRecords.forEach(s => {
        const em = (s.user_email || '').toLowerCase();
        if (!em) return;
        if (!userHistoryMap[em]) userHistoryMap[em] = [];
        userHistoryMap[em].push(s);
      });

      const userStreakMap = {};
      Object.keys(userHistoryMap).forEach(em => {
        userStreakMap[em] = calculateUserStreakStats(userHistoryMap[em], dateInfo.yyyyMMdd);
      });

      // Group and rank users
      let rankedList = [];

      if (type === 'daily') {
        // Direct rank by score DESC, time_taken_seconds ASC
        rankedList = allRecords
          .filter(r => r.target_date === dateInfo.yyyyMMdd)
          .map(r => {
            const em = (r.user_email || '').toLowerCase();
            const sStats = userStreakMap[em] || { currentStreak: 1, bestStreak: 1, totalDaysAttempted: 1, totalQuestionsAttempted: 3 };
            const activeStreak = Math.max(1, sStats.currentStreak || 1);
            return {
              user_email: r.user_email,
              user_name: r.user_name || r.user_email.split('@')[0],
              score: r.score,
              accuracy: r.accuracy,
              time_taken_seconds: r.time_taken_seconds,
              submitted_at: r.submitted_at,
              streak: activeStreak,
              bestStreak: Math.max(activeStreak, sStats.bestStreak || 1),
              totalDaysAttempted: Math.max(1, sStats.totalDaysAttempted || 1),
              totalQuestionsAttempted: Math.max(3, sStats.totalQuestionsAttempted || 3)
            };
          });
      } else {
        // Aggregated for weekly or monthly
        const userMap = {};
        allRecords.forEach(r => {
          const email = (r.user_email || '').toLowerCase();
          if (!userMap[email]) {
            userMap[email] = {
              user_email: email,
              user_name: r.user_name || email.split('@')[0],
              score: 0,
              totalAccuracySum: 0,
              totalTimeSeconds: 0,
              attemptsCount: 0
            };
          }
          userMap[email].score += (Number(r.score) || 0);
          userMap[email].totalAccuracySum += Number(r.accuracy || 0);
          userMap[email].totalTimeSeconds += Number(r.time_taken_seconds || 0);
          userMap[email].attemptsCount += 1;
        });

        rankedList = Object.values(userMap).map(u => {
          const em = u.user_email;
          const sStats = userStreakMap[em] || { currentStreak: 0, bestStreak: 0, totalDaysAttempted: 0, totalQuestionsAttempted: 0 };
          const resolvedStreak = sStats.currentStreak > 0 ? sStats.currentStreak : Math.max(1, sStats.bestStreak || u.attemptsCount || 1);
          const resolvedBest = Math.max(resolvedStreak, sStats.bestStreak || 1, u.attemptsCount || 1);
          return {
            user_email: u.user_email,
            user_name: u.user_name,
            score: u.score,
            accuracy: u.attemptsCount > 0 ? parseFloat((u.totalAccuracySum / u.attemptsCount).toFixed(1)) : 0,
            time_taken_seconds: Math.round(u.totalTimeSeconds / u.attemptsCount),
            attemptsCount: u.attemptsCount,
            streak: resolvedStreak,
            bestStreak: resolvedBest,
            totalDaysAttempted: Math.max(u.attemptsCount, sStats.totalDaysAttempted || 1),
            totalQuestionsAttempted: Math.max(u.attemptsCount * 3, sStats.totalQuestionsAttempted || 3)
          };
        });
      }

      // Sort ranking: score DESC, time_taken_seconds ASC
      rankedList.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_taken_seconds - b.time_taken_seconds;
      });

      // Assign rank index
      const leaderboard = rankedList.map((item, index) => ({
        rank: index + 1,
        ...item
      }));

      // Find current user's rank
      let currentUserRank = null;
      if (userEmail) {
        const found = leaderboard.find(u => u.user_email.toLowerCase() === userEmail);
        if (found) currentUserRank = found;
      }
      res.json({
        success: true,
        type,
        leaderboard,
        totalParticipants: leaderboard.length,
        currentUserRank
      });
    } catch (err) {
      console.error('[API] /api/leaderboard error:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch leaderboard.' });
    }
  });

  /**
   * POST /api/leaderboard/reset
   * Clears in-memory submissions and Supabase jee_daily_submissions table for a fresh start
   */
  router.post('/leaderboard/reset', async (req, res) => {
    try {
      memorySubmissions.length = 0;
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('jee_daily_submissions').delete().neq('user_email', '');
      }
      console.log('[API] 🧹 Leaderboard reset: All daily target submissions cleared.');
      res.json({ success: true, message: 'Leaderboard reset successfully! All previous submissions cleared.' });
    } catch (err) {
      console.error('[API] /api/leaderboard/reset error:', err);
      res.status(500).json({ success: false, error: 'Failed to reset leaderboard.' });
    }
  });

  app.use('/api', router);
}

module.exports = { registerDailyTargetRoutes };
