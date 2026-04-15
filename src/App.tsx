import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

import Steward from './pages/Steward';
import Approvals from './pages/Approvals';
import Activity from './pages/Activity';
import Connectors from './pages/Connectors';
import Ontology from './pages/Ontology';
import Settings from './pages/Settings';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import TeamVisualizationDemo from './pages/TeamVisualizationDemo';
import TeamVisualization1 from './pages/TeamVisualization1';
import TeamVisualization2 from './pages/TeamVisualization2';
import TeamVisualization3 from './pages/TeamVisualization3';
import Security from './pages/Security';
import VersionControl from './pages/VersionControl';
import VersionTestChat from './pages/VersionTestChat';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Steward />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:id" element={<TeamDetail />} />
          <Route path="steward" element={<Steward />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="activity" element={<Activity />} />
          <Route path="connectors" element={<Connectors />} />
          <Route path="ontology" element={<Ontology />} />
          <Route path="settings" element={<Settings />} />
          <Route path="security" element={<Security />} />
          <Route path="version-control" element={<VersionControl />} />
          <Route path="user-management" element={<UserManagement />} />
        </Route>
        <Route path="/team-demo" element={<TeamVisualizationDemo />} />
        <Route path="/version-control/test/:id" element={<VersionTestChat />} />
        <Route path="/team-viz-1" element={<TeamVisualization1 />} />
        <Route path="/team-viz-2" element={<TeamVisualization2 />} />
        <Route path="/team-viz-3" element={<TeamVisualization3 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
