import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, Plus, Trash2, Search, CheckSquare, Square, Trophy, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ManualQuestionModal from '../components/ManualQuestionModal';

export default function AdminContestManager() {
  const { user } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [contestRes, qRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/contests`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/questions/admin/all`, config)
      ]);
      
      const allContests = [
        ...(contestRes.data.upcoming || []),
        ...(contestRes.data.running || []),
        ...(contestRes.data.past || [])
      ];
      
      setContests(allContests);
      setQuestions(qRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleQuestion = (id) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qid => qid !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question.");
      return;
    }
    
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/contests`, {
        title,
        description,
        startTime,
        endTime,
        questions: selectedQuestions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setContests([res.data, ...contests]);
      // Reset form
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setSelectedQuestions([]);
      alert("Contest created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create contest");
    }
    setCreating(false);
  };

  const handleDeleteContest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/contests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContests(contests.filter(c => c._id !== id));
    } catch (err) {
      alert("Failed to delete contest");
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (!user || !user.isAdmin) return <div className="p-5 text-center">Unauthorized. Admins only.</div>;

  return (
    <div className="container py-5">
      <h1 className="h2 fw-bold mb-4 d-flex align-items-center">
        <Calendar className="me-2 text-primary" />
        Contest Management
      </h1>

      <div className="row g-4">
        {/* Create Form */}
        <div className="col-lg-5">
          <div className="card bg-secondary border-0 shadow-sm">
            <div className="card-body p-4">
              <h3 className="h5 fw-bold mb-4">Create New Contest</h3>
              <form onSubmit={handleCreateContest}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Title</label>
                  <input type="text" className="form-control bg-dark text-white border-0" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Weekly Challenge #1" />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Description</label>
                  <textarea className="form-control bg-dark text-white border-0" rows="2" required value={description} onChange={e=>setDescription(e.target.value)} placeholder="Brief description of the contest..." />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Start Time</label>
                    <input type="datetime-local" className="form-control bg-dark text-white border-0" required value={startTime} onChange={e=>setStartTime(e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">End Time</label>
                    <input type="datetime-local" className="form-control bg-dark text-white border-0" required value={endTime} onChange={e=>setEndTime(e.target.value)} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold d-flex justify-content-between align-items-center mb-2">
                    Select Questions 
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(true)} 
                      className="btn btn-success btn-sm px-3 py-2 rounded-pill d-flex align-items-center gap-2 fw-bold shadow-sm"
                      style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#10b981', borderColor: '#10b981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)' }}
                    >
                      <Plus size={14} /> Add Question Manually
                    </button>
                  </label>
                  <div className="d-flex gap-2 mb-2">
                    <div className="input-group flex-grow-1">
                      <span className="input-group-text bg-dark border-0 text-secondary"><Search size={16} /></span>
                      <input type="text" className="form-control bg-dark text-white border-0" placeholder="Search questions..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                    </div>
                    <select
                      className="form-select bg-dark text-white border-0"
                      style={{ maxWidth: '110px' }}
                      value={difficultyFilter}
                      onChange={e => setDifficultyFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="bg-dark rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto', minHeight: '60px' }}>
                    {filteredQuestions.length === 0 ? (
                      <div className="text-center text-secondary small py-3">
                        {questions.length === 0
                          ? '📭 No questions yet. Use "Add Question Manually" or generate one from the Dashboard.'
                          : '🔍 No questions match your filter.'}
                      </div>
                    ) : (
                      filteredQuestions.map(q => (
                        <div key={q._id}
                          className={`d-flex align-items-center p-2 rounded mb-1 ${selectedQuestions.includes(q._id) ? 'bg-primary bg-opacity-25' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleQuestion(q._id)}
                        >
                          {selectedQuestions.includes(q._id) ? <CheckSquare size={18} className="text-primary me-2" /> : <Square size={18} className="text-secondary me-2" />}
                          <div className="small flex-grow-1">
                            <div className="fw-bold">{q.title}</div>
                            <span className={`badge ${
                              q.difficulty === 'Easy' ? 'bg-success' :
                              q.difficulty === 'Hard' ? 'bg-danger' : 'bg-warning text-dark'
                            } small`}>{q.difficulty}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button type="submit" disabled={creating} className="btn btn-primary w-100 fw-bold py-2 mt-2">
                  {creating ? 'Creating...' : 'Launch Contest'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Contest List */}
        <div className="col-lg-7">
          <div className="card bg-secondary border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h3 className="h5 fw-bold mb-4">Existing Contests</h3>
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : contests.length === 0 ? (
                <div className="text-center py-5 text-secondary">No contests created yet.</div>
              ) : (
                <div className="list-group list-group-flush">
                  {contests.map(c => (
                    <div key={c._id} className="list-group-item bg-transparent border-dark px-0 py-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h4 className="h6 fw-bold text-white mb-1">{c.title}</h4>
                          <div className="small text-secondary mb-2 d-flex gap-3">
                             <span className="d-flex align-items-center"><Clock size={14} className="me-1" /> {new Date(c.startTime).toLocaleDateString()}</span>
                             <span>{c.questions.length} Questions</span>
                          </div>
                        </div>
                        <div className="d-flex gap-3">
                          <Link to={`/admin/contests/${c._id}/results`} className="btn btn-link text-info p-0 border-0" title="View Standings">
                            <Trophy size={18} />
                          </Link>
                          <button onClick={() => handleDeleteContest(c._id)} className="btn btn-link text-danger p-0 border-0" title="Delete Contest">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ManualQuestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
