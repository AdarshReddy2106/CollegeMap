import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './EnergyBatch.scss';

/** Replace with your WhatsApp deep link or wa.me number for 1-to-1 inquiries */
const INQUIRE_WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=919326602765&text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20IITian%20Guidance%20for%20JEE%20Preparation..';

const MENTORSHIP_IMG = `${process.env.PUBLIC_URL || ''}/studywithiitians.png`;
//const MENTORSHIP_IMG = `${process.env.PUBLIC_URL || ''}/Images_energy/mentor_student_illustration.svg`;

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

export default function EnergyBatch() {
  return (
    <div className="eb-page">
      <Helmet>
        <title>JEE Mentorship Programs | 1-on-1 IITian Guidance & Daily Schedules — CollegeMap</title>
        <meta name="description" content="Enroll in CollegeMap's structured JEE mentorship programs led by IITians. Get personalized daily study schedules, weekly progress reviews, 24/7 doubt support, and 1-on-1 guidance." />
        <link rel="canonical" href="https://collegemap.in/EnergyBatch" />
      </Helmet>
      <div className="eb-inner">
        {/* —— 1-to-1 hero —— */}
        <header className="eb-hero">
          <h1 className="eb-hero-title">
            <span className="eb-hero-rest">Top </span>
            <span className="eb-hero-top">1-to-1 guidance</span>
            <span className="eb-hero-rest"> for JEE preparation</span>
          </h1>

          <div className="eb-hero-split">
            <ul className="eb-quotes" aria-label="What students say">
              <li>&ldquo;I&apos;m not able to <strong>focus</strong>.&rdquo;</li>
              <li>&ldquo;I&apos;m not finishing my <strong>syllabus</strong>.&rdquo;</li>
              <li>&ldquo;I&apos;m not scoring <strong>good marks</strong>.&rdquo;</li>
              <a
              href={INQUIRE_WHATSAPP_URL}
              className="eb-hero-start-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start now
            </a>
            </ul>
            <figure className="eb-hero-visual">
              <img
                src={MENTORSHIP_IMG}
                alt="One student with an IITian mentor — personalised 1-to-1 guidance"
                className="eb-hero-img"
                width={480}
                height={360}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>

          <div className="eb-prose">
            <p className="eb-lead">
              Struggling with your JEE preparation? Putting in the hard work and still not getting good marks?
            </p>
            <p>
              Get top guidance from IITians to give shape to your hard work — daily
              schedules, timely sessions, and someone you can reach out to when things feel overwhelming.
            </p>
            {/* <p className="eb-tagline">One mentor — one student.</p>
            <p className="eb-tagline eb-tagline-muted">You put in the work; we give it the right direction.</p> */}
          </div>
        </header>

        {/* —— Other programmes —— */}
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
                  <div className="eb-visual-cell">
                    <IconGroup />
                    <span>Group study</span>
                  </div>
                  <div className="eb-visual-cell">
                    <IconChart />
                    <span>Backlog clear</span>
                  </div>
                  <div className="eb-visual-cell">
                    <IconClock />
                    <span>Weekly tracking</span>
                  </div>
                  <div className="eb-visual-cell">
                    <IconChat />
                    <span>24/7 motivation + doubts</span>
                  </div>
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
                  <div className="eb-visual-cell">
                    <IconGroup />
                    <span>Group study</span>
                  </div>
                  <div className="eb-visual-cell">
                    <IconBan />
                    <span>Avoid backlogs</span>
                  </div>
                  <div className="eb-visual-cell">
                    <IconClock />
                    <span>Delete confusion</span>
                  </div>
                  <div className="eb-visual-cell">
                    <IconChat />
                    <span>24/7 build discipline</span>
                  </div>
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
      <div className="eb-bottom-nav">
        <div className="eb-bottom-nav-steps">
          <span>Share your goal</span>
          <span className="eb-nav-arrow">→</span>
          <span>Get matched with an IITian</span>
          <span className="eb-nav-arrow">→</span>
          <span>Personal meeting</span>
        </div>
        <a href={INQUIRE_WHATSAPP_URL} className="eb-start-btn" target="_blank" rel="noopener noreferrer">Start now</a>
      </div>

    </div>
  );
}
