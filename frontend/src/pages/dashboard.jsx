function Dashboard() {
  return (
    <div className="page">
      <h2 className="page-title">Student Dashboard</h2>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Projects</h3>
          <p>3</p>
        </div>

        <div className="card">
          <h3>Completed Tasks</h3>
          <p>12</p>
        </div>

        <div className="card">
          <h3>Pending Tasks</h3>
          <p>5</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
