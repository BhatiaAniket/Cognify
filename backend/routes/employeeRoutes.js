const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require employee authentication
router.use(protect);
router.use(authorize('employee'));

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', notificationController.listNotifications);
router.patch('/notifications/:id/read', notificationController.markAsRead);
router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.put('/notifications/read-all', notificationController.markAllAsRead);

// ── Overview ──────────────────────────────────────────────────────────────────
router.get('/overview/stats', employeeController.getOverviewStats);
router.get('/overview/deadlines', employeeController.getUpcomingDeadlines);
router.get('/overview/meetings', employeeController.getUpcomingMeetings);

// ── Tasks ─────────────────────────────────────────────────────────────────────
router.get('/tasks', employeeController.getTasks);
router.patch('/tasks/:id/status', employeeController.updateTaskStatus);

// Requires multer for attachment uploads
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// ── Daily Reports ─────────────────────────────────────────────────────────────
router.get('/reports', employeeController.getDailyReports);
router.post('/reports', upload.array('files', 5), employeeController.submitDailyReport);
// Aliases
router.get('/daily-reports', employeeController.getDailyReports);
router.post('/daily-report', upload.array('files', 5), employeeController.submitDailyReport);

// ── Meetings ──────────────────────────────────────────────────────────────────
router.get('/meetings', employeeController.getMeetings);
router.post('/meetings/request', employeeController.requestMeeting);
router.get('/meetings/requests', employeeController.getMeetingRequests);

// ── Colleagues ────────────────────────────────────────────────────────────────
router.get('/colleagues', employeeController.getColleagues);

// ── Performance ───────────────────────────────────────────────────────────────
router.get('/performance', employeeController.getPerformance);
router.get('/performance/ai-report', employeeController.getPerformanceAIReport);

module.exports = router;
