/**
 * Difficulty-Based Test Generator
 * Generates custom tests based on difficulty level (Easy, Medium, Hard)
 * Pulls 75 questions (25 per subject) from available tests
 */

/**
 * Load difficulty metadata for a specific test
 * @param {string} testFolder - Name of the test folder
 * @returns {Promise<Object|null>} Difficulty metadata
 */
const loadDifficultyMetadata = async (testFolder) => {
  try {
    // Try to load the unified difficulty metadata file first
    try {
      const response = await fetch(`/tests/${testFolder}/${testFolder}-physics-1-15.json`);
      if (response.ok) {
        const data = await response.json();
        return data; // Return the entire metadata with all sections
      }
    } catch (error) {
      console.warn(`No unified difficulty metadata for ${testFolder}`);
    }

    // Fallback: Try to load individual subject files
    const subjects = ['physics', 'chemistry', 'mathematics'];
    const metadata = { sections: {} };

    for (const subject of subjects) {
      try {
        const response = await fetch(`/tests/${testFolder}/${testFolder}-${subject}.json`);
        if (response.ok) {
          const data = await response.json();
          if (data.sections && data.sections[subject]) {
            metadata.sections[subject] = data.sections[subject];
          }
        }
      } catch (error) {
        console.warn(`No difficulty metadata for ${subject} in ${testFolder}`);
      }
    }

    return Object.keys(metadata.sections).length > 0 ? metadata : null;
  } catch (error) {
    console.error('Error loading difficulty metadata:', error);
    return null;
  }
};

/**
 * Get all questions from all available tests with difficulty information
 * @returns {Promise<Object>} All questions grouped by subject and difficulty
 */
