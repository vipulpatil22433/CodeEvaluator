import React, { useEffect, useState, useContext } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { AuthContext } from '../context/AuthContext';
import { Play } from 'lucide-react';

const languageOptions = [
  { value: 'javascript', label: 'JavaScript', id: 63, defaultCode: 'function solve(input) {\n  // Your code here\n  return input;\n}' },
  { value: 'python', label: 'Python (3.8)', id: 71, defaultCode: 'def solve(input):\n  # Your code here\n  pass' },
  { value: 'cpp', label: 'C++', id: 54, defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n  // Your code here\n  return 0;\n}' }
];

export default function CodeEditorPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get('contestId');
  const { user, fetchUser } = useContext(AuthContext);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(languageOptions[0].defaultCode);
  const [language, setLanguage] = useState('javascript');
  const [languageId, setLanguageId] = useState(63);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/questions/${id}`);
        setProblem(res.data);
        // Only set default code on first load, not on language change
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();
  }, [id]);

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    const opt = languageOptions.find(l => l.value === val);
    setLanguage(val);
    setLanguageId(opt.id);
    setCode(opt.defaultCode);
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please login to submit code!");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/submissions`, {
        questionId: id,
        code,
        language,
        languageId,
        contestId: contestId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      
      // Sync user data so the new solved problem instantly updates the global memory
      if (res.data.submission?.status === 'Accepted') {
        fetchUser();
      }
    } catch (err) {
      setResult({ error: err.response?.data?.message || 'Submission failed' });
    }
    setSubmitting(false);
  };

  if (!problem) return <div className="p-5 text-center">Loading problem...</div>;

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="d-flex flex-column flex-md-row editor-shell">

        {/* Problem Description Panel */}
        <div className="w-100 overflow-auto p-4 border-end border-secondary problem-panel" style={{ width: '50%', maxHeight: 'calc(100vh - 4rem)' }}>
        <h1 className="h2 fw-bold mb-3">{problem.title}</h1>
        <div className="d-flex align-items-center mb-4">
          <span className={`badge ${
            problem.difficulty === 'Easy' ? 'bg-success' :
            problem.difficulty === 'Medium' ? 'bg-warning text-dark' :
            'bg-danger'
          }`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="mb-5 text-light opacity-75" style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui' }}>
          {problem.description}
        </div>

        {problem.examples && problem.examples.length > 0 && (
          <div className="mb-5">
            <h3 className="h5 fw-bold mb-3">Examples:</h3>
            {problem.examples.map((ex, i) => (
              <div key={i} className="card example-card border-0 rounded-3 mb-3 font-monospace small shadow-sm">
                <p className="mb-1"><span className="fw-bold">Input:</span> <span>{ex.input}</span></p>
                <p className="mb-1"><span className="fw-bold">Output:</span> <span>{ex.output}</span></p>
                {ex.explanation && <p className="mt-2 mb-0"><span className="fw-bold">Explanation:</span> {ex.explanation}</p>}
              </div>
            ))}
          </div>
        )}

        {problem.constraints && problem.constraints.length > 0 && (
          <div>
            <h3 className="h6 fw-bold mb-3">Constraints:</h3>
            <ul className="list-unstyled card bg-secondary border-0 p-3 rounded-3 shadow-sm font-monospace small">
              {problem.constraints.map((c, i) => <li key={i} className="mb-1 text-warning">• {c}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Editor Panel */}
      <div className="w-100 d-flex flex-column editor-panel" style={{ width: '50%', backgroundColor: '#1e1e1e', maxHeight: 'calc(100vh - 4rem)' }}>
        <div className="d-flex justify-content-between align-items-center bg-dark p-2 border-bottom border-secondary">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="form-select form-select-sm w-auto shadow-none"
          >
            {languageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-success btn-sm fw-bold d-flex align-items-center px-3"
          >
            {submitting
              ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              : <Play className="me-2" style={{ width: '1rem', height: '1rem' }} />
            }
            Submit Code
          </button>
        </div>

        <div className="flex-grow-1 code-area" style={{ minHeight: 0, overflow: 'hidden' }}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              }
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="output-panel overflow-auto position-relative" style={{ minHeight: '250px', backgroundColor: 'var(--bg-surface)', borderTop: '2px solid var(--border-glass)' }}>
          <div className="p-3">
            <h3 className="h6 text-light opacity-50 fw-bold mb-3 text-uppercase">Execution Result</h3>
            {!result && <p className="text-light opacity-50 small">Run your code to see the output here.</p>}
            {result && result.error && (
              <p className="text-danger font-monospace small" style={{ whiteSpace: 'pre-wrap' }}>{result.error}</p>
            )}
            {result && result.submission && (
              <div>
                <div className={`h5 fw-bold mb-2 ${result.submission.status === 'Accepted' ? 'text-success' : 'text-danger'}`}>
                  {result.submission.status}
                </div>
              <div className="d-flex gap-4 small text-light opacity-75 mb-3">
                <span>Cases Passed: <strong className="text-light">{result.submission.passedCases}/{result.submission.totalCases}</strong></span>
                <span>Time: <strong className="text-light">{result.submission.executionTime}s</strong></span>
              </div>

              {result.failedCaseInfo && (
                <div className="alert alert-danger p-3 rounded-2 small font-monospace mt-2 border-0 bg-danger bg-opacity-10 text-danger">
                  {result.failedCaseInfo.error ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{result.failedCaseInfo.error}</div>
                  ) : (
                    <>
                      <div className="mb-2"><span className="fw-bold opacity-75">Input:</span><br />{result.failedCaseInfo.input}</div>
                      <div className="mb-2"><span className="fw-bold opacity-75">Expected:</span><br /><span className="text-success">{result.failedCaseInfo.expected}</span></div>
                      <div><span className="fw-bold opacity-75">Actual:</span><br />{result.failedCaseInfo.actual}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
