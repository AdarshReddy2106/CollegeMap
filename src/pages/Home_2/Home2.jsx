import React from "react";
import "./Home2.css";
import HeroSection from "./HeroSection";
import CompareSection from "./CompareSection";
import PathwaysSection from "./PathwaysSection";

const Home2 = () => {
  return (
    <main className="home2-page">
      <div className="home2-shell">
        <HeroSection />
        <CompareSection />
        <PathwaysSection />
      </div>
    </main>
  );
};

export default Home2;
