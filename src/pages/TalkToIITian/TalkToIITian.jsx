import React, { useState } from "react";
import "./TalkToIITian.css";

const TalkToIITian = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleStartNow = async () => {
    setIsProcessing(true);
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      const baseUrl = "http://localhost:4000";
      // Create Razorpay Order
      const data = await fetch(`${baseUrl}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50000, currency: "INR", receipt: "tti_receipt_01" })
      }).then((t) => t.json());

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_SsglEeEz90a4Z9", 
        amount: data.amount,
        currency: data.currency,
        name: "CollegeMap",
        description: "Talk to IITian - 1:1 Mentorship",
        order_id: data.id,
        handler: async function (response) {
          try {
            const validateRes = await fetch(`${baseUrl}/order/validate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const jsonRes = await validateRes.json();
            if (jsonRes.msg === "success") {
              alert(`Payment successful! \n\nYour Payment ID is: ${response.razorpay_payment_id}\n\nPlease take a screenshot or copy this ID. Redirecting you to our WhatsApp to schedule your meeting...`);
              window.location.href = "https://wa.link/lo05a1";
            } else {
              alert("Payment Validation Failed");
            }
          } catch (validateErr) {
            console.error("Validation Error:", validateErr);
            alert("Payment successful but validation failed. Please contact support.");
          }
        },
        theme: { color: "#ff6c00" },
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on("payment.failed", function (response) {
        alert(`Payment Failed: ${response.error.description}`);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Payment Order Error:", error);
      alert("Something went wrong while initiating the payment. Is the backend server running?");
    } finally {
      setIsProcessing(false);
    }
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
          <button className="tti-start-now-btn" onClick={handleStartNow} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Start Now"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default TalkToIITian;