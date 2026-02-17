import React from 'react';

const StudyResources = () => (
  <section className="study-resources">
    <div className="container">
      <h2 className="section-title">Study Resources</h2>
      <p className="section-subtitle">Everything you need to excel in JEE, all in one place</p>
      <div className="home-resources-grid">
        
        <div className="home-resource-card">
          <div className="home-resource-icon">🎯</div>
          <h3>JEE Busters</h3>
          <p>High-yield questions curated by experts to crack the toughest problems and boost your score.</p>
          <ul className="home-resource-features">
            <li>Previous Year Questions</li>
            <li>Topic-wise Practice</li>
            <li>Difficulty Level: Advanced</li>
          </ul>
          <button className="home-resource-btn">View Materials</button>
        </div>

        <div className="home-resource-card">
          <div className="home-resource-icon">📝</div>
          <h3>Summary Notes</h3>
          <p>Comprehensive quick revision notes designed for last-minute preparation and concept clarity.</p>
          <ul className="home-resource-features">
            <li>All Important Formulas</li>
            <li>Key Concepts & Tricks</li>
            <li>Chapter-wise Coverage</li>
          </ul>
          <button className="home-resource-btn">Download PDF</button>
        </div>

        <div className="home-resource-card">
          <div className="home-resource-icon">✍️</div>
          <h3>Practice Sheets</h3>
          <p>Carefully designed topic-wise practice sheets with detailed step-by-step solutions.</p>
          <ul className="home-resource-features">
            <li>Progressive Difficulty</li>
            <li>Detailed Solutions</li>
            <li>Regular Updates</li>
          </ul>
          <button className="home-resource-btn">Start Practicing</button>
        </div>

      </div>
    </div>
  </section>
);

export default StudyResources;