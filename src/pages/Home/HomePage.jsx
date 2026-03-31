import React from 'react';
import './Home.css';

import HomeBanner from './HomeBanner';
import TrustedPlatform from './TrustedPlatform';
import HomeHighlights from './HomeHighlights';
import JEEBatches from './JEEBatches';
import StudyResources from './StudyResources';
import JoinFamily from './JoinFamily';
import Team from '../../components/Team/Team';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <HomeBanner />
      <elevenlabs-convai agent-id="agent_6001k906ndgzee69c8hjc31kv5fg"></elevenlabs-convai>
      <TrustedPlatform />
      <HomeHighlights />
      <JEEBatches />
      <JoinFamily />
      <StudyResources />
      <Team />
    </div>
  );
};

export default HomePage;