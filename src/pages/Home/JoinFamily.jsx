import React from 'react';
import { useNavigate } from 'react-router-dom';

const JoinFamily = () => {
  return (
    <section className="join-family">
      <div className="container">
        <h2 className="join-title">Join the CollegeMap Family, today!</h2>
        <p className="join-description">
          Be part of a thriving community where students learn, grow, and achieve their IIT dreams together.
        </p>
        
        <div className="evidence-section">
          <div className="evidence-stats">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Live Doubt Sessions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">150+</div>
              <div className="stat-label">Success Stories</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Practice Questions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support Available</div>
            </div>
          </div>
        </div>

        <div className="join-highlights">
          <div className="highlight-box">
            <span className="highlight-emoji">🎥</span>
            <span>Interactive Google Meet Sessions</span>
          </div>
          <div className="highlight-box">
            <span className="highlight-emoji">💬</span>
            <span>WhatsApp Community Support</span>
          </div>
          <div className="highlight-box">
            <span className="highlight-emoji">📊</span>
            <span>Real-Time Progress Tracking</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinFamily;