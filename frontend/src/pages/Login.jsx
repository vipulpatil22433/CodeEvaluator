import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center py-5 px-3" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="card bg-secondary border-0 shadow-lg p-5" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center h3 fw-bold mb-4">Sign in to your account</h2>
        
        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger p-2 text-center small">{error}</div>}
          
          <div className="mb-3">
            <input
              type="email"
              required
              className="form-control bg-dark text-light border-dark"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <input
              type="password"
              required
              className="form-control bg-dark text-light border-dark"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-medium mb-3">
            Sign in
          </button>
        </form>
        
        <div className="text-center small opacity-75">
          Don't have an account? <Link to="/register" className="text-info text-decoration-none">Register here</Link>
        </div>
      </div>
    </div>
  );
}
