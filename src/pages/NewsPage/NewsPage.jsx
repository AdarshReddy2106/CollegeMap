import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NewsPage.scss';

const NewsPage = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Exam Notifications', 'Result Updates', 'Admit Card', 'Important Dates'];

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      // Use port 4000 where your backend is running
      const response = await fetch('http://localhost:4000/api/nta-updates');
      const data = await response.json();
      
      if (data.success) {
        setUpdates(data.updates);
        setLastUpdated(data.lastUpdated);
        setError(null);
      } else {
        setError('Failed to fetch updates');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchUpdates, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleViewUpdate = (update) => {
    setSelectedUpdate(update);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUpdate(null);
  };

  const filteredUpdates = filterCategory === 'All' 
    ? updates 
    : updates.filter(update => update.category === filterCategory);

  const formatDate = (dateString) => {
    // Handle "Invalid Date" and various date formats
    if (!dateString || dateString === 'Invalid Date' || dateString === 'Recent') {
      return 'Recent';
    }
    
    try {
      // Try to parse the date
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If it's already in DD/MM/YYYY format, just return it
        if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          return dateString;
        }
        return 'Recent';
      }
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recent';
    }
  };

  return (
    <div className="nta-news-page">
      <motion.div 
        className="news-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>NTA Latest Updates</h1>
        <p className="subtitle">Stay updated with National Testing Agency notifications</p>
        <div className="header-info">
          <div className="last-updated">
            <span className="update-icon">🔄</span>
            Last updated: {lastUpdated ? formatDate(lastUpdated) : 'Never'}
          </div>
          <button onClick={fetchUpdates} className="refresh-btn" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </motion.div>

      <div className="filter-section">
        <div className="filter-container">
          <div className="filter-group">
            <h3>Filter by Category</h3>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  className={filterCategory === category ? 'active' : ''}
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        className="news-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {loading && updates.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading latest updates...</p>
          </div>
        ) : error && updates.length === 0 ? (
          <div className="error-state">
            <h3>⚠️ {error}</h3>
            <button onClick={fetchUpdates} className="retry-btn">Try Again</button>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="no-results">
            <h3>No updates found</h3>
            <p>Try changing your filter or check back later</p>
          </div>
        ) : (
          <div className="news-grid">
            {filteredUpdates.map((update, index) => (
              <motion.div 
                className="news-card"
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.25)' }}
              >
                <div className="news-badge">
                  {update.isNew && <span className="new-badge">NEW</span>}
                  <span className="category-badge">{update.category || 'General'}</span>
                </div>
                <div className="news-content">
                  <h3>{update.title}</h3>
                  <div className="news-meta">
                    <span className="news-date">📅 {update.date || 'Recent'}</span>
                    <span className="news-source">🔗 {update.source}</span>
                  </div>
                  {update.description && (
                    <p className="news-description">
                      {update.description.substring(0, 120)}
                      {update.description.length > 120 && '...'}
                    </p>
                  )}
                  <div className="news-actions">
                    <button 
                      onClick={() => handleViewUpdate(update)} 
                      className="view-button"
                    >
                      Read More
                    </button>
                    <a 
                      href={update.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="external-link"
                    >
                      Visit NTA Page →
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal for detailed view */}
      <AnimatePresence>
        {showModal && selectedUpdate && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedUpdate.title}</h2>
                <button className="close-button" onClick={handleCloseModal}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="update-meta">
                  <span className="update-date">📅 {selectedUpdate.date || 'Recent'}</span>
                  <span className="update-source">🔗 {selectedUpdate.source}</span>
                  <span className="update-category">{selectedUpdate.category || 'General'}</span>
                </div>
                <div className="update-description">
                  {selectedUpdate.description || 'No additional details available.'}
                </div>
              </div>
              <div className="modal-footer">
                <a 
                  href={selectedUpdate.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="open-nta-button"
                >
                  Visit Official NTA Page
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsPage;