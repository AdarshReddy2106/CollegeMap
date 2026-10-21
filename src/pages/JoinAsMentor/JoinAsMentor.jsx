import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Clock, 
  Wallet, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Award,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Zap,
  Mail,
  Phone,
  Send
} from 'lucide-react';
import { submitMentorApplication } from '../../services/supabaseService';
import './JoinAsMentor.css';

export default function JoinAsMentor() {
  const [activeFaq, setActiveFaq] = useState(null);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    branchYear: '',
    jeeRank: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('apply-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email) return;
    setSubmitting(true);
    try {
      await submitMentorApplication(formState);
      setSubmitted(true);
      setFormState({
        name: '',
        email: '',
        phone: '',
        college: '',
        branchYear: '',
        jeeRank: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { label: 'Verified Mentors', value: '500+', sub: 'From Top IITs & NITs' },
    { label: 'Mentorship Hours', value: '15,000+', sub: '1:1 Guidance Sessions' },
    { label: 'Avg. Rating', value: '4.95 / 5', sub: 'By JEE Aspirants' },
    { label: 'Earning Potential', value: '₹40k+/mo', sub: 'Flexible Work Hours' },
  ];

  const benefits = [
    {
      icon: <GraduationCap className="jam-card-icon" />,
      title: 'Guide Ambitious Aspirants',
      description: 'Help JEE Main & Advanced students build discipline, fix backlogs, analyze mock tests, and boost their rank.',
      tag: 'High Impact'
    },
    {
      icon: <Clock className="jam-card-icon" />,
      title: '100% Flexible Hours',
      description: 'Take sessions whenever you are free. Easily balance mentorship with your semester exams and college life.',
      tag: 'Work on Your Terms'
    },
    {
      icon: <Wallet className="jam-card-icon" />,
      title: 'Competitive Earnings',
      description: 'Earn competitive payouts for every 1:1 call, timetable review, and strategy roadmap you deliver.',
      tag: 'Direct Payouts'
    },
    {
      icon: <Users className="jam-card-icon" />,
      title: 'Elite IITian Network',
      description: 'Join an exclusive community of top JEE rankers from IIT Bombay, Delhi, Madras, Kharagpur & more.',
      tag: 'Community'
    },
  ];

  const eligibility = [
    'Current student or alumnus of an IIT or top-tier NIT / IIIT.',
    'Scored top rank / percentile in JEE Main or JEE Advanced.',
    'Passionate about guiding students through 1:1 mentorship & study planning.',
    'Good communication skills and empathy for student prep challenges.',
  ];

  const faqs = [
    {
      q: 'How do 1:1 mentorship sessions work?',
      a: 'Mentorship happens via 1:1 video calls, voice calls, or structured WhatsApp check-ins. You guide students on timetable planning, mock test strategy, subject balance, and mental discipline.'
    },
    {
      q: 'How much time commitment is required per week?',
      a: 'It is completely flexible! You can mentor anywhere from 3 to 10 hours a week depending on your college schedule and availability.'
    },
    {
      q: 'How and when do mentors get paid?',
      a: 'Payouts are calculated per session/student guided and transferred directly to your bank account or UPI on a weekly/monthly basis.'
    },
    {
      q: 'What happens after I submit the mentor application form?',
      a: 'Our team will review your application and rank credentials and reach out within 24 hours to schedule a quick 10-minute onboarding call.'
    }
  ];

  return (
    <div className="jam-page">
      <Helmet>
        <title>Join as an IITian Mentor | CollegeMap Mentorship Program</title>
        <meta
          name="description"
          content="Become an IITian Mentor with CollegeMap. Guide JEE aspirants 1-on-1, share your winning study strategies, and earn on your own schedule."
        />
        <link rel="canonical" href="https://collegemap.in/join-as-mentor" />
      </Helmet>

      <div className="jam-container">

        {/* HERO SECTION */}
        <motion.header 
          className="jam-hero"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="jam-badge">
            <Sparkles className="jam-badge-icon" />
            <span>Mentor Program</span>
          </div>

          <h1 className="jam-title">
            Become an <span>IITian Mentor</span>
          </h1>

          <p className="jam-subtitle">
            Empower JEE aspirants with 1-on-1 guidance, structured schedules, and proven strategies. Share your journey and help students conquer JEE!
          </p>

          <div className="jam-hero-ctas">
            <button onClick={handleScrollToForm} className="jam-btn-primary">
              <span>Apply as a Mentor</span>
              <ArrowRight className="btn-icon" />
            </button>
            
            <a
              href="https://api.whatsapp.com/send?phone=919326602765&text=Hi%2C%20I%20want%20to%20apply%20as%20an%20IITian%20Mentor%20on%20CollegeMap"
              target="_blank"
              rel="noopener noreferrer"
              className="jam-btn-secondary"
            >
              <MessageSquare className="btn-icon" />
              <span>Quick WhatsApp Inquiry</span>
            </a>
          </div>
        </motion.header>

        {/* BENEFITS SECTION */}
        <section className="jam-section">
          <div className="jam-section-header">
            <span className="jam-section-tag">WHY JOIN US</span>
            <h2>Why IITians Love Mentoring on CollegeMap</h2>
            <p>Everything you need to deliver high-impact mentorship without hampering your college routine.</p>
          </div>

          <div className="jam-benefits-grid">
            {benefits.map((b, idx) => (
              <motion.div 
                key={idx}
                className="jam-benefit-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="jam-card-badge">{b.tag}</div>
                <div className="jam-card-icon-wrapper">
                  {b.icon}
                </div>
                <h3>{b.title}</h3>
                <p>{b.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ELIGIBILITY & PERKS SPLIT SECTION */}
        <section className="jam-section jam-split-section">
          <motion.div 
            className="jam-eligibility-card"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="jam-card-header">
              <ShieldCheck className="jam-section-icon" />
              <h3>Who Can Apply?</h3>
            </div>
            <ul className="jam-checklist">
              {eligibility.map((item, idx) => (
                <li key={idx}>
                  <CheckCircle2 className="check-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="jam-perks-card"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="jam-card-header">
              <Zap className="jam-section-icon highlight" />
              <h3>Mentor Perks</h3>
            </div>
            <div className="jam-perks-list">
              <div className="perk-item">
                <Award className="perk-icon" />
                <div>
                  <strong>Official Mentor Certificate</strong>
                  <p>Enhance your CV with verified mentorship leadership experience.</p>
                </div>
              </div>
              <div className="perk-item">
                <Users className="perk-icon" />
                <div>
                  <strong>Exclusive Alumni Network</strong>
                  <p>Connect with senior mentors working at top tech firms and startups.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* INTEGRATED CONTACT & APPLICATION FORM SECTION */}
        <section id="apply-section" className="jam-contact-section">
          <div className="jam-contact-container">
            {/* Left Info Column */}
            <div className="jam-contact-info">
              <div className="jam-contact-illustration">
                <svg viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="contact-svg-art">
                  <circle cx="110" cy="75" r="65" fill="rgba(16, 195, 188, 0.08)" />
                  {/* Laptop & Envelope graphic */}
                  <rect x="40" y="45" width="80" height="55" rx="6" fill="#0f172a" />
                  <rect x="45" y="50" width="70" height="42" rx="3" fill="#10c3bc" opacity="0.2" />
                  <path d="M48 53L80 75L112 53" stroke="#10c3bc" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="30" y="100" width="100" height="6" rx="3" fill="#cbd5e1" />
                  {/* Smartphone graphic */}
                  <rect x="145" y="25" width="42" height="75" rx="8" fill="#10c3bc" />
                  <rect x="149" y="32" width="34" height="58" rx="4" fill="#ffffff" />
                  <circle cx="166" cy="94" r="2.5" fill="#ffffff" />
                  {/* Phone Handset Icon */}
                  <circle cx="166" cy="120" r="16" fill="#0b6f73" />
                  <path d="M160 114C160 114 162 122 170 125" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <h2>Get in Touch</h2>
              <p>
                We’d love to hear from you! Feel free to reach out with any questions, feedback, or mentor application details.
              </p>

              <div className="jam-contact-details">
                <a href="mailto:support@collegemap.in" className="contact-detail-link">
                  <Mail className="detail-icon" />
                  <span>support@collegemap.in</span>
                </a>

                <a href="tel:+919326602765" className="contact-detail-link">
                  <Phone className="detail-icon" />
                  <span>+91-9326602765</span>
                </a>

                <a
                  href="https://api.whatsapp.com/send?phone=919326602765&text=Hi%2C%20I%20want%20to%20apply%20as%20an%20IITian%20Mentor%20on%20CollegeMap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-detail-link whatsapp"
                >
                  <MessageSquare className="detail-icon" />
                  <span>WhatsApp Inquiry (+91 9326602765)</span>
                </a>
              </div>
            </div>

            {/* Right Form Card Column (Teal Theme matching screenshot) */}
            <div className="jam-contact-form-wrapper">
              <div className="jam-form-box">
                <h3>Send us a Message</h3>

                {submitted ? (
                  <motion.div 
                    className="jam-form-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="success-icon-wrapper">
                      <CheckCircle2 className="success-icon" />
                    </div>
                    <h4>Application Sent!</h4>
                    <p>
                      Thank you for contacting CollegeMap. We have received your details and our mentor relations team will connect with you via WhatsApp/Email shortly.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="jam-btn-reset">
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitForm} className="jam-embedded-form">
                    <div className="jam-field-group">
                      <label htmlFor="mentor-name">Full Name *</label>
                      <input 
                        id="mentor-name"
                        type="text" 
                        name="name" 
                        value={formState.name} 
                        onChange={handleInputChange} 
                        placeholder="Your full name" 
                        required 
                      />
                    </div>

                    <div className="jam-field-group">
                      <label htmlFor="mentor-email">Email Address *</label>
                      <input 
                        id="mentor-email"
                        type="email" 
                        name="email" 
                        value={formState.email} 
                        onChange={handleInputChange} 
                        placeholder="Your email address" 
                        required 
                      />
                    </div>

                    <div className="jam-field-group">
                      <label htmlFor="mentor-phone">WhatsApp Number *</label>
                      <input 
                        id="mentor-phone"
                        type="tel" 
                        name="phone" 
                        value={formState.phone} 
                        onChange={handleInputChange} 
                        placeholder="Your 10-digit WhatsApp mobile number" 
                        required 
                      />
                    </div>

                    <div className="jam-field-group">
                      <label htmlFor="mentor-college">College / IIT *</label>
                      <input 
                        id="mentor-college"
                        type="text" 
                        name="college" 
                        value={formState.college} 
                        onChange={handleInputChange} 
                        placeholder="e.g. IIT Bombay / IIT Delhi / NIT Trichy" 
                        required 
                      />
                    </div>

                    <div className="jam-field-group">
                      <label htmlFor="mentor-branch">Branch &amp; Year</label>
                      <input 
                        id="mentor-branch"
                        type="text" 
                        name="branchYear" 
                        value={formState.branchYear} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Computer Science, 2nd Year" 
                      />
                    </div>

                    <div className="jam-field-group">
                      <label htmlFor="mentor-rank">JEE Rank (Main / Advanced)</label>
                      <input 
                        id="mentor-rank"
                        type="text" 
                        name="jeeRank" 
                        value={formState.jeeRank} 
                        onChange={handleInputChange} 
                        placeholder="e.g. AIR 340 (Advanced) / 99.8%ile" 
                      />
                    </div>

                    <div className="jam-field-group">
                      <label htmlFor="mentor-message">Why do you want to be a mentor? *</label>
                      <textarea 
                        id="mentor-message"
                        name="message" 
                        value={formState.message} 
                        onChange={handleInputChange} 
                        placeholder="Tell us about your background, mentoring interest or student prep strategies..." 
                        rows={3}
                        required 
                      />
                    </div>

                    <button type="submit" className="jam-form-submit-btn" disabled={submitting}>
                      <Send className="submit-btn-icon" />
                      <span>{submitting ? 'Submitting Application...' : 'Send Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="jam-section jam-faq-section">
          <div className="jam-section-header">
            <span className="jam-section-tag">GOT QUESTIONS?</span>
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="jam-faq-list">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`jam-faq-item ${activeFaq === idx ? 'active' : ''}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="jam-faq-q">
                  <span>{faq.q}</span>
                  <ChevronDown className={`jam-faq-arrow ${activeFaq === idx ? 'open' : ''}`} />
                </div>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div 
                      className="jam-faq-a"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
