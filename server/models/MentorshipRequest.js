import mongoose from 'mongoose';

const mentorshipRequestSchema = new mongoose.Schema(
  {
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      trim: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export default mongoose.model('MentorshipRequest', mentorshipRequestSchema);
