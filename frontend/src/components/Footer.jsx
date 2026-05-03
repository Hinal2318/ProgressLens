import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Progress<span>Lens</span>
          </Link>
          <p>Empowering academic excellence through transparent project tracking and collaborative workflows.</p>
          <div className="social-links">
            <a href="#" className="social-icon"><Github size={20} /></a>
            <a href="#" className="social-icon"><Twitter size={20} /></a>
            <a href="#" className="social-icon"><Linkedin size={20} /></a>
            <a href="#" className="social-icon"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h4>Platform</h4>
            <Link to="/student/dashboard">Student Portal</Link>
            <Link to="/faculty/dashboard">Faculty Portal</Link>
            <Link to="/project-manager">Project Manager</Link>
          </div>
          <div className="link-group">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">Support Center</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="link-group">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Feedback</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ProgressLens. All rights reserved.</p>
      </div>
    </footer>
  );
}
