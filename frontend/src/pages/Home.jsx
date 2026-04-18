import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, BrainCircuit, Trophy } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user } = useContext(AuthContext);
  const startLink = user ? '/problems' : '/register';

  return (
    <div className="page-container d-flex align-items-center">
      <div className="container" style={{ maxWidth: '1140px' }}>
        
        {/* HERO SECTION */}
        <div className="text-center mb-5 pb-4">
          <span className="section-title">CodeEvaluator AI</span>
          <h1 className="page-title mb-4">
            Master coding faster with<br />
            <span className="text-gradient">AI-powered practice</span>
          </h1>
          <p className="lead mx-auto mb-5" style={{ maxWidth: '600px', color: 'var(--text-secondary)' }}>
            Generate custom problems, write code in a beautiful modern editor, and validate your solutions instantly with hidden test cases.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to={startLink} className="btn btn-primary btn-lg rounded-pill px-5 py-3">
              {user ? 'Go to Problems' : 'Start Coding Now'}
            </Link>
            <Link to="/problems" className="btn btn-outline-light btn-lg rounded-pill px-5 py-3">
              Browse Library
            </Link>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="row g-4 mb-5">
          <div className="col-lg-4">
            <div className="feature-card glass-panel text-center">
              <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
                <BrainCircuit size={32} />
              </div>
              <h3>AI Generated Challenges</h3>
              <p>Create problems on demand tailored to any topic and difficulty. Let smart AI support your learning journey continuously.</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="feature-card glass-panel text-center">
              <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)' }}>
                <Terminal size={32} />
              </div>
              <h3>Instant Execution</h3>
              <p>Run your JavaScript, Python, or C++ solutions instantly inside our highly responsive coding environment.</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="feature-card glass-panel text-center">
              <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>
                <Trophy size={32} />
              </div>
              <h3>Track Your Progress</h3>
              <p>Compete in daily contests, earn points, save your best submissions, and build an impressive developer profile.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
