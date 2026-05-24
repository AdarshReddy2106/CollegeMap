import React, { useState } from "react";
import "./TalkToIITian.css";
import RazorPayment from "../../components/RazorpayPayment/RazorpayPayment";

const TalkToIITian = () => {
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const handleStartNow = () => {
    setShowPaymentGateway(true);
  };

  const onPaymentSuccess = async () => {
    setShowPaymentGateway(false);
    alert("Payment successful! Our team will contact you shortly.");
  };

  return (
    <main className="talk-to-iitian-page">
      <section className="tti-layout">
        <p className="tti-page-label">Talk to IITians</p>

        {/* Hero Section */}
        <div className="tti-hero-section">
          <div className="tti-hero-content">
            <h1 className="tti-title">
              Don't Guess.<br />
              <span>Talk to an IITian.</span>
            </h1>
            <ul className="tti-list">
              <li>Select a college & branch</li>
              <li>Connect with CollegeMap</li>
              <li>Find college students to clear all doubts</li>
            </ul>
          </div>
          <div className="tti-hero-visual">
            <img
              src="/talktoiitians.png"
              alt="Talk to IITians - 1:1 Mentorship"
              className="tti-visual-img"
            />
          </div>
        </div>

        {/* Middle Section */}
        <div className="tti-middle-section">
          <h2 className="tti-middle-heading">
            Before spending <span>lakhs</span> on your college,<br />
            this is the perfect <span>final check</span> — @ ₹500
          </h2>

          <div className="tti-steps-container">
            <div className="tti-step">
              <p className="tti-step-title">Tell us your goal</p>
              <p className="tti-step-desc">Share your <strong>dream college & branch</strong> with us</p>
            </div>

            <div className="tti-step-arrow">→</div>

            <div className="tti-step">

              <p className="tti-step-title">We find your match</p>
              <p className="tti-step-desc">We connect you with a <strong>student who took that exact course</strong></p>
            </div>

            <div className="tti-step-arrow">→</div>

            <div className="tti-step">

              <p className="tti-step-title">Personal meeting</p>
              <p className="tti-step-desc">Ask all your doubts & <strong>take the final call with confidence</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* Fixed Bottom Bar */}
      <div className="tti-fixed-bottom-bar">
        <div className="tti-fixed-bar-content">
          <div className="tti-fixed-text">
            <span>Make payment</span>
            <span className="tti-arrow">→</span>
            <span>Inquire on WhatsApp</span>
            <span className="tti-arrow">→</span>
            <span>Personal meeting</span>
          </div>
          <button className="tti-start-now-btn" onClick={handleStartNow}>
            Start Now
          </button>
        </div>
      </div>

      {showPaymentGateway && (
        <div className="payment-gateway-overlay">
          <div className="payment-gateway-section">
            <p>Please complete the payment to proceed with booking your 1:1 session with an IITian.</p>
            <RazorPayment
              amount={500}
              onSuccess={onPaymentSuccess}
              className="payment_button"
            />
            <button
              className="cancel-payment tti-cancel-payment"
              onClick={() => setShowPaymentGateway(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default TalkToIITian;