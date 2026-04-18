import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import CodeEditorPage from './pages/CodeEditorPage';
import Contests from './pages/Contests';
import ContestDetails from './pages/ContestDetails';
import Leaderboard from './pages/Leaderboard';
import Insights from './pages/Insights';
import AdminContestManager from './pages/AdminContestManager';
import ContestResults from './pages/ContestResults';

function App() {
  return (
    <AuthProvider>
      <div className="app-shell d-flex flex-column min-vh-100 text-light">
        <Navbar />

        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/problems" element={<ProtectedRoute><ProblemList /></ProtectedRoute>} />
            <Route path="/problems/:id" element={<ProtectedRoute><CodeEditorPage /></ProtectedRoute>} />
            <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
            <Route path="/contests/:id" element={<ProtectedRoute><ContestDetails /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            <Route path="/admin/contests" element={<ProtectedRoute><AdminContestManager /></ProtectedRoute>} />
            <Route path="/admin/contests/:id/results" element={<ProtectedRoute><ContestResults /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;