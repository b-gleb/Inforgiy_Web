import { Routes, Route } from 'react-router-dom';
import Main from './pages/Main.jsx';
import Profile from './pages/Profile.jsx';
import WeeklyView from './components/WeeklyView.jsx';
import BranchStats from './components/statistics/branchStats.jsx';

function App() {
  return (
    <Routes>
      <Route path="/Inforgiy_Web/" element={<Main />} />
      <Route path="/Inforgiy_Web/profile" element={<Profile />} />
      <Route path="/Inforgiy_Web/weekly" element={<WeeklyView />} />
      <Route path="/Inforgiy_Web/branchStats" element={<BranchStats />} />
    </Routes>
  );
}

export default App;