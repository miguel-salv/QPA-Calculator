import QpaCalculator from '@/components/QpaCalculator';
import { Mail, Github } from 'lucide-react';
import '@/styles/pages/home.css';

export default function Home() {
  return (
    <main className="main-container">
      <h1 className="page-title">
        CMU QPA Calculator
      </h1>
      <div className="content-container">
        <QpaCalculator />
      </div>
      
      <footer className="page-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-heading">CMU QPA Calculator</h3>
              <div className="space-y-2">
                <p className="footer-text">
                  Not officially associated with Carnegie Mellon University
                </p>
                <p className="footer-copyright">
                  Copyright © {new Date().getFullYear()}
                </p>
              </div>
            </div>
            <div className="footer-section">
              <h4 className="footer-subheading">Created by</h4>
              <p className="footer-text">Miguel Salvacion</p>
              <div className="footer-contact">
                <a 
                  href="mailto:msalvaci@andrew.cmu.edu" 
                  className="footer-link"
                >
                  <Mail className="footer-icon" />
                  <span>msalvaci@andrew.cmu.edu</span>
                </a>
                <a 
                  href="https://github.com/miguel-salv" 
                  className="footer-link"
                >
                  <Github className="footer-icon" />
                  <span>GitHub Profile</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

