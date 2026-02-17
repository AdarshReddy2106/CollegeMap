import React from 'react';
import ScrollReveal from './ScrollReveal';


const JEEBatches = () => (
  <section className="jee-batches">
    <div className="container">
      <h2 className="section-title">JEE Student Batches</h2>
      <div className="batches-grid">
        
        {/* JEE 2026 */}
        <div className="batch-card featured">
          
          <div className="batch-year">JEE 2026</div>
           <div className="batch-content">
            <h3 className="batch-title">Target: IIT JEE Aspirants</h3>
            <p className="batch-description">Connect with fellow JEE aspirants and IITians in our free WhatsApp community for support, guidance, and preparation resources.</p>
            <ul className="batch-features">
              <li>✓ Peer-to-Peer Doubt Solving</li>
              <li>✓ Free Mock Tests & Assessments</li>
              <li>✓ Ask IITians Directly</li>
              <li>✓ Share Strategies & Tips</li>
            </ul>
            <a 
              href="https://chat.whatsapp.com/Jv5KBBAeP62L9EzNqHHmwr?mode=ems_copy_t" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="batch-btn primary"
            >
              Join for Free
            </a>
            <span className="whatsapp-badge">WhatsApp Community</span>
          </div>
         
        </div>

        {/* JEE 2027 */}
        <div className="batch-card">
          <div className="batch-year">JEE 2027</div>
          <div className="batch-content">
            <h3 className="batch-title">Foundation Building</h3>
            <p className="batch-description">Start your JEE preparation journey with Class 11 students in a supportive community environment.</p>
            <ul className="batch-features">
              <li>✓ Connect with Fellow Aspirants</li>
              <li>✓ Regular Practice Tests</li>
              <li>✓ Guidance from IITians</li>
              <li>✓ Doubt Clearing Support</li>
            </ul>
            <a 
              href="https://chat.whatsapp.com/E81KGIjOLuI1NfAO8AVLVI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="batch-btn primary"
            >
              Join for Free
            </a>
            <span className="whatsapp-badge">WhatsApp Community</span>
          </div>
        </div>

        {/* JEE 2028 */}
        <div className="batch-card">
          <div className="batch-year">JEE 2028</div>
          <div className="batch-content">
            <h3 className="batch-title">Pre-Foundation Course</h3>
            <p className="batch-description">Class 10 students can begin their JEE journey early by connecting with peers and mentors.</p>
            <ul className="batch-features">
              <li>✓ Build Study Habits Early</li>
              <li>✓ Community Learning</li>
              <li>✓ Access to Mock Tests</li>
              <li>✓ Guidance & Motivation</li>
            </ul>
            <a 
              href="https://chat.whatsapp.com/FFvn8Ogz4Sd4GgTphd7qfO" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="batch-btn primary"
            >
              Join for Free
            </a>
            <span className="whatsapp-badge">WhatsApp Community</span>
          </div>
        </div>

      </div>
    </div>
  </section>
);

export default JEEBatches;