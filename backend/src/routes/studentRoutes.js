const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Import the controller
const studentController = require("../controllers/studentController");

// DEBUG LOG: Check if functions are defined
console.log("Checking imports: ", {
    dashboard: !!studentController.getStudentDashboard,
    test: !!studentController.createTestProject
});

// Use the functions from the controller object
router.get("/dashboard", protect, studentController.getStudentDashboard);
router.post("/create-test", protect, studentController.createTestProject);

module.exports = router;