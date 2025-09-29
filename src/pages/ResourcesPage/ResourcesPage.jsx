import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ResourcesPage.scss';

// Sample resource data - this would normally come from an API
const resourcesData = [
  {
    id: 1,
    title: "JEE Mathematics Formulas",
    description: "Comprehensive formula sheet covering all JEE Math topics",
    type: "cheatsheet",
    subject: "Mathematics",
    thumbnail: "https://via.placeholder.com/150?text=Math+Formulas",
    downloadUrl: "#",
    popular: true,
    dateAdded: "2023-08-15"
  },
  {
    id: 2,
    title: "Physics Quick Reference Guide",
    description: "Essential physics concepts and equations for quick revision",
    type: "shortNotes",
    subject: "Physics",
    thumbnail: "https://via.placeholder.com/150?text=Physics+Guide",
    downloadUrl: "#",
    popular: true,
    dateAdded: "2023-09-02"
  },
  {
    id: 3,
    title: "Organic Chemistry Mechanisms",
    description: "Visual guide to important organic chemistry reaction mechanisms",
    type: "cheatsheet",
    subject: "Chemistry",
    thumbnail: "https://via.placeholder.com/150?text=Chemistry",
    downloadUrl: "#",
    popular: false,
    dateAdded: "2023-07-20"
  },
  {
    id: 4,
    title: "Calculus Master Notes",
    description: "Detailed explanations of calculus concepts with examples",
    type: "notes",
    subject: "Mathematics",
    thumbnail: "https://via.placeholder.com/150?text=Calculus",
    downloadUrl: "#",
    popular: false,
    dateAdded: "2023-10-05"
  },
  {
    id: 5,
    title: "Electromagnetism Simplified",
    description: "Clear explanations of electromagnetic principles and applications",
    type: "notes",
    subject: "Physics",
    thumbnail: "https://via.placeholder.com/150?text=Electromagnetism",
    downloadUrl: "#",
    popular: true,
    dateAdded: "2023-09-18"
  },
  {
    id: 7,
    title: "Vectors & 3D Geometry",
    description: "Illustrated guide to vectors and three-dimensional geometry",
    type: "cheatsheet",
    subject: "Mathematics",
    thumbnail: "https://via.placeholder.com/150?text=Vectors",
    downloadUrl: "#",
    popular: false,
    dateAdded: "2023-10-12"
  },
  {
    id: 8,
    title: "Chemistry Equations Handbook",
    description: "All important chemical equations and reactions for JEE preparation",
    type: "cheatsheet",
    subject: "Chemistry",
    thumbnail: "https://via.placeholder.com/150?text=Chem+Equations",
    downloadUrl: "#",
    popular: true,
    dateAdded: "2023-07-25"
  },
];

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeSubject, setActiveSubject] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

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
      result = result.filter(resource => resource.subject === activeSubject);
    }
    
    // Filter by type
    if (activeType !== 'All') {
      result = result.filter(resource => resource.type === activeType);
    }
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        resource =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort resources
    if (sortBy === 'popular') {
      result = [...result].sort((a, b) => (b.popular === a.popular) ? 0 : b.popular ? 1 : -1);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
    }
    
    setFilteredResources(result);
  }, [resources, activeSubject, activeType, searchQuery, sortBy]);

  // Get unique subjects and types for filters
  const subjects = ['All', ...new Set(resources.map(item => item.subject))];
  const types = ['All', ...new Set(resources.map(item => item.type))];

  return (
    <div className="resources-page">
      <motion.div 
        className="resources-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Student Resources</h1>
        <p>Access valuable study materials to enhance your learning experience</p>
      </motion.div>
      
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
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
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
                  onClick={() => setActiveType(type)}
                >
                  {type === 'shortNotes' ? 'Short Notes' : 
                   type === 'All' ? 'All Types' : type}
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
                <div className="resource-thumbnail">
                  <img src={resource.thumbnail} alt={resource.title} />
                  {resource.popular && <span className="popular-tag">Popular</span>}
                  <span className={`type-indicator ${resource.type}`}>
                    {resource.type === 'shortNotes' ? 'Short Notes' : resource.type}
                  </span>
                </div>
                <div className="resource-details">
                  <h3>{resource.title}</h3>
                  <p className="resource-subject">{resource.subject}</p>
                  <p className="resource-description">{resource.description}</p>
                  <div className="resource-actions">
                    <a href={resource.downloadUrl} className="download-button">
                      Download
                    </a>
                    <button className="preview-button">Preview</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};


export default ResourcesPage;
