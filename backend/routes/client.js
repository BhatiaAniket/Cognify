const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const clientController = require('../controllers/clientController');

// All client routes require authentication and 'client' role
router.use(protect);
router.use(authorize('client'));

router.get('/overview', clientController.getOverview);
router.get('/project', clientController.getProject);
router.get('/meetings', clientController.getMeetings);
router.post('/meetings/request', clientController.requestMeeting);
router.get('/reports', clientController.getReports);
router.get('/reports/:id', clientController.getReportDetails);
router.get('/reports/:id/download', clientController.downloadReportPdf);
router.get('/shared-summaries', clientController.getSharedSummaries);
router.get('/demands', clientController.getDemands);
router.post('/demands', clientController.submitDemand);
router.get('/notifications', clientController.getNotifications);
router.patch('/notifications/:id', clientController.markNotificationRead);

module.exports = router;
