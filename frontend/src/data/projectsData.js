const projectsData = [
  {
    id: 1,
    title: "Design Engineering Project",
    semester: 6,
    faculty: "Dr. Sharma",

    tasks: [
      {
        id: 1,
        title: "Problem Definition",
        owner: "Amit",
        status: "Completed",
      },
      {
        id: 2,
        title: "Literature Survey",
        owner: "Hinal",
        status: "In Progress",
      },
    ],

    // 🔥 Milestone-Based Assessment System
    milestones: [
      {
        id: 1,
        title: "Proposal Review",
        status: "Reviewed", // Pending | Submitted | Reviewed
        decision: "Approved", // Approved | Revise
        facultyComment: "Good problem clarity and scope.",
      },
      {
        id: 2,
        title: "Mid Evaluation",
        status: "Pending",
        decision: "",
        facultyComment: "",
      },
      {
        id: 3,
        title: "Final Review",
        status: "Pending",
        decision: "",
        facultyComment: "",
      },
    ],
  },

  {
    id: 2,
    title: "Mini Project (DBMS)",
    semester: 6,
    faculty: "Prof. Patel",

    tasks: [
      {
        id: 1,
        title: "ER Diagram",
        owner: "Hinal",
        status: "Completed",
      },
    ],

    // No milestones yet for this project
    milestones: [],
  },
];

export default projectsData;
