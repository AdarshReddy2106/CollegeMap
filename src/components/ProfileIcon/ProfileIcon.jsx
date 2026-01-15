import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProfileIcon.scss';

const ProfileIcon = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = () => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    setFormData({
      name: userProfile.name || '',
      email: userProfile.email || ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setError('Valid email is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://collegemapseminarpage.vercel.app/api/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userProfile', JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          setupComplete: true,
          setupDate: new Date().toISOString()
        }));

        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Fallback: Save locally
      localStorage.setItem('userProfile', JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        setupComplete: true,
        setupDate: new Date().toISOString()
      }));
      
      setSuccess('Profile updated locally!');
      setTimeout(() => {
        setShowModal(false);
        window.location.reload();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const initials = userProfile.name 
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '👤';

  return (
    <>
      <div className="profile-icon-container" onClick={loadProfile}>
        <div className="profile-avatar">
          {initials}
        </div>
        <div className="profile-name">{userProfile.name || 'User'}</div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="profile-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="profile-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="profile-modal-header">
                <h2>Update Profile</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
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

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" className="update-btn" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileIcon;
