import { supabase } from '../supabaseClient';

/**
 * Helper: get the current Supabase Auth user's metadata (name, email, phone)
 * This is useful as a fallback when the users table doesn't have a row yet.
 */
const getAuthUserMeta = async () => {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = user.user_metadata || {};
    return {
      email: user.email,
      name: meta.display_name || meta.name || meta.full_name || '',
      phone: meta.phone_number || meta.phone || '',
    };
  } catch {
    return null;
  }
};

const PROFILE_CACHE_KEY = 'cachedUserProfile';

/**
 * Get cached user profile from localStorage
 * @returns {Object|null} Cached profile or null
 */
export const getCachedProfile = () => {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore parse errors
  }
  return null;
};

/**
 * Cache user profile in localStorage
 * @param {Object|null} profile
 */
export const setCachedProfile = (profile) => {
  if (profile) {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  }
};

/**
 * Clear cached user profile
 */
export const clearCachedProfile = () => {
  localStorage.removeItem(PROFILE_CACHE_KEY);
};

/**
 * Get user profile from Supabase by email
 * @param {string} email - User's email
 * @param {boolean} skipCache - If true, always fetch from Supabase
 * @returns {Promise<Object|null>} User profile or null
 */
export const getUserProfile = async (email, skipCache = false) => {
  if (!email) return null;

  // Return cached profile if available (avoids rate limits)
  if (!skipCache) {
    const cached = getCachedProfile();
    if (cached && cached.email === email.toLowerCase()) {
      return cached;
    }
  }

  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error) {
      // No row in users table — fallback to Supabase Auth metadata
      console.warn('No profile row in users table, falling back to auth metadata');
      const authMeta = await getAuthUserMeta();
      if (authMeta && authMeta.email?.toLowerCase() === email.toLowerCase()) {
        // Auto-create user row from auth metadata
        const created = await saveUserProfile(authMeta);
        if (created) return created;
        // If auto-create failed, still return the metadata so the UI shows the name
        setCachedProfile(authMeta);
        return authMeta;
      }
      return null;
    }
    if (data) setCachedProfile(data);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Save or update user profile in Supabase
 * @param {Object} profileData - Profile data { name, email, phone }
 * @returns {Promise<Object|null>} Saved profile or null
 */
export const saveUserProfile = async (profileData) => {
  if (!supabase) return null;
  
  try {
    const row = {
      name: profileData.name,
      email: profileData.email.toLowerCase(),
      phone: profileData.phone || '',
      password_hash: 'managed_by_supabase_auth',
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(row, { onConflict: 'email' })
      .select()
      .single();
    
    if (error) throw error;
    if (data) setCachedProfile(data);
    return data;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return null;
  }
};

/**
 * Save test result to Supabase
 * @param {Object} testResult - Test result data
 * @param {string} userEmail - User's email
 * @returns {Promise<Object|null>} Saved result or null
 */
export const saveTestResult = async (testResult, userEmail) => {
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return null;
  }
  
  if (!userEmail) {
    console.error('❌ No user email provided');
    return null;
  }
  
  try {
    console.log('📝 Preparing to save test result:', {
      userEmail,
      testId: testResult.testId,
      testTitle: testResult.testTitle
    });

    const { data, error } = await supabase
      .from('test_results')
      .insert({
        user_email: userEmail.toLowerCase(),
        test_id: testResult.testId,
        test_title: testResult.testTitle,
        total_marks: testResult.totalMarks,
        total_questions: testResult.totalQuestions,
        correct_answers: testResult.correctAnswers,
        incorrect_answers: testResult.incorrectAnswers,
        unattempted: testResult.unattempted,
        percentage: parseFloat(testResult.percentage),
        total_test_duration: testResult.totalTestDuration,
        section_wise_results: testResult.sectionWiseResults,
        fullscreen_exit_count: testResult.fullscreenExitCount || 0,
        question_details: testResult.questionDetails || [],
        completed_at: testResult.completedAt || new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    
    console.log('✅ Test result saved to Supabase:', data);
    return data;
  } catch (error) {
    console.error('❌ Error saving test result to Supabase:', error);
    return null;
  }
};

/**
 * Get all test results for a user from Supabase
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} Array of test results
 */
export const getTestResults = async (userEmail) => {
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return [];
  }
  
  if (!userEmail) {
    console.error('❌ No user email provided');
    return [];
  }
  
  try {
    console.log('📊 Fetching test results for:', userEmail);

    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_email', userEmail.toLowerCase())
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }
    
    console.log(`📊 Found ${data?.length || 0} test results`);
    
    // Transform to match existing format
    return data.map(result => ({
      id: result.id,
      testId: result.test_id,
      testTitle: result.test_title,
      totalMarks: result.total_marks,
      totalQuestions: result.total_questions,
      correctAnswers: result.correct_answers,
      incorrectAnswers: result.incorrect_answers,
      unattempted: result.unattempted,
      percentage: result.percentage,
      totalTestDuration: result.total_test_duration,
      sectionWiseResults: result.section_wise_results,
      fullscreenExitCount: result.fullscreen_exit_count,
      questionDetails: result.question_details,
      completedAt: result.completed_at
    }));
  } catch (error) {
    console.error('❌ Error fetching test results from Supabase:', error);
    return [];
  }
};

