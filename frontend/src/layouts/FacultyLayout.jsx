import FacultySidebar from "../components/FacultySidebar";
import "./FacultyLayout.css";

export default function FacultyLayout({ children }) {
  return (
    <div className="faculty-layout">
      <FacultySidebar />
      <main className="faculty-content">
        {children}
      </main>
    </div>
  );
}
