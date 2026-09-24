import { Outlet } from "react-router-dom";
import Navigation from "../navigation/Navigation";
import Header from "./Header";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Navigation />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ padding: "20px", flex: 1, backgroundColor: "#fff" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