/**
 * Delete a test result from Supabase
 * @param {number} resultId - Result ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteTestResult = async (resultId) => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('test_results')
      .delete()
      .eq('id', resultId);
    
    if (error) throw error;
    console.log('✅ Test result deleted from Supabase');
    return true;
  } catch (error) {
    console.error('❌ Error deleting test result:', error);
    return false;
  }
};

/**
 * Submit a question report to Supabase
 * @param {Object} reportData - Report data
 * @returns {Promise<Object|null>} Saved report or null
 */
export const reportQuestion = async (reportData) => {
  if (!supabase) {
    console.error('❌ Supabase client not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('question_reports')
      .insert({
        test_id: reportData.testId,
        test_title: reportData.testTitle || null,
        question_id: reportData.questionId,
        question_number: reportData.questionNumber || null,
        subject: reportData.subject || null,
        reason: reportData.reason,
        description: reportData.description || null,
        user_email: reportData.userEmail ? reportData.userEmail.toLowerCase() : null,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error reporting question:', error);
      throw error;
    }

    console.log('✅ Question report submitted:', data);
    return data;
  } catch (error) {
    console.error('❌ Error submitting question report:', error);
    return null;
  }
};

/**
 * Track a resource view or download in Supabase
 * @param {Object} resource - The resource data
 * @param {string} actionType - 'view' or 'download'
 * @param {string} [userEmail] - Optional user email
 * @returns {Promise<boolean>} Success status
 */
export const trackResourceEventSupabase = async (resource, actionType, userEmail = null) => {
  if (!supabase) {
    console.warn('⚠️ Supabase client not initialized, skipping resource tracking');
    return false;
  }

  try {
    const payload = {
      resource_id: String(resource.id),
      resource_title: resource.title || 'Unknown',
      action_type: actionType,
      subject: resource.subject || null,
      type: resource.type || null
    };

    if (userEmail) {
      payload.user_email = userEmail.toLowerCase();
    }

    console.log(`⏳ Attempting to insert ${actionType} event for ${resource.title} into Supabase...`, payload);
    const { data, error, status } = await supabase
      .from('resource_events')
      .insert(payload)
      .select();

    if (error) {
      console.error('❌ Supabase insertion error:', error);
      throw error;
    }
    
    console.log(`✅ Tracked ${actionType} for resource: ${resource.title} in Supabase. Response:`, data, status);
    return true;
  } catch (error) {
    console.error('❌ Error tracking resource event in Supabase:', error);
    return false;
  }
};

/**
 * Fetch analytics for a specific resource from Supabase
 * @param {string} resourceId - The resource ID
 * @returns {Promise<Object>} Views and downloads count
 */
/**
 * Fetch analytics for ALL resources from Supabase (for sorting by popularity)
 * @returns {Promise<Object>} Map of resourceId -> { views, downloads }
 */
export const getAllResourceAnalyticsSupabase = async () => {
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from('resource_analytics')
      .select('resource_id, views, downloads');

    if (error) throw error;

    const analyticsMap = {};
    (data || []).forEach(row => {
      analyticsMap[String(row.resource_id)] = {
        views: row.views || 0,
        downloads: row.downloads || 0,
      };
    });
    return analyticsMap;
  } catch (error) {
    console.error('❌ Error fetching all resource analytics from Supabase:', error);
    return {};
  }
};

export const getResourceAnalyticsSupabase = async (resourceId) => {
  if (!supabase) return { views: 0, downloads: 0 };

  try {
    const { data, error } = await supabase
      .from('resource_analytics')
      .select('views, downloads')
      .eq('resource_id', String(resourceId))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found - meaning 0 views/downloads
        return { views: 0, downloads: 0 };
      }
      throw error;
    }

    return {
      views: data.views || 0,
      downloads: data.downloads || 0
    };
  } catch (error) {
    console.error('❌ Error fetching resource analytics from Supabase:', error);
    return { views: 0, downloads: 0 };
  }
};

