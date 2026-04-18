import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function ProblemList() {
  const { user } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/questions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProblems(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchProblems();
  }, []);

  const solvedIds = new Set((user?.solvedProblems || []).map((id) => id.toString()));
  const filteredProblems = problems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '1080px' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4 gap-3 page-header">
          <div>
            <h1 className="display-6 fw-bold mb-2">Coding Problems</h1>
            <p className="text-muted-light mb-0">Search through your current problem set and solve tasks with built-in editor support.</p>
          </div>
          <div className="position-relative" style={{ width: '100%', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Search problems..."
              className="form-control form-control-dark ps-5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="position-absolute text-light opacity-50" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', width: '18px' }} />
          </div>
        </div>

        <div>
          {loading ? (
            <div className="p-5 text-center text-light opacity-50">Loading problems...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="p-5 text-center text-light opacity-50">No problems found. Generate some in the dashboard!</div>
          ) : (
            <div className="problem-grid">
              {filteredProblems.map(problem => (
                <div key={problem._id} className="problem-card glass-panel">
                  <h3 className="fw-bold text-white">{problem.title}</h3>
                  <p className="mb-4">Solve this problem using JavaScript, Python, or C++ and submit your code for hidden test case validation.</p>
                  <div className="problem-card-footer">
                    <span className={`badge rounded-pill ${
                      problem.difficulty === 'Easy' ? 'bg-success' :
                      problem.difficulty === 'Medium' ? 'bg-warning text-dark' :
                      'bg-danger'
                    }`}>
                      {problem.difficulty}
                    </span>
                    {solvedIds.has(problem._id) ? (
                      <button className="btn btn-success btn-sm px-3 fw-bold" disabled>
                        <CheckCircle2 className="me-1" style={{ width: '1rem', height: '1rem' }} />
                        Solved
                      </button>
                    ) : (
                      <Link to={`/problems/${problem._id}`} className="btn btn-primary btn-sm px-3 fw-bold">
                        Solve
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
