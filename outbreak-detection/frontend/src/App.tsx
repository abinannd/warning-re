import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import OutbreakMap from "./pages/OutbreakMap";
import Intelligence from "./pages/Intelligence";
import Clusters from "./pages/Clusters";
import Alerts from "./pages/Alerts";
import Surveillance from "./pages/Surveillance";
import Advisory from "./pages/Advisory";
import Landing from "./pages/Landing";
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="map" element={<OutbreakMap />} />
        <Route path="intelligence" element={<Intelligence />} />
        <Route path="clusters" element={<Clusters />} />
        <Route path="clusters/:id" element={<Clusters />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="surveillance" element={<Surveillance />} />
        <Route path="advisory" element={<Advisory />} />
      </Route>
    </Routes>
  );
}

export default App;