/**
 * Submit a seminar booking directly to Supabase
 * @param {Object} bookingData - { name, email, phone }
 * @returns {Promise<boolean>} Success status
 */
export const submitSeminarBooking = async (bookingData) => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('seminar_bookings')
      .insert({
        name: bookingData.name.trim(),
        email: bookingData.email.trim().toLowerCase(),
        phone: bookingData.phone ? bookingData.phone.trim() : null
      });

    if (error) {
      console.error('❌ Supabase booking error:', error);
      throw error;
    }
    
    console.log('✅ Seminar booking saved successfully to Supabase');
    return true;
  } catch (error) {
    // If it's a unique constraint error on email (if added), we can handle it
    console.error('❌ Error saving seminar booking:', error);
    throw error; // Throw so UI can catch and display alert
  }
};

/**
 * Submit a mentor application directly to Google Forms & Supabase
 * Google Form ID: 1FAIpQLSdi4h29RDwcWEFwxW_1Gs4D3FqGrRplMh3xfbfo3Sl9otEKYw
 * @param {Object} appData - { name, email, phone, college, branchYear, jeeRank, message }
 * @returns {Promise<boolean>} Success status
 */
export const submitMentorApplication = async (appData) => {
  // 1. Submit directly to Google Form endpoint
  const gformUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdi4h29RDwcWEFwxW_1Gs4D3FqGrRplMh3xfbfo3Sl9otEKYw/formResponse';
  const body = new URLSearchParams();
  body.append('entry.505045348', appData.name || '');
  body.append('entry.706587445', appData.email || '');
  body.append('entry.701503484', appData.phone || '');
  body.append('entry.666643575', appData.college || appData.subject || '');
  body.append('entry.1167721055', appData.branchYear || '');
  body.append('entry.766560701', appData.jeeRank || '');
  body.append('entry.1742531862', appData.message || '');

  try {
    await fetch(gformUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });
    console.log('✅ Mentor application submitted to Google Form');
  } catch (err) {
    console.warn('⚠️ Google Form submit note:', err);
  }

  // 2. Also save to Supabase if table exists
  if (supabase) {
    try {
      await supabase
        .from('mentor_applications')
        .insert({
          name: appData.name ? appData.name.trim() : '',
          email: appData.email ? appData.email.trim().toLowerCase() : '',
          phone: appData.phone ? appData.phone.trim() : null,
          college: appData.college ? appData.college.trim() : null,
          branch_year: appData.branchYear ? appData.branchYear.trim() : null,
          jee_rank: appData.jeeRank ? appData.jeeRank.trim() : null,
          message: appData.message ? appData.message.trim() : null
        });
    } catch (e) {
      // ignore table missing errors
    }
  }

  return true;
};

/**
 * Check if the user has active access to Branch Comparison
 * @param {string} userEmail - User's email
 * @returns {Promise<boolean>} True if paid and not expired
 */
export const checkBranchComparisonAccess = async (userEmail) => {
  if (!supabase || !userEmail) return false;
  try {
    const { data, error } = await supabase
      .from('branch_compare_payments')
      .select('expires_at')
      .eq('email', userEmail.toLowerCase())
      .order('expires_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) return false;
    
    const expiresAt = new Date(data[0].expires_at);
    return expiresAt > new Date();
  } catch {
    return false;
  }
};

/**
 * Save Branch Comparison payment
 * @param {string} userEmail - User's email
 * @param {string} paymentId - Razorpay Payment ID
 * @param {string} orderId - Razorpay Order ID
 * @returns {Promise<boolean>} Success status
 */
export const saveBranchComparisonPayment = async (userEmail, paymentId, orderId) => {
  if (!supabase || !userEmail) return false;
  try {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months access
    
    const { error } = await supabase
      .from('branch_compare_payments')
      .insert({
        email: userEmail.toLowerCase(),
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        expires_at: expiresAt.toISOString()
      });
      
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error saving payment:', err);
    return false;
  }
};

/**
 * Track user inputs for Branch Comparison
 * @param {string} userEmail - User's email
 * @param {Object} inputs - The comparison inputs
 * @returns {Promise<boolean>}
 */
export const trackBranchComparisonInput = async (userEmail, inputs) => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('branch_comparison_inputs')
      .insert({
        user_email: userEmail ? userEmail.toLowerCase() : null,
        college_1: inputs.college1 || null,
        branch_1: inputs.branch1 || null,
        college_2: inputs.college2 || null,
        branch_2: inputs.branch2 || null,
        user_query: inputs.userQuery || null,
        promo_code: inputs.promoCode || null
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error tracking branch comparison input:', err);
    return false;
  }
};

/**
 * Track user inputs for College Predictor
 * @param {string} userEmail - User's email
 * @param {Object} inputs - The predictor inputs
 * @returns {Promise<boolean>}
 */
export const trackCollegePredictorInput = async (userEmail, inputs) => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('college_predictor_inputs')
      .insert({
        user_email: userEmail ? userEmail.toLowerCase() : null,
        exam: inputs.exam,
        rank: inputs.rank,
        category: inputs.category,
        gender_female: inputs.genderFemale,
        seat_pool: inputs.seatPool || null
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error tracking college predictor input:', err);
    return false;
  }
};

/**
 * Local storage key for fallback submissions when Supabase table is not yet created
 */
const LOCAL_SUBMISSIONS_KEY = 'collegemap_jee_daily_submissions';

const getLocalSubmissions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalSubmission = (sub) => {
  try {
    const list = getLocalSubmissions();
    // remove existing if same user and target_date
    const filtered = list.filter(item => !(item.user_email === sub.user_email && item.target_date === sub.target_date));
    filtered.push(sub);
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
};

/**
 * Save daily target submission to Supabase with localStorage fallback
 */
export const saveDailyTargetSubmissionSupabase = async (submissionData) => {
  const rawEmail = (submissionData?.userEmail || submissionData?.user_email || '').trim().toLowerCase();
  if (!rawEmail || !rawEmail.includes('@') || rawEmail === 'user@collegemap.in') {
    const err = new Error('Valid student email is required to save submission to database.');
    console.warn('⚠️ Aborting save submission:', err.message);
    return { data: null, error: err };
  }

  const row = {
    user_email: rawEmail,
    user_name: (submissionData.userName || submissionData.user_name || rawEmail.split('@')[0] || 'Student').trim(),
    target_date: submissionData.targetDate || submissionData.target_date,
    score: Number(submissionData.score) || 0,
    total_questions: Number(submissionData.totalQuestions || submissionData.total_questions) || 3,
    correct_answers: Number(submissionData.correctAnswers ?? submissionData.correct_answers ?? 0),
    incorrect_answers: Number(submissionData.incorrectAnswers ?? submissionData.incorrect_answers ?? 0),
    unattempted: Number(submissionData.unattempted ?? 0),
    accuracy: Number(submissionData.accuracy ?? 0),
    time_taken_seconds: Number(submissionData.timeTakenSeconds ?? submissionData.time_taken_seconds ?? 0),
    answers: submissionData.answers || {},
    submitted_at: submissionData.submitted_at || submissionData.submittedAt || new Date().toISOString()
  };

  // Always save to localStorage backup
  saveLocalSubmission(row);

  if (!supabase) {
    return { data: row, error: new Error('Supabase client is not initialized') };
  }

  try {
    // A submit can be retried after a slow connection or after the API has
    // already persisted the same attempt.  Upsert keeps that single attempt
    // durable instead of treating the duplicate as a successful local-only
    // submission.
    const { data, error } = await supabase
      .from('jee_daily_submissions')
      .upsert(row, { onConflict: 'user_email,target_date' })
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Supabase save submission note:', error.message);
      return { data: row, error };
    }
    
    // Save updated record with db id into local backup
    if (data) saveLocalSubmission(data);
    return { data, error: null };
  } catch (err) {
    console.error('❌ Exception saving to Supabase:', err);
    return { data: row, error: err };
  }
};

/**
 * Fetch daily target submission for a user on a given date
 * @param {string} userEmail
 * @param {string} targetDate - YYYY-MM-DD
 */
export const getDailyTargetSubmissionSupabase = async (userEmail, targetDate) => {
  if (!userEmail || !targetDate) return null;
  const emailLower = userEmail.toLowerCase().trim();
  if (emailLower === 'user@collegemap.in') return null;

  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('jee_daily_submissions')
        .select('*')
        .eq('user_email', emailLower)
        .eq('target_date', targetDate)
        .maybeSingle();

      if (!error && data) return data;
    } catch (err) {
      console.warn('⚠️ Supabase query note:', err.message);
    }
  }

  // Fallback to localStorage
  const localList = getLocalSubmissions();
  const foundLocal = localList.find(s => (s.user_email === emailLower || s.userEmail === emailLower) && (s.target_date === targetDate || s.targetDate === targetDate));
  if (foundLocal && supabase) {
    // Attempt auto-recovery sync to Supabase in background
    saveDailyTargetSubmissionSupabase(foundLocal).catch(() => {});
  }
  return foundLocal || null;
};

