import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './EnergyBatch.scss';

const INQUIRE_WHATSAPP_URL =
  'https://api.whatsapp.com/send?phone=919326602765&text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20IITian%20Guidance%20for%20JEE%20Preparation..';
const MENTORSHIP_IMG = `${process.env.PUBLIC_URL || ''}/energybatch.jpg`;

function IconGroup() {
  return (
    <svg className="eb-mini-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="16" cy="18" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="18" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M8 38c0-6 6.5-10 16-10s16 4 16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg className="eb-mini-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8 40h32M12 32l8-12 8 6 8-18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="eb-mini-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <path d="M24 16v10l6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg className="eb-mini-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M10 14h28a4 4 0 014 4v14a4 4 0 01-4 4H22l-8 6v-6h-4a4 4 0 01-4-4V18a4 4 0 014-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function IconBan() {
  return (
    <svg className="eb-mini-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
      <path d="M14 34l20-20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const PROBLEMS = [
  { pre: "Can't stay ", bold: "focused", post: "?" },
  { pre: "Unable to finish your ", bold: "syllabus", post: "?" },
  { pre: "Getting ", bold: "distracted", post: " every day?" },
  { pre: "Not seeing ", bold: "improvement", post: " in mock tests?" },
  { pre: "Struggling with ", bold: "consistency", post: "?" },
  { pre: "", bold: "Falling behind", post: " your study plan?" },
];

const WHY_CARDS = [
  { title: 'Stop Distractions', desc: 'Stay focused and eliminate study blockers.' },
  { title: 'Finish Your Syllabus', desc: 'Structured planning and timely completion.' },
  { title: 'Improve Scores', desc: 'Track progress and boost performance.' },
  { title: 'Stay On Track', desc: 'Never lose direction in preparation.' },
  { title: 'Build Consistency', desc: 'Create strong daily study habits.' },
  { title: 'Daily Motivation', desc: 'Accountability and support from IITians.' },
];

export default function EnergyBatch() {
  return (
    <div className="eb-page">
      <Helmet>
        <title>JEE Mentorship Programs | 1-on-1 IITian Guidance & Daily Schedules — CollegeMap</title>
        <meta name="description" content="Enroll in CollegeMap's structured JEE mentorship programs led by IITians. Get personalized daily study schedules, weekly progress reviews, 24/7 doubt support, and 1-on-1 guidance." />
        <link rel="canonical" href="https://collegemap.in/EnergyBatch" />
      </Helmet>

      <div className="eb-inner">

        {/* ── HERO ── */}
        <header className="eb-hero">
          <div className="eb-hero-grid">

            {/* LEFT */}
            <div className="eb-hero-left">
              <div className="eb-badge">For JEE Aspirants</div>

              <h1 className="eb-new-title">
                Learn <span>Smarter</span><br />
                with Dedicated <span>IITian Mentors.</span><br />
                {/* Stay <span>Ahead.</span> */}
              </h1>

              <p className="eb-new-subtitle">
                Personalized IITian guidance to help you stay disciplined,
                finish your syllabus on time, and improve your JEE performance.
              </p>

              <div className="eb-problem-grid">
                {PROBLEMS.map((p) => (
                  <div className="eb-problem-card" key={p.pre + p.bold + p.post}>
                    <span className="eb-problem-text">
                      {p.pre}
                      <strong>{p.bold}</strong>
                      {p.post}
                    </span>
                  </div>
                ))}
              </div>

              <div className="eb-hero-action-row">
                <span className="eb-ratio-line">Only 5 students per mentor</span>

                <a href={INQUIRE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="eb-primary-btn">
                  Join Energy Batch
                </a>
              </div>

            </div>

            {/* RIGHT */}
            <div className="eb-hero-right">
              <figure className="eb-hero-visual-modern">
                <img
                  src={MENTORSHIP_IMG}
                  alt="Student with IITian mentor"
                  className="eb-hero-img-modern"
                />
              </figure>
            </div>
          </div>

          {/* WHY JOIN */}
          {/* <section className="eb-why-join">
            <h2 className="eb-why-title">
              Why Students Join <span>Energy Batch</span>
            </h2>
            <div className="eb-why-grid">
              {WHY_CARDS.map(({ icon, title, desc }) => (
                <div className="eb-why-card" key={title}>
                  <div className="eb-why-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </section> */}
        </header>

        {/* ── OTHER PROGRAMMES ── */}
        <section className="eb-programs" aria-labelledby="eb-programs-title">
          <h2 id="eb-programs-title" className="eb-programs-title">
            Other IITian guidance programs
          </h2>

          <article className="eb-program-block">
            <div className="eb-program-grid">
              <div className="eb-program-copy">
                <h3 className="eb-program-sub">Class 12 group mentorship</h3>
                <ul className="eb-program-list">
                  <li>Prepare for your JEE 2027 with high-focus peers.</li>
                  <li>Guidance for day-to-day planning.</li>
                  <li>Backlog cover plans.</li>
                  <li>Weekly progress monitoring.</li>
                  <li>24/7 doubt clearance.</li>
                </ul>
              </div>
              <div className="eb-visual-card">
                <div className="eb-visual-grid">
                  <div className="eb-visual-cell"><IconGroup /><span>Group study</span></div>
                  <div className="eb-visual-cell"><IconChart /><span>Backlog clear</span></div>
                  <div className="eb-visual-cell"><IconClock /><span>Weekly tracking</span></div>
                  <div className="eb-visual-cell"><IconChat /><span>24/7 motivation + doubts</span></div>
                </div>
              </div>
            </div>
          </article>

          <article className="eb-program-block">
            <div className="eb-program-grid eb-program-grid--reverse">
              <div className="eb-program-copy">
                <h3 className="eb-program-sub">Class 11 group mentorship</h3>
                <ul className="eb-program-list">
                  <li>Prepare for your JEE 2028 with high-focus peers.</li>
                  <li>Early guidance to build discipline.</li>
                  <li>Day-to-day planning to avoid backlogs.</li>
                  <li>Weekly progress monitoring.</li>
                  <li>Maximum benefit from an early start.</li>
                </ul>
              </div>
              <div className="eb-visual-card">
                <div className="eb-visual-grid">
                  <div className="eb-visual-cell"><IconGroup /><span>Group study</span></div>
                  <div className="eb-visual-cell"><IconBan /><span>Avoid backlogs</span></div>
                  <div className="eb-visual-cell"><IconClock /><span>Delete confusion</span></div>
                  <div className="eb-visual-cell"><IconChat /><span>24/7 build discipline</span></div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <p className="eb-footnote">
          Questions?{' '}
          <a href={INQUIRE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Contact us</a>
        </p>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div className="eb-bottom-nav">
        <div className="eb-bottom-nav-steps">
          <span>Share your goal</span>
          <span className="eb-nav-arrow">→</span>
          <span>Get matched with an IITian</span>
          <span className="eb-nav-arrow">→</span>
          <span>Group Mentorship</span>
        </div>
        <a href={INQUIRE_WHATSAPP_URL} className="eb-start-btn" target="_blank" rel="noopener noreferrer">
          Join now
        </a>
      </div>
    </div>
  );
}