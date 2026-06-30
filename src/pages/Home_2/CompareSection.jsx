import React from "react";
import { Link } from "react-router-dom";

const compareHighlights = [
  "Compare 2 branches across any college.",
  "Ask questions like IIT vs NIT in one click.",
  "Make the right choice with real data.",
];

const promptChips = ["IIT vs NIT", "CSE vs ECE", "ROI check", "Campus life"];

const CompareSection = () => {
  return (
    <section className="home2-section home2-compare">
      <div className="home2-compare-content">
        <p className="home2-eyebrow">Compare Colleges</p>
        <h2 className="home2-heading">Compare colleges with this tool</h2>
        <p className="home2-body">
          Chemical Eng at IIT or CSE at NIT? Find answers to all such questions in one place.
        </p>
        <ul className="home2-list home2-list-compact">
          {compareHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="home2-prompt">
          <div className="home2-chip-row">
            {promptChips.map((chip) => (
              <span key={chip} className="home2-chip">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <Link className="home2-btn home2-btn-accent" to="/BranchComparision">
          Try now for free
        </Link>
      </div>

      <div className="home2-video-card">
        <div className="home2-video-frame" style={{ padding: 0 }}>
          <video 
            src="/branch_comp.mp4"
            controls
            playsInline
            title="Compare Colleges"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
          />
        </div>
      </div>
    </section>
  );
};

export default CompareSection;