export const getAllQuestionsWithDifficulty = async () => {
  const knownTests = [
    'jee-main-2022-27th-jan-shift-1',
    'jee-main-2023-25th-jan-shift-2'
  ];

  const questionPool = {
    physics: { easy: [], medium: [], hard: [] },
    chemistry: { easy: [], medium: [], hard: [] },
    mathematics: { easy: [], medium: [], hard: [] }
  };

  for (const testFolder of knownTests) {
    try {
      // Load answer key
      const answerKeyResponse = await fetch(`/tests/${testFolder}/answerKey.json`);
      if (!answerKeyResponse.ok) continue;
      
      const answerKey = await answerKeyResponse.json();
      
      // Load difficulty metadata
      const difficultyMetadata = await loadDifficultyMetadata(testFolder);
      
      if (!difficultyMetadata) continue;

      // Process each section
      for (const section of answerKey.sections) {
        const subjectKey = section.sectionId.toLowerCase(); // 'physics', 'chemistry', 'mathematics'
        const difficultyInfo = difficultyMetadata.sections[subjectKey];
        
        if (!difficultyInfo) continue;

        // Process each question
        section.questions.forEach(question => {
          const qNum = question.questionNumber.toString();
          const difficultyData = difficultyInfo[qNum];
          
          if (difficultyData && difficultyData.difficulty) {
            const difficulty = difficultyData.difficulty.toLowerCase();
            
            // Add question with metadata
            questionPool[subjectKey][difficulty].push({
              ...question,
              testFolder,
              subject: section.sectionName,
              subjectId: subjectKey,
              difficulty: difficultyData.difficulty,
              lesson: difficultyData.lesson,
              type: difficultyData.type
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error processing test ${testFolder}:`, error);
    }
  }

  return questionPool;
};

/**
 * Generate a difficulty-based test with 75 questions (25 per subject)
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Promise<Object>} Generated test data
 */
export const generateDifficultyBasedTest = async (difficulty) => {
  const difficultyLower = difficulty.toLowerCase();
  const questionPool = await getAllQuestionsWithDifficulty();

  // Shuffle array helper
  const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate sections with 25 questions each
  const sections = [];
  const subjects = ['physics', 'chemistry', 'mathematics'];
  
  for (const subject of subjects) {
    const availableQuestions = questionPool[subject][difficultyLower] || [];
    
    if (availableQuestions.length === 0) {
      console.warn(`No ${difficulty} questions available for ${subject}`);
      continue;
    }

    // Shuffle and take up to 25 questions
    const selectedQuestions = shuffle(availableQuestions).slice(0, 25);
    
    // Process questions
    const processedQuestions = selectedQuestions.map((q, index) => {
      const questionNumber = index + 1;
      const imagePath = `/tests/${q.testFolder}/${subject}/${q.questionNumber}`;
      
      // Generate option keys
      const optionsWithKeys = q.options ? q.options.map((opt, idx) => ({
        ...opt,
        optionKey: `${subject}-q${questionNumber}-opt-${idx + 1}`
      })) : [];

      // Handle integer questions
      if (q.questionType === 'integer') {
        return {
          questionId: `${subject}-q${questionNumber}`,
          questionNumber,
          questionType: 'integer',
          questionImage: imagePath,
          questionText: '',
          subject: q.subject,
          subjectId: q.subjectId,
          difficulty: q.difficulty,
          lesson: q.lesson,
          correctIntegerAnswer: q.correctIntegerAnswer,
          marks: q.marks || 4,
          negativeMarks: q.negativeMarks || -1,
          originalTestFolder: q.testFolder,
          originalQuestionNumber: q.questionNumber
        };
      }

      // Handle MCQ questions
      return {
        questionId: `${subject}-q${questionNumber}`,
        questionNumber,
        questionType: q.questionType || 'single-correct',
        questionImage: imagePath,
        questionText: '',
        subject: q.subject,
        subjectId: q.subjectId,
        difficulty: q.difficulty,
        lesson: q.lesson,
        options: optionsWithKeys,
        correctAnswer: q.correctAnswer || [],
        correctAnswerKeys: q.correctAnswer || [],
        marks: q.marks || 4,
        negativeMarks: q.negativeMarks || -1,
        originalTestFolder: q.testFolder,
        originalQuestionNumber: q.questionNumber
      };
    });

    sections.push({
      sectionId: subject,
      sectionName: subject.charAt(0).toUpperCase() + subject.slice(1),
      questionCount: processedQuestions.length,
      questions: processedQuestions
    });
  }

  // Calculate total questions
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

  return {
    paperId: `difficulty-${difficultyLower}-test`,
    paperTitle: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level Practice Test`,
    paperType: 'JEE Main Practice',
    duration: 10800, // 3 hours
    totalQuestions,
    isDifficultyBased: true,
    difficulty: difficultyLower,
    sections
  };
};

/**
 * Get difficulty-based test options
 * @returns {Array} Array of difficulty test options
 */
export const getDifficultyTestOptions = () => {
  return [
    {
      id: 'difficulty-easy',
      title: '🟢 Easy Level Practice Test',
      type: 'Difficulty Practice',
      duration: '3 hours',
      totalQuestions: '75 (approx)',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      description: 'Practice test with 75 easy-level questions (25 per subject)',
      difficulty: 'easy',
      isDifficultyBased: true
    },
    {
      id: 'difficulty-medium',
      title: '🟡 Medium Level Practice Test',
      type: 'Difficulty Practice',
      duration: '3 hours',
      totalQuestions: '75 (approx)',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      description: 'Practice test with 75 medium-level questions (25 per subject)',
      difficulty: 'medium',
      isDifficultyBased: true
    },
    {
      id: 'difficulty-hard',
      title: '🔴 Hard Level Practice Test',
      type: 'Difficulty Practice',
      duration: '3 hours',
      totalQuestions: '75 (approx)',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      description: 'Practice test with 75 hard-level questions (25 per subject)',
      difficulty: 'hard',
      isDifficultyBased: true
    }
  ];
};

/**
 * Check if test ID is a difficulty-based test
 * @param {string} testId - Test ID
 * @returns {boolean} True if difficulty-based
 */
export const isDifficultyBasedTest = (testId) => {
  return testId && testId.startsWith('difficulty-');
};

/**
 * Get difficulty level from test ID
 * @param {string} testId - Test ID
 * @returns {string|null} Difficulty level or null
 */
export const getDifficultyFromTestId = (testId) => {
  if (!isDifficultyBasedTest(testId)) return null;
  
  if (testId === 'difficulty-easy') return 'easy';
  if (testId === 'difficulty-medium') return 'medium';
  if (testId === 'difficulty-hard') return 'hard';
  
  return null;
};
