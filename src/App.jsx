import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ROUTES
import Main from './pages/Main.jsx';
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const StatsOverview = lazy(() => import('./pages/StatsOverview.jsx'));

function App() {
  return (
    <>
      <Routes>
        <Route path="/Inforgiy_Web/" element={<Main />} />
        <Route path="/Inforgiy_Web/profile" element={<Profile />} />
        <Route path="/Inforgiy_Web/calendar" element={<Calendar />} />
        <Route path="/Inforgiy_Web/stats/overview" element={<StatsOverview />} />
      </Routes>

      <ToastContainer
        position='bottom-center'
        newestOnTop
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        theme={window.Telegram.WebApp.colorScheme}
        limit={4}
      />
    </>
  );
}

export default App;