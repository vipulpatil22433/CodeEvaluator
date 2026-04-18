import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg px-3 py-3 sticky-top">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand fw-bold text-gradient">
          <Code2 className="me-2" />
          CodeEvaluator AI
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {user ? (
              <>
                <li className="nav-item">
                  <Link to="/" className="nav-link px-3">Home</Link>
                </li>
                <li className="nav-item">
                  <Link to="/contests" className="nav-link px-3 fw-bold" style={{ color: 'var(--accent-cyan)' }}>Contests</Link>
                </li>
                <li className="nav-item">
                  <Link to="/problems" className="nav-link px-3">Problems</Link>
                </li>
                <li className="nav-item">
                  <Link to="/leaderboard" className="nav-link px-3 fw-bold" style={{ color: 'var(--accent-purple)' }}>Leaderboard</Link>
                </li>
                <li className="nav-item">
                  <Link to="/insights" className="nav-link px-3 fw-bold" style={{ color: 'var(--accent-orange, #fb923c)' }}>Insights</Link>
                </li>
                {user.isAdmin && (
                  <li className="nav-item">
                    <Link to="/admin/contests" className="nav-link px-3 fw-bold text-info">Admin</Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link px-3 d-flex align-items-center">
                    <UserIcon className="me-1" style={{width: '1rem', height: '1rem'}} />
                    {user.username}
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm d-flex align-items-center mt-2 mt-lg-0"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                  >
                    <LogOut className="me-1" style={{width: '1rem', height: '1rem'}} />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/" className="nav-link px-3">Home</Link>
                </li>
                <li className="nav-item">
                  <Link to="/contests" className="nav-link px-3 fw-bold" style={{ color: 'var(--accent-cyan)' }}>Contests</Link>
                </li>
                <li className="nav-item">
                  <Link to="/problems" className="nav-link px-3">Problems</Link>
                </li>
                <li className="nav-item">
                  <Link to="/insights" className="nav-link px-3 fw-bold" style={{ color: 'var(--accent-orange, #fb923c)' }}>Insights</Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link px-3">Login</Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link to="/register" className="btn btn-primary btn-sm px-4 mt-2 mt-lg-0 rounded-pill">Get Started</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
