import React from "react";
import "./TalkToIITian.css";
// import thumbnailAsk from "../../assets/Thumbnails/Ask me anything.png";

const TalkToIITian = () => {
	const handleStartNow = () => {
		// Replace with the actual URL or payment gateway link when ready
		window.open("https://wa.link/1j0y0o", "_blank");
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
							Talk to an IITian.
						</h1>
						<ul className="tti-list">
							<li>Select a college & branch</li>
							<li>Connect with CollegeMap</li>
							<li>Find college students to clear all doubts</li>
						</ul>
					</div>
					<div className="tti-hero-visual">
						<div className="tti-visual-placeholder">Visual</div>
					</div>
				</div>

				{/* Middle Section */}
				<div className="tti-middle-section">
					<h2 className="tti-middle-heading">
						Before spending LAKHS on your college , this is the PERFECT Final check , @ Rs. 500 /-
					</h2>

					<div className="tti-steps-container">
						<div className="tti-step">
							<div className="tti-step-visual">Visual</div>
							<p>Tell us YOUR dream college & branch</p>
						</div>
						
						<div className="tti-step-arrow">→</div>

						<div className="tti-step">
							<div className="tti-step-visual">Visual</div>
							<p>WE provide you a student who took the course</p>
						</div>

						<div className="tti-step-arrow">→</div>

						<div className="tti-step">
							<div className="tti-step-visual">Visual</div>
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
		</main>
	);
};

export default TalkToIITian;
