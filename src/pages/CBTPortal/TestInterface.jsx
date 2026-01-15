import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './TestInterface.scss';
import { availableTests } from './TestData';
import TestResults from './TestResults';

const TestInterface = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [testData, setTestData] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({}); // Track questions marked for review
  const [visitedQuestions, setVisitedQuestions] = useState({}); // Track visited questions
  const [timeRemaining, setTimeRemaining] = useState(10800); // 3 hours in seconds
  const [questionTimeSpent, setQuestionTimeSpent] = useState({}); // Track time spent per question in seconds
  const [questionStartTime, setQuestionStartTime] = useState(null); // Track when current question was viewed
  const [testStartTime, setTestStartTime] = useState(null); // Track test start time
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const timerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const previousQuestionIdRef = useRef(null);

  const isFullscreenActive = () => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  const exitFullscreen = () => {
    if (!isFullscreenActive()) return;
    
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (error) {
      console.warn('Error exiting fullscreen:', error);
    }
  };

  // Shuffle array function (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle questions and option texts (but keep A, B, C, D order)
  const shuffleTestData = (paperData) => {
    const shuffledData = JSON.parse(JSON.stringify(paperData)); // Deep clone

    shuffledData.sections.forEach((section, sectionIndex) => {
      // Shuffle questions within each section
      section.questions = shuffleArray(section.questions);
      
      // Renumber questions after shuffling
      section.questions.forEach((q, index) => {
        q.questionNumber = index + 1;
      });

      // Shuffle option texts but keep optionIds (A, B, C, D) in order
      section.questions.forEach(question => {
        const originalOptions = [...question.options];
        
        // Shuffle the option objects (which contain optionKey, optionText)
        const shuffledOptions = shuffleArray(originalOptions);
        
        // Reassign optionIds to maintain A, B, C, D order
        const optionIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // Support up to 8 options
        question.options = shuffledOptions.map((option, index) => ({
          ...option,
          optionId: optionIds[index] // Keep A, B, C, D order
        }));
        
        // correctAnswerKeys remain the same (they reference unique keys, not positions)
        // No need to update them since they're tied to optionKey, not optionId
      });
    });

    return shuffledData;
  };

  const calculateResultsWithTime = useCallback((timeData) => {
    if (!testData) return null;

    let totalMarks = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    const sectionWiseResults = {};
    const questionDetails = [];
    const totalTestDuration = testStartTime ? Math.floor((Date.now() - testStartTime) / 1000) : 0;

    testData.sections.forEach((section, sectionIndex) => {
      let sectionMarks = 0;
      let sectionCorrect = 0;
      let sectionIncorrect = 0;
      let sectionUnattempted = 0;
      let sectionTimeSpent = 0;

      section.questions.forEach(question => {
        totalQuestions++;
        const userAnswer = answers[question.questionId] || [];
        const timeSpent = timeData[question.questionId] || 0;
        sectionTimeSpent += timeSpent;
        
        let isCorrect = false;
        let userAnswerDisplay = '';
        
        if (question.questionType === 'integer') {
          // Integer type question
          const userInteger = userAnswer[0] ? parseInt(userAnswer[0]) : null;
          const correctAnswer = question.correctIntegerAnswer;
          userAnswerDisplay = userInteger !== null && userInteger !== undefined ? userInteger.toString() : 'Not Attempted';
          
          if (userInteger === null || userInteger === undefined || isNaN(userInteger)) {
            unattempted++;
            sectionUnattempted++;
          } else if (typeof correctAnswer === 'object' && correctAnswer.min !== undefined) {
            // Range answer
            if (userInteger >= correctAnswer.min && userInteger <= correctAnswer.max) {
              isCorrect = true;
            }
          } else {
            // Single value answer
            if (userInteger === correctAnswer) {
              isCorrect = true;
            }
          }
        } else {
          // Multiple choice question
          const correctAnswer = question.correctAnswerKeys || question.correctAnswer;
          
          if (userAnswer.length === 0) {
            unattempted++;
            sectionUnattempted++;
            userAnswerDisplay = 'Not Attempted';
          } else {
            // Map option keys to option IDs for display
            const selectedOptions = question.options
              .filter(opt => userAnswer.includes(opt.optionKey || opt.optionId))
              .map(opt => opt.optionId)
              .join(', ');
            userAnswerDisplay = selectedOptions || userAnswer.join(', ');
            
            if (JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort())) {
              isCorrect = true;
            }
          }
        }
        
        if (isCorrect) {
          correctAnswers++;
          sectionCorrect++;
          sectionMarks += question.marks;
          totalMarks += question.marks;
        } else if (userAnswer.length > 0 || (question.questionType === 'integer' && userAnswer[0] !== null && userAnswer[0] !== undefined)) {
          incorrectAnswers++;
          sectionIncorrect++;
          totalMarks += question.negativeMarks;
          sectionMarks += question.negativeMarks;
        }

        // Store question details for breakdown
        let correctAnswerDisplay = '';
        if (question.questionType === 'integer') {
          if (typeof question.correctIntegerAnswer === 'object' && question.correctIntegerAnswer.min !== undefined) {
            correctAnswerDisplay = `${question.correctIntegerAnswer.min} - ${question.correctIntegerAnswer.max}`;
          } else {
            correctAnswerDisplay = question.correctIntegerAnswer?.toString() || '';
          }
        } else {
          const correctOptions = question.options
            .filter(opt => (question.correctAnswerKeys || question.correctAnswer || []).includes(opt.optionKey || opt.optionId))
            .map(opt => `${opt.optionId}. ${opt.optionText}`)
            .join(', ');
          correctAnswerDisplay = correctOptions || (question.correctAnswerKeys || question.correctAnswer || []).join(', ');
        }

        questionDetails.push({
          questionId: question.questionId,
          questionNumber: question.questionNumber,
          sectionName: section.sectionName,
          sectionId: section.sectionId,
          questionText: question.questionText,
          questionImage: question.questionImage,
          questionType: question.questionType,
          options: question.options,
          userAnswer: userAnswerDisplay,
          correctAnswer: correctAnswerDisplay,
          isCorrect,
          timeSpent,
          marks: isCorrect ? question.marks : (userAnswer.length > 0 || (question.questionType === 'integer' && userAnswer[0])) ? question.negativeMarks : 0
        });
      });

      sectionWiseResults[section.sectionId] = {
        name: section.sectionName,
        marks: sectionMarks,
        correct: sectionCorrect,
        incorrect: sectionIncorrect,
        unattempted: sectionUnattempted,
        total: section.questions.length,
        timeSpent: sectionTimeSpent
      };
    });

    return {
      totalMarks,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      sectionWiseResults,
      questionDetails,
      totalTestDuration,
      percentage: ((totalMarks / (totalQuestions * 4)) * 100).toFixed(2)
    };
  }, [testData, answers, testStartTime]);

  const calculateResults = useCallback(() => {
    return calculateResultsWithTime(questionTimeSpent);
  }, [calculateResultsWithTime, questionTimeSpent]);

  // Save test results to backend
  const saveTestResults = useCallback(async (results) => {
    try {
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      
      if (!userProfile.email) {
        console.warn('User profile not found, skipping test result save');
        return;
      }

      console.log('Saving test results with user profile:', userProfile);

      const testResultData = {
        testId: testId,
        testTitle: testData?.paperTitle || 'Test',
        totalMarks: results.totalMarks,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        unattempted: results.unattempted,
        percentage: parseFloat(results.percentage),
        totalTestDuration: results.totalTestDuration,
        sectionWiseResults: results.sectionWiseResults
      };

      console.log('Test result data being sent:', testResultData);

      // Create AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch('https://collegemapseminarpage.vercel.app/api/cbt/test-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Profile': JSON.stringify(userProfile)
          },
          body: JSON.stringify(testResultData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('✅ Backend response:', responseData);

        if (responseData.success) {
          console.log('✅ Test results saved successfully to Google Sheets');
          // Don't save to localStorage if successfully saved to backend
          return;
        } else {
          throw new Error(responseData.message || 'Failed to save');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('❌ Request timeout - Saving to localStorage as fallback');
        } else {
          console.error('❌ Network error:', fetchError);
        }
        
        // Save to localStorage as fallback - Only store last 5 results to prevent quota exceeded
        try {
          const localResults = JSON.parse(localStorage.getItem('offlineTestResults') || '[]');
          
          // Keep only the last 4 results + this new one = max 5 results
          const limitedResults = localResults.slice(-4);
          
          limitedResults.push({
            ...testResultData,
            userProfile,
            completedAt: new Date().toISOString(),
            synced: false
          });
          
          localStorage.setItem('offlineTestResults', JSON.stringify(limitedResults));
          console.log('💾 Saved to localStorage as fallback (max 5 results kept)');
        } catch (storageError) {
          console.error('❌ localStorage quota exceeded, clearing old results');
          // If still fails, clear all and save only this one
          localStorage.setItem('offlineTestResults', JSON.stringify([{
            ...testResultData,
            userProfile,
            completedAt: new Date().toISOString(),
            synced: false
          }]));
        }
      }
    } catch (error) {
      console.error('❌ Error in saveTestResults:', error);
    }
  }, [testId, testData]);

  const handleAutoSubmit = useCallback(async () => {
    // Save time spent on current question
    let updatedQuestionTime = { ...questionTimeSpent };
    if (previousQuestionIdRef.current && questionStartTime !== null) {
      const timeElapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      updatedQuestionTime[previousQuestionIdRef.current] = 
        (updatedQuestionTime[previousQuestionIdRef.current] || 0) + timeElapsed;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    
    // Calculate results with updated time data
    setQuestionTimeSpent(updatedQuestionTime);
    const results = calculateResultsWithTime(updatedQuestionTime);
    if (results) {
      setTestResults(results);
      setTestSubmitted(true);
      if (isFullscreenActive()) {
        exitFullscreen();
      }
      
      // Save test results to backend
      await saveTestResults(results);
    }
  }, [questionTimeSpent, questionStartTime, calculateResultsWithTime, saveTestResults]);

  useEffect(() => {
    // Check if profile exists first
    const userProfile = localStorage.getItem('userProfile');
    if (!userProfile) {
      navigate('/profile-setup', { state: { testId } });
      return;
    }

    // Profile exists, proceed with test loading
    const test = availableTests.find(t => t.id === testId);
    if (test && test.paperData) {
      // Shuffle questions and options
      const shuffledData = shuffleTestData(test.paperData);
      setTestData(shuffledData);
      setTimeRemaining(shuffledData.duration);
      setTestStartTime(Date.now());
      
      // Initialize answers object
      const initialAnswers = {};
      const initialMarkedForReview = {};
      const initialVisited = {};
      const initialQuestionTime = {};
      shuffledData.sections.forEach(section => {
        section.questions.forEach(q => {
          initialAnswers[q.questionId] = [];
          initialMarkedForReview[q.questionId] = false;
          initialVisited[q.questionId] = false;
          initialQuestionTime[q.questionId] = 0;
        });
      });
      setAnswers(initialAnswers);
      setMarkedForReview(initialMarkedForReview);
      setVisitedQuestions(initialVisited);
      setQuestionTimeSpent(initialQuestionTime);
    } else {
      navigate('/cbt-portal');
    }
  }, [testId, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !testSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining, testSubmitted, handleAutoSubmit]);

  // Fullscreen on mount
  useEffect(() => {
    if (testData && !testSubmitted) {
      enterFullscreen();
    }
  }, [testData, testSubmitted]);

  // Detect fullscreen exit
  useEffect(() => {
    if (!testData || testSubmitted) return;

    const handleFullscreenChange = () => {
      if (!isFullscreenActive() && !testSubmitted) {
        setShowExitWarning(true);
        // Auto-submit after showing warning
        setTimeout(() => {
          const results = calculateResults();
          if (results) {
            setTestResults(results);
            setTestSubmitted(true);
            setShowExitWarning(false);
          }
        }, 2000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [testData, testSubmitted, calculateResults]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, optionId, isMultiple) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (isMultiple) {
        if (currentAnswers.includes(optionId)) {
          return { ...prev, [questionId]: currentAnswers.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleIntegerAnswerChange = (questionId, value) => {
    setAnswers(prev => {
      // Store as array with single integer value
      return { ...prev, [questionId]: value ? [value] : [] };
    });
  };

  const handleNextQuestion = () => {
    if (!testData) return;
    const section = testData.sections[currentSection];
    // Mark current question as visited before moving
    const currentQ = section.questions[currentQuestion];
    setVisitedQuestions(prev => ({
      ...prev,
      [currentQ.questionId]: true
    }));
    
    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Mark next question as visited
      const nextQ = section.questions[currentQuestion + 1];
      setVisitedQuestions(prev => ({
        ...prev,
        [nextQ.questionId]: true
      }));
    } else if (currentSection < testData.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
      // Mark first question of next section as visited
      const nextSection = testData.sections[currentSection + 1];
      if (nextSection.questions.length > 0) {
        setVisitedQuestions(prev => ({
          ...prev,
          [nextSection.questions[0].questionId]: true
        }));
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (!testData) return;
    // Mark current question as visited before moving
    const currentSectionData = testData.sections[currentSection];
    const currentQ = currentSectionData.questions[currentQuestion];
    setVisitedQuestions(prev => ({
      ...prev,
      [currentQ.questionId]: true
    }));
    
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Mark previous question as visited
      const prevQ = currentSectionData.questions[currentQuestion - 1];
      setVisitedQuestions(prev => ({
        ...prev,
        [prevQ.questionId]: true
      }));
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSection = testData.sections[currentSection - 1];
      setCurrentQuestion(prevSection.questions.length - 1);
      // Mark last question of previous section as visited
      const lastQ = prevSection.questions[prevSection.questions.length - 1];
      setVisitedQuestions(prev => ({
        ...prev,
        [lastQ.questionId]: true
      }));
    }
  };

  const handleSectionChange = (sectionIndex) => {
    if (!testData) return;
    // Mark current question as visited
    const currentSectionData = testData.sections[currentSection];
    const currentQ = currentSectionData.questions[currentQuestion];
    setVisitedQuestions(prev => ({
      ...prev,
      [currentQ.questionId]: true
    }));
    
    setCurrentSection(sectionIndex);
    setCurrentQuestion(0);
    // Mark first question of new section as visited
    const newSection = testData.sections[sectionIndex];
    if (newSection.questions.length > 0) {
      setVisitedQuestions(prev => ({
        ...prev,
        [newSection.questions[0].questionId]: true
      }));
    }
  };

  const handleQuestionJump = (sectionIndex, questionIndex) => {
    setCurrentSection(sectionIndex);
    setCurrentQuestion(questionIndex);
    // Mark question as visited
    if (testData) {
      const question = testData.sections[sectionIndex].questions[questionIndex];
      setVisitedQuestions(prev => ({
        ...prev,
        [question.questionId]: true
      }));
    }
  };

  const handleMarkForReview = () => {
    if (!testData) return;
    const question = testData.sections[currentSection].questions[currentQuestion];
    setMarkedForReview(prev => ({
      ...prev,
      [question.questionId]: !prev[question.questionId]
    }));
  };

  const handleMarkForReviewAndNext = () => {
    handleMarkForReview();
    handleNextQuestion();
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = async () => {
    // Save time spent on current question
    let updatedQuestionTime = { ...questionTimeSpent };
    if (previousQuestionIdRef.current && questionStartTime !== null) {
      const timeElapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      updatedQuestionTime[previousQuestionIdRef.current] = 
        (updatedQuestionTime[previousQuestionIdRef.current] || 0) + timeElapsed;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    
    // Calculate results with updated time data
    setQuestionTimeSpent(updatedQuestionTime);
    const results = calculateResultsWithTime(updatedQuestionTime);
    if (results) {
      setTestResults(results);
      setTestSubmitted(true);
      if (isFullscreenActive()) {
        exitFullscreen();
      }
      setShowSubmitConfirm(false);
      
      // Save test results to backend
      await saveTestResults(results);
    }
  };

  const cancelSubmit = () => {
    setShowSubmitConfirm(false);
  };

  // Count answered questions
  const getAnsweredCount = useCallback(() => {
    if (!testData) return 0;
    let count = 0;
    testData.sections.forEach(section => {
      section.questions.forEach(q => {
        const answer = answers[q.questionId];
        if (answer && answer.length > 0) {
          // For integer type, check if value is not empty
          if (q.questionType === 'integer') {
            if (answer[0] !== null && answer[0] !== undefined && answer[0] !== '') {
              count++;
            }
          } else {
            count++;
          }
        }
      });
    });
    return count;
  }, [testData, answers]);

  // Calculate question statistics
  const getQuestionStatistics = useCallback(() => {
    if (!testData) return { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, total: 0 };
    
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let marked = 0;
    const total = testData.totalQuestions;

    testData.sections.forEach(section => {
      section.questions.forEach(q => {
        const answer = answers[q.questionId] || [];
        const isVisited = visitedQuestions[q.questionId] || false;
        const isMarked = markedForReview[q.questionId] || false;
        
        if (isMarked) marked++;
        
        if (!isVisited) {
          notVisited++;
        } else {
          // Check if answered
          let hasAnswer = false;
          if (answer && answer.length > 0) {
            if (q.questionType === 'integer') {
              hasAnswer = answer[0] !== null && answer[0] !== undefined && answer[0] !== '';
            } else {
              hasAnswer = true;
            }
          }
          
          if (hasAnswer) {
            answered++;
          } else {
            notAnswered++;
          }
        }
      });
    });

    return { answered, notAnswered, notVisited, marked, total };
  }, [testData, answers, visitedQuestions, markedForReview]);

  // Mark current question as visited and track time spent
  useEffect(() => {
    if (!testData || testSubmitted) return;
    
    if (testData.sections[currentSection] && testData.sections[currentSection].questions[currentQuestion]) {
      const question = testData.sections[currentSection].questions[currentQuestion];
      
      // Save time spent on previous question before switching
      if (previousQuestionIdRef.current && questionStartTime !== null) {
        const timeElapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        setQuestionTimeSpent(prev => ({
          ...prev,
          [previousQuestionIdRef.current]: (prev[previousQuestionIdRef.current] || 0) + timeElapsed
        }));
      }

      // Mark question as visited
      setVisitedQuestions(prev => ({
        ...prev,
        [question.questionId]: true
      }));

      // Update previous question reference and start time tracking
      previousQuestionIdRef.current = question.questionId;
      setQuestionStartTime(Date.now());
    }
  }, [currentSection, currentQuestion, testData, testSubmitted, questionStartTime]);

  if (!testData) {
    return <div className="loading">Loading test...</div>;
  }

  if (testSubmitted && testResults) {
    return <TestResults results={testResults} testData={testData} />;
  }

  const currentSectionData = testData.sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData.questionId] || [];
  const questionStats = getQuestionStatistics();

  return (
    <div className="test-interface jee-style nta-official">
      {/* NTA JEE Mains Header */}
      <div className="jee-test-header">
        <div className="header-top-bar">
          <div className="candidate-profile">
            <div className="profile-image">
              <div className="avatar-placeholder">👤</div>
            </div>
            <div className="candidate-details">
              <div className="detail-row">
                <span className="detail-label">Candidate Name</span>
                <span className="detail-separator">:</span>
                <span className="detail-value">
                  {JSON.parse(localStorage.getItem('userProfile') || '{}').name || '[Your Name]'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Exam Name</span>
                <span className="detail-separator">:</span>
                <span className="detail-value">JEE-Main</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subject Name</span>
                <span className="detail-separator">:</span>
                <span className="detail-value orange-text">{testData.paperTitle}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Remaining Time</span>
                <span className="detail-separator">:</span>
                <span className={`detail-value timer-value ${timeRemaining < 600 ? 'warning' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          <div className="language-selector-top">
            <select className="language-dropdown">
              <option>English</option>
            </select>
          </div>
        </div>
        
        <div className="header-tabs">
          {testData.sections.map((section, index) => (
            <button
              key={section.sectionId}
              className={`subject-tab ${currentSection === index ? 'active' : ''}`}
              onClick={() => handleSectionChange(index)}
            >
              {section.sectionName}
            </button>
          ))}
        </div>
      </div>

      <div className="jee-test-body">
        {/* Main Question Section */}
        <div className="jee-question-panel">
          <div className="question-header-bar">
            <span className="question-number-display">Question No. {currentQuestionData.questionNumber}</span>
          </div>

          <div className="question-content-area">
            <div className="question-text-display">
              {currentQuestionData.questionText}
            </div>

            {currentQuestionData.questionImage && (
              <div className="question-image-wrapper">
                <img 
                  src={currentQuestionData.questionImage} 
                  alt="Question" 
                  className="question-image"
                />
              </div>
            )}

            {currentQuestionData.questionType === 'integer' ? (
              <div className="integer-answer-input">
                <input
                  type="number"
                  className="integer-field"
                  value={currentAnswer[0] || ''}
                  onChange={(e) => handleIntegerAnswerChange(currentQuestionData.questionId, e.target.value)}
                  placeholder="Enter integer value"
                  step="1"
                />
              </div>
            ) : (
              <div className="options-list">
                {currentQuestionData.options.map((option) => {
                  const isSelected = currentAnswer.includes(option.optionKey || option.optionId);
                  const isMultiple = currentQuestionData.questionType === 'multiple-correct';
                  const optionKey = option.optionKey || option.optionId;
                  return (
                    <label
                      key={optionKey}
                      className={`option-item ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type={isMultiple ? 'checkbox' : 'radio'}
                        name={`question-${currentQuestionData.questionId}`}
                        value={optionKey}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(currentQuestionData.questionId, optionKey, isMultiple)}
                      />
                      <span className="option-number">({option.optionId})</span>
                      <span className="option-content">{option.optionText}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="jee-action-buttons">
            <button
              className="jee-btn save-next"
              onClick={handleNextQuestion}
              disabled={currentSection === testData.sections.length - 1 && 
                       currentQuestion === currentSectionData.questions.length - 1}
            >
              SAVE & NEXT
            </button>
            <button
              className="jee-btn save-mark"
              onClick={handleMarkForReviewAndNext}
              disabled={currentSection === testData.sections.length - 1 && 
                       currentQuestion === currentSectionData.questions.length - 1}
            >
              SAVE & MARK FOR REVIEW
            </button>
            <button
              className="jee-btn clear-response"
              onClick={() => {
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestionData.questionId]: []
                }));
              }}
            >
              CLEAR RESPONSE
            </button>
            <button
              className="jee-btn mark-review-next"
              onClick={handleMarkForReviewAndNext}
              disabled={currentSection === testData.sections.length - 1 && 
                       currentQuestion === currentSectionData.questions.length - 1}
            >
              MARK FOR REVIEW & NEXT
            </button>
          </div>

          {/* Navigation Arrows - Mobile */}
          <div className="mobile-navigation">
            <button
              className="mobile-nav-btn"
              onClick={handlePreviousQuestion}
              disabled={currentSection === 0 && currentQuestion === 0}
            >
              &lt;&lt; BACK
            </button>
            <button
              className="mobile-nav-btn"
              onClick={handleNextQuestion}
              disabled={currentSection === testData.sections.length - 1 && 
                       currentQuestion === currentSectionData.questions.length - 1}
            >
              NEXT &gt;&gt;
            </button>
          </div>
        </div>

        {/* Right Sidebar - Question Navigator */}
        <div className="jee-question-navigator">
          <div className="navigator-content">
            <div className="question-grid">
              {testData.sections[currentSection].questions.map((q, qIndex) => {
                const answer = answers[q.questionId];
                const isVisited = visitedQuestions[q.questionId] || false;
                let isAnswered = false;
                if (answer && answer.length > 0) {
                  if (q.questionType === 'integer') {
                    isAnswered = answer[0] !== null && answer[0] !== undefined && answer[0] !== '';
                  } else {
                    isAnswered = true;
                  }
                }
                const isMarked = markedForReview[q.questionId] || false;
                const isCurrent = currentQuestion === qIndex;
                
                let statusClass = 'not-visited';
                if (!isVisited) {
                  statusClass = 'not-visited';
                } else if (isMarked && isAnswered) {
                  statusClass = 'marked-answered';
                } else if (isMarked && !isAnswered) {
                  statusClass = 'marked-not-answered';
                } else if (isAnswered) {
                  statusClass = 'answered';
                } else {
                  statusClass = 'not-answered';
                }
                
                return (
                  <button
                    key={q.questionId}
                    className={`question-num-btn ${statusClass} ${isCurrent ? 'current' : ''}`}
                    onClick={() => handleQuestionJump(currentSection, qIndex)}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="question-legend">
              <div className="legend-item">
                <div className="legend-box not-visited"></div>
                <span>Not Visited</span>
              </div>
              <div className="legend-item">
                <div className="legend-box not-answered"></div>
                <span>Not Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-box answered"></div>
                <span>Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-box marked-answered"></div>
                <span>Marked & Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-box marked-not-answered"></div>
                <span>Marked for Review</span>
              </div>
            </div>

            {/* Submit Button */}
            <button className="jee-submit-button" onClick={handleSubmit}>
              SUBMIT
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div
            className="submit-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelSubmit}
          >
            <motion.div
              className="submit-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirm Submission</h3>
              <p>Are you sure you want to submit the test? You have answered {getAnsweredCount()} out of {testData.totalQuestions} questions.</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={cancelSubmit}>Cancel</button>
                <button className="confirm-btn" onClick={confirmSubmit}>Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showExitWarning && (
          <motion.div
            className="exit-warning-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="exit-warning-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="warning-icon">⚠️</div>
              <h3>Fullscreen Exited</h3>
              <p>You have exited fullscreen mode. The test will be automatically submitted in 2 seconds.</p>
              <p className="warning-message">Please do not exit fullscreen during the test.</p>
            </motion.div>
          </motion.div>
        )}

        {showCalculator && (
          <Calculator 
            onClose={() => setShowCalculator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Calculator Component - Optimized and Floating with Drag & Resize
const Calculator = React.memo(({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  
  // Drag and resize state
  const [position, setPosition] = useState({ x: window.innerWidth - 360, y: 80 });
  const [size, setSize] = useState({ width: 320, height: 420 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const calculatorRef = useRef(null);

  const inputNumber = useCallback((num) => {
    setDisplay(prev => {
      if (waitingForNewValue) {
        setWaitingForNewValue(false);
        return String(num);
      }
      return prev === '0' ? String(num) : prev + num;
    });
  }, [waitingForNewValue]);

  const inputDecimal = useCallback(() => {
    setDisplay(prev => {
      if (waitingForNewValue) {
        setWaitingForNewValue(false);
        return '0.';
      }
      return prev.indexOf('.') === -1 ? prev + '.' : prev;
    });
  }, [waitingForNewValue]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  const calculate = useCallback((firstValue, secondValue, op) => {
    switch (op) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      default:
        return secondValue;
    }
  }, []);

  const performOperation = useCallback((nextOperation) => {
    setDisplay(prev => {
      const inputValue = parseFloat(prev);
      
      setPreviousValue(prevVal => {
        if (prevVal === null) {
          return inputValue;
        } else if (operation) {
          const newValue = calculate(prevVal, inputValue, operation);
          setDisplay(String(newValue));
          return newValue;
        }
        return prevVal;
      });
      
      setWaitingForNewValue(true);
      setOperation(nextOperation);
      return prev;
    });
  }, [operation, calculate]);

  const handleEquals = useCallback(() => {
    setDisplay(prev => {
      const inputValue = parseFloat(prev);
      
      if (previousValue !== null && operation) {
        const newValue = calculate(previousValue, inputValue, operation);
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
        return String(newValue);
      }
      return prev;
    });
  }, [previousValue, operation, calculate]);

  const handleSquareRoot = useCallback(() => {
    setDisplay(prev => {
      const value = parseFloat(prev);
      if (value >= 0) {
        const result = Math.sqrt(value);
        setWaitingForNewValue(true);
        return String(result);
      }
      return prev;
    });
  }, []);

  const handleReciprocal = useCallback(() => {
    setDisplay(prev => {
      const value = parseFloat(prev);
      if (value !== 0) {
        const result = 1 / value;
        setWaitingForNewValue(true);
        return String(result);
      }
      return prev;
    });
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.calculator-close') || e.target.closest('.calc-btn') || e.target.closest('.resize-handle')) {
      return;
    }
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
      } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      let newWidth = resizeStartPos.current.width;
      let newHeight = resizeStartPos.current.height;
      
      const minWidth = 250;
      const minHeight = 350;
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;
      
      // Handle right edge
      if (resizeHandle === 'right' || resizeHandle === 'both') {
        newWidth = Math.max(minWidth, Math.min(resizeStartPos.current.width + deltaX, maxWidth));
      }
      // Handle bottom edge
      if (resizeHandle === 'bottom' || resizeHandle === 'both') {
        newHeight = Math.max(minHeight, Math.min(resizeStartPos.current.height + deltaY, maxHeight));
      }
      
      setSize({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, resizeHandle, position, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e, handle) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  }, [size]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <motion.div
      className="calculator-floating"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`
      }}
      ref={calculatorRef}
    >
      <div
        className="calculator-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <div 
          className="calculator-header"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <h3>Calculator</h3>
          <button className="calculator-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Resize handles - only right and bottom */}
        <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleResizeStart(e, 'right')}></div>
        <div className="resize-handle resize-handle-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')}></div>
        <div className="resize-handle resize-handle-corner" onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
          setResizeHandle('both');
          resizeStartPos.current = {
            x: e.clientX,
            y: e.clientY,
            width: size.width,
            height: size.height
          };
        }}></div>
        <div className="calculator-display">
          {display}
        </div>
        <div className="calculator-buttons">
          <button className="calc-btn function" onClick={clear}>C</button>
          <button className="calc-btn function" onClick={handleSquareRoot}>√</button>
          <button className="calc-btn function" onClick={handleReciprocal}>1/x</button>
          <button className="calc-btn operator" onClick={() => performOperation('÷')}>÷</button>
          
          <button className="calc-btn number" onClick={() => inputNumber(7)}>7</button>
          <button className="calc-btn number" onClick={() => inputNumber(8)}>8</button>
          <button className="calc-btn number" onClick={() => inputNumber(9)}>9</button>
          <button className="calc-btn operator" onClick={() => performOperation('×')}>×</button>
          
          <button className="calc-btn number" onClick={() => inputNumber(4)}>4</button>
          <button className="calc-btn number" onClick={() => inputNumber(5)}>5</button>
          <button className="calc-btn number" onClick={() => inputNumber(6)}>6</button>
          <button className="calc-btn operator" onClick={() => performOperation('-')}>-</button>
          
          <button className="calc-btn number" onClick={() => inputNumber(1)}>1</button>
          <button className="calc-btn number" onClick={() => inputNumber(2)}>2</button>
          <button className="calc-btn number" onClick={() => inputNumber(3)}>3</button>
          <button className="calc-btn operator" onClick={() => performOperation('+')}>+</button>
          
          <button className="calc-btn number zero" onClick={() => inputNumber(0)}>0</button>
          <button className="calc-btn number" onClick={inputDecimal}>.</button>
          <button className="calc-btn equals" onClick={handleEquals}>=</button>
        </div>
      </div>
    </motion.div>
  );
});

export default TestInterface;

