const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Company = require('../models/Company');
const { generateMeetingSummary } = require('../services/ai.service');

// WebRTC signaling server would be implemented here with Socket.io
// This is a simplified version for demonstration

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const { title, agenda, type, date, time, durationMinutes, participants, roomId: bodyRoomId } = req.body;
    
    // Instructions: companyId and createdBy set from req.user (JWT)
    // Using req.companyId from verifyCompanyScope middleware which is already extracted from JWT
    const companyId = new mongoose.Types.ObjectId(req.companyId);
    const userId = new mongoose.Types.ObjectId(req.user._id);

    if (!title || (!req.body.startTime && (!date || !time))) {
      return res.status(400).json({ success: false, message: 'Title and time are required' });
    }

    let parsedStart = req.body.startTime ? new Date(req.body.startTime) : new Date(`${date}T${time}`);
    if (isNaN(parsedStart.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid meeting time format' });
    }

    // Instructions: Always include creator in participants array
    let participantIds = (Array.isArray(participants) ? participants : [])
      .map(id => new mongoose.Types.ObjectId(id));
      
    if (!participantIds.some(id => id.equals(userId))) {
      participantIds.push(userId);
    }

    const meeting = await Meeting.create({
      title,
      agenda: agenda || '',
      type: type || 'one-on-one',
      startTime: parsedStart,
      durationMinutes: parseInt(durationMinutes) || 30,
      companyId,
      createdBy: userId,
      participants: participantIds,
      roomId: bodyRoomId || uuidv4(), // Instructions: Generate roomId using uuid if missing
      status: 'scheduled',
    });

    const populated = await Meeting.findById(meeting._id)
      .populate('participants', 'fullName email role avatar')
      .populate('createdBy', 'fullName email role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ success: false, message: 'Failed to create meeting' });
  }
};

// Join a meeting
exports.joinMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const meeting = await Meeting.findOne({ roomId, companyId: req.companyId })
      .populate('participants', 'fullName avatar')
      .populate('createdBy', 'fullName');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found',
      });
    }

    // Check if user is allowed to join
    const isParticipant = meeting.participants.some(p => p._id.toString() === userId.toString());
    const isCreator = meeting.createdBy?._id.toString() === userId.toString();

    if (!isParticipant && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to join this meeting',
      });
    }

    // Update meeting status to active if scheduled
    if (meeting.status === 'scheduled') {
      meeting.status = 'active';
      await meeting.save();
    }

    res.status(200).json({
      success: true,
      data: {
        meeting,
        roomId: meeting.roomId,
        canJoin: true,
      },
    });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join meeting',
    });
  }
};

// Get meeting by roomId
exports.getMeetingByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const meeting = await Meeting.findOne({ roomId, companyId: req.companyId })
      .populate('createdBy', 'fullName email role');

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Leave a meeting
exports.leaveMeeting = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Left meeting successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to leave meeting',
    });
  }
};

// Get meeting summary
exports.getMeetingSummary = async (req, res) => {
  try {
    const { id: meetingId } = req.params;

    const meeting = await Meeting.findOne({
      _id: meetingId,
      companyId: req.companyId
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found',
      });
    }

    res.status(200).json({
      success: true,
      data: meeting.summary || "No summary available.",
    });
  } catch (error) {
    console.error('Get meeting summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meeting summary',
    });
  }
};

// Summarize meeting
exports.summarizeMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("participants", "fullName");
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: "Meeting not found" 
      });
    }
    
    // Check if already has summary
    if (meeting.summary) {
      return res.json({ success: true, summary: meeting.summary });
    }
    
    // Generate new summary
    const summary = await generateMeetingSummary({
      title: meeting.title,
      durationMinutes: meeting.durationMinutes,
      participants: meeting.participants,
      chatHistory: meeting.chatHistory || []
    });
    
    // Save to DB
    meeting.summary = summary;
    await meeting.save();
    
    return res.json({ success: true, summary });
  } catch (error) {
    console.error('Summarize meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
    });
  }
};

