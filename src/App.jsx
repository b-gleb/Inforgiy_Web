import { Routes, Route } from 'react-router-dom';
import Main from './Main.jsx';
import WeeklyView from './components/WeeklyView.jsx';

function App() {
  return (
    <Routes>
      <Route path="/Inforgiy_Web" element={<Main />} />
      <Route path="/Inforgiy_Web/weekly" element={<WeeklyView />}/>
    </Routes>
  );
}

export default App;