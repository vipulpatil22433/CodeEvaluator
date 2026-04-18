import React from 'react';
import { Mail, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer mt-auto py-4 bg-dark border-top border-secondary">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <span className="text-secondary small">
              © 2026 <span className="text-light fw-bold">CodeEvaluator AI</span>. All rights reserved.
            </span>
          </div>
          
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <div className="d-flex justify-content-center align-items-center gap-4">
              <a href="https://github.com" className="text-secondary hover-light transition" title="GitHub">
                <Github size={20} />
              </a>
              <a href="mailto:CodeEvaluator@gmail.com" className="text-secondary hover-light transition d-flex align-items-center gap-2" title="Contact Us">
                <Mail size={20} />
                <span className="small">CodeEvaluator@gmail.com</span>
              </a>
            </div>
          </div>
          
          <div className="col-md-4 text-center text-md-end">
            <span className="text-secondary small d-flex align-items-center justify-content-center justify-content-md-end gap-1">
              Made with <Heart size={14} className="text-danger" fill="#dc3545" /> for Developers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
