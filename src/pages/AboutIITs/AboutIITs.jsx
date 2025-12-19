import React, { useState, useEffect } from 'react';
import './AboutIITs.css';
import IITPalakkadImg from '../../assets/IITs/IITPalakkad.jpg';
import IITBombayImg from '../../assets/IITs/IITBombay.jpg';
import iitpkdData from '../../IIT DATA/iitpkd.json';

const AboutIITs = () => {
  const [selectedIIT, setSelectedIIT] = useState('');
  const [iitData, setIITData] = useState(null);
  const [loading, setLoading] = useState(false);

  const iitDataMap = {
    iitpkd: iitpkdData,
  };

  const iitOptions = [
    { value: 'iitpkd', label: 'IIT Palakkad', image: IITPalakkadImg },
  ];

  useEffect(() => {
    if (selectedIIT) {
      setLoading(true);
      setTimeout(() => {
        setIITData(iitDataMap[selectedIIT]);
        setLoading(false);
      }, 300);
    }
  }, [selectedIIT]);

  const handleIITChange = (e) => {
    setSelectedIIT(e.target.value);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getImageForIIT = () => {
    const selectedOption = iitOptions.find(opt => opt.value === selectedIIT);
    return selectedOption ? selectedOption.image : '';
  };

  const renderNavigationMenu = () => {
    if (!iitData) return null;

    const sections = [
      { id: 'overview', label: 'Overview', key: 'institute' },
      { id: 'courses', label: 'Courses Offered', key: 'courses_offered' },
      { id: 'placements', label: 'Placements', key: 'placements' },
      { id: 'seats', label: 'Seat Matrix 2025', key: 'seat_matrix_2025' },
      { id: 'cutoffs', label: 'Cutoffs', key: 'cutoffs' },
    ];

    return (
      <div className="navigation-menu">
        {sections.map((section) => (
          iitData[section.key] && (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="nav-button"
            >
              {section.label}
            </button>
          )
        ))}
      </div>
    );
  };

  const renderOverview = () => (
    <section id="overview" className="content-section">
      <h2 className="section-title">Overview</h2>
      <div className="overview-grid">
        <div className="info-card">
          <div className="info-label">Institute</div>
          <div className="info-value">{iitData.institute}</div>
        </div>
        {iitData.program_type && (
          <div className="info-card">
            <div className="info-label">Program Type</div>
            <div className="info-value">{iitData.program_type}</div>
          </div>
        )}
        {iitData["NIRF Engineering Rankings"] && (
          <div className="info-card">
            <div className="info-label">NIRF Engineering Rankings</div>
            <div className="info-value">{iitData["NIRF Engineering Rankings"]}</div>
          </div>
        )}
      </div>
    </section>
  );

  const renderCourses = () => (
    <section id="courses" className="content-section">
      <h2 className="section-title">Courses Offered</h2>
      <div className="courses-grid">
        {iitData.courses_offered.map((course, index) => (
          <div key={index} className="course-card">
            <div className="course-icon">🎓</div>
            <div className="course-name">{course}</div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderPlacements = () => (
    <section id="placements" className="content-section">
      <h2 className="section-title">Placements</h2>
      {iitData.placements.map((yearData, yearIndex) => (
        <div key={yearIndex} className="placement-year-section">
          <h3 className="year-title">
            {yearData.year} - <span className="status">{yearData.status}</span>
          </h3>
          <div className="placement-grid">
            {yearData.programs.map((program, progIndex) => (
              <div key={progIndex} className="placement-card">
                <h4 className="branch-name">{program.branch}</h4>
                <div className="placement-stats">
                  <div className="stat-row">
                    <span className="stat-label">Participated:</span>
                    <span className="stat-value">{program.participated}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Placed:</span>
                    <span className="stat-value">{program.placed}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Placement Rate:</span>
                    <span className="stat-value highlight">{program.placement_rate}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Average Package:</span>
                    <span className="stat-value">₹{program.avg_package_lpa} LPA</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Highest Package:</span>
                    <span className="stat-value highlight">₹{program.highest_package_lpa} LPA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );

  const renderSeatMatrix = () => (
    <section id="seats" className="content-section">
      <h2 className="section-title">Seat Matrix 2025</h2>
      <div className="table-container">
        <table className="seat-matrix-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Type</th>
              <th>Total</th>
              <th>Open</th>
              <th>Open PWD</th>
              <th>EWS</th>
              <th>EWS PWD</th>
              <th>SC</th>
              <th>SC PWD</th>
              <th>ST</th>
              <th>ST PWD</th>
              <th>OBC-NCL</th>
              <th>OBC PWD</th>
            </tr>
          </thead>
          <tbody>
            {iitData.seat_matrix_2025.map((seat, index) => (
              <tr key={index}>
                <td className="program-cell">{seat.program}</td>
                <td className="type-cell">{seat.type}</td>
                <td className="total-cell">{seat.seats.total}</td>
                <td>{seat.seats.open}</td>
                <td>{seat.seats.open_pwd}</td>
                <td>{seat.seats.gen_ews}</td>
                <td>{seat.seats.gen_ews_pwd}</td>
                <td>{seat.seats.sc}</td>
                <td>{seat.seats.sc_pwd}</td>
                <td>{seat.seats.st}</td>
                <td>{seat.seats.st_pwd}</td>
                <td>{seat.seats.obc_ncl}</td>
                <td>{seat.seats.obc_ncl_pwd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderCutoffs = () => (
    <section id="cutoffs" className="content-section">
      <h2 className="section-title">Cutoffs</h2>
      {Object.keys(iitData.cutoffs).map((year) => (
        <div key={year} className="cutoff-year-section">
          <h3 className="year-title">Year {year}</h3>
          <div className="table-container">
            <table className="cutoff-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Category</th>
                  <th>Gender</th>
                  <th>Round 1 Opening</th>
                  <th>Round 1 Closing</th>
                  <th>Last Round Opening</th>
                  <th>Last Round Closing</th>
                </tr>
              </thead>
              <tbody>
                {iitData.cutoffs[year].map((cutoff, index) => (
                  <tr key={index}>
                    <td className="program-cell">{cutoff.program}</td>
                    <td className="category-cell">{cutoff.category}</td>
                    <td className="gender-cell">{cutoff.gender}</td>
                    <td>{cutoff.round_1_opening_rank}</td>
                    <td>{cutoff.round_1_closing_rank}</td>
                    <td>{cutoff.last_round_opening_rank}</td>
                    <td>{cutoff.last_round_closing_rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );

  return (
    <div className="about-iits-container">
      <div className="hero-section">
        <h1 className="main-title">Explore IIT Institutes</h1>
        <p className="subtitle">Select an IIT to view detailed information</p>
      </div>

      <div className="selection-container">
        <div className="dropdown-wrapper">
          <label htmlFor="iit-select" className="dropdown-label">
            Select IIT
          </label>
          <select
            id="iit-select"
            value={selectedIIT}
            onChange={handleIITChange}
            className="iit-dropdown"
          >
            <option value="">Choose an IIT...</option>
            {iitOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading IIT data...</p>
        </div>
      )}

      {!loading && selectedIIT && iitData && (
        <>
          <div className="institute-header">
            <div className="institute-image-container">
              <img
                src={getImageForIIT()}
                alt={iitData.institute}
                className="institute-image"
              />
            </div>
            <div className="institute-name-container">
              <h2 className="institute-name">{iitData.institute}</h2>
              {iitData["NIRF Engineering Rankings"] && (
                <p className="institute-ranking">
                  NIRF Ranking: {iitData["NIRF Engineering Rankings"]}
                </p>
              )}
            </div>
          </div>

          {renderNavigationMenu()}

          <div className="content-container">
            {renderOverview()}
            {iitData.courses_offered && renderCourses()}
            {iitData.placements && renderPlacements()}
            {iitData.seat_matrix_2025 && renderSeatMatrix()}
            {iitData.cutoffs && renderCutoffs()}
          </div>
        </>
      )}

      {!loading && !selectedIIT && (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3>Select an IIT to get started</h3>
          <p>Choose an IIT from the dropdown above to view detailed information</p>
        </div>
      )}
    </div>
  );
};

export default AboutIITs;
