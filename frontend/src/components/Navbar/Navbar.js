import React, { useState } from 'react';
import './Navbar.css';
import { FaHome, FaRegNewspaper, FaMapMarkedAlt, FaBookOpen, FaImages, FaInfoCircle, FaEnvelope, FaComments, FaChevronLeft, FaChevronRight, FaBars, FaUser} from 'react-icons/fa';
import logo from '../../assets/images/logo.png';
import { useNavigate } from "react-router-dom";

function Navbar() {
    const [collapsed, setCollapsed] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0); // ✅ Track active nav item
    const [isTablet, setIsTablet] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 768 && window.innerWidth <= 1024 : false));
    const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));

    const navigate = useNavigate();

    const navItems = [
        { icon: <FaHome />, label: 'Home', target: 'home' },
        { icon: <FaRegNewspaper />, label: 'Posts', target: 'posts' },
        { icon: <FaMapMarkedAlt />, label: 'Destinations', target: 'destinations' },
        { icon: <FaBookOpen />, label: 'Travel Stories', target: 'travel-stories' },
        { icon: <FaComments />, label: 'Messages', target: 'messages' },
        { icon: <FaImages />, label: 'Gallery', target: 'gallery' },
        { icon: <FaInfoCircle />, label: 'About', target: 'about' },
        { icon: <FaEnvelope />, label: 'Contact', target: 'contact' }
    ];

    const mobileNavItems = [
    ...navItems,
    { icon: <FaUser />, label: 'Login', target: 'login' }
    ];

  const handleNavClick = (target, index) => {
    setActiveIndex(index);
    setCollapsed(true);

    if (target === "login") {
        navigate("/login");
        return;
    }

    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const section = document.getElementById(target);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo-img" />
                {isMobile ? <span className="logo-text">Travलिन</span> : isTablet ? <span className="logo-text">Travलिन</span> : !collapsed && <span className="logo-text">Travलिन</span>}
            </div>

            <button className="mobile-menu-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle navigation menu">
                <FaBars />
            </button>

            <ul className="nav-items">
                {(isMobile ? mobileNavItems : isTablet ? mobileNavItems : navItems).map((item, index) => (
                    <li
                        key={index}
                        title={item.label}
                        data-label={item.label}
                        className={index === activeIndex ? 'active' : ''}
                        onClick={() => handleNavClick(item.target, index)}
                    >
                        {item.icon}
                        {!collapsed && <span className="label">{item.label}</span>}
                    </li>
                ))}
            </ul>

            <div className="toggle-container" onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </div>
        </div>
    );
}

export default Navbar;