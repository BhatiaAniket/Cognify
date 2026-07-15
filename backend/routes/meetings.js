const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { verifyCompanyScope } = require('../middleware/verifyCompanyScope');
const meetingController = require('../controllers/meetingController');

router.use(protect);
router.use(verifyCompanyScope);

router.get('/', meetingController.getUserMeetings);
router.get('/by-room/:roomId', meetingController.getMeetingByRoomId);
router.get('/:id/summary', meetingController.getMeetingSummary);  
router.post('/:id/summarize', meetingController.summarizeMeeting);
router.patch('/:id/share-summary', authorize('manager', 'company_admin'), meetingController.shareSummary);
router.post('/request-admin', authorize('manager'), meetingController.requestAdminMeeting);
router.get('/requests', authorize('company_admin', 'manager'), meetingController.getMeetingRequests);
router.put('/requests/:reqId', authorize('company_admin', 'manager'), meetingController.handleMeetingRequest);

router.post(
  '/',
  authorize('company_admin', 'manager'),
  [
    body('title').trim().notEmpty().withMessage('Meeting title is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
  ],
  meetingController.createMeeting
);

router.post('/:id/join', meetingController.joinMeeting);
router.post('/:id/leave', meetingController.leaveMeeting);
router.post('/:id/end', authorize('company_admin', 'manager'), meetingController.endMeeting);
router.put('/:meetingId', authorize('company_admin', 'manager'), meetingController.updateMeeting);
router.delete('/:meetingId', authorize('company_admin'), meetingController.cancelMeeting);

module.exports = router;
