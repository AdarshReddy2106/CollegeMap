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
          <Link className="home2-btn home2-btn-primary" to="/BranchComparision">
            Compare colleges
          </Link>
          <Link className="home2-btn home2-btn-ghost" to="/CollegePredictor">
            College predictor
          </Link>
          <Link className="home2-btn home2-btn-ghost" to="/TalkToIITians">
            Talk to IITian
          </Link>
        </div>
      </div>

      <div className="home2-hero-visual" aria-hidden="true">
        <img 
          src="/college-predictor.png" 
          alt="College Predictor" 
          className="home2-graphic-card"
          style={{ padding: 0, objectFit: 'contain' }}
        />
        <div className="home2-hero-orb" />
      </div>
    </section>
  );
};

export default HeroSection;
