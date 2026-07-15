const express = require('express');
const router = express.Router();
const MeetingRequest = require('../models/MeetingRequest');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { verifyCompanyScope } = require('../middleware/verifyCompanyScope');
const toObjectId = require('../utils/toObjectId');

router.use(protect);
router.use(verifyCompanyScope);

// Create meeting request
router.post('/', protect, async (req, res) => {
  try {
    const { requestedTo, subject, preferredDate, agenda, requesterRole } = req.body;
    const companyId = req.companyId;
    const requestedBy = req.user._id;

    const request = await MeetingRequest.create({
      requestedBy,
      requestedTo,
      companyId,
      subject,
      preferredDate,
      agenda,
      requesterRole,
      status: 'pending'
    });

    // Notify the recipient
    await Notification.create({
      user: requestedTo,
      company: companyId,
      type: 'meeting_request',
      title: 'New Meeting Request',
      message: `${req.user.fullName} has requested a meeting: ${subject}`,
      relatedId: request._id,
      relatedModel: 'Meeting' // Closest match or just notification
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Create meeting request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get requests for current user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const companyId = req.companyId;

    // Requests received OR requests sent
    const requests = await MeetingRequest.find({
      companyId,
      $or: [
        { requestedTo: userId },
        { requestedBy: userId }
      ]
    })
    .populate('requestedBy', 'fullName email role avatar')
    .populate('requestedTo', 'fullName email role avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Respond to meeting request
router.put('/:id/respond', protect, async (req, res) => {
  try {
    const { status, responseNote } = req.body;
    const requestId = req.params.id;
    const userId = req.user._id;

    const request = await MeetingRequest.findOne({ 
      _id: requestId, 
      requestedTo: userId 
    }).populate('requestedBy');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or unauthorized' });
    }

    request.status = status;
    request.responseNote = responseNote;
    request.respondedAt = new Date();
    await request.save();

    // If accepted, create a Meeting
    if (status === 'accepted') {
      const meeting = await Meeting.create({
        title: `Accepted: ${request.subject}`,
        agenda: request.agenda,
        startTime: request.preferredDate,
        companyId: request.companyId,
        createdBy: userId,
        participants: [request.requestedBy._id, userId],
        status: 'scheduled'
      });

      // Notify the requester
      await Notification.create({
        user: request.requestedBy._id,
        company: request.companyId,
        type: 'meeting_request_accepted',
        title: 'Meeting Request Accepted',
        message: `${req.user.fullName} accepted your meeting request: ${request.subject}`,
        relatedId: meeting._id,
        relatedModel: 'Meeting'
      });
    } else {
      // Notify the requester of rejection
      await Notification.create({
        user: request.requestedBy._id,
        company: request.companyId,
        type: 'meeting_request_rejected',
        title: 'Meeting Request Declined',
        message: `${req.user.fullName} declined your meeting request: ${request.subject}`,
        relatedId: request._id,
        relatedModel: 'Meeting'
      });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Respond to meeting request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