// End meeting (by roomId or ID)
exports.endMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Try finding by roomId first, then by _id
    const meeting = await Meeting.findOneAndUpdate(
      { 
        $or: [
          { roomId: roomId, createdBy: userId },
          { _id: mongoose.Types.ObjectId.isValid(roomId) ? roomId : null, createdBy: userId }
        ]
      },
      { status: 'ended', endedAt: new Date() },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    console.error('End meeting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Share meeting summary with client
exports.shareSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id).populate('participants', 'role fullName');
    
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    meeting.sharedWithClient = true;
    await meeting.save();

    // Identify clients among participants
    const clients = meeting.participants.filter(p => p.role === 'client');
    
    if (clients.length > 0) {
      const Notification = require('../models/Notification');
      for (const client of clients) {
        await Notification.create({
          company: meeting.companyId,
          user: client._id,
          type: 'meeting_summary',
          title: 'Meeting Summary Shared',
          message: `Manager shared a meeting summary for: ${meeting.title}`,
          relatedId: meeting._id,
          relatedModel: 'Meeting'
        });

        // Emit socket event if user is online
        if (req.io) {
          req.io.to(`user_${client._id}`).emit('summary-shared', { 
            meetingId: meeting._id,
            title: meeting.title 
          });
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Summary shared with client successfully',
      data: { sharedWithClient: true }
    });
  } catch (error) {
    console.error('Share summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to share summary' });
  }
};

// Get user's meetings
exports.getUserMeetings = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const companyId = new mongoose.Types.ObjectId(req.companyId);

    const Project = require('../models/Project');
    const Task = require('../models/Task');
    let teamMemberIds = [];
    if (req.user.role === 'manager') {
      const projects = await Project.find({ manager: userId, company: companyId }).select('_id');
      const projectIds = projects.map(p => p._id);
      const tasks = await Task.find({ project: { $in: projectIds } }).select('assignedTo');
      teamMemberIds = [...new Set(tasks.map(t => t.assignedTo?.toString()).filter(Boolean))].map(id => new mongoose.Types.ObjectId(id));
    }

    let query = { companyId };
    if (req.user.role !== 'company_admin') {
      let conditions = [
        { createdBy: userId },
        { participants: userId }
      ];
      if (req.user.role === 'manager' && teamMemberIds.length > 0) {
        conditions.push({ participants: { $in: teamMemberIds } });
      }
      query.$or = conditions;
    }

    const meetings = await Meeting.find(query)
    .populate('participants', 'fullName email role avatar')
    .populate('createdBy', 'fullName email role')
    .sort({ startTime: 1 });

    const now = new Date();
    const upcoming = meetings.filter(m => {
      const endTime = new Date(new Date(m.startTime).getTime() + (m.durationMinutes || 30) * 60000);
      return endTime >= now && m.status !== 'cancelled' && m.status !== 'ended';
    });
    const past = meetings.filter(m => {
      const endTime = new Date(new Date(m.startTime).getTime() + (m.durationMinutes || 30) * 60000);
      return endTime < now || m.status === 'ended' || m.status === 'cancelled';
    });

    res.status(200).json({
      success: true,
      data: {
        upcoming,
        past,
        all: meetings
      }
    });
  } catch (error) {
    console.error('Get user meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meetings',
    });
  }
};

// Redundant endMeeting removed

// Update meeting
exports.updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, description, startTime, duration, participants } = req.body;
    const userId = req.user.id;

    const meeting = await Meeting.findOne({
      _id: meetingId,
      companyId: req.companyId,
      createdBy: userId
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or you are not the creator',
        errors: [],
      });
    }

    // Update meeting fields
    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (startTime) meeting.startTime = new Date(startTime);
    if (duration) meeting.duration = duration;
    if (participants) meeting.participants = participants;

    await meeting.save();

    // Emit meeting updated event
    req.io.to(meeting.roomId).emit('meeting:updated', {
      meetingId: meeting._id,
      updates: { title, description, startTime, duration, participants },
    });

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting',
      errors: [],
    });
  }
};

// Cancel meeting
exports.cancelMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;

    const meeting = await Meeting.findOne({
      _id: meetingId,
      companyId: req.companyId,
      createdBy: userId
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found or you are not the creator',
        errors: [],
      });
    }

    meeting.status = 'cancelled';
    await meeting.save();

    // Emit meeting cancelled event
    req.io.to(meeting.roomId).emit('meeting:cancelled', {
      meetingId: meeting._id,
      title: meeting.title,
    });

    res.status(200).json({
      success: true,
      message: 'Meeting cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel meeting',
      errors: [],
    });
  }
};

