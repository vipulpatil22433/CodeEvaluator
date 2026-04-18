import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center py-5 px-3" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="card bg-secondary border-0 shadow-lg p-5" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center h3 fw-bold mb-4">Create an account</h2>
        
        <form onSubmit={handleRegister}>
          {error && <div className="alert alert-danger p-2 text-center small">{error}</div>}
          
          <div className="mb-3">
            <input
              type="text"
              required
              className="form-control bg-dark text-light border-dark"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

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
            Sign up
          </button>
        </form>
        
        <div className="text-center small opacity-75">
          Already have an account? <Link to="/login" className="text-info text-decoration-none">Login here</Link>
        </div>
      </div>
    </div>
  );
}
