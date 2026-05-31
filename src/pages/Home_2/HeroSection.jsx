import React from "react";
import { Link } from "react-router-dom";

const heroPoints = [
  "Find out in-depth about colleges.",
  "Compare different colleges.",
  "Deepest insights to make the right call.",
];

const HeroSection = () => {
  return (
    <section className="home2-section home2-hero">
      <div className="home2-hero-content">
        <p className="home2-eyebrow">College Finder</p>
        <h1 className="home2-title">
          Exam preparation is crucial, but choosing the right college is just as important.
        </h1>
        <p className="home2-subtitle">
          Everything you need to know about colleges - all in one place.
        </p>
        <ul className="home2-list">
          {heroPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="home2-cta-row">
          <Link className="home2-btn home2-btn-primary" to="/branch-comparison">
            Compare colleges
          </Link>
          <Link className="home2-btn home2-btn-ghost" to="/college-predictor">
            College predictor
          </Link>
          <Link className="home2-btn home2-btn-ghost" to="/talk-to-iitians">
            Talk to IITian
          </Link>
        </div>
      </div>

      <div className="home2-hero-visual" aria-hidden="true">
        <div className="home2-graphic-card">
          <div className="home2-graphic-header">
            <span>Insight map</span>
            <span className="home2-status-dot" />
          </div>
          <div className="home2-graphic-grid">
            <div className="home2-graphic-tile">
              <p>Cutoffs</p>
              <strong>2024</strong>
            </div>
            <div className="home2-graphic-tile">
              <p>Placements</p>
              <strong>Top 15%</strong>
            </div>
            <div className="home2-graphic-tile">
              <p>Campus life</p>
              <strong>4.6/5</strong>
            </div>
            <div className="home2-graphic-tile">
              <p>Fees</p>
              <strong>Compare</strong>
            </div>
          </div>
          <div className="home2-graphic-footer">
            <span>Compare colleges after this section</span>
          </div>
        </div>
        <div className="home2-hero-orb" />
      </div>
    </section>
  );
};

export default HeroSection;
