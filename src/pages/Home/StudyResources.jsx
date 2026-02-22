import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudyResources = () => {
  const navigate = useNavigate();

  return (
    <section className="study-resources">
      <div className="container">
        <h2 className="section-title">Study Resources</h2>
        <p className="section-subtitle">Everything you need to <strong>ace JEE</strong>, curated by <strong>IITians</strong> — all in one place</p>
        <div className="batches-grid">
          
          <div className="batch-card resource-card-1">
            <div className="batch-year resource-header-1">JEE Busters</div>
            <div className="batch-content">
              <h3 className="batch-title">🎯 <strong>High-Yield</strong> Question Bank</h3>
              <p className="batch-description">Curated by <strong>IITians</strong> — crack the toughest problems with <strong>targeted practice</strong> and boost your score significantly.</p>
              <ul className="batch-features">
                <li>✓ <strong>Previous Year</strong> Questions</li>
                <li>✓ <strong>Topic-wise</strong> Practice</li>
                <li>✓ Difficulty Level: <strong>Advanced</strong></li>
              </ul>
              <button className="batch-btn primary" onClick={() => navigate('/resources')}>View Materials</button>
            </div>
          </div>

          <div className="batch-card resource-card-2">
            <div className="batch-year resource-header-2">Summary Notes</div>
            <div className="batch-content">
              <h3 className="batch-title">📝 <strong>Quick Revision</strong> Notes</h3>
              <p className="batch-description"><strong>Comprehensive notes</strong> designed for last-minute prep — all <strong>key formulas</strong>, concepts, and tricks in one place.</p>
              <ul className="batch-features">
                <li>✓ All <strong>Important Formulas</strong></li>
                <li>✓ Key <strong>Concepts &amp; Tricks</strong></li>
                <li>✓ <strong>Chapter-wise</strong> Coverage</li>
              </ul>
              <button className="batch-btn primary" onClick={() => navigate('/resources')}>Download PDF</button>
            </div>
          </div>

          <div className="batch-card resource-card-3">
            <div className="batch-year resource-header-3">Practice Sheets</div>
            <div className="batch-content">
              <h3 className="batch-title">✍️ <strong>Topic-wise</strong> Worksheets</h3>
              <p className="batch-description">Carefully designed <strong>practice sheets</strong> with <strong>detailed solutions</strong> — progress from easy to advanced step by step.</p>
              <ul className="batch-features">
                <li>✓ <strong>Progressive</strong> Difficulty</li>
                <li>✓ <strong>Detailed</strong> Solutions</li>
                <li>✓ <strong>Regular</strong> Updates</li>
              </ul>
              <button className="batch-btn primary" onClick={() => navigate('/resources')}>Start Practicing</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StudyResources;