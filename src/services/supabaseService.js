import { supabase } from '../supabaseClient';

/**
 * Get user profile from Supabase by email
 * @param {string} email - User's email
 * @returns {Promise<Object|null>} User profile or null
 */
export const getUserProfile = async (email) => {
  if (!supabase || !email) return null;
  
  try {
    const { data, error } = await supabase
      .from('portal_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Save or update user profile in Supabase
 * @param {Object} profileData - Profile data { name, email }
 * @returns {Promise<Object|null>} Saved profile or null
 */
export const saveUserProfile = async (profileData) => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('portal_users')
      .upsert(
        {
          name: profileData.name,
          email: profileData.email.toLowerCase(),
          submitted_at: new Date().toISOString()
        },
        { onConflict: 'email' }
      )
      .select()
      .single();
    
    if (error) throw error;
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
