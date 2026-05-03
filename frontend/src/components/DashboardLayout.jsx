import TopNav from "./Sidebar";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <TopNav />
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}
