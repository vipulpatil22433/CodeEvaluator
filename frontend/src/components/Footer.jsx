import React from 'react';

export default function Footer() {
  return (
    <footer className="footer mt-auto py-4 bg-dark border-top border-secondary">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <span className="text-secondary small">
              © 2026 <span className="text-light fw-bold">CodeEvaluator AI</span>. All rights reserved.
            </span>
          </div>
          
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end align-items-center gap-3">
               <a href="mailto:CodeEvaluator@gmail.com" className="text-info text-decoration-none small fw-bold">
                 CodeEvaluator@gmail.com
               </a>
               <span className="text-secondary opacity-50 small">|</span>
               <span className="text-secondary small">Made for Developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
