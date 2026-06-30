import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import "./Home2.css";
import HeroSection from "./HeroSection";
import CompareSection from "./CompareSection";
import PathwaysSection from "./PathwaysSection";

import gm1 from '../../assets/GMeetphotos/gm1.jpg';
import gm2 from '../../assets/GMeetphotos/3.png';
import gm3 from '../../assets/GMeetphotos/gm3f.png';
import gm4 from '../../assets/GMeetphotos/gm5.jpg';

const Home2 = () => {
  return (
    <main className="home2-page">
      <Helmet>
        <title>CollegeMap | College Counseling by IITians — Branch Comparison & Predictor</title>
        <meta name="description" content="Get expert college counseling from IITians. Compare branches, predict your college with real JoSAA data, and connect with IIT students for personalized guidance." />
        <link rel="canonical" href="https://collegemap.in/" />
      </Helmet>
      <div className="home2-shell">
        <HeroSection />
        <CompareSection />
        <PathwaysSection />

        <section className="home2-section home2-compare">
          <div className="home2-compare-content">
            <p className="home2-eyebrow">Connect with college students</p>
            <h2 className="home2-heading">Connect with IITians and College students</h2>
            <p className="home2-body">
              Talk to students who have gone through it all. Connect with final year students from your dream college in a 1-to-1 session.
            </p>

            <div className="home2-btn-container">
              <Link className="home2-btn home2-btn-accent home2-btn-talk" to="/TalkToIITians">
                Talk now
              </Link>
            </div>
          </div>

          <div className="home2-video-card home2-video-card-centered">
            <div className="home2-graphic-grid home2-graphic-grid-small">
              <div className="home2-graphic-tile home2-graphic-tile-gmeet">
                <img src={gm1} alt="GMeet session 1" className="home2-gmeet-img" />
              </div>
              <div className="home2-graphic-tile home2-graphic-tile-gmeet">
                <img src={gm2} alt="GMeet session 2" className="home2-gmeet-img" />
              </div>
              <div className="home2-graphic-tile home2-graphic-tile-gmeet">
                <img src={gm3} alt="GMeet session 3" className="home2-gmeet-img" />
              </div>
              <div className="home2-graphic-tile home2-graphic-tile-gmeet">
                <img src={gm4} alt="GMeet session 4" className="home2-gmeet-img" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home2;
