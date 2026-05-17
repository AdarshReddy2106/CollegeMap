import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.scss";
import logo from "../../assets/logo/collegeMapLogo.png";
import { useLocation } from "react-router-dom";


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [pyqDropdownOpen, setPyqDropdownOpen] = useState(false);
    const [jeeDropdownOpen, setJeeDropdownOpen] = useState(false);
    const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);
    const [userType, setUserType] = useState('jee');
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const storedUserType = localStorage.getItem('userType');
        if (storedUserType) {
            setUserType(storedUserType);
        }

        const handleUserTypeChange = () => {
            const newType = localStorage.getItem('userType');
            if (newType) {
                setUserType(newType);
            }
        };

        window.addEventListener('userTypeChanged', handleUserTypeChange);
        return () => {
            window.removeEventListener('userTypeChanged', handleUserTypeChange);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSwitchNav = (type) => {
        localStorage.setItem('userType', type);
        window.dispatchEvent(new Event('userTypeChanged'));
        setIsMenuOpen(false);
        if (type === 'college') {
            navigate('/home');
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/">
                    <img className="logo" src={logo} alt="logo" />
                </Link>
            </div>

            <div className="navbar-right">
                <div className={`nav-links ${isMenuOpen ? "open" : ""}`} ref={menuRef}>
                    {userType === 'jee' ? (
                        <>
                            <li><Link to="/resources" onClick={() => setIsMenuOpen(false)}>Top Resources</Link></li>
                            <li><Link to="/StudyWithIITians" onClick={() => setIsMenuOpen(false)}>Study With IITians</Link></li>
                            <li><Link to="/energy-batch" onClick={() => setIsMenuOpen(false)}>Energy Batch</Link></li>
                            
                            <li
                                className="nav-dropdown"
                                onMouseEnter={() => setPyqDropdownOpen(true)}
                                onMouseLeave={() => setPyqDropdownOpen(false)}
                                onClick={() => {
                                    if (window.innerWidth <= 990) {
                                        setPyqDropdownOpen(!pyqDropdownOpen);
                                    }
                                }}
                            >
                                <span className="dropdown-trigger" style={{ gap: '5px' }}>
                                    Practice <span style={{ fontSize: '0.8em', marginTop: '2px' }}>{pyqDropdownOpen ? "▲" : "▼"}</span>
                                </span>
                                {pyqDropdownOpen && (
                                    <ul className="dropdown-menu">
                                        <li><Link to="/cbt-portal" onClick={() => setIsMenuOpen(false)}>Test Portal</Link></li>
                                        <li><Link to="/pyq" onClick={() => setIsMenuOpen(false)}>Past Year Papers</Link></li>
                                    </ul>
                                )}
                            </li>

                            <li
                                className="nav-dropdown"
                                onMouseEnter={() => setCollegeDropdownOpen(true)}
                                onMouseLeave={() => setCollegeDropdownOpen(false)}
                                onClick={() => {
                                    if (window.innerWidth <= 990) {
                                        setCollegeDropdownOpen(!collegeDropdownOpen);
                                    }
                                }}
                            >
                                <span className="dropdown-trigger" style={{ gap: '5px' }}>
                                    Read About Colleges <span style={{ fontSize: '0.8em', marginTop: '2px' }}>{collegeDropdownOpen ? "▲" : "▼"}</span>
                                </span>
                                {collegeDropdownOpen && (
                                    <ul className="dropdown-menu">
                                        <li>
                                            <button 
                                                style={{ background: 'none', border: 'none', color: '#10c3bc', padding: '0.75rem 1.5rem', cursor: 'pointer', textAlign: 'left', width: '100%', fontWeight: '500', fontSize: '16px' }}
                                                onClick={() => { handleSwitchNav('college'); setCollegeDropdownOpen(false); }}
                                            >
                                                Switch to Find Colleges
                                            </button>
                                        </li>
                                        <li><Link to="/home" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                                        <li><Link to="/ComingSoon" onClick={() => setIsMenuOpen(false)}>Talk to IITian</Link></li>
                                        <li><Link to="/branch-comparison" onClick={() => setIsMenuOpen(false)}>Branch Comparison</Link></li>
                                        <li><Link to="/college-predictor" onClick={() => setIsMenuOpen(false)}>College Predictor</Link></li>
                                    </ul>
                                )}
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/home" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                            <li><Link to="/ComingSoon" onClick={() => setIsMenuOpen(false)}>Talk to IITian</Link></li>
                            <li><Link to="/branch-comparison" onClick={() => setIsMenuOpen(false)}>Branch Comparison</Link></li>
                            <li><Link to="/college-predictor" onClick={() => setIsMenuOpen(false)}>College Predictor</Link></li>
                            
                            <li
                                className="nav-dropdown"
                                onMouseEnter={() => setJeeDropdownOpen(true)}
                                onMouseLeave={() => setJeeDropdownOpen(false)}
                                onClick={() => {
                                    if (window.innerWidth <= 990) {
                                        setJeeDropdownOpen(!jeeDropdownOpen);
                                    }
                                }}
                            >
                                <span className="dropdown-trigger" style={{ gap: '5px' }}>
                                    JEE Student<span style={{ fontSize: '0.8em', marginTop: '2px' }}>{jeeDropdownOpen ? "▲" : "▼"}</span>
                                </span>
                                {jeeDropdownOpen && (
                                    <ul className="dropdown-menu">
                                        <li>
                                            <button 
                                                style={{ background: 'none', border: 'none', color: '#10c3bc', padding: '0.75rem 1.5rem', cursor: 'pointer', textAlign: 'left', width: '100%', fontWeight: '500', fontSize: '16px' }}
                                                onClick={() => { handleSwitchNav('jee'); setJeeDropdownOpen(false); }}
                                            >
                                                Switch to JEE Preparation
                                            </button>
                                        </li>
                                        <li><Link to="/resources" onClick={() => setIsMenuOpen(false)}>Top Resources</Link></li>
                                        <li><Link to="/StudyWithIITians" onClick={() => setIsMenuOpen(false)}>Study With IITians</Link></li>
                                        <li><Link to="/energy-batch" onClick={() => setIsMenuOpen(false)}>Energy Batch</Link></li>
                                        <li><Link to="/cbt-portal" onClick={() => setIsMenuOpen(false)}>Test Portal</Link></li>
                                        <li><Link to="/pyq" onClick={() => setIsMenuOpen(false)}>Past Year Papers</Link></li>
                                    </ul>
                                )}
                            </li>
                        </>
                    )}

                    {isLoggedIn ? (
                        <button className="cta logout login-size" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>Sign Out</button>
                    ) : (
                        <button
                            className="cta login-size"
                            onClick={() => {
                                setIsMenuOpen(false);
                                navigate("/login", {
                                    state: { redirectTo: location.pathname }
                                });
                            }}
                        >
                            Login
                        </button>
                    )}

                </div>

                <div className="nav-actions">
                    <div className={`hamburger ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu} ref={hamburgerRef}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;
