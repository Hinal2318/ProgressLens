const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getDeptAnalytics, getProjectAnalytics } = require("../controllers/analyticsController");

router.get("/dept", protect, authorize("faculty"), getDeptAnalytics);
router.get("/project/:projectId", protect, getProjectAnalytics);

module.exports = router;
