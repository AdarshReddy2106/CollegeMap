import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ResourcesPage.scss';


const resourcesData = [  
  {
    id: 1,
    title: "Mechanics I",
    type: "Books",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/drive/folders/1nu8LUMs8RmT5AKdSHEv-pvMVwIQw4LUl",
  },
  {
    id:2,
    title: "Mechanics II",
    type: "Books",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/drive/folders/1RE_hBQogejGMxClAYYw9lQES4klRpAjd",
  },
  {
    id: 3,
    title: "Magnetism",
    type: "Books",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/drive/folders/1AX-FJxu8EYcoE4LME9dRGZKuI2OWJHZY",
  },
  {
    id: 4,
    title: "Thermometry",
    type: "Books",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/drive/folders/17hlNXTFZiNuUGLNNMK6hMlSv-VbBQIcM",
  },
  {
    id: 5,
    title: "Electrostatics",
    type: "Books",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/drive/folders/1W2YEoENQlhgLe2Ky_M-d2rA1cVc9Dbf6",
  },
  {
    id: 6,
    title: "Optics",
    type: "Books",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/drive/folders/1muAo9SzSkFPfcjsj3fhJDCveyWul3f8G",
  },


  {
    id: 7,
    title: "Physical Chemistry I",
    type: "Books",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/drive/folders/1C00WgC5fPhUFrGmfZ9xo5h_w4sMDahg_",
  },
  {
    id: 8,
    title: "Physical Chemistry II",
    type: "Books",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/drive/folders/1o-Zpun8PFjvr2wAtmRGRb0ixVbr5Oar7",
  },
  {
    id: 9,
    title: "Inorganic Chemistry I",
    type: "Books",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/drive/folders/1D_pdEgTWEFQ0rwJSS-hIgObM51rE9qYe",
  },
  {
    id: 10,
    title: "Inorganic Chemistry II",
    type: "Books",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/drive/folders/1gWFrxlwQ_W-KEheqkCOKVvvb4QKQcoK3",
  },
  {
    id: 11,
    title: "Organic Chemistry I",
    type: "Books",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/drive/folders/1IxXUj5wO2hdx3ID5G8lFDamomGu_KfdJ",
  },
  {
    id: 12,
    title: "Organic Chemistry II",
    type: "Books",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/drive/folders/1fpjU3VWAwOd8O8cVvWNkZPWWcA2cQA72",
  },

  
  {
    id: 13,
    title: "Trigonometry",
    type: "Books",
    subject: "Mathematics",
    downloadUrl: "https://drive.google.com/drive/folders/1XNLJuPpw-9wQ9MWnnEzJ_4Vfw16J6ZAH",
  },
  
  {
    id: 14,
    title: "Calculus",
    type: "Books",
    subject: "Mathematics",
    downloadUrl: "https://drive.google.com/drive/folders/1a_wPAXU_Q1fiyVtZFGLFQj3hx_eIomH-",
  },
  
  {
    id: 15,
    title: "3D Geometry",
    type: "Books",
    subject: "Mathematics",
    downloadUrl: "https://drive.google.com/drive/folders/1LJByflN76lAwqTR02NP9FGaiM9clri5s",
  },
  {
    id: 16,
    title: "Algebra",
    type: "Books",
    subject: "Mathematics",
    downloadUrl: "https://drive.google.com/drive/folders/1H6j6Ew3A0ntL971RTqpbkaJqsdIwdodG",
  },
  {
    id: 17,
    title: "Coordinate Geometry",
    type: "Books",
    subject: "Mathematics",
    downloadUrl: "https://drive.google.com/drive/folders/1MSVkAlTy-ljQauWc0awJdO1wMf40YT2J",
  },
  // Practice Papers
  {
    id: 18,
    title: "Chemical Bonding",
    type: "Practice",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/file/d/1m81vSNTEBYHPw_2SJ-VJg6aFfF_QnWCh/view?usp=drive_link",
  },
 {
    id: 19,
    title: "Equilibrium",
    type: "Practice",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/file/d/18wPaGQQKU31JlZvAfOMWoC5U6hd2EmG7/view?usp=drive_link"
 },
 {
    id: 20,
    title: "Relations and Functions",
    type: "Practice",
    subject: "Mathematics",
    downloadUrl: "https://drive.google.com/file/d/18wPaGQQKU31JlZvAfOMWoC5U6hd2EmG7/view?usp=drive_link"
 },
 {
    id: 21,
    title: "Electrostatics",
    type: "Practice",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/file/d/1Mboxm38IM52dOgqVkm7CfEO8gCu7IUiy/view?usp=drive_link"
 },
 {
    id: 22,
    title: "Rotational Motion",
    type: "Practice",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/file/d/1tu3JN8NBubZIrmCkGuJXhoUJEQk4I6iR/view?usp=drive_link"
 },
 {
    id: 23,
    title:"Semiconductor",
    type: "Practice",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/file/d/1MBmybEUQaDIRgbC5aSUwdzuWMEUiH7km/view?usp=drive_link"
 },
 {
    id: 24,
    title: "Thermal Physics",
    type: "Practice",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/file/d/1dFQN2vSgKh-gAum51kjgM8XNXIZmlBr1/view?usp=drive_link"
 },
 // Cheatsheets
  {
    id: 25,
    title: "Haloalkanes and Haloarenes",
    type: "Cheatsheets",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/file/d/17kQbg8vycn02LjTNNw45rtgd96GB5b87/view?usp=drive_link"
  },
  {
    id: 26,
    title: "Hydrogen",
    type: "Cheatsheets",
    subject: "Chemistry",
    downloadUrl: "https://drive.google.com/file/d/1lV89zgepRmXa0rUCmyXrg3efxU5-oK5F/view?usp=drive_link"
  },
  {
    id: 27,
    title: "Conic Sections",
    type: "Cheatsheets",
    subject: "Mathematics",
    downloadUrl: "https://drive.google.com/file/d/1SYTCaC9XrV41gLu2MutxfWhY-w-pD5Tx/view?usp=drive_link"
  },
  {
    id: 28,
    title: "Circular Motion",
    type: "Cheatsheets",
    subject: "Physics",
    downloadUrl: "https://drive.google.com/file/d/1NtnlcBpQ4IjJzkmUp_IlujrWKOs0h6gC/view?usp=drive_link"
  }  
];

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [activeSubject, setActiveSubject] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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
          resource.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort resources
    if (sortBy === 'newest') {
    } else if (sortBy === 'a-z') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'z-a') {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
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
                  onClick={() => setActiveType(type)}
                >
                  {type === 'Practice Papers' ? 'Practice Papers' : type}
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
                <div className="resource-content">
                  <span className={`type-indicator ${resource.type}`}>
                    {resource.type === 'Practice Papers' ? 'Practice Papers' : resource.type}
                  </span>
                  <div className="resource-details">
                    <h3>{resource.title}</h3>
                    <p className="resource-subject">{resource.subject}</p>
                    <div className="resource-actions">
                      <a href={resource.downloadUrl} className="view-button">
                        View
                      </a>
                    </div>
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
