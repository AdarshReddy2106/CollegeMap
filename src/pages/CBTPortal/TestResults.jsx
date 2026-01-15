import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './TestResults.scss';

const TestResults = ({ results, testData }) => {
  const navigate = useNavigate();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getAverageTimePerQuestion = () => {
    if (!results.questionDetails || results.questionDetails.length === 0) return 0;
    const totalTime = results.questionDetails.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
    return Math.floor(totalTime / results.questionDetails.length);
  };

  return (
    <div className="test-results">
      <motion.div
        className="results-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="results-header">
          <h1>Test Results</h1>
          <p>{testData.paperTitle}</p>
        </div>

        <div className="results-summary">
          <motion.div
            className="summary-card total-marks"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Total Marks</h3>
              <p className="big-number">{results.totalMarks}</p>
              <p className="sub-text">out of {results.totalQuestions * 4}</p>
            </div>
          </motion.div>

          <motion.div
            className="summary-card correct"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Correct</h3>
              <p className="big-number">{results.correctAnswers}</p>
              <p className="sub-text">out of {results.totalQuestions}</p>
            </div>
          </motion.div>

          <motion.div
            className="summary-card incorrect"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-icon">❌</div>
            <div className="card-content">
              <h3>Incorrect</h3>
              <p className="big-number">{results.incorrectAnswers}</p>
              <p className="sub-text">out of {results.totalQuestions}</p>
            </div>
          </motion.div>

          <motion.div
            className="summary-card unattempted"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-icon">⏭️</div>
            <div className="card-content">
              <h3>Unattempted</h3>
              <p className="big-number">{results.unattempted}</p>
              <p className="sub-text">out of {results.totalQuestions}</p>
            </div>
          </motion.div>

          <motion.div
            className="summary-card time-taken"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-icon">⏱️</div>
            <div className="card-content">
              <h3>Total Time</h3>
              <p className="big-number">{formatTime(results.totalTestDuration)}</p>
              <p className="sub-text">Avg: {formatTime(getAverageTimePerQuestion())} per question</p>
            </div>
          </motion.div>
        </div>

        <div className="section-wise-results">
          <h2>Section-wise Performance</h2>
          <div className="sections-grid">
            {Object.entries(results.sectionWiseResults).map(([sectionId, sectionResult], index) => (
              <motion.div
                key={sectionId}
                className="section-result-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <h3>{sectionResult.name}</h3>
                <div className="section-stats">
                  <div className="stat-item">
                    <span className="stat-label">Marks:</span>
                    <span className="stat-value">{sectionResult.marks}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Correct:</span>
                    <span className="stat-value correct">{sectionResult.correct}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Incorrect:</span>
                    <span className="stat-value incorrect">{sectionResult.incorrect}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Unattempted:</span>
                    <span className="stat-value unattempted">{sectionResult.unattempted}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Time Taken:</span>
                    <span className="stat-value time">{formatTime(sectionResult.timeSpent || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Time/Question:</span>
                    <span className="stat-value time">
                      {formatTime(Math.floor((sectionResult.timeSpent || 0) / sectionResult.total))}
                    </span>
                  </div>
                </div>
                <div className="section-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(sectionResult.correct / sectionResult.total) * 100}%`,
                        background: '#10c3bc'
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {sectionResult.correct}/{sectionResult.total} correct
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button
            className="action-button breakdown"
            onClick={() => setShowBreakdown(true)}
          >
            View Question Breakdown
          </button>
          <button
            className="action-button dashboard"
            onClick={() => navigate('/cbt-portal/dashboard')}
          >
            View Dashboard
          </button>
          <button
            className="action-button primary"
            onClick={() => navigate('/cbt-portal')}
          >
            Take Another Test
          </button>
          <button
            className="action-button secondary"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>
      </motion.div>

      {/* Question Breakdown Modal */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            className="breakdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBreakdown(false)}
          >
            <motion.div
              className="breakdown-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="breakdown-header">
                <h2>Question Breakdown</h2>
                <button className="close-button" onClick={() => setShowBreakdown(false)}>✕</button>
              </div>
              <div className="breakdown-content">
                {results.questionDetails && results.questionDetails.map((question, index) => (
                  <div key={question.questionId} className="breakdown-question">
                    <div className="question-header-breakdown">
                      <span className="section-badge">{question.sectionName}</span>
                      <span className="question-number-badge">Question {question.questionNumber}</span>
                      <span className={`status-badge ${question.isCorrect ? 'correct' : question.userAnswer !== 'Not Attempted' ? 'incorrect' : 'unattempted'}`}>
                        {question.isCorrect ? '✓ Correct' : question.userAnswer !== 'Not Attempted' ? '✗ Incorrect' : '○ Unattempted'}
                      </span>
                      <span className="time-badge">⏱️ {formatTime(question.timeSpent)}</span>
                    </div>

                    {question.questionImage && (
                      <div className="question-image-container">
                        <img 
                          src={question.questionImage} 
                          alt="Question" 
                          className="question-image"
                        />
                      </div>
                    )}

                    <div className="question-text-breakdown">
                      {question.questionText}
                    </div>

                    {question.questionType !== 'integer' && question.options && (
                      <div className="options-breakdown">
                        {question.options.map((option) => (
                          <div key={option.optionKey || option.optionId} className="option-item">
                            <strong>{option.optionId}.</strong> {option.optionText}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="answer-comparison">
                      <div className="answer-row">
                        <span className="answer-label">Your Answer:</span>
                        <span className={`answer-value ${question.isCorrect ? 'correct' : question.userAnswer !== 'Not Attempted' ? 'incorrect' : 'unattempted'}`}>
                          {question.userAnswer}
                        </span>
                      </div>
                      <div className="answer-row">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="answer-value correct-answer">
                          {question.correctAnswer}
                        </span>
                      </div>
                      <div className="answer-row">
                        <span className="answer-label">Marks Obtained:</span>
                        <span className={`answer-value ${question.marks >= 0 ? 'positive' : 'negative'}`}>
                          {question.marks > 0 ? `+${question.marks}` : question.marks}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestResults;
