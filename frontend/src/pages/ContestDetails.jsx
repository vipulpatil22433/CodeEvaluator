import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';


function ContestDetails() {
  const { id } = useParams();

  const [contest, setContest] = useState(null);
  const [solved, setSolved] = useState([]); //  NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const token = localStorage.getItem("token"); //  FIX
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/contests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}` //  FIX
            }
          }
        );

        //  BACKEND RETURNS { contest, solvedProblems }
        setContest(response.data.contest);
        setSolved(response.data.solvedProblems || []);

      } catch (err) {
        console.error('Failed to fetch contest', err);
        setError('Failed to load contest details.');
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="container py-5 text-center text-danger">
        <h4>{error || 'Contest not found'}</h4>
        <Link to="/contests" className="btn btn-outline-light mt-3">
          Back to Contests
        </Link>
      </div>
    );
  }

  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);

  const isUpcoming = startTime > now;
  const isActive = startTime <= now && endTime >= now;
  const isPast = endTime < now;

  let statusBadge = null;
  if (isUpcoming) statusBadge = <span className="badge bg-info ms-3">Upcoming</span>;
  if (isActive) statusBadge = <span className="badge bg-success ms-3">Active</span>;
  if (isPast) statusBadge = <span className="badge bg-secondary ms-3">Ended</span>;

  const renderDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return <span className="badge bg-success">Easy</span>;
      case 'Medium': return <span className="badge bg-warning text-dark">Medium</span>;
      case 'Hard': return <span className="badge bg-danger">Hard</span>;
      default: return <span className="badge bg-secondary">{difficulty}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link to="/contests" className="btn btn-outline-light btn-sm px-3 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-2 mb-2 text-decoration-none transition-all hover-glow" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
          ← Back to Contests
        </Link>
  
        <div className="glass-panel mt-3 p-4 p-md-5 text-center position-relative overflow-hidden">
          <h1 className="display-6 fw-bold mb-3">{contest.title} {statusBadge}</h1>
          <p className="text-muted-light fs-5 mb-4">{contest.description}</p>
  
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 text-light">
            <div className="p-3 rounded-4 shadow-sm border border-white border-opacity-10 w-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="small text-muted-light mb-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Start Time</div>
              <div className="fw-bold">{startTime.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-4 shadow-sm border border-white border-opacity-10 w-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="small text-muted-light mb-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>End Time</div>
              <div className="fw-bold">{endTime.toLocaleString()}</div>
            </div>
          </div>
        </div>
  
        {!isUpcoming && (
          <div className="mt-5">
            <h3 className="h4 fw-bold mb-4">Challenge Problems</h3>
  
            {contest.questions?.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {contest.questions.map((q, index) => {
                  //  CHECK IF SOLVED
                  const isSolved = solved.some(
                    (id) => id.toString() === q._id.toString()
                  );
  
                  return (
                    <div key={q._id} className="glass-panel p-3 px-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center border border-white border-opacity-10 transition-all hover-glow">
                      <div className="d-flex align-items-center gap-3 mb-3 mb-sm-0">
                        <div className="text-muted-light fw-bold fs-5 opacity-50">#{index + 1}</div>
                        <div className="text-white fw-bold fs-5">{q.title}</div>
                        <div>{renderDifficulty(q.difficulty)}</div>
                      </div>
  
                      <div>
                        {isSolved ? (
                          <button className="btn btn-success px-4 fw-bold shadow-sm" disabled>
                             Solved
                          </button>
                        ) : (
                          <Link
                            to={`/problems/${q._id}?contestId=${id}`}
                            className="btn btn-primary px-4 fw-bold shadow-sm"
                          >
                            Solve
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-5 text-center text-muted-light">No problems found for this contest.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContestDetails;