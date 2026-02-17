/**
 * Test Discovery System
 * Dynamically discovers tests from public/tests folder
 */

import { getDifficultyTestOptions } from './difficultyTestGenerator';

/**
 * Discover all available tests from the tests folder
 * @returns {Promise<Array>} Array of test metadata
 */
export const discoverTests = async () => {
  try {
    // Try to fetch a tests manifest or list all test folders
    // Since we can't list directories in browser, we'll use a manifest approach
    // For now, we'll try to load known tests and check if they exist
    
    // Known test folders - can be extended
    const knownTestFolders = [
      'jee-main-2023-25th-jan-shift-2',
      'jee-main-2022-27th-jan-shift-1'
    ];
    
    const tests = [];
    
    // Add difficulty-based practice tests at the top
    const difficultyTests = getDifficultyTestOptions();
    tests.push(...difficultyTests);
    
    // Add regular full-length tests
    for (const testFolder of knownTestFolders) {
      try {
        const answerKey = await loadTestMetadata(testFolder);
        if (answerKey) {
          tests.push({
            id: testFolder,
            title: answerKey.paperTitle || formatTestName(testFolder),
            type: answerKey.paperType || 'JEE Main',
            duration: formatDuration(answerKey.duration),
            totalQuestions: answerKey.totalQuestions || 0,
            subjects: answerKey.sections?.map(s => s.sectionName) || ['Physics', 'Chemistry', 'Mathematics'],
            description: `Full-length test from ${testFolder}`,
            testFolder: testFolder,
            isDifficultyBased: false
          });
        }
      } catch (error) {
        console.warn(`Failed to load test ${testFolder}:`, error);
        // Continue to next test
      }
    }
    
    return tests;
  } catch (error) {
    console.error('Error discovering tests:', error);
    return [];
  }
};

/**
 * Load test metadata from answerKey.json
 * @param {string} testFolder - Name of the test folder
 * @returns {Promise<Object|null>} Test metadata or null if not found
 */
export const loadTestMetadata = async (testFolder) => {
  try {
    const response = await fetch(`/tests/${testFolder}/answerKey.json`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading metadata for ${testFolder}:`, error);
    return null;
  }
};

/**
 * Format test folder name to display name
 * @param {string} folderName - Folder name like "jee-main-2023-25th-jan-shift-2"
 * @returns {string} Formatted name
 */
const formatTestName = (folderName) => {
  return folderName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1$2');
};

/**
 * Format duration from seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
const formatDuration = (seconds) => {
  if (!seconds) return '3 hours';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

/**
 * Get test by ID
 * @param {string} testId - Test ID (folder name or difficulty-based ID)
 * @returns {Promise<Object|null>} Test metadata or null
 */
export const getTestById = async (testId) => {
  // Check if it's a difficulty-based test
  if (testId && testId.startsWith('difficulty-')) {
    const difficultyTests = getDifficultyTestOptions();
    return difficultyTests.find(test => test.id === testId) || null;
  }
  
  // Regular test
  const metadata = await loadTestMetadata(testId);
  if (!metadata) return null;
  
  return {
    id: testId,
    title: metadata.paperTitle || formatTestName(testId),
    type: metadata.paperType || 'JEE Main',
    duration: formatDuration(metadata.duration),
    totalQuestions: metadata.totalQuestions || 0,
    subjects: metadata.sections?.map(s => s.sectionName) || ['Physics', 'Chemistry', 'Mathematics'],
    description: `Full-length test from ${testId}`,
    testFolder: testId,
    isDifficultyBased: false
  };
};
