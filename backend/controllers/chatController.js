const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET CONTACTS — role-based, no duplicates
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.getContacts = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const companyId = req.companyId;
    let contacts = [];

    if (role === 'company_admin') {
      // Admin sees: all managers + all employees in the company
      contacts = await User.find({
        company: companyId,
        role: { $in: ['manager', 'employee'] },
        _id: { $ne: userId },
        isActive: true,
      }).select('_id fullName role avatar').lean();

    } else if (role === 'manager') {
      // Manager sees: Company Admin + other managers + employees on their projects
      const admins = await User.find({
        company: companyId,
        role: 'company_admin',
        isActive: true,
      }).select('_id fullName role avatar').lean();

      const otherManagers = await User.find({
        company: companyId,
        role: 'manager',
        _id: { $ne: userId },
        isActive: true,
      }).select('_id fullName role avatar').lean();

      // Employees assigned to projects managed by this manager
      const projects = await Project.find({
        company: companyId,
        manager: userId,
      }).select('_id team').lean();

      const teamIds = [...new Set(
        projects.flatMap(p => (p.team || []).map(t => t.toString()))
      )];
      
      const projectIds = projects.map(p => p._id);
      const tasks = await Task.find({ 
        project: { $in: projectIds }, 
        assignedTo: { $exists: true, $ne: null } 
      }).select('assignedTo').lean();
      
      const employeeIds = [...new Set([
        ...teamIds,
        ...tasks.map(t => t.assignedTo.toString())
      ])];

      const employees = employeeIds.length > 0
        ? await User.find({
            _id: { $in: employeeIds },
            role: 'employee',
            isActive: true,
          }).select('_id fullName role avatar').lean()
        : [];

      // Deduplicate by _id
      const seen = new Set();
      for (const c of [...admins, ...otherManagers, ...employees]) {
        const id = c._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          contacts.push(c);
        }
      }

    } else if (role === 'employee') {
      // Employee sees: Admins + their manager + other Employees on same project
      const admins = await User.find({
        company: companyId,
        role: 'company_admin',
        isActive: true,
      }).select('_id fullName role avatar').lean();

      const tasks = await Task.find({ 
        company: companyId, 
        assignedTo: userId 
      }).select('assignedManager project').lean();
      
      const taskManagerIds = tasks.map(t => t.assignedManager?.toString()).filter(Boolean);
      const userAssignedManager = req.user.assignedManager ? req.user.assignedManager.toString() : null;
      const managerIds = [...new Set([...taskManagerIds, userAssignedManager].filter(Boolean))];

      const userProjectIds = tasks.map(t => t.project?.toString()).filter(Boolean);
      const teamProjects = await Project.find({ 
        company: companyId, 
        team: userId 
      }).select('_id team').lean();

      const allProjectIds = [...new Set([
        ...userProjectIds, 
        ...teamProjects.map(p => p._id.toString())
      ])];
      
      const projectTasks = await Task.find({ 
        project: { $in: allProjectIds }, 
        assignedTo: { $exists: true, $ne: null } 
      }).select('assignedTo').lean();

      const coworkerIds = [...new Set([
         ...teamProjects.flatMap(p => (p.team || []).map(t => t.toString())),
         ...projectTasks.map(t => t.assignedTo.toString())
      ])].filter(id => id !== userId.toString());

      const managerContacts = managerIds.length > 0
        ? await User.find({
            _id: { $in: managerIds },
            role: 'manager',
            isActive: true,
          }).select('_id fullName role avatar').lean()
        : [];

      const coworkerContacts = coworkerIds.length > 0
        ? await User.find({
            _id: { $in: coworkerIds },
            role: 'employee',
            isActive: true,
          }).select('_id fullName role avatar').lean()
        : [];

      const seen = new Set();
      for (const c of [...admins, ...managerContacts, ...coworkerContacts]) {
        const id = c._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          contacts.push(c);
        }
      }
    }

    return res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('getContacts error:', error);
    return res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LIST CONVERSATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.listConversations = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const companyId = req.companyId;

    // ── Auto-sync Company Broadcast (all non-client users in company) ──
    if (role !== 'client') {
      const nonClientUsers = await User.find({
        company: companyId,
        role: { $ne: 'client' },
        isActive: true,
      }).select('_id').lean();
      const participantIds = nonClientUsers.map(u => u._id);

      if (participantIds.length > 0) {
        await Conversation.findOneAndUpdate(
          { company: companyId, type: 'group', groupName: 'Company Broadcast' },
          {
            $set:        { participants: participantIds },
            $setOnInsert: { company: companyId, type: 'group', groupName: 'Company Broadcast' },
          },
          { upsert: true, new: true }
        );
      }
    }

    // ── Auto-sync Project Team groups (for manager & employee) ──
    if (role === 'manager' || role === 'employee') {
      const projectQuery = role === 'manager'
        ? { company: companyId, manager: userId }
        : { company: companyId, team: userId };

      const projects = await Project.find(projectQuery).select('_id name team manager').lean();

      for (const project of projects) {
        const allMembers = [
          ...(project.team || []).map(t => t.toString()),
          project.manager ? project.manager.toString() : null,
        ].filter(Boolean);

        const uniqueMembers = [...new Set(allMembers)];

        if (uniqueMembers.length > 0) {
          await Conversation.findOneAndUpdate(
            { company: companyId, type: 'group', groupName: `Team: ${project.name}` },
            {
              $set:        { participants: uniqueMembers },
              $setOnInsert: { company: companyId, type: 'group', groupName: `Team: ${project.name}` },
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    // ── Fetch all conversations for this user ──
    const conversations = await Conversation.find({
      company:      companyId,
      participants: userId,
    })
      .populate('participants', 'fullName avatar role')
      .populate('lastMessage.sender', 'fullName')
      .sort({ updatedAt: -1 });

    // Add unread count
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unread = await Message.countDocuments({
          conversation: conv._id,
          readBy:       { $ne: userId },
          sender:       { $ne: userId },
        });
        return { ...conv.toObject(), unreadCount: unread };
      })
    );

    return res.status(200).json({ success: true, data: withUnread });
  } catch (error) {
    console.error('listConversations error:', error);
    return res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CREATE CONVERSATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.createConversation = async (req, res) => {
  try {
    const { type, participants, groupName } = req.body;
    const companyId = req.companyId;

    // For DM: check if conversation already exists between these two users
    if (type === 'dm' && participants && participants.length === 1) {
      const existing = await Conversation.findOne({
        company:      companyId,
        type:         'dm',
        participants: { $all: [req.user._id, participants[0]], $size: 2 },
      }).populate('participants', 'fullName avatar role');

      if (existing) {
        return res.status(200).json({ success: true, data: existing });
      }
    }

    const allParticipants = [
      req.user._id,
      ...(participants || []).filter(p => p !== req.user._id.toString()),
    ];

    const conversation = await Conversation.create({
      company:   companyId,
      type:      type || 'dm',
      participants: allParticipants,
      groupName: type === 'group' ? groupName : null,
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'fullName avatar role');

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('createConversation error:', error);
    return res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id:          conversationId,
      company:      req.companyId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found', errors: [] });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        readBy:       { $ne: req.user._id },
        sender:       { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Return in ascending order (oldest first)
    return res.status(200).json({ success: true, data: messages.reverse() });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEND MESSAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await Conversation.findOne({
      _id:          conversationId,
      company:      req.companyId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found', errors: [] });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender:       req.user._id,
      content:      content || '',
      fileUrl:      req.file ? req.file.path : null,
      fileName:     req.file ? req.file.originalname : null,
      fileType:     req.file ? req.file.mimetype : null,
      readBy:       [req.user._id],
    });

    // Update lastMessage on conversation
    conversation.lastMessage = {
      content:   content || (req.file ? '📎 File' : ''),
      sender:    req.user._id,
      timestamp: new Date(),
    };
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName avatar');

    const payload = {
      ...populated.toObject(),
      conversationId, // ensures frontend can match the conversation
    };

    // ── Emit to all participants in the conversation room via Socket.io ──
    try {
      const { getIO } = require('../socket');
      getIO().to(`chat:${conversationId}`).emit('chat:message', payload);

      // Create Notification for each participant EXCEPT the sender
      const notifyRecipients = conversation.participants
        .filter(p => p.toString() !== req.user._id.toString());
      
      const notifications = notifyRecipients.map(recipientId => ({
        company: req.companyId,
        user: recipientId,
        title: 'New Message',
        message: `New message from ${req.user.fullName}`,
        type: 'message',
        relatedId: conversationId,
        relatedModel: 'Conversation',
        isRead: false
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        // Dispatch new notification toast to sockets
        const io = getIO();
        for (const notif of notifications) {
          io.to(`user:${notif.user.toString()}`).emit('notification:new', {
            ...notif,
            createdAt: new Date()
          });
        }
      }

    } catch (err) {
      console.warn('Socket emit or Notification failed:', err.message);
    }

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({ success: false, message: 'Server error', errors: [] });
  }
};
