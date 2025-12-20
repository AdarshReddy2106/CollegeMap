import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Search, 
  MapPin, 
  Menu,
  School,
  ArrowLeft
} from 'lucide-react';
import IITPalakkadImg from '../../assets/IITs/IITPalakkad.jpg';
import iitpkdData from '../../IIT DATA/iitpkd.json';
import "./AboutIITs.css";

// --- COMPONENTS ---

const SectionTitle = ({ title, icon: Icon }) => (
  <div className="iit-section-title">
    <div className="iit-title-icon-wrapper">
      <Icon size={24} />
    </div>
    <h2>{title.replace(/_/g, ' ')}</h2>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`iit-card ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  return (
    <span className={`iit-badge iit-badge-${color}`}>
      {children}
    </span>
  );
};

// --- SUB-SECTIONS ---

const OverviewSection = ({ data }) => (
  <div className="iit-overview-grid">
    <Card className="iit-overview-card">
      <h3 className="iit-card-header">
        <School className="iit-icon-blue" /> Institute Details
      </h3>
      <div className="iit-details-list">
        <div className="iit-detail-row">
          <span className="label">Name</span>
          <span className="value">{data.institute}</span>
        </div>
        <div className="iit-detail-row">
          <span className="label">Program</span>
          <span className="value">{data.program_type}</span>
        </div>
        <div className="iit-detail-row">
          <span className="label">NIRF Ranking</span>
          <span className="value highlight-blue">{data["NIRF Engineering Rankings"]}</span>
        </div>
      </div>
    </Card>

    <Card className="iit-overview-card">
      <h3 className="iit-card-header">
        <BookOpen className="iit-icon-blue" /> Courses Offered
      </h3>
      <div className="iit-tags-container">
        {data.courses_offered.map((course, idx) => (
          <Badge key={idx} color="slate">{course}</Badge>
        ))}
      </div>
    </Card>
  </div>
);

const PlacementsSection = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState(data[0].year);
  const currentYearData = data.find(p => p.year === selectedYear) || data[0];

  const maxStudents = Math.max(...currentYearData.programs.map(p => p.participated));

  return (
    <div className="placements-section">
      <div className="iit-year-tabs">
        {data.map(item => (
          <button
            key={item.year}
            onClick={() => setSelectedYear(item.year)}
            className={`iit-tab-btn ${selectedYear === item.year ? 'active' : ''}`}
          >
            Batch {item.year}
          </button>
        ))}
      </div>

      

      <div className="iit-stats-grid">
         {currentYearData.programs.map((prog, idx) => (
           <Card key={idx} className="iit-stat-card">
             <div className="iit-branch-label">{prog.branch}</div>
             <div className="stat-content">
               <div className="iit-stat-row">
                 <span className="iit-stat-label">Placement Rate</span>
                 <span className="stat-value iit-text-green">{prog.placement_rate}%</span>
               </div>
               <div className="iit-progress-bar-bg">
                  <div className="iit-progress-bar-fill" style={{ width: `${prog.placement_rate}%` }}></div>
               </div>
               <div className="iit-stat-footer">
                 <div className="stat-box">
                   <div className="iit-sub-label">Avg Package</div>
                   <div className="iit-sub-value">{prog.avg_package_lpa} LPA</div>
                 </div>
                 <div className="stat-box iit-text-right">
                   <div className="iit-sub-label">Highest</div>
                   <div className="iit-sub-value">{prog.highest_package_lpa} LPA</div>
                 </div>
               </div>
             </div>
           </Card>
         ))}
      </div>

      {/* Placement Overview Graph */}
      <Card className="iit-placement-graph-card">
        <h3 className="iit-graph-title">Placement Overview: {currentYearData.year}</h3>
        <div className="iit-graph-legend">
          <span className="iit-legend-item">
            <span className="iit-legend-box iit-legend-registered"></span>
            Registered
          </span>
          <span className="iit-legend-item">
            <span className="iit-legend-box iit-legend-placed"></span>
            Placed
          </span>
        </div>
        <div className="iit-placement-chart">
          {currentYearData.programs.map((prog, idx) => {
            const branchAbbr = prog.branch
              .split(' ')
              .filter(w => w.toLowerCase() !== 'and')
              .map(w => w[0].toUpperCase())
              .join('');
            const placementPercent = Math.round((prog.placed / prog.participated) * 100);
            
            return (
              <div key={idx} className="iit-chart-bar-group">
                <div className="iit-chart-bars">
                  <div className="iit-bar-wrapper">
                    <div 
                      className="iit-bar iit-bar-registered" 
                      style={{ height: `${(prog.participated / maxStudents) * 100}%` }}
                    >
                      <span className="iit-bar-value">{prog.participated}</span>
                    </div>
                    <div 
                      className="iit-bar iit-bar-placed" 
                      style={{ height: `${(prog.placed / maxStudents) * 100}%` }}
                    >
                      <span className="iit-bar-value">{prog.placed}</span>
                    </div>
                  </div>
                  <div className="iit-chart-label">
                    <div className="iit-chart-branch">{branchAbbr}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const SeatMatrixSection = ({ data }) => {
  const grouped = useMemo(() => {
    const groups = {};
    data.forEach(item => {
      if (!groups[item.program]) groups[item.program] = [];
      groups[item.program].push(item);
    });
    return groups;
  }, [data]);

  return (
    <div className="iit-seat-matrix-container">
      {Object.entries(grouped).map(([program, items]) => (
        <Card key={program} className="iit-matrix-card">
          <div className="iit-matrix-header">
            <h3>{program}</h3>
            <span className="iit-total-seats">Total Seats: {items.reduce((acc, curr) => acc + curr.seats.total, 0)}</span>
          </div>
          <div className="iit-table-wrapper">
            <table className="iit-data-table">
              <thead>
                <tr>
                  <th className="th-category">Category</th>
                  <th>Total</th>
                  <th>OPEN</th>
                  <th>EWS</th>
                  <th>OBC-NCL</th>
                  <th>SC</th>
                  <th>ST</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={idx}>
                    <td className="td-category">
                      {row.type === 'Female-only' ? (
                        <span className="iit-category-tag iit-text-pink">
                          <Users size={14} /> Female Supernumerary
                        </span>
                      ) : (
                        <span className="iit-category-tag iit-text-blue">
                          <Users size={14} /> Gender Neutral
                        </span>
                      )}
                    </td>
                    <td className="iit-td-bold">{row.seats.total}</td>
                    <td>{row.seats.open}</td>
                    <td>{row.seats.gen_ews}</td>
                    <td>{row.seats.obc_ncl}</td>
                    <td>{row.seats.sc}</td>
                    <td>{row.seats.st}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
};

const CutoffSection = ({ data }) => {
  const [year, setYear] = useState("2025");
  const [searchTerm, setSearchTerm] = useState("");
  
  const flatData = useMemo(() => {
    const list = data[year] || [];
    return list.filter(item => 
      item.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, year, searchTerm]);

  return (
    <Card className="iit-cutoff-card">
      <div className="iit-cutoff-header">
        <div className="iit-year-selector">
           {Object.keys(data).sort().reverse().map(y => (
             <button
              key={y}
              onClick={() => setYear(y)}
              className={`iit-filter-btn ${year === y ? 'active' : ''}`}
             >
               {y} Cutoffs
             </button>
           ))}
        </div>
        <div className="iit-search-wrapper">
          <Search className="iit-search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search branch or category..." 
            className="iit-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="iit-table-scroll-container">
        <table className="iit-data-table iit-sticky-header">
          <thead>
            <tr>
              <th>Program</th>
              <th>Category</th>
              <th>Quota</th>
              <th className="iit-text-right">Opening Rank</th>
              <th className="iit-text-right">Closing Rank</th>
            </tr>
          </thead>
          <tbody>
            {flatData.length > 0 ? flatData.map((row, idx) => (
              <tr key={idx}>
                <td className="iit-td-program">{row.program}</td>
                <td>
                  <Badge color={row.category.includes('OPEN') ? 'blue' : 'amber'}>{row.category}</Badge>
                </td>
                <td className="iit-text-muted">{row.gender}</td>
                <td className="iit-text-right iit-font-mono iit-text-muted">{row.round_1_opening_rank}</td>
                <td className="iit-text-right iit-font-mono iit-text-blue">{row.round_1_closing_rank}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="iit-no-data">
                  No records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// --- MAIN SCREENS ---

const SelectionScreen = ({ onSelect }) => {
  return (
    <div className="iit-selection-screen">
      <div className="iit-background-shapes">
        <div className="iit-shape iit-shape-1"></div>
        <div className="iit-shape iit-shape-2"></div>
      </div>

      <div className="iit-selection-content">
        <div className="iit-selection-header">
           <div className="logo-box">
             <MapPin className="iit-text-white" size={32} />
           </div>
           <h1>College Map</h1>
           <p>By IITians for Future IITians</p>
        </div>

        <div className="iit-selection-card">
          <label>Select Target Institute</label>
          <div className="iit-select-wrapper">
            <select 
              onChange={(e) => onSelect(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Choose an IIT...</option>
              <option value="iitpkd">IIT Palakkad</option>
            </select>
            <ChevronRight className="iit-select-arrow" />
          </div>
          <p className="iit-helper-text">
            Select an institute to view detailed analytics, placements, and cutoffs.
          </p>
        </div>
      </div>
    </div>
  );
};

const CollegeDashboard = ({ data, onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: School },
    { id: 'placements', label: 'Placements', icon: TrendingUp },
    { id: 'seats', label: 'Seat Matrix', icon: Users },
    { id: 'cutoffs', label: 'Cutoffs', icon: Award },
  ];

  return (
    <div className="iit-dashboard-container">
      {/* Hero Header */}
      <div className="iit-hero-section">
        <div className="iit-hero-content">
          <div className="iit-hero-flex">
            <div className="iit-college-icon-large">
               <School size={56} />
            </div>
            <div className="iit-hero-text">
              <h1>{data.institute}</h1>
              <div className="iit-hero-badges">
                <span className="iit-hero-badge primary">
                   Rank {data["NIRF Engineering Rankings"].split(' ')[0]}
                </span>
                <span className="iit-hero-badge secondary">
                   Kerala, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <nav className="iit-college-dashboard-navbar">
          <div className="iit-college-dashboard-navbar-inner">
            <button onClick={onBack} className="iit-college-back-btn">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            <div className="iit-college-nav-links">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`iit-college-nav-link ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="iit-main-content">
        
        <section id="overview" className="iit-section-block">
          <SectionTitle title="Overview" icon={School} />
          <OverviewSection data={data} />
        </section>

        <section id="placements" className="iit-section-block">
          <SectionTitle title="Placement Statistics" icon={TrendingUp} />
          <PlacementsSection data={data.placements} />
        </section>

        <section id="seats" className="iit-section-block">
          <SectionTitle title="Seat Matrix (2025)" icon={Users} />
          <SeatMatrixSection data={data.seat_matrix_2025} />
        </section>

        <section id="cutoffs" className="iit-section-block">
          <SectionTitle title="Opening & Closing Ranks" icon={Award} />
          <CutoffSection data={data.cutoffs} />
        </section>

      </main>

      <footer className="iit-footer">
        <div className="iit-footer-content">
          <p>© {new Date().getFullYear()} College Map. Data sourced for educational purposes.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [selectedCollege, setSelectedCollege] = useState(null);

  return (
    <div className="app-root">
      {selectedCollege ? (
        <CollegeDashboard 
          data={iitpkdData} 
          onBack={() => setSelectedCollege(null)} 
        />
      ) : (
        <SelectionScreen onSelect={setSelectedCollege} />
      )}
    </div>
  );
}