// WebRTC signaling handlers (would be implemented with Socket.io)
exports.handleSignaling = (io, socket) => {
  // Join meeting room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  // Leave meeting room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      from: socket.id,
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      from: socket.id,
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id,
    });
  });

  // Screen sharing
  socket.on('start-screen-share', (data) => {
    socket.to(data.roomId).emit('screen-share-started', {
      userId: socket.id,
    });
  });

  socket.on('stop-screen-share', (data) => {
    socket.to(data.roomId).emit('screen-share-stopped', {
      userId: socket.id,
    });
  });

  // Mute/Unmute
  socket.on('mute-changed', (data) => {
    socket.to(data.roomId).emit('participant-muted', {
      userId: socket.id,
      isMuted: data.isMuted,
    });
  });

  socket.on('video-changed', (data) => {
    socket.to(data.roomId).emit('participant-video-changed', {
      userId: socket.id,
      isVideoOff: data.isVideoOff,
    });
  });
};

// Get meeting requests for the current user
exports.getMeetingRequests = async (req, res) => {
  try {
    const MeetingRequest = require('../models/MeetingRequest');
    const requests = await MeetingRequest.find({ requestedTo: req.user._id, status: 'pending' })
      .populate('requestedBy', 'fullName email role profilePicture')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching requests' });
  }
};

exports.handleMeetingRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const MeetingRequest = require('../models/MeetingRequest');
    const request = await MeetingRequest.findById(req.params.reqId);

    if (!request || request.requestedTo.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found or unauthorized' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      
      const Meeting = require('../models/Meeting');
      const meeting = await Meeting.create({
        title: request.subject,
        companyId: request.companyId,
        createdBy: req.user._id,
        participants: [request.requestedBy, req.user._id],
        startTime: request.preferredDate,
        durationMinutes: 30,
        agenda: request.agenda,
        type: 'one-on-one'
      });

      const Notification = require('../models/Notification');
      await Notification.create({
        user: request.requestedBy,
        company: req.companyId,
        type: 'meeting_request_accepted',
        title: 'Meeting Request Accepted',
        message: `${req.user.fullName} accepted your meeting request: ${request.subject}`,
        relatedId: meeting._id,
        relatedModel: 'Meeting'
      });
    } else {
      request.status = 'rejected';
      const Notification = require('../models/Notification');
      await Notification.create({
        user: request.requestedBy,
        company: req.companyId,
        type: 'meeting_request_rejected',
        title: 'Meeting Request Declined',
        message: `${req.user.fullName} declined your meeting request: ${request.subject}`,
        relatedId: request._id,
        relatedModel: 'MeetingRequest'
      });
    }

    await request.save();
    res.json({ success: true, message: `Request ${action}ed` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ━━━ REQUEST ADMIN MEETING ━━━
exports.requestAdminMeeting = async (req, res) => {
  try {
    const { subject, date, reason } = req.body;

    // Find the company admin
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const admin = await User.findOne({ company: req.companyId, role: 'company_admin' });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Company admin not found', errors: [] });
    }

    // Create a robust MeetingRequest
    const MeetingRequest = require('../models/MeetingRequest');
    const meetingReq = await MeetingRequest.create({
      requestedBy: req.user._id,
      requestedTo: admin._id,
      companyId: req.companyId,
      subject: subject || 'Meeting with Admin',
      preferredDate: new Date(date),
      agenda: reason,
      requesterRole: req.user.role || 'manager',
      status: 'pending'
    });

    // Create Notification for admin
    await Notification.create({
      user: admin._id,
      company: req.companyId,
      type: 'meeting_request',
      title: 'Admin Meeting Request',
      message: `${req.user.fullName} requested a meeting regarding: ${subject} on ${new Date(date).toLocaleDateString()}.`,
      relatedId: meetingReq._id,
      relatedModel: 'MeetingRequest'
    });

    return res.status(200).json({ success: true, message: 'Meeting request sent to Admin' });
  } catch (error) {
    console.error('Request admin meeting error:', error);
    return res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
};
