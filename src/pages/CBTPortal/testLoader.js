/**
 * Image-based Test Loader
 * Loads test data from image folders and answer key JSON
 */

import { 
  isDifficultyBasedTest, 
  getDifficultyFromTestId, 
  generateDifficultyBasedTest 
} from './difficultyTestGenerator';

/**
 * Get image path for a question
 * @param {string} testName - Name of the test folder
 * @param {string} subject - Subject folder name (physics, chemistry, maths)
 * @param {number} questionNumber - Question number (1-indexed)
 * @returns {string} Image path
 */
export const getQuestionImagePath = (testName, subject, questionNumber) => {
  // Map subject names to folder names
  const subjectFolderMap = {
    'physics': 'physics',
    'chemistry': 'chemistry',
    'mathematics': 'mathematics',
    'maths': 'mathematics' // Map 'maths' to 'mathematics' folder
  };
  
  const folderName = subjectFolderMap[subject.toLowerCase()] || subject.toLowerCase();
  
  // Try .jpg first, then .png
  const basePath = `/tests/${testName}/${folderName}/${questionNumber}`;
  return basePath;
};

/**
 * Load answer key JSON for a test
 * @param {string} testName - Name of the test folder
 * @returns {Promise<Object>} Answer key data
 */
export const loadAnswerKey = async (testName) => {
  try {
    const response = await fetch(`/tests/${testName}/answerKey.json`);
    if (!response.ok) {
      throw new Error(`Failed to load answer key: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading answer key:', error);
    throw error;
  }
};

/**
 * Check if an image exists - Improved for Chemistry and Mathematics
 * @param {string} imagePath - Path to the image (without extension)
 * @returns {Promise<string|null>} Full path to image if exists, null otherwise
 */
export const checkImageExists = async (imagePath) => {
  // Try .png first since all images are .png files
  const extensions = ['.png', '.PNG', '.jpg', '.JPG', '.jpeg', '.JPEG'];
  
  for (const ext of extensions) {
    try {
      const fullPath = `${imagePath}${ext}`;
      const response = await fetch(fullPath, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ Found image: ${fullPath}`);
        return fullPath;
      }
    } catch (error) {
      // Continue to next extension
    }
  }
  
  console.warn(`⚠️ Image not found: ${imagePath} (tried: ${extensions.join(', ')})`);
  return null;
};

/**
 * Load test data from images and answer key
 * @param {string} testName - Name of the test folder or difficulty-based test ID
 * @returns {Promise<Object>} Complete test data with image paths
 */
export const loadImageBasedTest = async (testName) => {
  try {
    // Check if it's a difficulty-based test
    if (isDifficultyBasedTest(testName)) {
      const difficulty = getDifficultyFromTestId(testName);
      if (!difficulty) {
        throw new Error('Invalid difficulty test ID');
      }
      
      console.log(`🎯 Loading ${difficulty} difficulty-based test...`);
      const testData = await generateDifficultyBasedTest(difficulty);
      console.log(`✅ Generated ${difficulty} test with ${testData.totalQuestions} questions`);
      return testData;
    }
    
    // Load regular image-based test
    // Load answer key
    const answerKey = await loadAnswerKey(testName);
    
    // Process sections and add image paths
    const processedSections = answerKey.sections.map(section => {
      // Filter out empty question arrays and handle missing questions
      const validQuestions = (section.questions || []).filter(q => q && q.questionNumber);
      const processedQuestions = validQuestions.map(question => {
        const imagePath = getQuestionImagePath(
          testName,
          section.sectionId,
          question.questionNumber
        );
        
        // Generate unique option keys if not present
        const optionsWithKeys = question.options ? question.options.map((opt, idx) => ({
          ...opt,
          optionKey: opt.optionKey || `${section.sectionId}-${question.questionNumber}-opt-${idx + 1}`
        })) : [];
        
        // Convert correctAnswer to correctAnswerKeys if needed
        let correctAnswerKeys = question.correctAnswerKeys || question.correctAnswer || [];
        if (correctAnswerKeys.length > 0 && typeof correctAnswerKeys[0] === 'string' && 
            (correctAnswerKeys[0].length === 1 || ['A', 'B', 'C', 'D'].includes(correctAnswerKeys[0]))) {
          // Convert option IDs to option keys
          correctAnswerKeys = correctAnswerKeys.map(ans => {
            const option = optionsWithKeys.find(opt => opt.optionId === ans);
            return option ? option.optionKey : ans;
          });
        }
        
        return {
          ...question,
          questionId: question.questionId || `${section.sectionId}-${question.questionNumber}`,
          questionImage: imagePath, // Base path, will try different extensions
          questionText: '', // No text, only images
          subject: section.sectionName,
          options: optionsWithKeys,
          correctAnswer: question.correctAnswer || [],
          correctAnswerKeys: correctAnswerKeys
        };
      });
      
      return {
        ...section,
        questions: processedQuestions
      };
    });
    
    return {
      ...answerKey,
      sections: processedSections
    };
  } catch (error) {
    console.error('Error loading image-based test:', error);
    throw error;
  }
};

/**
 * Resolve actual image URL (tries different extensions)
 * @param {string} basePath - Base path without extension
 * @returns {Promise<string|null>} Resolved image URL or null
 */
export const resolveImageUrl = async (basePath) => {
  return await checkImageExists(basePath);
};
