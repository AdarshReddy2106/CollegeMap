import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.scss";
import logo from "../../assets/logo/collegeMapLogo.png";
import { useLocation } from "react-router-dom";


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);
    const location = useLocation();


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
        navigate("/MobileLogin");
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                    <li><Link to="/HowItWorks" onClick={() => setIsMenuOpen(false)}>How It Works?</Link></li>
                    <li><Link to="/AboutUs" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
                    <li><Link to="/resources" onClick={() => setIsMenuOpen(false)}>Resources</Link></li>
                    {/* <li><Link to="https://collegemap1.wordpress.com/" onClick={() => setIsMenuOpen(false)}>IIT News</Link></li> */}
                    <li><Link to="https://wa.link/lo05a1" onClick={() => setIsMenuOpen(false)}>Talk to an IITian</Link></li>
                    <li><Link to="/ComingSoon" onClick={() => setIsMenuOpen(false)}>IIT News</Link></li>
                    <li><Link to="/news" onClick={() => setIsMenuOpen(false)}>News</Link></li>
                    {/* <li><Link to="/ComingSoon" onClick={() => setIsMenuOpen(false)}>Talk to an IITian</Link></li> */}
                    <li><Link to="/Contact-Us" onClick={() => setIsMenuOpen(false)}>Contact Us</Link></li>
                    <li><Link to="/seminar" onClick={() => setIsMenuOpen(false)}>Seminar</Link></li>

                    {isLoggedIn ? (
                        <button className="cta logout login-size" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>Sign Out</button>
                    ) : (
                        <button
                            className="cta login-size"
                            onClick={() => {
                                setIsMenuOpen(false);
                                navigate("/MobileLogin", {
                                    state: { redirectTo: location.pathname }
                                });
                            }}
                        >
                            Login
                        </button>
                    )}

                </div>

                <div className="nav-actions">
                    <Link to="/seminar" className="cta">Seminar</Link>

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