/**
 * Helper to normalize any date input to strict YYYY-MM-DD
 */
const normalizeDateStr = (val) => {
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
};

const getISTTodayDateString = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
};

/**
 * Calculate user streak & attempt statistics from submission history
 */
export const calculateUserStreakStatsClient = (userSubs, todayDateStr = '') => {
  if (!userSubs || userSubs.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalDaysAttempted: 0, totalQuestionsAttempted: 0 };
  }

  const cleanDates = [...new Set(userSubs.map(s => normalizeDateStr(s.target_date)).filter(Boolean))].sort().reverse();
  const totalDays = cleanDates.length;

  let totalQuestions = 0;
  userSubs.forEach(s => {
    const qCount = Number(s.total_questions) || (Number(s.correct_answers || 0) + Number(s.incorrect_answers || 0) + Number(s.unattempted || 0)) || 3;
    totalQuestions += qCount;
  });

  const todayStr = normalizeDateStr(todayDateStr) || getISTTodayDateString();
  const parseD = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };

  const todayObj = parseD(todayStr);
  const yestObj = new Date(todayObj.getTime() - 86400000);
  const yestStr = `${yestObj.getUTCFullYear()}-${String(yestObj.getUTCMonth() + 1).padStart(2, '0')}-${String(yestObj.getUTCDate()).padStart(2, '0')}`;

  let currentStreak = 0;
  let startCheck = null;

  if (cleanDates.includes(todayStr)) {
    startCheck = parseD(todayStr);
  } else if (cleanDates.includes(yestStr)) {
    startCheck = parseD(yestStr);
  }

  if (startCheck) {
    let curr = startCheck;
    while (true) {
      const cy = curr.getUTCFullYear();
      const cm = String(curr.getUTCMonth() + 1).padStart(2, '0');
      const cd = String(curr.getUTCDate()).padStart(2, '0');
      const formatted = `${cy}-${cm}-${cd}`;
      if (cleanDates.includes(formatted)) {
        currentStreak++;
        curr = new Date(curr.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Calculate best streak
  const asc = [...cleanDates].sort();
  let bestStreak = asc.length > 0 ? 1 : 0;
  let tempStreak = 1;
  for (let i = 1; i < asc.length; i++) {
    const prev = parseD(asc[i - 1]);
    const curr = parseD(asc[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else if (diff > 1) {
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
};

/**
 * Fetch streak stats for a specific user
 */
export const getUserStreakStatsSupabase = async (userEmail, todayDateStr = '') => {
  if (!userEmail) return { currentStreak: 0, bestStreak: 0, totalDaysAttempted: 0, totalQuestionsAttempted: 0 };
  const emailLower = userEmail.toLowerCase();

  let userSubs = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('jee_daily_submissions')
        .select('target_date, total_questions, correct_answers, incorrect_answers, unattempted')
        .eq('user_email', emailLower);
      if (!error && data) userSubs = data;
    } catch (err) {
      console.warn('⚠️ Supabase streak fetch note:', err.message);
    }
  }

  if (userSubs.length === 0) {
    const localList = getLocalSubmissions();
    userSubs = localList.filter(s => (s.user_email || s.userEmail) === emailLower);
  }

  return calculateUserStreakStatsClient(userSubs, todayDateStr);
};

/**
 * Fetch leaderboard from Supabase (daily, weekly, monthly)
 * @param {string} type - 'daily' | 'weekly' | 'monthly'
 * @param {string} todayDateStr - YYYY-MM-DD
 */
export const getDailyTargetLeaderboardSupabase = async (type = 'daily', todayDateStr = '') => {
  let allRecords = [];
  let historyRecords = [];
  let fetchedFromSupabase = false;

  if (supabase) {
    try {
      let query = supabase.from('jee_daily_submissions').select('*');

      if (type === 'daily' && todayDateStr) {
        query = query.eq('target_date', todayDateStr);
      } else if (type === 'weekly') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('submitted_at', sevenDaysAgo);
      } else if (type === 'monthly') {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        query = query.gte('submitted_at', startOfMonth);
      }

      const { data, error } = await query;
      if (!error && data) {
        allRecords = data;
        fetchedFromSupabase = true;
      }

      const { data: hData } = await supabase
        .from('jee_daily_submissions')
        .select('user_email, target_date, total_questions, correct_answers, incorrect_answers, unattempted');
      if (hData) historyRecords = hData;
    } catch (err) {
      console.warn('⚠️ Supabase leaderboard note:', err.message);
    }
  }

  // Check local submissions: auto-sync any trapped records to Supabase & merge them
  const localList = getLocalSubmissions();
  if (localList.length > 0 && supabase) {
    localList.forEach(localItem => {
      const em = (localItem.user_email || localItem.userEmail || '').toLowerCase().trim();
      const tDate = localItem.target_date || localItem.targetDate;
      if (em && em.includes('@') && em !== 'user@collegemap.in' && tDate) {
        const alreadyInRemote = allRecords.some(r => (r.user_email || '').toLowerCase() === em && (r.target_date || r.targetDate) === tDate);
        if (!alreadyInRemote) {
          saveDailyTargetSubmissionSupabase(localItem).catch(() => {});
        }
      }
    });
  }

  if (!fetchedFromSupabase || allRecords.length === 0) {
    historyRecords = localList;
    if (type === 'daily' && todayDateStr) {
      allRecords = localList.filter(r => (r.target_date || r.targetDate) === todayDateStr && (r.user_email || r.userEmail) !== 'user@collegemap.in');
    } else if (type === 'weekly') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();
      allRecords = localList.filter(r => new Date(r.submitted_at || Date.now()).getTime() >= sevenDaysAgo && (r.user_email || r.userEmail) !== 'user@collegemap.in');
    } else {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      allRecords = localList.filter(r => new Date(r.submitted_at || Date.now()).getTime() >= startOfMonth && (r.user_email || r.userEmail) !== 'user@collegemap.in');
    }
  } else if (localList.length > 0) {
    // If Supabase returned records, also merge any local record belonging to current user that isn't yet reflected
    localList.forEach(localItem => {
      const em = (localItem.user_email || localItem.userEmail || '').toLowerCase().trim();
      const tDate = localItem.target_date || localItem.targetDate;
      if (em && em.includes('@') && em !== 'user@collegemap.in') {
        const alreadyInList = allRecords.some(r => (r.user_email || '').toLowerCase() === em && (r.target_date || r.targetDate) === tDate);
        if (!alreadyInList) {
          if (type === 'daily' && tDate === todayDateStr) {
            allRecords.push(localItem);
          } else if (type === 'weekly') {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            if (new Date(localItem.submitted_at || Date.now()).getTime() >= sevenDaysAgo) {
              allRecords.push(localItem);
            }
          } else if (type === 'monthly') {
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
            if (new Date(localItem.submitted_at || Date.now()).getTime() >= startOfMonth) {
              allRecords.push(localItem);
            }
          }
        }
      }
    });
  }

  // Also merge local history to historyRecords
  if (localList.length > 0) {
    localList.forEach(localItem => {
      const em = (localItem.user_email || localItem.userEmail || '').toLowerCase().trim();
      const tDate = localItem.target_date || localItem.targetDate;
      if (em && em.includes('@') && em !== 'user@collegemap.in' && tDate) {
        const alreadyInHistory = historyRecords.some(r => (r.user_email || '').toLowerCase() === em && (r.target_date || r.targetDate) === tDate);
        if (!alreadyInHistory) {
          historyRecords.push({
            user_email: em,
            target_date: tDate,
            total_questions: localItem.total_questions || localItem.totalQuestions || 3,
            correct_answers: localItem.correct_answers || localItem.correctAnswers || 0,
            incorrect_answers: localItem.incorrect_answers || localItem.incorrectAnswers || 0,
            unattempted: localItem.unattempted || 0
          });
        }
      }
    });
  }

  // Filter out any dummy emails if any existed historically
  allRecords = allRecords.filter(r => (r.user_email || r.userEmail) && (r.user_email || r.userEmail).toLowerCase() !== 'user@collegemap.in');

  // Pre-calculate user streaks
  const historyGroup = {};
  historyRecords.forEach(s => {
    const em = (s.user_email || s.userEmail || '').toLowerCase();
    if (!em) return;
    if (!historyGroup[em]) historyGroup[em] = [];
    historyGroup[em].push(s);
  });

  const streakMap = {};
  Object.keys(historyGroup).forEach(em => {
    streakMap[em] = calculateUserStreakStatsClient(historyGroup[em], todayDateStr);
  });

  if (type === 'daily') {
    return allRecords
      .sort((a, b) => b.score !== a.score ? b.score - a.score : a.time_taken_seconds - b.time_taken_seconds)
      .map((item, idx) => {
        const em = (item.user_email || item.userEmail || '').toLowerCase();
        const st = streakMap[em] || { currentStreak: 1, bestStreak: 1, totalDaysAttempted: 1, totalQuestionsAttempted: 3 };
        const activeStreak = Math.max(1, st.currentStreak || 1);
        return {
          rank: idx + 1,
          ...item,
          user_email: em,
          user_name: item.user_name || item.userName || em.split('@')[0],
          streak: activeStreak,
          bestStreak: Math.max(activeStreak, st.bestStreak || 1),
          totalDaysAttempted: Math.max(1, st.totalDaysAttempted || 1),
          totalQuestionsAttempted: Math.max(3, st.totalQuestionsAttempted || 3)
        };
      });
  }

  // Aggregated for weekly or monthly
  const userMap = {};
  allRecords.forEach(r => {
    const email = (r.user_email || r.userEmail || '').toLowerCase();
    if (!userMap[email]) {
      userMap[email] = {
        user_email: email,
        user_name: r.user_name || r.userName || email.split('@')[0],
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

  return Object.values(userMap)
    .map(u => {
      const em = u.user_email;
      const st = streakMap[em] || { currentStreak: 0, bestStreak: 0, totalDaysAttempted: 0, totalQuestionsAttempted: 0 };
      const resolvedStreak = st.currentStreak > 0 ? st.currentStreak : Math.max(1, st.bestStreak || u.attemptsCount || 1);
      const resolvedBest = Math.max(resolvedStreak, st.bestStreak || 1, u.attemptsCount || 1);
      return {
        user_email: u.user_email,
        user_name: u.user_name,
        score: u.score,
        accuracy: u.attemptsCount > 0 ? parseFloat((u.totalAccuracySum / u.attemptsCount).toFixed(1)) : 0,
        time_taken_seconds: Math.round(u.totalTimeSeconds / u.attemptsCount),
        attemptsCount: u.attemptsCount,
        streak: resolvedStreak,
        bestStreak: resolvedBest,
        totalDaysAttempted: Math.max(u.attemptsCount, st.totalDaysAttempted || 1),
        totalQuestionsAttempted: Math.max(u.attemptsCount * 3, st.totalQuestionsAttempted || 3)
      };
    })
    .sort((a, b) => b.score !== a.score ? b.score - a.score : a.time_taken_seconds - b.time_taken_seconds)
    .map((item, idx) => ({ rank: idx + 1, ...item }));
};



