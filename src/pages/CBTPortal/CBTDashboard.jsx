import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './CBTDashboard.scss';
import ProfileIcon from '../../components/ProfileIcon/ProfileIcon';

const CBTDashboard = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    // Check profile first
    const userProfile = localStorage.getItem('userProfile');
    if (!userProfile) {
      navigate('/profile-setup', { state: { redirectTo: '/cbt-portal/dashboard' } });
      return;
    }
    
    // Profile exists, fetch test history
    fetchTestHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      
      console.log('Fetching test history for user:', userProfile);
      
      if (!userProfile.email) {
        console.warn('No user profile found');
        const offlineResults = JSON.parse(localStorage.getItem('offlineTestResults') || '[]');
        setTestHistory(offlineResults);
        setLoading(false);
        return;
      }

      // Try to sync offline results first
      await syncOfflineResults(userProfile);

      // Create AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch('https://collegemapseminarpage.vercel.app/api/cbt/test-results', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Profile': JSON.stringify(userProfile)
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Test results received:', data);
          
          // After successful fetch, only use server results (offline results already synced)
          setTestHistory(data.testResults || []);
        } else {
          console.error('Failed to fetch test history');
          const offlineResults = JSON.parse(localStorage.getItem('offlineTestResults') || '[]');
          setTestHistory(offlineResults);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('❌ Network error:', fetchError);
        const offlineResults = JSON.parse(localStorage.getItem('offlineTestResults') || '[]');
        setTestHistory(offlineResults);
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
      const offlineResults = JSON.parse(localStorage.getItem('offlineTestResults') || '[]');
      setTestHistory(offlineResults);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Sync offline results with server
  const syncOfflineResults = async (userProfile) => {
    const offlineResults = JSON.parse(localStorage.getItem('offlineTestResults') || '[]');
    const unsyncedResults = offlineResults.filter(r => !r.synced);

    if (unsyncedResults.length === 0) {
      console.log('✅ No offline results to sync');
      return;
    }

    console.log(`📤 Syncing ${unsyncedResults.length} offline results...`);

    for (const result of unsyncedResults) {
      try {
        const response = await fetch('https://collegemapseminarpage.vercel.app/api/cbt/test-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Profile': JSON.stringify(userProfile)
          },
          body: JSON.stringify({
            testId: result.testId,
            testTitle: result.testTitle,
            totalMarks: result.totalMarks,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            incorrectAnswers: result.incorrectAnswers,
            unattempted: result.unattempted,
            percentage: result.percentage,
            totalTestDuration: result.totalTestDuration,
            sectionWiseResults: result.sectionWiseResults
          })
        });

        if (response.ok) {
          console.log(`✅ Synced result: ${result.testTitle}`);
          // Mark as synced
          result.synced = true;
        }
      } catch (error) {
        console.error(`❌ Failed to sync result: ${result.testTitle}`, error);
      }
    }

    // Update localStorage with synced status
    localStorage.setItem('offlineTestResults', JSON.stringify(offlineResults));
    
    // Clear synced results after successful sync
    const remainingOffline = offlineResults.filter(r => !r.synced);
    if (remainingOffline.length < offlineResults.length) {
      console.log(`🗑️ Cleared ${offlineResults.length - remainingOffline.length} synced offline results`);
      localStorage.setItem('offlineTestResults', JSON.stringify(remainingOffline));
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getPerformanceColor = (percentage) => {
    const percent = parseFloat(percentage) || 0;
    if (percent >= 75) return '#10c3bc';
    if (percent >= 50) return '#ffa500';
    return '#ff4444';
  };

  if (loading) {
    return (
      <div className="cbt-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your test history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cbt-dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>My Test Dashboard</h1>
          <p>Welcome, {JSON.parse(localStorage.getItem('userProfile') || '{}').name || 'Student'}</p>
        </div>
        <div className="header-actions">
          <button
            className="back-button"
            onClick={() => navigate('/cbt-portal')}
          >
            ← Back to Portal
          </button>
        </div>
      </motion.div>

      {testHistory.length === 0 ? (
        <motion.div
          className="no-tests-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No Tests Taken Yet</h2>
            <p>Start taking tests to see your results and analysis here</p>
            <button
              className="start-test-button"
              onClick={() => navigate('/cbt-portal')}
            >
              Take Your First Test
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="stats-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-card">
              <h3>Total Tests</h3>
              <p className="stat-number">{testHistory.length}</p>
            </div>
            <div className="stat-card">
              <h3>Average Score</h3>
              <p className="stat-number">
                {testHistory.length > 0
                  ? Math.round(
                      testHistory.reduce((sum, test) => {
                        const percentage = parseFloat(test.percentage || 0);
                        return sum + percentage;
                      }, 0) / testHistory.length
                    )
                  : 0}%
              </p>
            </div>
            <div className="stat-card">
              <h3>Best Score</h3>
              <p className="stat-number">
                {testHistory.length > 0
                  ? Math.max(...testHistory.map((test) => parseFloat(test.percentage || 0)).filter(p => !isNaN(p)))
                  : 0}%
              </p>
            </div>
          </motion.div>

          <motion.div
            className="test-history-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2>Test History</h2>
            <div className="tests-grid">
              {testHistory.map((test, index) => (
                <motion.div
                  key={test.id || index}
                  className="test-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="test-card-header">
                    <h3>{test?.testTitle || 'Test'}</h3>
                    <span className="test-date">{formatDate(test?.completedAt)}</span>
                  </div>
                  <div className="test-card-body">
                    <div className="score-display">
                      <div className="score-circle">
                        <svg className="score-svg" viewBox="0 0 100 100">
                          <circle
                            className="score-circle-bg"
                            cx="50"
                            cy="50"
                            r="45"
                          />
                          <circle
                            className="score-circle-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            style={{
                              strokeDasharray: `${2 * Math.PI * 45}`,
                              strokeDashoffset: `${2 * Math.PI * 45 * (1 - Math.min(Math.max((test?.percentage || 0) / 100, 0), 1))}`,
                              stroke: getPerformanceColor(test?.percentage || 0)
                            }}
                          />
                        </svg>
                        <div className="score-text">
                          <span className="score-percentage">{Math.round(test?.percentage || 0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="test-stats">
                      <div className="stat-row">
                        <span className="stat-label">Marks:</span>
                        <span className="stat-value">{test?.totalMarks || 0} / {(test?.totalQuestions || 0) * 4}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Correct:</span>
                        <span className="stat-value correct">{test?.correctAnswers || 0}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Incorrect:</span>
                        <span className="stat-value incorrect">{test?.incorrectAnswers || 0}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Unattempted:</span>
                        <span className="stat-value unattempted">{test?.unattempted || 0}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Time Taken:</span>
                        <span className="stat-value">{formatTime(test?.totalTestDuration || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="test-card-footer">
                    <button
                      className="view-analysis-button"
                      onClick={() => {
                        setSelectedTest(test);
                        setShowAnalysis(true);
                      }}
                    >
                      View Full Analysis
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* Analysis Modal */}
      <AnimatePresence>
        {showAnalysis && selectedTest && (
          <motion.div
            className="analysis-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAnalysis(false)}
          >
            <motion.div
              className="analysis-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="analysis-header">
                <h2>Test Analysis</h2>
                <button
                  className="close-button"
                  onClick={() => setShowAnalysis(false)}
                >
                  ✕
                </button>
              </div>
              <div className="analysis-content">
                <div className="analysis-summary">
                  <h3>{selectedTest?.testTitle || 'Test'}</h3>
                  <p className="test-date-analysis">Completed on {formatDate(selectedTest?.completedAt)}</p>
                  
                  <div className="overall-stats">
                    <div className="overall-stat">
                      <span className="overall-label">Total Marks:</span>
                      <span className="overall-value">{selectedTest?.totalMarks || 0} / {(selectedTest?.totalQuestions || 0) * 4}</span>
                    </div>
                    <div className="overall-stat">
                      <span className="overall-label">Percentage:</span>
                      <span className="overall-value" style={{ color: getPerformanceColor(selectedTest?.percentage || 0) }}>
                        {Math.round(selectedTest?.percentage || 0)}%
                      </span>
                    </div>
                  </div>

                  <div className="detailed-stats">
                    <div className="detail-stat correct">
                      <span className="detail-icon">✅</span>
                      <div className="detail-info">
                        <span className="detail-label">Correct Answers</span>
                        <span className="detail-value">{selectedTest?.correctAnswers || 0}</span>
                      </div>
                    </div>
                    <div className="detail-stat incorrect">
                      <span className="detail-icon">❌</span>
                      <div className="detail-info">
                        <span className="detail-label">Incorrect Answers</span>
                        <span className="detail-value">{selectedTest?.incorrectAnswers || 0}</span>
                      </div>
                    </div>
                    <div className="detail-stat unattempted">
                      <span className="detail-icon">⏭️</span>
                      <div className="detail-info">
                        <span className="detail-label">Unattempted</span>
                        <span className="detail-value">{selectedTest?.unattempted || 0}</span>
                      </div>
                    </div>
                    <div className="detail-stat time">
                      <span className="detail-icon">⏱️</span>
                      <div className="detail-info">
                        <span className="detail-label">Time Taken</span>
                        <span className="detail-value">{formatTime(selectedTest?.totalTestDuration || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedTest?.sectionWiseResults && Object.keys(selectedTest.sectionWiseResults).length > 0 && (
                    <div className="section-analysis">
                      <h3>Section-wise Performance</h3>
                      {Object.entries(selectedTest.sectionWiseResults).map(([sectionId, section]) => {
                        const sectionData = section || {};
                        const total = sectionData.total || 1;
                        const correct = sectionData.correct || 0;
                        return (
                          <div key={sectionId} className="section-result">
                            <div className="section-header">
                              <h4>{sectionData.name || 'Section'}</h4>
                              <span className="section-marks">{sectionData.marks || 0} marks</span>
                            </div>
                            <div className="section-details">
                              <div className="section-detail">
                                <span>Correct: {correct}</span>
                                <span>Incorrect: {sectionData.incorrect || 0}</span>
                                <span>Unattempted: {sectionData.unattempted || 0}</span>
                              </div>
                              <div className="section-progress-bar">
                                <div
                                  className="section-progress-fill"
                                  style={{
                                    width: `${Math.min((correct / total) * 100, 100)}%`,
                                    background: getPerformanceColor((correct / total) * 100)
                                  }}
                                />
                              </div>
                              <div className="section-time">
                                Time: {formatTime(sectionData.timeSpent || 0)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CBTDashboard;
