import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BrainCircuit, CheckCircle, CodeSquare, Clock, Trophy } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [provider, setProvider] = useState('gemini');

  const [alertMessage, setAlertMessage] = useState(null);

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setAlertMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/questions/generate`,
        { topic, difficulty, provider },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAlertMessage({ type: 'success', text: `Problem "${res.data.title}" generated successfully!` });
      setTopic('');
    } catch (err) {
      setAlertMessage({ type: 'danger', text: err.response?.data?.message || 'Error generating problem' });
    }
    setGenerating(false);
    
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  if (!user) return <div className="text-center mt-5 pt-5">Please log in.</div>;

  return (
    <div className="py-5 px-3" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="container position-relative">
        
        {alertMessage && (
          <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3 mt-4" style={{ zIndex: 1050, animation: 'fadeInDown 0.3s ease-out' }}>
            <div className={`alert alert-${alertMessage.type} shadow-lg border-0 px-4 py-3 fw-bold d-flex align-items-center mb-0 gap-2`} style={{ borderRadius: '12px' }}>
               {alertMessage.text}
            </div>
          </div>
        )}

        <header className="mb-5">
          <h1 className="h2 fw-bold">Welcome back, {user.username}!</h1>
          <p className="text-secondary mt-2">Here is your coding profile overview.</p>
        </header>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card bg-secondary border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center p-4">
                <div className="rounded-circle bg-dark p-3 me-3 d-flex justify-content-center align-items-center">
                  <Trophy className="text-info" style={{width:'2rem', height:'2rem'}} />
                </div>
                <div>
                  <p className="small text-light opacity-75 mb-1 fw-bold">Total Score</p>
                  <p className="h3 fw-bold mb-0">{user.score || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-secondary border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center p-4">
                <div className="rounded-circle bg-dark p-3 me-3 d-flex justify-content-center align-items-center">
                  <CheckCircle className="text-success" style={{width:'2rem', height:'2rem'}} />
                </div>
                <div>
                  <p className="small text-light opacity-75 mb-1 fw-bold">Problems Solved</p>
                  <p className="h3 fw-bold mb-0">{user.problemsSolved || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-secondary border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center p-4">
                <div className="rounded-circle bg-dark p-3 me-3 d-flex justify-content-center align-items-center">
                  <CodeSquare className="text-warning" style={{width:'2rem', height:'2rem'}} />
                </div>
                <div>
                  <p className="small text-light opacity-75 mb-1 fw-bold">Submissions</p>
                  <p className="h3 fw-bold mb-0">{submissions.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card bg-secondary border-0 shadow-sm overflow-hidden h-100">
              <div className="card-header bg-secondary border-dark py-3 px-4">
                <h3 className="h5 fw-bold mb-0">Recent Submissions</h3>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <p className="p-4 text-light opacity-75 mb-0">Loading submissions...</p>
                ) : submissions.length === 0 ? (
                  <p className="p-4 text-light opacity-75 mb-0">No submissions yet. Go solve some problems!</p>
                ) : (
                  <ul className="list-group list-group-flush border-top border-dark">
                    {submissions.slice(0, 5).map(sub => (
                      <li key={sub._id} className="list-group-item bg-secondary border-dark p-4 d-flex justify-content-between align-items-center">
                        <div>
                          <Link to={`/problems/${sub.question?._id}`} className="text-info fw-bold text-decoration-none">
                            {sub.question?.title || 'Deleted Problem'}
                          </Link>
                          <div className="d-flex align-items-center small text-light opacity-75 mt-2 gap-3">
                            <span className="d-flex align-items-center"><Clock className="me-1" style={{width:'14px', height:'14px'}}/> {new Date(sub.createdAt).toLocaleDateString()}</span>
                            <span>{sub.language}</span>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className={`badge rounded-pill px-3 py-2 ${
                            sub.status === 'Accepted' ? 'bg-success text-white' : 'bg-danger text-white'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card bg-dark border-primary shadow h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <BrainCircuit className="text-primary me-2" style={{width:'2rem', height:'2rem'}} />
                  <h3 className="h5 fw-bold mb-0 text-white">AI Problem Generator</h3>
                </div>
                <p className="small text-light opacity-75 mb-4">Create a custom coding challenge instantly using API.</p>



                <form onSubmit={handleGenerate}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Topic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Dynamic Programming, Arrays"
                      className="form-control bg-secondary text-light border-secondary"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Difficulty</label>
                    <select
                      className="form-select bg-secondary text-light border-secondary"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">AI Provider</label>
                    <select
                      className="form-select bg-secondary text-light border-secondary"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    >
                      <option value="gemini">Gemini AI</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    {provider === 'gemini' ? (
                      <>
                        <span className="badge bg-success px-3 py-2 me-2"> Gemini AI</span>
                        <span className="text-secondary small">Free · Powered by Google</span>
                      </>
                    ) : (
                      <>
                        <span className="badge bg-info px-3 py-2 me-2"> OpenAI</span>
                        <span className="text-secondary small">Requires OPENAI_API_KEY</span>
                      </>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={generating}
                    className="btn btn-primary w-100 fw-bold py-2"
                  >
                    {generating ? 'Generating...' : 'Generate Problem'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
