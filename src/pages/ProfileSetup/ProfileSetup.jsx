import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ProfileSetup.scss';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const testId = location.state?.testId;
  const redirectTo = location.state?.redirectTo;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setError('Valid email is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    // Always save to localStorage first
    const profileData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      setupComplete: true,
      setupDate: new Date().toISOString()
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    console.log('✅ Profile saved to localStorage:', profileData);
    
    try {
      console.log('📤 Submitting profile to backend...');
      
      const response = await fetch('https://collegemapseminarpage.vercel.app/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile saved to backend:', data);
      } else {
        console.warn('⚠️ Backend save failed, but continuing with localStorage profile');
      }
    } catch (error) {
      console.error('⚠️ Network error saving to backend:', error);
      console.log('Continuing with localStorage profile...');
    } finally {
      setLoading(false);
      
      // Navigate regardless of backend save status
      if (testId) {
        navigate(`/cbt-portal/test/${testId}`);
      } else if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/cbt-portal');
      }
    }
  };

  return (
    <div className="profile-setup">
      <motion.div
        className="profile-setup-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <h1>Setup Your Profile</h1>
          <p>Please complete your profile to access the CBT Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Continue to Test'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
