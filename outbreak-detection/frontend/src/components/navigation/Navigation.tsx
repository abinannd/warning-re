import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav style={{ width: "200px", borderRight: "1px solid #ccc", padding: "20px" }}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={{ marginBottom: "10px" }}><Link to="/dashboard">Dashboard</Link></li>
        <li style={{ marginBottom: "10px" }}><Link to="/map">Outbreak Map</Link></li>
        <li style={{ marginBottom: "10px" }}><Link to="/intelligence">Intelligence</Link></li>
        <li style={{ marginBottom: "10px" }}><Link to="/clusters">Clusters</Link></li>
        <li style={{ marginBottom: "10px" }}><Link to="/alerts">Alerts</Link></li>
        <li style={{ marginBottom: "10px" }}><Link to="/surveillance">Surveillance</Link></li>
        <li style={{ marginBottom: "10px" }}><Link to="/advisory">Advisory</Link></li>
      </ul>
    </nav>
  );
}
