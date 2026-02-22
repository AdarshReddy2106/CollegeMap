import React from 'react';

const testimonials = [
  {
    name: 'Rahul S.',
    batch: 'JEE 2026',
    text: '"The doubt-solving sessions with IITians are incredibly helpful. I feel much more confident about my preparation now."',
  },
  {
    name: 'Priya M.',
    batch: 'JEE 2026',
    text: '"CollegeMap\'s WhatsApp community is the best thing that happened to my JEE prep. Real guidance from real IITians!"',
  },
  {
    name: 'Arjun K.',
    batch: 'JEE 2027',
    text: '"Starting early with the community gave me a huge head start. The mock tests and resources are top quality."',
  },
];

const JoinFamily = () => {
  return (
    <section className="join-family">
      <div className="container">
        <h2 className="join-title">Join the CollegeMap Family</h2>
        <p className="join-description">
          Be part of a <strong>thriving community</strong> where students learn, grow, and achieve their <strong>IIT dreams</strong> together with <strong>IITian mentors</strong>.
        </p>
        
        {/* Scrolling Evidence Banner */}
        <div className="evidence-scroll-banner">
          <div className="scroll-track">
            <span className="scroll-item">🎥 50+ Live Google Meet Sessions</span>
            <span className="scroll-item">👨‍🎓 150+ Students Supported</span>
            <span className="scroll-item">📝 1000+ Practice Questions</span>
            <span className="scroll-item">💬 24/7 Doubt Support</span>
            <span className="scroll-item">🏆 IITian Mentors from Top IITs</span>
            <span className="scroll-item">📊 Free Mock Tests & Analysis</span>
            {/* Duplicate for seamless loop */}
            <span className="scroll-item">🎥 50+ Live Google Meet Sessions</span>
            <span className="scroll-item">👨‍🎓 150+ Students Supported</span>
            <span className="scroll-item">📝 1000+ Practice Questions</span>
            <span className="scroll-item">💬 24/7 Doubt Support</span>
            <span className="scroll-item">🏆 IITian Mentors from Top IITs</span>
            <span className="scroll-item">📊 Free Mock Tests & Analysis</span>
          </div>
        </div>

        {/* GMeet Sessions Evidence */}
        <div className="gmeet-evidence">
          <h3 className="evidence-heading">Interactive <strong>Google Meet</strong> Sessions</h3>
          <div className="gmeet-gallery">
            <div className="gmeet-card">
              <div className="gmeet-placeholder">
                <span className="gmeet-icon">🎥</span>
                <span>Live Doubt Session</span>
              </div>
              <p className="gmeet-caption"><strong>Physics</strong> Doubt Clearing — JEE 2026 Batch</p>
            </div>
            <div className="gmeet-card">
              <div className="gmeet-placeholder">
                <span className="gmeet-icon">📢</span>
                <span>Strategy Session</span>
              </div>
              <p className="gmeet-caption"><strong>JEE Strategy</strong> Discussion with IITians</p>
            </div>
            <div className="gmeet-card">
              <div className="gmeet-placeholder">
                <span className="gmeet-icon">✍️</span>
                <span>Mock Analysis</span>
              </div>
              <p className="gmeet-caption"><strong>Mock Test Analysis</strong> &amp; Improvement Tips</p>
            </div>
          </div>
        </div>

        {/* Student Testimonials */}
        <div className="student-testimonials">
          <h3 className="evidence-heading">What Our <strong>Students</strong> Say</h3>
          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span className="testimonial-batch">{t.batch}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="evidence-section">
          <div className="evidence-stats">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Live Doubt Sessions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">150+</div>
              <div className="stat-label">Students Supported</div>
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
      </div>
    </section>
  );
};

export default JoinFamily;