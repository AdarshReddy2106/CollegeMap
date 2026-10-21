import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles } from 'lucide-react';
import './Addmentor.css';

export default function Addmentor({
  text = "Join as Mentor",
  to = "/join-as-mentor",
  threshold = 100,
  hasBottomNav = true,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return (
    <Link
      to={to}
      className={`ask-doubts-float ${isVisible ? 'visible' : ''} ${hasBottomNav ? 'with-bottom-nav' : ''}`}
      aria-label={text}
    >
      <div className="ask-doubts-icon-wrapper">
        <GraduationCap className="mentor-cap-icon" size={20} />
        <Sparkles className="mentor-sparkle-icon" size={12} />
      </div>
      <span className="ask-doubts-text">{text}</span>
    </Link>
  );
}
