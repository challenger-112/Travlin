import './Footer.css';
import { FaHome, FaRegNewspaper, FaMapMarkedAlt, FaBookOpen, FaRoute, FaImages, FaInfoCircle, FaEnvelope, FaComments, FaChevronLeft, FaChevronRight, FaBars, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import logo from '../../assets/images/logo.png';

function Footer() {

  return (
    <footer id="contact" className="footer-container">
        <div className="footer-content">
    
          {/* 🔷 Contact Details */}
          <div className="footer-section contact-section">
            <h3>GET IN TOUCH</h3>
            <p><FaEnvelope /> info@travlin.com</p>
            <p><FaPhoneAlt /> +91 123456XXXX</p>
            <p><FaMapMarkerAlt /> Gorakhpur, India</p>
          </div>
    
          <div className="footer-section contact-section">
            <h3>ABOUT US</h3>
              <a href="#">How it works</a>
              <a href="#">Start Planning</a>
              <a href="#">Posts</a>
          </div>           
    
          {/* 🔷 Social Links */}
          <div className="footer-section links-section">
            <h3>GET SOCIAL</h3>
            <div className="social-icons">
              <a href="#"><FaFacebook /> Facebook</a>
              <a href="#"><FaInstagram /> Instagram</a>
              <a href="#"><FaTwitter /> Twitter</a>
            </div>
          </div>
        </div>
    
        {/* 🔷 Bottom section */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <img src={logo} alt="Logo" className="footer-bottom-logo" />
            <span className="footer-bottom-name">Travलिन</span>
            <p>Your personalized travel companion.</p>
          </div>
    
          <div className="footer-divider" />
    
          <div className="footer-bottom-right">
            <p>Copyright © {new Date().getFullYear()} Travलिन. All rights reserved.</p>
          </div>
        </div>
    </footer>
  );

}

export default Footer;