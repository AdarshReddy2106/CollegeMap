import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ResourcesPage.scss';
import { resourcesData } from './ResourcesData';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeSubject, setActiveSubject] = useState('Physics');
  const [activeType, setActiveType] = useState('JEE Busters');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showBooks, setShowBooks] = useState(false);
  const [booksSelected, setBooksSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Simulate fetching resources from an API
  useEffect(() => {
    setResources(resourcesData);
    setFilteredResources(resourcesData);
  }, []);

  // Filter resources based on selected filters
  useEffect(() => {
    let result = resources;
    
    // Filter by subject
    if (activeSubject !== 'All') {
      result = result.filter(resource => 
        resource.subject === activeSubject || resource.subject === 'All'
      );
    }
    
    // Filter by type
    if (activeType !== 'All') {
      result = result.filter(resource => resource.type === activeType);
    }
    
    // For Books type, only show if books category is selected
    if (activeType === 'Books' && !booksSelected) {
      result = [];
    }
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        resource =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort resources
    if (sortBy === 'a-z') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'z-a') {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }
    
    setFilteredResources(result);
    
    // Show books selection when Books type is active
    setShowBooks(activeType === 'Books' && !booksSelected);
  }, [resources, activeSubject, activeType, searchQuery, sortBy, booksSelected]);

  // Get unique subjects and types for filters
  const subjects = ['All', ...new Set(resources.map(item => item.subject).filter(s => s !== 'All'))];
  const types = ['JEE Busters', 'Cheatsheets', 'Practice', 'Books'];

  const handleTypeChange = (type) => {
    setActiveType(type);
    setBooksSelected(false); // Reset books selection when type changes
  };

  const handleBooksClick = () => {
    setBooksSelected(true);
  };

  const handleBackFromBooks = () => {
    setBooksSelected(false);
  };

  const handleViewResource = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResource(null);
  };

  // Helper function to create a direct download link for files
  const getDownloadLink = (url) => {
    const fileIdMatch = url.match(/\/d\/(.*?)\//);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url; // Fallback for folders (though this button won't show)
  };

  return (
    <div className="resources-page">
      <motion.div 
        className="resources-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Our Resources</h1>
      </motion.div>
      
      <elevenlabs-convai agent-id="agent_6001k906ndgzee69c8hjc31kv5fg"></elevenlabs-convai>
      
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </div>
        
        <div className="sort-dropdown">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>
        </div>
      </div>
      
      <div className="filter-section">
        <div className="filter-container">
          <div className="filter-group subject-filters">
            <h3>Subject</h3>
            <div className="filter-buttons">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  className={activeSubject === subject ? 'active' : ''}
                  onClick={() => setActiveSubject(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
              
          <div className="filter-group type-filters">
            <h3>Resource Type</h3>
            <div className="filter-buttons">
              {types.map((type) => (
                <button
                  key={type}
                  className={activeType === type ? 'active' : ''}
                  onClick={() => handleTypeChange(type)}
                >
                  {type === 'Practice Papers' ? 'Practice Papers' : 
                   type === 'Cheatsheets' ? 'Short Notes' : 
                   type === 'JEE Busters' ? 'JEE Busters' : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="resources-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {showBooks ? (
          <div className="books-selection">
            <motion.div
              className="books-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={handleBooksClick}
            >
              <div className="books-content">
                <div className="books-icon">📚</div>
                <h2>Cengage</h2>
                <p>Click to view all available books</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {booksSelected && activeType === 'Books' && (
              <div className="back-button-container">
                <button className="back-button" onClick={handleBackFromBooks}>
                  ←Back
                </button>
              </div>
            )}
            {filteredResources.length === 0 ? (
              <div className="no-results">
                <h3>No resources found</h3>
                <p>Try changing your filters or search query</p>
              </div>
            ) : (
              <div className="resources-grid">
                {filteredResources.map((resource) => (
                  <motion.div 
                    className="resource-card"
                    key={resource.id}
                    whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.25)' }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="resource-content">
                      <span className={`type-indicator ${resource.type}`}>
                        {resource.type === 'Practice Papers' ? 'Practice Papers' : 
                         resource.type === 'Cheatsheets' ? 'Short Notes' : 
                         resource.type === 'JEE Busters' ? 'JEE Busters' : resource.type}
                      </span>
                      <div className="resource-details">
                        <h3>{resource.title}</h3>
                        <p className="resource-subject">{resource.subject}</p>
                        <div className="resource-actions">
                          <button 
                            onClick={() => handleViewResource(resource)} 
                            className="view-button"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedResource && (
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
                <h2>{selectedResource.title}</h2>
                <button className="close-button" onClick={handleCloseModal}>
                  X
                </button>
              </div>
              <div className="modal-body">
                <iframe
                  src={selectedResource.downloadUrl.replace('/view?usp=drive_link', '/preview').replace('/drive/folders/', '/embeddedfolderview?id=')}
                  title={selectedResource.title}
                  className="resource-iframe"
                  allow="autoplay"
                />
              </div>
              <div className="modal-footer">
                {/* Conditionally render download button only for files (not folders/Books) */}
                {selectedResource.type !== 'Books' && (
                  <a
                    href={getDownloadLink(selectedResource.downloadUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-button"
                    download
                  >
                    Download PDF
                  </a>
                )}
                <a 
                  href={selectedResource.downloadUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="open-drive-button"
                >
                  Open in Google Drive
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default ResourcesPage;