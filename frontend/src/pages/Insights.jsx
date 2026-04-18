import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Target } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Insights() {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/submissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubmissions(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (user) fetchSubmissions();
  }, [user]);

  if (!user) return <div className="text-center mt-5 pt-5">Please log in to view insights.</div>;

  const outcomeData = [
    { name: 'Accepted', value: submissions.filter(s => s.status === 'Accepted').length },
    { name: 'Failed', value: submissions.filter(s => s.status !== 'Accepted').length }
  ].filter(d => d.value > 0);

  const langCounts = {};
  submissions.forEach(s => {
    langCounts[s.language] = (langCounts[s.language] || 0) + 1;
  });
  const langData = Object.keys(langCounts).map(key => ({
    name: key,
    count: langCounts[key]
  }));

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="py-5 px-3" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="container">
        <header className="mb-5">
          <h1 className="h2 fw-bold d-flex align-items-center">
            <TrendingUp className="me-3 text-primary" style={{width: '2.5rem', height: '2.5rem'}} />
            Performance Insights
          </h1>
          <p className="text-secondary mt-2">A detailed breakdown of your coding progress and accuracy.</p>
        </header>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-5 glass-panel rounded-4">
            <Target className="text-secondary mb-3" style={{width: '4rem', height: '4rem'}} />
            <h3 className="h4 fw-bold">No Data Available</h3>
            <p className="text-secondary">Start solving problems to see your performance metrics here!</p>
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {/* Accuracy Chart */}
            <div className="col-lg-5">
              <div className="card bg-secondary border-0 shadow-sm overflow-hidden h-100">
                <div className="card-header bg-secondary border-dark py-3 px-4 d-flex align-items-center">
                  <PieChartIcon className="text-info me-2" style={{width:'1.2rem'}} />
                  <h3 className="h6 fw-bold mb-0">Submission Accuracy</h3>
                </div>
                <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center" style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={outcomeData}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {outcomeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex gap-4 mt-3 small fw-bold">
                     <span className="text-success d-flex align-items-center">
                       <span className="d-inline-block rounded-circle bg-success me-2" style={{width:'10px', height:'10px'}}></span>
                       Accepted
                     </span>
                     <span className="text-danger d-flex align-items-center">
                       <span className="d-inline-block rounded-circle bg-danger me-2" style={{width:'10px', height:'10px'}}></span>
                       Failed
                     </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Chart */}
            <div className="col-lg-7">
              <div className="card bg-secondary border-0 shadow-sm overflow-hidden h-100">
                <div className="card-header bg-secondary border-dark py-3 px-4 d-flex align-items-center">
                  <BarChart3 className="text-warning me-2" style={{width:'1.2rem'}} />
                  <h3 className="h6 fw-bold mb-0">Language Proficiency</h3>
                </div>
                <div className="card-body p-4" style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={langData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      />
                      <Bar dataKey="count" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Added a nice Summary Card at the bottom */}
            <div className="col-12">
               <div className="card bg-dark border-secondary p-4 rounded-4 shadow-lg">
                  <div className="row align-items-center text-center text-md-start">
                     <div className="col-md-8">
                        <h4 className="fw-bold text-white mb-2">Detailed Statistics</h4>
                        <p className="text-secondary mb-0">You have completed <strong>{user.problemsSolved || 0}</strong> unique challenges across <strong>{langData.length}</strong> different programming languages. Keep pushing your limits!</p>
                     </div>
                     <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <Link to="/problems" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">Solve More Problems</Link>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
