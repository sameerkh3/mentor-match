import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['mentee', 'mentor', 'admin'],
      required: [true, 'Role is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // --- Mentor-only fields ---
    title: { type: String, trim: true },
    department: { type: String, trim: true },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: [{ type: String, trim: true }],
    yearsOfExperience: { type: Number, min: 0 },
    availability: { type: String, trim: true },
    photoUrl: { type: String, trim: true },

    // Derived from submitted ratings (updated when a mentee rates)
    ratingsTotal: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for full-text search on bio and skills
userSchema.index({ bio: 'text', skills: 'text' });

const User = mongoose.model('User', userSchema);
export default User;
