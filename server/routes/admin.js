import { Router } from 'express';
import User from '../models/User.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/roleMiddleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, requireRole('admin'));

// GET /api/admin/users — list all users, optional ?role= filter
router.get('/users', async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter)
      .select('_id name email role isActive createdAt')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/status — activate or deactivate a user
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own active status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('_id name email role isActive createdAt');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('PATCH /admin/users/:id/status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/stats — platform-level usage metrics
router.get('/stats', async (req, res) => {
  try {
    const [totalMentors, totalMentees, requestsSent, requestsAccepted] = await Promise.all([
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'mentee' }),
      MentorshipRequest.countDocuments(),
      MentorshipRequest.countDocuments({ status: 'accepted' }),
    ]);

    res.json({ totalMentors, totalMentees, requestsSent, requestsAccepted });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
