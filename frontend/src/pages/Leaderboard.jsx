import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star } from 'lucide-react';

export default function Leaderboard() {
  const [globalData, setGlobalData] = useState([]);
  const [contestData, setContestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/leaderboard`);
        setGlobalData(res.data.globalRanking || []);
        setContestData(res.data.contestRanking || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const renderTable = (data, type) => (
    <div className="glass-panel overflow-hidden">
      <div className="table-responsive">
        <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
          <thead>
            <tr>
              <th className="px-4 py-3 border-bottom border-light border-opacity-10 opacity-75">Rank</th>
              <th className="px-4 py-3 border-bottom border-light border-opacity-10 opacity-75">User</th>
              <th className="px-4 py-3 border-bottom border-light border-opacity-10 opacity-75 text-end">
                {type === 'global' ? 'Total Solved' : 'Contest Solved'}
              </th>
              <th className="px-4 py-3 border-bottom border-light border-opacity-10 opacity-75 text-end">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => {
              let rowClass = "";
              if (index === 0) rowClass = "text-warning fw-bold bg-warning bg-opacity-10";
              else if (index === 1) rowClass = "text-light fw-bold bg-light bg-opacity-10";
              else if (index === 2) rowClass = "fw-bold";

              return (
                <tr key={user._id} className={rowClass}>
                  <td className="px-4 py-3 border-light border-opacity-10 align-middle">
                    {index === 0 && <Trophy size={18} className="me-2 text-warning" />}
                    {index === 1 && <Medal size={18} className="me-2 text-light" />}
                    {index === 2 && <Star size={18} className="me-2" style={{color: '#cd7f32'}} />}
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 border-light border-opacity-10 align-middle">
                    <span style={{ color: index === 2 ? '#cd7f32' : 'inherit' }}>{user.username}</span>
                  </td>
                  <td className="px-4 py-3 border-light border-opacity-10 align-middle text-end font-monospace">
                    {type === 'global' ? user.problemsSolved : (user.contestProblemsSolved || 0)}
                  </td>
                  <td className="px-4 py-3 border-light border-opacity-10 align-middle text-end text-info font-monospace">
                    {type === 'global' ? user.score : (user.contestProblemsSolved || 0) * 10}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-5 text-muted-light border-0">
                  No ranking data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="page-container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-5 px-3">
      <div className="container" style={{ maxWidth: '900px' }}>
        
        <div className="text-center mb-5 fade-in">
           <Trophy size={56} className="text-warning mb-3" />
           <h1 className="display-5 fw-bold mb-3">Global <span className="text-gradient">Leaderboard</span></h1>
           <p className="text-muted-light fs-5">See how you stack up against the best coders on the platform.</p>
        </div>

        <div className="d-flex justify-content-center mb-5 fade-in">
          <div className="btn-group shadow p-1 glass-panel rounded-pill" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button 
              className={`btn rounded-pill px-4 py-2 ${activeTab === 'global' ? 'btn-primary fw-bold shadow-sm' : 'btn-link text-light text-decoration-none'}`}
              onClick={() => setActiveTab('global')}
            >
              Overall Ranking
            </button>
            <button 
              className={`btn rounded-pill px-4 py-2 ${activeTab === 'contest' ? 'btn-primary fw-bold shadow-sm' : 'btn-link text-light text-decoration-none'}`}
              onClick={() => setActiveTab('contest')}
            >
              Contest Ranking
            </button>
          </div>
        </div>

        <div className="fade-in">
          {activeTab === 'global' ? renderTable(globalData, 'global') : renderTable(contestData, 'contest')}
        </div>

      </div>
    </div>
  );
}
