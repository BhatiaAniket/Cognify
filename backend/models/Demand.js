const mongoose = require('mongoose');

const demandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Demand title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['UI Change', 'Feature Request', 'Bug Report', 'Other'],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Accepted', 'Rejected'],
      default: 'Submitted',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    managerComment: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: [
      {
        fileName: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Demand', demandSchema);
