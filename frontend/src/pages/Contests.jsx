import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Contests() {
  const [upcoming, setUpcoming] = useState([]);
  const [running, setRunning] = useState([]);
  const [past, setPast] = useState([]);
  const navigate = useNavigate();

  const fetchContests = async () => {
    const res = await axios.get(`${API_URL}/contests`);
    setUpcoming(res.data.upcoming || []);
    setRunning(res.data.running || []);
    setPast(res.data.past || []);
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const getUpcomingGroup = (contest) => {
    const title = contest.title || '';
    if (/biweekly/i.test(title)) return 'Biweekly';
    if (/weekly/i.test(title)) return 'Weekly';
    if (/daily/i.test(title)) return 'Daily';
    return 'Other';
  };

  const renderCard = (c, type) => (
    <div 
      key={c._id} 
      className="contest-card glass-panel transition-all hover-glow d-flex flex-column" 
      onClick={() => navigate(`/contests/${c._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
        <div>
          <h3 className="h5 fw-bold text-white mb-2">{c.title}</h3>
          <p className="text-muted-light mb-0">{c.description}</p>
        </div>
        <span className={`badge rounded-pill border px-3 py-2 ${
          type === 'running' ? 'border-success text-success bg-success bg-opacity-10' : 
          type === 'upcoming' ? 'border-warning text-warning bg-warning bg-opacity-10' : 
          'border-secondary text-secondary bg-secondary bg-opacity-10'
        }`}>
          {type.toUpperCase()}
        </span>
      </div>
      <div className="mt-auto pt-3 border-top border-white border-opacity-10 text-muted-light small fw-bold">
        {type === 'running' && 'Ends: '}
        {type === 'upcoming' && 'Starts: '}
        {type === 'past' && 'Ended: '}
        <span className="text-light">{new Date(type === 'upcoming' ? c.startTime : c.endTime).toLocaleString()}</span>
      </div>
    </div>
  );

  const renderGroup = (title, items) => {
    if (!items.length) return null;
    return (
      <div className="mb-4">
        <h3 className="h6 text-muted-light mb-3">{title}</h3>
        <div className="contest-grid">
          {items.map(c => renderCard(c, 'upcoming'))}
        </div>
      </div>
    );
  };

  const dailyContests = upcoming.filter(c => getUpcomingGroup(c) === 'Daily');
  const weeklyContests = upcoming.filter(c => getUpcomingGroup(c) === 'Weekly');
  const biweeklyContests = upcoming.filter(c => getUpcomingGroup(c) === 'Biweekly');
  const otherUpcoming = upcoming.filter(c => getUpcomingGroup(c) === 'Other');

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '1080px' }}>
        <div className="page-header">
          <h1 className="display-6 fw-bold mb-2">Contests</h1>
          <p className="text-muted-light mb-0">Browse live, upcoming, and past coding competitions with clean cards and easy navigation.</p>
        </div>

        <div className="mb-5">
          <h2 className="section-title">🔥 Running</h2>
          <div className="contest-grid">
            {running.length > 0 ? running.map(c => renderCard(c, 'running')) : <div className="glow-card p-4 text-muted-light">No running contests at the moment. Check back soon!</div>}
          </div>
        </div>

        <div className="mb-5">
          <h2 className="section-title mb-4">⏳ Upcoming</h2>
          <div className="contest-grid">
            {upcoming.length > 0 ? (
              upcoming.map(c => renderCard(c, 'upcoming'))
            ) : (
              <div className="glass-panel p-4 text-muted-light">No upcoming contests yet. Start a new challenge soon!</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="section-title">📜 Past</h2>
          <div className="contest-grid">
            {past.length > 0 ? past.map(c => renderCard(c, 'past')) : <div className="glow-card p-4 text-muted-light">No past contests found. Once you complete an event it will appear here.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
