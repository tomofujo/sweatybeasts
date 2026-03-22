import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutLogger from './pages/WorkoutLogger';
import ActivityLogger from './pages/ActivityLogger';
import ExerciseBuilder from './pages/ExerciseBuilder';
import History from './pages/History';
import Progress from './pages/Progress';
import SettingsPage from './pages/SettingsPage';
import Routines from './pages/Routines';

const pages = [
  { path: '/', Component: Dashboard },
  { path: '/workout', Component: WorkoutLogger },
  { path: '/activity', Component: ActivityLogger },
  { path: '/exercises', Component: ExerciseBuilder },
  { path: '/routines', Component: Routines },
  { path: '/history', Component: History },
  { path: '/progress', Component: Progress },
  { path: '/settings', Component: SettingsPage },
] as const;

function KeepAlivePages() {
  const { pathname } = useLocation();

  return (
    <>
      {pages.map(({ path, Component }) => (
        <div
          key={path}
          style={{ display: pathname === path ? 'block' : 'none' }}
        >
          <Component />
        </div>
      ))}
    </>
  );
}

function App() {
  return (
    <BrowserRouter basename="/sweatybeasts">
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<KeepAlivePages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
