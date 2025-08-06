import React, { useState, useEffect } from 'react';
import './SeminarPage.scss';

// You can replace these with actual icons from a library like react-icons
const CheckIcon = () => <span className="icon-check">✓</span>;
const PlusIcon = () => <span className="icon-plus">+</span>;

const SeminarPage = () => {
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        preferredDate: '', // ADDED: State for preferred date
        preferredTime: '',
        message: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    
    // --- FAQ Data ---
    const faqs = [
        { q: "How will I get the link to the 1-on-1 session?", a: "Once you book your spot, you'll receive a confirmation email with a calendar invite and a video call link (Google Meet/Zoom)." },
        { q: "Why does this guidance session only cost ₹299?", a: "Our mission is to make quality guidance accessible. This introductory price helps us reach more students like you. The price will increase soon." },
        { q: "Can my parents join the session with me?", a: "Absolutely! We encourage parents to be part of the session to ensure everyone is on the same page about this crucial decision." },
        { q: "What if I miss my scheduled session?", a: "No problem. Just email us at least 2 hours in advance, and we will find another suitable time slot for you." },
        { q: "Is this a live session with a real person?", a: "Yes! This is a 100% live, interactive 1-on-1 session with an experienced IITian mentor, not a pre-recorded webinar." }
    ];

    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = index => {
        if (openFaq === index) {
            setOpenFaq(null);
        } else {
            setOpenFaq(index);
        }
    };

    const handleContactFormChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        
        const submissionData = {
            ...contactForm,
            timestamp: new Date().toLocaleString(),
            id: Date.now()
        };
        
        console.log("Form data to be sent to server:", submissionData);
        
        try {
            const response = await fetch('http://localhost:4000/api/save-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Server response:', result);
                setShowSuccess(true);
                
                // MODIFIED: Clear the form, including the new date field
                setContactForm({
                    name: '',
                    email: '',
                    phone: '',
                    preferredDate: '',
                    preferredTime: '',
                    message: ''
                });
                
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                console.error('Server error:', response.status);
                alert('There was an error submitting your booking. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Unable to submit booking. Please check your internet connection and try again.');
        }
    };

    return (
        <div className="seminar-page">
            {/* --- Hero Section --- */}
            <header className="hero-section">
                <p className="subtitle">By IITians, for Future IITians</p>
                <h1>Stop Guessing Your Future. Secure Your Dream IIT Branch with 100% Confidence.</h1>
                <p className="urgency">JEE Counselling Starts Soon. Don't Make a Choice You'll Regret.</p>

                <div className="hero-details">
                    <div className="mentor-intro">
                        <img src="https://www.bing.com/th/id/OIP.IGNf7GuQaCqz_RPq5wCkPgHaLH?w=160&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2" alt="IITian Mentor" className="mentor-photo" />
                        <h3>Your Personal Mentor</h3>
                        <p>An experienced graduate from a top IIT, dedicated to guiding you.</p>
                        <div className="social-proof">
                            <p>⭐ <b>4.9/5 Star Rating</b> from 5,000+ Guided Students</p>
                        </div>
                    </div>
                    <div className="workshop-info">
                        <h2>What You'll Get</h2>
                        <ul>
                            <li><CheckIcon /> Unlock a data-driven list of your best-fit IITs & Branches.</li>
                            <li><CheckIcon /> Learn the hidden truths about campus life, placements, and research.</li>
                            <li><CheckIcon /> Gain a clear roadmap with backup options, eliminating all confusion.</li>
                            <li><CheckIcon /> <b>More Confidence, Less Anxiety.</b> A guaranteed clear path forward.</li>
                        </ul>
                        <div className="cta-box">
                             <p className="offer-ends">Special Offer Ends In: <b>{formatTime(timeLeft)}</b></p>
                            <a href="#pricing" className="cta-button">BOOK YOUR SESSION NOW AT ₹299</a>
                            <p className="price"><s>₹1999</s></p>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Who is this for Section --- */}
            <section className="target-audience">
                 <h2>Is This Guidance Session For You?</h2>
                 <div className="audience-columns">
                    <div className="audience-yes">
                        <h3>This Is For YOU If...</h3>
                        <ul>
                            <li>You have your JEE Rank and are confused about counselling.</li>
                            <li>You are overwhelmed by conflicting advice.</li>
                            <li>You want a decision based on data, not just perception.</li>
                            <li>You are serious about making the best choice for your career.</li>
                        </ul>
                    </div>
                    <div className="audience-no">
                        <h3>This Is NOT For You If...</h3>
                         <ul>
                            <li>You are not serious about your IIT choice.</li>
                            <li>You prefer guesswork over expert guidance.</li>
                            <li>You aren't ready to take control of your future.</li>
                        </ul>
                    </div>
                 </div>
            </section>

            {/* --- Testimonials Section --- */}
            <section className="testimonials">
                <h2>Thousands of Students Transformed Their Confusion into Clarity</h2>
                <div className="testimonial-cards">
                    <div className="card">
                        <p>"CollegeMap changed everything. I got into IIT Madras in a branch I love, which I wasn't even considering before!"</p>
                        <div className="author">
                            <img src="https://i.imgur.com/dZAP2rN.png" alt="Ananya S."/>
                            <div>
                                <h4>Ananya S.</h4>
                                <p>Student, IIT Madras</p>
                            </div>
                        </div>
                    </div>
                     <div className="card">
                        <p>"The 1-on-1 session was the best money I spent on my education. The data they have is insane and the mentor was so helpful."</p>
                         <div className="author">
                            <img src="https://i.imgur.com/XkYzkDe.png" alt="Rohan K."/>
                            <div>
                                <h4>Rohan K.</h4>
                                <p>Student, IIT Delhi</p>
                            </div>
                        </div>
                    </div>
                     <div className="card">
                        <p>"I was completely lost with my rank. The mentor gave me a clear, personalized preference list. Forever grateful!"</p>
                         <div className="author">
                            <img src="https://i.imgur.com/uN6F3hJ.png" alt="Priya V."/>
                            <div>
                                <h4>Priya V.</h4>
                                <p>Student, IIT Bombay</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- Bonuses Section --- */}
            <section id="pricing" className="bonuses-section">
                <h2>Book Before The Timer Hits 0 And Get 4 Exclusive Bonuses</h2>
                <div className="bonuses-grid">
                    <div className="bonus-card"><h4>Bonus #1</h4><p>5 Mistakes to Avoid in JoSAA Counselling (PDF Guide)</p></div>
                    <div className="bonus-card"><h4>Bonus #2</h4><p>The Ultimate College Life Prep Checklist</p></div>
                    <div className="bonus-card"><h4>Bonus #3</h4><p>E-Book: Decoding Placements Branch-by-Branch</p></div>
                    <div className="bonus-card"><h4>Bonus #4</h4><p>Private Community Access with Fellow Aspirants</p></div>
                </div>
                 <div className="cta-box-final">
                    <h3>Total Value: <span className='value-strikethrough'>₹3999</span> (Session + Bonuses)</h3>
                    <p className="timer-final">Offer Ends In: <b>{formatTime(timeLeft)}</b></p>
                    <a href="#contact" className="cta-button-large">BOOK YOUR 1-on-1 SESSION NOW FOR JUST ₹299</a>
                    <p className="price-final">Regular Price: <s>₹1999</s></p>
                </div>
            </section>

            {/* --- Guarantee Section --- */}
            <section className="guarantee-section">
                <div className="guarantee-text">
                    <h2>Still Not Sure? We've Got Your Back!</h2>
                    <h3>Our 100% Satisfaction Guarantee</h3>
                    <p>We are confident our guidance will provide you with immense clarity. If after the session you feel it wasn't worth your investment, just send us an email. We'll refund your full payment. No questions asked.</p>
                     <a href="#pricing" className="cta-button">BOOK RISK-FREE AT ₹299/- ONLY</a>
                </div>
            </section>
            
            {/* --- FAQ Section --- */}
            <section className="faq-section">
                                <h2>Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                         <div className="faq-item" key={index}>
                            <div className="faq-question" onClick={() => toggleFaq(index)}>
                                {faq.q}
                                <PlusIcon />
                            </div>
                            {openFaq === index && (
                                <div className="faq-answer">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Contact Us Section --- */}
            <section id="contact" className="contact-section">
                <div className="contact-container">
                    <div className="contact-info">
                        <h2>Ready to Transform Your Future?</h2>
                        <p>Book your personalized 1-on-1 guidance session now. Fill out the form and we'll get back to you within 24 hours with your session details.</p>
                        
                        <div className="contact-details">
                            <div className="contact-item">
                                <h4>📧 Email</h4>
                                <p>guidance@collegemap.com</p>
                            </div>
                            <div className="contact-item">
                                <h4>📞 Phone</h4>
                                <p>+91 98765 43210</p>
                            </div>
                            <div className="contact-item">
                                <h4>⏰ Response Time</h4>
                                <p>Within 24 hours</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <form className="contact-form" onSubmit={handleContactSubmit}>
                            <h3>Book Your Session</h3>
                            
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={contactForm.name}
                                    onChange={handleContactFormChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={contactForm.email}
                                    onChange={handleContactFormChange}
                                    required
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={contactForm.phone}
                                    onChange={handleContactFormChange}
                                    required
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            
                            {/* ADDED: Preferred Date Input Field */}
                            <div className="form-group">
                                <label htmlFor="preferredDate">Preferred Date *</label>
                                <input
                                    type="date"
                                    id="preferredDate"
                                    name="preferredDate"
                                    value={contactForm.preferredDate}
                                    onChange={handleContactFormChange}
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="preferredTime">Preferred Session Time</label>
                                <select
                                    id="preferredTime"
                                    name="preferredTime"
                                    value={contactForm.preferredTime}
                                    onChange={handleContactFormChange}
                                >
                                    <option value="">Select preferred time</option>
                                    <option value="morning">Morning (9 AM - 12 PM)</option>
                                    <option value="afternoon">Afternoon (2 PM - 5 PM)</option>
                                    <option value="evening">Evening (6 PM - 9 PM)</option>
                                    <option value="flexible">I'm flexible</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Additional Message (Optional)</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    value={contactForm.message}
                                    onChange={handleContactFormChange}
                                    placeholder="Any specific questions or concerns?"
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button">
                                BOOK MY SESSION FOR ₹299
                            </button>

                            {showSuccess && (
                                <div className="success-message">
                                    ✅ Success! Your booking request has been submitted. We'll contact you within 24 hours.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="page-footer">
                <h3>CollegeMap</h3>
                <p>By IITians, for Future IITians</p>
                <div className="footer-links">
                    <a href="#">Terms and Conditions</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Refunds</a>
                </div>
                <p className="copyright">&copy; 2025 CollegeMap. All rights reserved.</p>
            </footer>

            {/* --- Sticky Footer CTA --- */}
            <div className="sticky-footer">
                <div className="sticky-info">
                    <span className="sticky-price">₹299 <s>₹1999</s></span>
                    <span className="sticky-timer">Offer Ends in: <b>{formatTime(timeLeft)}</b></span>
                </div>
                <a href="#pricing" className="cta-button">BOOK YOUR SPOT NOW</a>
            </div>
        </div>
    );
};

export default SeminarPage;