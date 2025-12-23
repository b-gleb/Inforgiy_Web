import { Routes, Route } from 'react-router-dom';
import Main from './pages/Main.jsx';
import Profile from './pages/Profile.jsx';
import Calendar from './pages/Calendar.jsx';
import StatsOverview from './pages/StatsOverview.jsx';

function App() {
  return (
    <Routes>
      <Route path="/Inforgiy_Web/" element={<Main />} />
      <Route path="/Inforgiy_Web/profile" element={<Profile />} />
      <Route path="/Inforgiy_Web/calendar" element={<Calendar />} />
      <Route path="/Inforgiy_Web/stats/overview" element={<StatsOverview />} />
    </Routes>
  );
}

export default App;