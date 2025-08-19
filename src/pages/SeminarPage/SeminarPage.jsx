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
        { q: "How will I get the link to the live seminar?", a: "After you complete your free registration, the unique link to the online seminar will be sent to your registered email address. We will also send reminders before the session starts." },
        { q: "Why is this guidance session free?", a: "We believe that quality guidance should be accessible to all students. This seminar is part of our commitment to making JEE counselling easy and a great way to experience the value CollegeMap provides, at no cost to you." },
        { q: "Can my parents join the session with me?", a: "Yes, absolutely! We encourage parents to attend the session with their child. It's an opportunity for both of you to get clarity and understand the best preparation strategies." },
        { q: "Will there be recording for the entire session?", a: "A link to the recording will be sent to all registered participants a few hours after the live seminar." },
        { q: "Are all seminars live and interactive?", a: "Yes, all our seminars are live and interactive. You will be able to ask your questions directly to our speaker, an experienced IITian, during the Q&A session." }
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
            // First try the direct API endpoint
            const response = await fetch('https://collegemapseminarpage.vercel.app/api/save-booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(submissionData)
            });
            
            // Try to parse response as JSON regardless of status code
            const responseData = await response.json().catch(() => null);
            
            if (response.ok) {
                console.log('Server response:', responseData);
                setShowSuccess(true);
                
                // Clear the form
                setContactForm({
                    name: '',
                    email: '',
                    phone: '',
                });
                
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                console.error('Server error:', response.status);
                
                // Handle duplicate booking error (409 Conflict)
                if (response.status === 409 && responseData?.existingBooking) {
                    alert(`You have already registered with this email address. Please use a different email or contact support@collegemap.com if you need assistance.`);
                } else {
                    // Generic error for other status codes
                    alert(responseData?.message || 'There was an error submitting your registration. Please try again or contact us directly.');
                }
            }
        } catch (error) {
            console.error('Network error:', error);
            
            // If CORS error occurs, notify the user with a more helpful message
            alert('Unable to submit registration through our online system. Please email your details to support@collegemap.com or try again later.');
        }
    };

    return (
        <div className="seminar-page">
            {/* --- Hero Section --- */}
            <header className="hero-section">
                <p className="subtitle">By IITians, for Future IITians</p>
                <h1>Master Your JEE Prep: The Ultimate Strategy Session.</h1>
                <p className="urgency"> Join our live online seminar and learn proven techniques to ace your JEE.</p>

                <div className="hero-details">
                    <div className="mentor-intro">
                        <img src="https://www.bing.com/th/id/OIP.IGNf7GuQaCqz_RPq5wCkPgHaLH?w=160&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2" alt="IITian Mentor" className="mentor-photo" />
                        <h3>Meet Your Mentor</h3>
                        <p>A CS student from IIT Bombay, dedicated to helping you succeed</p>
                        <div className="social-proof">
                            <p>B.E Maths: AIR 1</p>
                            <p>JEE Advanced: AIR 94</p>
                        </div>
                    </div>
                    <div className="workshop-info">
                        <h2>What You'll Learn at the Seminar</h2>
                        <ul>
                            <li><CheckIcon /> Master a proven time management and study plan to optimize your preparation.</li>
                            <li><CheckIcon /> Learn exam-day strategies to manage pressure and boost your score.</li>
                            <li><CheckIcon /> Discover how to tackle high-weight topics and avoid common mistakes.</li>
                            <li><CheckIcon /> "Unlock expert insights into building a resilient mindset for success.</li>
                            <li><CheckIcon /> Ask your question directly to IIT Bombay students.</li>
                        </ul>
                        <div className="cta-box">
                            <p className="offer-ends">Special Offer Ends In: <b>{formatTime(timeLeft)}</b></p>
                            <a href="#contact" className="cta-button">REGISTER NOW FOR FREE</a>
                            
                            <p className="price"><s>₹499</s></p>
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
                            <li>You are a serious JEE aspirant looking for a proven preparation strategy.</li>
                            <li>You are struggling with time management or staying motivated.</li>
                            <li> You feel overwhelmed by the vast syllabus and want a clear roadmap.</li>
                            <li>You are ready to learn from someone who has successfully gone through the process.</li>
                        </ul>
                    </div>
                    <div className="audience-no">
                        <h3>This Is NOT For You If...</h3>
                        <ul>
                            <li>You prefer to rely on guesswork instead of a data-backed plan.</li>
                            <li> You are not committed to putting in the hard work required for JEE.</li>
                            <li>You are already confident in your preparation and do not need expert guidance.</li>
                            <li> You are not open to learning new strategies from successful IITians.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* --- Testimonials Section --- */}
            <section className="testimonials">
                <h2>Thousands of Students Will Transform Their Confusion into Clarity</h2>
                <div className="testimonial-cards">
                    <div className="card">
                        <p>"CollegeMap changed everything. I got into IIT Madras in a branch I love, which I wasn't even considering before!"</p>
                        <div className="author">
                            <img src="https://i.imgur.com/dZAP2rN.png" alt="Ananya S."/>
                            <div>
                                <h4>Ananya S.</h4>
                                <p>Student, Preparing for Jee 2026</p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <p>"The 1-on-1 session was the best money I spent on my education. The data they have is insane and the mentor was so helpful."</p>
                        <div className="author">
                            <img src="https://i.imgur.com/XkYzkDe.png" alt="Rohan K."/>
                            <div>
                                <h4>Rohan K.</h4>
                                <p>Student, Preparing for Jee 2026</p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <p>"I was completely lost with my rank. The mentor gave me a clear, personalized preference list. Forever grateful!"</p>
                        <div className="author">
                            <img src="https://i.imgur.com/uN6F3hJ.png" alt="Priya V."/>
                            <div>
                                <h4>Priya V.</h4>
                                <p>Student, Preparing for Jee 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* --- Bonuses Section --- */}
            <section id="pricing" className="bonuses-section">
                <h2>Follow us for more updates.</h2>
                <div className="social-links">
                    <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
                </div>
            </section>

            {/* --- Guarantee Section --- */}
            <section className="guarantee-section">
                <div className="guarantee-text">
                    <h2> High-Value Learning, No Cost.</h2>
                    <h3>Our 100% Satisfaction Guarantee</h3>
                    <p> We're committed to making quality guidance accessible to all. Join our live session to experience our unique approach to JEE preparation firsthand. We're confident the insights you'll gain will provide immense clarity for your journey.</p>
                     <a href="#contact" className="cta-button">SAVE MY SPOT</a>
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
                        <p> Register for our free seminar now. Fill out the form below and we'll send your session details to your email instantly.</p>
                        <div className="contact-details">
                            <div className="contact-item">
                                <h4>📧 Email</h4>
                                <p>support@collegemap.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <form className="contact-form" onSubmit={handleContactSubmit}>
                            <h3>Reserve Your Spot</h3>

                            <div className="form-group">
                                <label htmlFor="name">Full Name*</label>
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
                                <label htmlFor="email">Email Address*</label>
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
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={contactForm.phone}
                                    onChange={handleContactFormChange}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <button type="submit" className="submit-button">
                                REGISTER FOR FREE
                            </button>

                            {showSuccess && (
                                <div className="success-message">
                                    ✅ Success! Your registration is complete. Check your email for session details.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </section>
            {/* --- Sticky Footer CTA --- */}
            <div className="sticky-footer">
                <a href="#contact" className="cta-button">BOOK YOUR SPOT NOW</a>
            </div>
        </div>
    );
};

export default SeminarPage;