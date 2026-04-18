import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Users, CheckCircle, ChevronLeft } from 'lucide-react';

export default function ContestResults() {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [resultsRes, contestRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/contests/${id}/results`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/contests/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setResults(resultsRes.data);
        setContest(contestRes.data.contest);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-info" role="status"></div>
      </div>
    );
  }

  return (
    <div className="page-container container py-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/admin/contests" className="btn btn-outline-light btn-sm d-flex align-items-center gap-1">
          <ChevronLeft size={18} /> Back
        </Link>
        <h1 className="h3 fw-bold mb-0">Contest Standings: <span className="text-info">{contest?.title}</span></h1>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-panel p-4 text-center">
            <Users className="text-info mb-2" size={32} />
            <div className="h2 fw-bold">{results.length}</div>
            <div className="text-muted-light small text-uppercase">Participants</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel p-4 text-center">
            <CheckCircle className="text-success mb-2" size={32} />
            <div className="h2 fw-bold">
              {results.reduce((acc, curr) => acc + curr.solvedCount, 0)}
            </div>
            <div className="text-muted-light small text-uppercase">Total Solved</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel p-4 text-center">
            <Trophy className="text-warning mb-2" size={32} />
            <div className="h2 fw-bold text-gradient">
                {results.length > 0 ? results[0].username : 'N/A'}
            </div>
            <div className="text-muted-light small text-uppercase">Current Leader</div>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-glass">
        <table className="table table-dark table-hover mb-0 custom-table">
          <thead>
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="py-3">User</th>
              <th className="py-3">Email</th>
              <th className="py-3 text-center">Solved</th>
              <th className="px-4 py-3 text-end">Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((res, index) => (
                <tr key={res.userId} className="align-middle border-glass">
                  <td className="px-4 py-3">
                    <span className={`badge ${index < 3 ? 'bg-warning text-dark' : 'bg-secondary'} rounded-circle`} style={{ width: '2rem', height: '2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 fw-bold">{res.username}</td>
                  <td className="py-3 text-muted-light">{res.email}</td>
                  <td className="py-3 text-center">
                    <span className="badge bg-info bg-opacity-10 text-info px-3">{res.solvedCount} Problems</span>
                  </td>
                  <td className="px-4 py-3 text-end fw-bold text-success fs-5">
                    {res.marks} <span className="small opacity-50">pts</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted-light">
                  No submissions recorded for this contest yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
