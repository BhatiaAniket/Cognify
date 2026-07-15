const File = require('../models/File');
const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'files');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed',
      'application/json', 'application/xml', 'text/xml',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// Upload a file
exports.uploadFile = async (req, res) => {
  try {
    const { description, tags, category, linkedTaskId, linkedProjectId, sharedWith } = req.body;
    const companyId = req.companyId;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        errors: [],
      });
    }

    const fileMessage = req.body.message || description || '';
    const rawSharedWith = req.body.recipients || sharedWith;
    const parsedSharedWith = rawSharedWith ? (typeof rawSharedWith === 'string' ? JSON.parse(rawSharedWith) : rawSharedWith) : [];
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/files/${req.file.filename}`;

    const file = new File({
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: userId,
      senderRole: req.user.role,
      company: companyId,
      description: fileMessage,
      tags: parsedTags,
      category: category || 'other',
      linkedTask: linkedTaskId || null,
      linkedProject: linkedProjectId || null,
      sharedWith: parsedSharedWith,
      downloadCount: 0,
      isPublic: false,
    });

    await file.save();

    // Populate file details
    await file.populate([
      { path: 'uploadedBy', select: 'fullName email avatar' },
      { path: 'linkedTask', select: 'title' },
      { path: 'linkedProject', select: 'name' },
    ]);

    // Emit file uploaded event to shared users
    if (parsedSharedWith && parsedSharedWith.length > 0) {
      if (req.io) {
        req.io.to(parsedSharedWith).emit('file:uploaded', {
          fileId: file._id,
          fileName: file.originalName,
          uploadedBy: file.uploadedBy,
        });
      }

      // Create Notification for each recipient
      try {
        const notifications = parsedSharedWith.map(recipientId => ({
          company: companyId,
          user: recipientId,
          title: 'New File Received',
          message: `New file received from ${req.user.fullName || 'a colleague'}`,
          type: 'general',
          relatedId: file._id,
          relatedModel: 'File',
          isRead: false
        }));

        await Notification.insertMany(notifications);
        
        if (req.io) {
          for (const notif of notifications) {
            req.io.to(`user:${notif.user.toString()}`).emit('notification:new', {
              ...notif,
              createdAt: new Date()
            });
          }
        }
      } catch (err) {
        console.warn('Failed to create file notifications:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      data: file,
    });
  } catch (error) {
    console.error('Upload file error:', error);

    // Clean up uploaded file if error occurred
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      errors: [],
    });
  }
};

// Get files for user
exports.getUserFiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;
    const companyId = req.companyId;

    const query = {
      company: companyId,
      $or: [
        { uploadedBy: userId },
        { sharedWith: userId },
        { isPublic: true },
      ],
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { originalName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ],
      });
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const files = await File.find(query)
      .populate('uploadedBy', 'fullName email avatar')
      .populate('linkedTask', 'title')
      .populate('linkedProject', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await File.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      errors: [],
    });
  }
};

// Get file details
exports.getRecipients = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;
    const role = req.user.role;
    
    let query = { company: companyId };
    
    if (role === 'manager') {
      // managers see their assigned employees + company clients + other managers
      // for simplicity and robust fallback, returning users across those 3 roles 
      query.role = { $in: ['employee', 'client', 'manager'] };
      // exclude self
      query._id = { $ne: userId };
    } else if (role === 'employee') {
      // employees only see managers
      query.role = 'manager';
    } else {
      // fallback for other roles
      query._id = { $ne: userId };
    }

    const users = await User.find(query).select('fullName email role avatar');

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipients' });
  }
};

exports.getReceivedFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;

    const files = await File.find({ company: companyId, sharedWith: userId })
      .populate('uploadedBy', 'fullName email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    console.error('Get received files error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch received files' });
  }
};

exports.getSentFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;

    const files = await File.find({ company: companyId, uploadedBy: userId, sharedWith: { $exists: true, $not: { $size: 0 } } })
      .populate('sharedWith', 'fullName email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    console.error('Get sent files error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sent files' });
  }
};

// Mark file as read
exports.markAsRead = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if user is already in readBy
    const alreadyRead = file.readBy.some(r => r.user.toString() === userId);
    if (!alreadyRead) {
      file.readBy.push({ user: userId, readAt: new Date() });
      await file.save();
    }

    res.status(200).json({ success: true, message: 'File marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark file as read' });
  }
};

// Get file details
exports.getFileDetails = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    const companyId = req.companyId;

    const file = await File.findOne({
      _id: fileId,
      company: companyId
    })
      .populate('uploadedBy', 'fullName email avatar')
      .populate('linkedTask', 'title description')
      .populate('linkedProject', 'name description')
      .populate('sharedWith', 'fullName email avatar');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        errors: [],
      });
    }

    // Check if user has access to this file
    const hasAccess =
      file.uploadedBy._id.toString() === userId ||
      file.sharedWith.some(user => user._id.toString() === userId) ||
      file.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this file',
        errors: [],
      });
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    console.error('Get file details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file details',
      errors: [],
    });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    const companyId = req.companyId;

    const file = await File.findOne({
      _id: fileId,
      company: companyId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        errors: [],
      });
    }

    // Check if user has access to this file
    const hasAccess =
      file.uploadedBy.toString() === userId ||
      file.sharedWith.includes(userId) ||
      file.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this file',
        errors: [],
      });
    }

    // Check if file exists
    try {
      await fs.access(file.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
        errors: [],
      });
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);

    // Send file
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      errors: [],
    });
  }
};

// Update file details
exports.updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { description, tags, category, sharedWith, isPublic } = req.body;
    const userId = req.user.id;
    const companyId = req.companyId;

    const file = await File.findOne({
      _id: fileId,
      company: companyId,
      uploadedBy: userId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found or you are not the owner',
        errors: [],
      });
    }

    // Update file fields
    if (description !== undefined) file.description = description;
    if (tags !== undefined) {
      file.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    if (category !== undefined) file.category = category;
    if (sharedWith !== undefined) {
      file.sharedWith = typeof sharedWith === 'string' ? JSON.parse(sharedWith) : sharedWith;
    }
    if (isPublic !== undefined) file.isPublic = isPublic;

    await file.save();

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update file',
      errors: [],
    });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;
    const companyId = req.companyId;

    const file = await File.findOne({
      _id: fileId,
      company: companyId,
      uploadedBy: userId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found or you are not the owner',
        errors: [],
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Failed to delete file from filesystem:', error);
    }

    // Delete file record from database
    await File.findByIdAndDelete(fileId);

    // Emit file deleted event to shared users
    req.io.to(file.sharedWith).emit('file:deleted', {
      fileId: file._id,
      fileName: file.originalName,
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      errors: [],
    });
  }
};

// Share file with users
exports.shareFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userIds, message } = req.body;
    const currentUserId = req.user.id;
    const companyId = req.companyId;

    const file = await File.findOne({
      _id: fileId,
      company: companyId,
      uploadedBy: currentUserId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found or you are not the owner',
        errors: [],
      });
    }

    // Add new users to sharedWith array
    const newSharedUsers = userIds.filter(id => !file.sharedWith.includes(id));
    file.sharedWith.push(...newSharedUsers);
    await file.save();

    // Send notifications to newly shared users
    if (newSharedUsers.length > 0) {
      try {
        const notifications = newSharedUsers.map(userId => ({
          company: companyId,
          user: userId,
          title: 'New File Received',
          message: `New file received from ${req.user.fullName || 'a colleague'}`,
          type: 'general',
          relatedId: file._id,
          relatedModel: 'File',
          isRead: false
        }));

        await Notification.insertMany(notifications);

        for (const userId of newSharedUsers) {
          if (req.io) {
            req.io.to(`user:${userId}`).emit('file:shared', {
              fileId: file._id,
              fileName: file.originalName,
              sharedBy: currentUserId,
              message: message || '',
            });

            // Emit the notification alert
            const notif = notifications.find(n => n.user === userId);
            if (notif) {
              req.io.to(`user:${userId}`).emit('notification:new', {
                ...notif,
                createdAt: new Date()
              });
            }
          }
        }
      } catch (err) {
        console.warn('Failed to create share file notifications:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'File shared successfully',
      data: {
        sharedWith: file.sharedWith,
        newlyShared: newSharedUsers,
      },
    });
  } catch (error) {
    console.error('Share file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share file',
      errors: [],
    });
  }
};

// Get file statistics
exports.getFileStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;

    const stats = await File.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          uploadedByUser: {
            $sum: {
              $cond: [{ $eq: ['$uploadedBy', new mongoose.Types.ObjectId(userId)] }, 1, 0]
            }
          },
          sharedWithUser: {
            $sum: {
              $cond: [{ $in: [new mongoose.Types.ObjectId(userId), '$sharedWith'] }, 1, 0]
            }
          },
          publicFiles: {
            $sum: { $cond: ['$isPublic', 1, 0] }
          },
        },
      },
    ]);

    const categoryStats = await File.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
        },
      },
    ]);

    const result = stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      uploadedByUser: 0,
      sharedWithUser: 0,
      publicFiles: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        ...result,
        categoryStats,
      },
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file statistics',
      errors: [],
    });
  }
};

// Middleware for handling file uploads
exports.uploadMiddleware = upload.single('file');
