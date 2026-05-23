import React, { useState } from "react";
import "./TalkToIITian.css";
// import thumbnailAsk from "../../assets/Thumbnails/Ask me anything.png";
import RazorPayment from "../../components/RazorpayPayment/RazorpayPayment";

const TalkToIITian = () => {
	const [showPaymentGateway, setShowPaymentGateway] = useState(false);

	const handleStartNow = () => {
		setShowPaymentGateway(true);
	};

	const onPaymentSuccess = async () => {
		setShowPaymentGateway(false);
		alert("Payment successful! Our team will contact you shortly.");
		// Add your logic after successful payment if needed
	};

	return (
		<main className="talk-to-iitian-page">
			<section className="tti-layout">
				<p className="tti-page-label">Talk to IITians:</p>
				
				{/* Top Section */}
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
						Before spending <span>LAKHS</span> on your college,<br/> this is the PERFECT <span>Final check</span>, @ Rs. 500 /-
					</h2>

					<div className="tti-steps-container">
						<div className="tti-step">
							<div className="tti-step-visual">1</div>
							<p>Tell us YOUR dream college & branch</p>
						</div>
						
						<div className="tti-step-arrow">→</div>

						<div className="tti-step">
							<div className="tti-step-visual">2</div>
							<p>WE provide you a student who took the course</p>
						</div>

						<div className="tti-step-arrow">→</div>

						<div className="tti-step">
							<div className="tti-step-visual">3</div>
							<p>Personal meeting to ask all doubts & take the final call</p>
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

			{/* Payment Gateway: Show when Start Now is clicked */}
			{showPaymentGateway && (
				<div className="payment-gateway-overlay">
					<div className="payment-gateway-section">
						<p>Please complete the payment to proceed with booking your 1:1 session with an IITian.</p>
						<RazorPayment
							amount={500}
							onSuccess={onPaymentSuccess}
							className="payment_button"
						/>
						<button className="cancel-payment tti-cancel-payment" onClick={() => setShowPaymentGateway(false)}>
							Cancel Payment
						</button>
					</div>
				</div>
			)}
		</main>
	);
};

export default TalkToIITian;
