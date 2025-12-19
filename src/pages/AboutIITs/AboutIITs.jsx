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
  ArrowRight
} from 'lucide-react';
import IITPalakkadImg from '../../assets/IITs/IITPalakkad.jpg';
import iitpkdData from '../../IIT DATA/iitpkd.json';
import "./AboutIITs.css";

// --- COMPONENTS ---

const SectionTitle = ({ title, icon: Icon }) => (
  <div className="section-title">
    <div className="title-icon-wrapper">
      <Icon size={24} />
    </div>
    <h2>{title.replace(/_/g, ' ')}</h2>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  return (
    <span className={`badge badge-${color}`}>
      {children}
    </span>
  );
};

// --- SUB-SECTIONS ---

const OverviewSection = ({ data }) => (
  <div className="overview-grid">
    <Card className="overview-card">
      <h3 className="card-header">
        <School className="icon-blue" /> Institute Details
      </h3>
      <div className="details-list">
        <div className="detail-row">
          <span className="label">Name</span>
          <span className="value">{data.institute}</span>
        </div>
        <div className="detail-row">
          <span className="label">Program</span>
          <span className="value">{data.program_type}</span>
        </div>
        <div className="detail-row">
          <span className="label">NIRF Ranking</span>
          <span className="value highlight-blue">{data["NIRF Engineering Rankings"]}</span>
        </div>
      </div>
    </Card>

    <Card className="overview-card">
      <h3 className="card-header">
        <BookOpen className="icon-blue" /> Courses Offered
      </h3>
      <div className="tags-container">
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

  return (
    <div className="placements-section">
      <div className="year-tabs">
        {data.map(item => (
          <button
            key={item.year}
            onClick={() => setSelectedYear(item.year)}
            className={`tab-btn ${selectedYear === item.year ? 'active' : ''}`}
          >
            Batch {item.year}
          </button>
        ))}
      </div>

      <div className="stats-grid">
         {currentYearData.programs.map((prog, idx) => (
           <Card key={idx} className="stat-card">
             <div className="branch-label">{prog.branch}</div>
             <div className="stat-content">
               <div className="stat-row">
                 <span className="stat-label">Placement Rate</span>
                 <span className="stat-value text-green">{prog.placement_rate}%</span>
               </div>
               <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${prog.placement_rate}%` }}></div>
               </div>
               <div className="stat-footer">
                 <div className="stat-box">
                   <div className="sub-label">Avg Package</div>
                   <div className="sub-value">{prog.avg_package_lpa} LPA</div>
                 </div>
                 <div className="stat-box text-right">
                   <div className="sub-label">Highest</div>
                   <div className="sub-value">{prog.highest_package_lpa} LPA</div>
                 </div>
               </div>
             </div>
           </Card>
         ))}
      </div>
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
    <div className="seat-matrix-container">
      {Object.entries(grouped).map(([program, items]) => (
        <Card key={program} className="matrix-card">
          <div className="matrix-header">
            <h3>{program}</h3>
            <span className="total-seats">Total Seats: {items.reduce((acc, curr) => acc + curr.seats.total, 0)}</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
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
                        <span className="category-tag text-pink">
                          <Users size={14} /> Female Supernumerary
                        </span>
                      ) : (
                        <span className="category-tag text-blue">
                          <Users size={14} /> Gender Neutral
                        </span>
                      )}
                    </td>
                    <td className="td-bold">{row.seats.total}</td>
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
    <Card className="cutoff-card">
      <div className="cutoff-header">
        <div className="year-selector">
           {Object.keys(data).sort().reverse().map(y => (
             <button
              key={y}
              onClick={() => setYear(y)}
              className={`filter-btn ${year === y ? 'active' : ''}`}
             >
               {y} Cutoffs
             </button>
           ))}
        </div>
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search branch or category..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="table-scroll-container">
        <table className="data-table sticky-header">
          <thead>
            <tr>
              <th>Program</th>
              <th>Category</th>
              <th>Quota</th>
              <th className="text-right">Opening Rank</th>
              <th className="text-right">Closing Rank</th>
            </tr>
          </thead>
          <tbody>
            {flatData.length > 0 ? flatData.map((row, idx) => (
              <tr key={idx}>
                <td className="td-program">{row.program}</td>
                <td>
                  <Badge color={row.category.includes('OPEN') ? 'blue' : 'amber'}>{row.category}</Badge>
                </td>
                <td className="text-muted">{row.gender}</td>
                <td className="text-right font-mono text-muted">{row.round_1_opening_rank}</td>
                <td className="text-right font-mono text-blue">{row.round_1_closing_rank}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="no-data">
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
    <div className="selection-screen">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="selection-content">
        <div className="selection-header">
           <div className="logo-box">
             <MapPin className="text-white" size={32} />
           </div>
           <h1>College Map</h1>
           <p>By IITians for Future IITians</p>
        </div>

        <div className="selection-card">
          <label>Select Target Institute</label>
          <div className="select-wrapper">
            <select 
              onChange={(e) => onSelect(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Choose an IIT...</option>
              <option value="iitpkd">IIT Palakkad</option>
            </select>
            <ChevronRight className="select-arrow" />
          </div>
          <p className="helper-text">
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
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-left">
            <button onClick={onBack} className="back-btn">
              <ArrowRight className="rotate-180" size={20} />
            </button>
            <div className="nav-title">
              <span className="institute-name">{data.institute}</span>
              <span className="nav-subtitle">College Map Explorer</span>
            </div>
          </div>
          
          <div className="nav-links">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="mobile-menu-btn">
            <Menu className="text-white" />
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-flex">
            <div className="college-icon-large">
               <School size={40} />
            </div>
            <div className="hero-text">
              <h1>{data.institute}</h1>
              <div className="hero-badges">
                <span className="hero-badge primary">
                   Rank {data["NIRF Engineering Rankings"].split(' ')[0]}
                </span>
                <span className="hero-badge secondary">
                   Kerala, India
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        
        <section id="overview" className="section-block">
          <SectionTitle title="Overview" icon={School} />
          <OverviewSection data={data} />
        </section>

        <section id="placements" className="section-block">
          <SectionTitle title="Placement Statistics" icon={TrendingUp} />
          <PlacementsSection data={data.placements} />
        </section>

        <section id="seats" className="section-block">
          <SectionTitle title="Seat Matrix (2025)" icon={Users} />
          <SeatMatrixSection data={data.seat_matrix_2025} />
        </section>

        <section id="cutoffs" className="section-block">
          <SectionTitle title="Opening & Closing Ranks" icon={Award} />
          <CutoffSection data={data.cutoffs} />
        </section>

      </main>

      <footer className="footer">
        <div className="footer-content">
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