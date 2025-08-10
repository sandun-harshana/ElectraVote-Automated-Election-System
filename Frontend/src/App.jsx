import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/index';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import CreateElection from './components/CreateElection';
import ViewCandidate from './pages/ViewCandidate'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/voter-dashboard" element={<VoterDashboard />} />
        <Route path="/create-election" element={<CreateElection />} />

        
        <Route path="/candidate/:id" element={<ViewCandidate />} />
      </Routes>
    </Router>
  );
}

export default App;
