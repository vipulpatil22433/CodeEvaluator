import React, { useState } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function ManualQuestionModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState(['']);
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', isHidden: false }]);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddConstraint = () => setConstraints([...constraints, '']);
  const handleRemoveConstraint = (index) => setConstraints(constraints.filter((_, i) => i !== index));
  
  const handleAddExample = () => setExamples([...examples, { input: '', output: '', explanation: '' }]);
  const handleRemoveExample = (index) => setExamples(examples.filter((_, i) => i !== index));

  const handleAddTestCase = () => setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  const handleRemoveTestCase = (index) => setTestCases(testCases.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/questions/manual`, {
        title,
        difficulty,
        description,
        constraints: constraints.filter(c => c.trim()),
        examples: examples.filter(ex => ex.input.trim() || ex.output.trim()),
        testCases: testCases.filter(tc => tc.input.trim() || tc.expectedOutput.trim()),
        solution
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create question");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '80px 20px', backdropFilter: 'blur(4px)', overflowY: 'auto' }}
    >
      <div className="glass-panel w-100 shadow-lg border-glass" style={{ maxWidth: '850px', position: 'relative', marginBottom: '40px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 sticky-top bg-dark p-4 rounded-top border-bottom border-secondary" style={{ top: '-1px', zIndex: 10 }}>
          <h2 className="h4 fw-bold mb-0 text-gradient">Create Question Manually</h2>
          <button onClick={onClose} className="btn btn-link text-light p-0 border-0 hover-scale"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="row g-4 mb-4">
            <div className="col-md-8">
              <label className="form-label small fw-bold">Title</label>
              <input type="text" className="form-control bg-dark text-white border-glass" required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Sum of Two Integers" />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Difficulty</label>
              <select className="form-select bg-dark text-white border-glass" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Problem Description (Markdown supported)</label>
            <textarea className="form-control bg-dark text-white border-glass" rows="4" required value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the problem, input format, and output format..." />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold d-flex justify-content-between">Constraints <Plus className="text-primary cursor-pointer" size={18} onClick={handleAddConstraint} /></label>
            {constraints.map((c, i) => (
              <div key={i} className="d-flex gap-2 mb-2">
                <input type="text" className="form-control bg-dark text-white border-glass form-control-sm" value={c} onChange={e => {
                  const newC = [...constraints];
                  newC[i] = e.target.value;
                  setConstraints(newC);
                }} placeholder="e.g. 1 <= nums.length <= 100" />
                <button type="button" onClick={() => handleRemoveConstraint(i)} className="btn btn-link text-danger p-0 border-0"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold d-flex justify-content-between">Examples <Plus className="text-primary cursor-pointer" size={18} onClick={handleAddExample}/></label>
            {examples.map((ex, i) => (
              <div key={i} className="card bg-dark border-glass p-3 mb-3">
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <input type="text" className="form-control bg-secondary text-white border-0 form-control-sm" value={ex.input} onChange={e=>{
                      const newEx = [...examples];
                      newEx[i].input = e.target.value;
                      setExamples(newEx);
                    }} placeholder="Input" />
                  </div>
                  <div className="col-6">
                    <input type="text" className="form-control bg-secondary text-white border-0 form-control-sm" value={ex.output} onChange={e=>{
                      const newEx = [...examples];
                      newEx[i].output = e.target.value;
                      setExamples(newEx);
                    }} placeholder="Output" />
                  </div>
                </div>
                <input type="text" className="form-control bg-secondary text-white border-0 form-control-sm" value={ex.explanation} onChange={e=>{
                  const newEx = [...examples];
                  newEx[i].explanation = e.target.value;
                  setExamples(newEx);
                }} placeholder="Explanation (Optional)" />
                <button type="button" onClick={()=>handleRemoveExample(i)} className="btn btn-link text-danger p-0 border-0 text-end mt-2"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold d-flex justify-content-between">Test Cases (For Evaluator) <Plus className="text-primary cursor-pointer" size={18} onClick={handleAddTestCase}/></label>
            {testCases.map((tc, i) => (
              <div key={i} className="card bg-dark border-glass p-3 mb-3">
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <textarea className="form-control bg-secondary text-white border-0 form-control-sm" value={tc.input} onChange={e=>{
                      const newTC = [...testCases];
                      newTC[i].input = e.target.value;
                      setTestCases(newTC);
                    }} placeholder="Input Data" />
                  </div>
                  <div className="col-6">
                    <textarea className="form-control bg-secondary text-white border-0 form-control-sm" value={tc.expectedOutput} onChange={e=>{
                      const newTC = [...testCases];
                      newTC[i].expectedOutput = e.target.value;
                      setTestCases(newTC);
                    }} placeholder="Expected Output" />
                  </div>
                </div>
                <div className="form-check form-switch mt-2">
                  <input className="form-check-input" type="checkbox" checked={tc.isHidden} onChange={e=>{
                    const newTC = [...testCases];
                    newTC[i].isHidden = e.target.checked;
                    setTestCases(newTC);
                  }} />
                  <label className="form-check-label small text-muted-light">Hidden Test Case?</label>
                </div>
                <button type="button" onClick={()=>handleRemoveTestCase(i)} className="btn btn-link text-danger p-0 border-0 text-end mt-2"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Reference Solution (Code)</label>
            <textarea 
              className="form-control bg-dark text-white border-glass font-monospace" 
              rows="6" 
              value={solution} 
              onChange={e=>setSolution(e.target.value)} 
              placeholder="Paste your reference code here (optional)..." 
              style={{ fontSize: '13px' }}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary w-100 fw-bold py-3 mt-3 d-flex align-items-center justify-content-center gap-2">
            {submitting ? 'Creating Question...' : <><CheckCircle2 size={20} /> Save Question</>}
          </button>
        </form>
      </div>
    </div>
  );
}
