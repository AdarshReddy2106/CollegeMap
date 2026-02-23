import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/UserProfileContext';
import './CBTPortal.scss';
import { discoverTests, getTestById } from './testDiscovery';
import ProfileIcon from '../../components/ProfileIcon/ProfileIcon';

const CBTPortal = () => {
  const [tests, setTests] = useState([]);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { userProfile, refreshProfile } = useUserProfile();

  useEffect(() => {
    // Check and load user profile from Supabase if not in context
    const loadProfile = async () => {
      if (!userProfile) {
        const emailStored = sessionStorage.getItem('userEmail');
        if (emailStored) {
          // Fetch profile from Supabase
          await refreshProfile(emailStored);
        }
      }
    };

    loadProfile();
  }, [userProfile, refreshProfile]);

  useEffect(() => {
    // Discover tests dynamically from public/tests folder
    discoverTests()
      .then(discoveredTests => {
        setTests(discoveredTests);
      })
      .catch(error => {
        console.error('Error discovering tests:', error);
        setTests([]);
      });
  }, []);

  const handleStartTest = (testId) => {
    // Check if profile is set up first (from context)
    if (!userProfile) {
      navigate('/profile-setup', { state: { testId } });
      return;
    }
    
    // Profile exists, proceed directly to test guidelines
    getTestById(testId)
      .then(test => {
        if (test) {
          setSelectedTest(test);
          setShowGuidelines(true);
          setTermsAccepted(false); // Reset checkbox when opening guidelines
        } else {
          console.error('Test not found:', testId);
          navigate('/cbt-portal');
        }
      })
      .catch(error => {
        console.error('Error loading test:', error);
        navigate('/cbt-portal');
      });
  };

  const handleConfirmStartTest = () => {
    if (!termsAccepted) {
      setShowWarning(true);
      return;
    }
    
    if (selectedTest) {
      setShowGuidelines(false);
      navigate(`/cbt-portal/test/${selectedTest.id}`);
    }
  };

  return (
    <div className="cbt-portal-page">
      <motion.div 
        className="cbt-portal-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-title-section">
          <h1 className="header-portal-title">CBT Portal</h1>
          <p className="header-portal-subtitle">Practice with timed mock tests</p>
        </div>
        <div className="header-content">
          <div className="header-left">
            <span className="user-name">
              {userProfile?.name || 'User'}
            </span>
          </div>
          <div className="header-right">
            <motion.button
              className="update-details-button"
              onClick={() => navigate('/profile-setup')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Update Details
            </motion.button>
            <motion.button
              className="dashboard-button"
              onClick={() => navigate('/cbt-portal/dashboard')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              View Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="tests-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Custom Test Builder Card */}
        <motion.div 
          className="custom-test-builder-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(13, 148, 136, 0.3)' }}
          onClick={() => navigate('/cbt-portal/custom-test')}
        >
          <div className="builder-card-content">
            <div className="builder-icon">📝</div>
            <div className="builder-info">
              <h3>Build Custom Test</h3>
              <p>Choose your subject, topic, difficulty & number of questions to create a personalized practice test from 750+ JEE Main questions</p>
            </div>
            <div className="builder-features">
              <span className="feature-tag">🎯 By Topic</span>
              <span className="feature-tag">📊 By Difficulty</span>
              <span className="feature-tag">🔢 Custom Count</span>
            </div>
            <button className="builder-start-btn">Build Your Test →</button>
          </div>
        </motion.div>

        {tests.length === 0 ? (
          <div className="no-tests">
            <h3>No tests available</h3>
            <p>Check back later for new tests</p>
          </div>
        ) : (
          <div className="tests-grid">
            {tests.map((test) => (
              <motion.div 
                className="test-card"
                key={test.id}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.25)' }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="test-content">
                  <span className={`type-indicator ${test.type.replace(/\s+/g, '-')}`}>
                    {test.type}
                  </span>
                  <div className="test-details">
                    <h3>{test.title}</h3>
                    <div className="test-info">
                      <p><strong>Duration:</strong> {test.duration}</p>
                      <p><strong>Questions:</strong> {test.totalQuestions}</p>
                      <p><strong>Subjects:</strong> {test.subjects.join(', ')}</p>
                    </div>
                    <p className="test-description">{test.description}</p>
                    <div className="test-actions">
                      <button 
                        onClick={() => handleStartTest(test.id)} 
                        className="start-button"
                      >
                        Start Test
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showGuidelines && (
          <motion.div
            className="guidelines-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!selectedTest) {
                setShowGuidelines(false);
              }
            }}
          >
            <motion.div
              className="guidelines-modal-content nta-official"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nta-header">
                <h1>GENERAL INSTRUCTIONS</h1>
              </div>

              <div className="nta-content">
                <h2 className="instruction-title">Please read the instructions carefully</h2>

                <div className="instruction-section">
                  <h3 className="section-heading">General Instructions:</h3>
                  
                  <ol className="instruction-list">
                    <li>
                      <span className="instruction-number">1.</span>
                      Total duration of {selectedTest ? selectedTest.title : 'JEE-Main'} is {selectedTest ? selectedTest.duration : '180 min'}.
                    </li>
                    <li>
                      <span className="instruction-number">2.</span>
                      The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
                    </li>
                    <li>
                      <span className="instruction-number">3.</span>
                      The Questions Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                      <ol className="sub-list">
                        <li>
                          <span className="status-box white-box"></span>
                          <span>You have not visited the question yet.</span>
                        </li>
                        <li>
                          <span className="status-box red-box"></span>
                          <span>You have not answered the question.</span>
                        </li>
                        <li>
                          <span className="status-box green-box"></span>
                          <span>You have answered the question.</span>
                        </li>
                        <li>
                          <span className="status-box purple-box"></span>
                          <span>You have NOT answered the question, but have marked the question for review.</span>
                        </li>
                        <li>
                          <span className="status-box purple-green-box"></span>
                          <span>The question(s) "Answered and Marked for Review" will be considered for evaluation.</span>
                        </li>
                      </ol>
                    </li>
                    <li>
                      <span className="instruction-number">4.</span>
                      You can click on your "Profile" image on top right corner of your screen to change the language during the exam for entire question paper. On clicking of Profile image you will get a drop-down to change the question content to the desired language.
                    </li>
                    <li>
                      <span className="instruction-number">5.</span>
                      You can click on <span className="arrow-icon down-arrow"></span> to navigate to the bottom and <span className="arrow-icon up-arrow"></span> to navigate to top of the question are, without scrolling.
                    </li>
                  </ol>
                </div>

                <div className="instruction-section">
                  <h3 className="section-heading">Navigating to a Question:</h3>
                  
                  <ol className="instruction-list" start="6">
                    <li>
                      <span className="instruction-number">6.</span>
                      To answer a question, do the following:
                      <ol className="sub-list alpha-list">
                        <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                        <li>Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
                        <li>Click on <strong>Mark for Review & Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
                      </ol>
                    </li>
                  </ol>
                </div>

                <div className="instruction-section">
                  <h3 className="section-heading">Answering a Question:</h3>
                  
                  <ol className="instruction-list" start="7">
                    <li>
                      <span className="instruction-number">7.</span>
                      Procedure for answering a multiple choice type question:
                      <ol className="sub-list alpha-list">
                        <li>To select you answer, click on the button of one of the options.</li>
                        <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button</li>
                        <li>To change your chosen answer, click on the button of another option</li>
                        <li>To save your answer, you MUST click on the Save & Next button.</li>
                        <li>To mark the question for review, click on the Mark for Review & Next button.</li>
                      </ol>
                    </li>
                    <li>
                      <span className="instruction-number">8.</span>
                      To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.
                    </li>
                  </ol>
                </div>

                <div className="instruction-section">
                  <h3 className="section-heading">Navigating through sections:</h3>
                  
                  <ol className="instruction-list" start="9">
                    <li>
                      <span className="instruction-number">9.</span>
                      Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by click on the section name. The section you are currently viewing is highlighted.
                    </li>
                    <li>
                      <span className="instruction-number">10.</span>
                      After click the Save & Next button on the last question for a section, you will automatically be taken to the first question of the next section.
                    </li>
                    <li>
                      <span className="instruction-number">11.</span>
                      You can shuffle between sections and questions anything during the examination as per your convenience only during the time stipulated.
                    </li>
                    <li>
                      <span className="instruction-number">12.</span>
                      Candidate can view the corresponding section summary as part of the legend that appears in every section above the question palette.
                    </li>
                  </ol>
                </div>

                <p className="note-text">
                  Please note all questions will appear in your default language. This language can be changed for a particular question later on.
                </p>

                <div className="declaration-box">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="terms-checkbox" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <span className="declaration-text">
                      I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall.I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations
                    </span>
                  </label>
                </div>

                <div className="proceed-button-container">
                  <button 
                    className="proceed-btn" 
                    onClick={handleConfirmStartTest}
                  >
                    PROCEED
                  </button>
                </div>

                <div className="nta-footer">
                  © All Rights Reserved - National Testing Agency
                </div>
              </div>
            </motion.div>

            {/* Warning Modal */}
            <AnimatePresence>
              {showWarning && (
                <motion.div
                  className="warning-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowWarning(false)}
                >
                  <motion.div
                    className="warning-modal"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="warning-icon">⚠</div>
                    <h3>Warning!</h3>
                    <p>Please accept terms and conditions before proceeding.</p>
                    <button 
                      className="ok-btn" 
                      onClick={() => setShowWarning(false)}
                    >
                      OK
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CBTPortal;

