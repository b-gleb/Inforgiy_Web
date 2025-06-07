import { Routes, Route } from 'react-router-dom';
import Main from './Main.jsx';

function App() {
  return (
    <Routes>
      <Route path="/Inforgiy_Web" element={<Main />} />
    </Routes>
  );
}

export default App;