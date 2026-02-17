import React from 'react';
import './Home.css'; // Make sure this file exists in the same folder

import HomeBanner from './HomeBanner';
import TrustedPlatform from './TrustedPlatform';
import HomeHighlights from './HomeHighlights';
import JEEBatches from './JEEBatches';
// import AcademicAchievements from './AcademicAchievements'; 
// import StudentTestimonials from './StudentTestimonials'; 
import StudyResources from './StudyResources';
import JoinFamily from './JoinFamily';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <HomeBanner />
      <elevenlabs-convai agent-id="agent_6001k906ndgzee69c8hjc31kv5fg"></elevenlabs-convai>
      <TrustedPlatform />
      <HomeHighlights />
      <JEEBatches />
      {/* <AcademicAchievements /> */}
      {/* <StudentTestimonials /> */}
      <StudyResources />
      <JoinFamily />
    </div>
  );
};

export default HomePage;