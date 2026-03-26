import { Router } from 'express';
import MentorshipRequest from '../models/MentorshipRequest.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/roleMiddleware.js';
import { sendNewRequestEmail, sendStatusUpdateEmail } from '../services/emailService.js';

const router = Router();

// POST /api/requests — mentee sends a mentorship request
router.post('/', authMiddleware, requireRole('mentee'), async (req, res) => {
  try {
    const { mentorId, message, goal } = req.body;

    if (!mentorId || !message || !goal) {
      return res.status(400).json({ error: 'mentorId, message, and goal are required' });
    }

    const request = await MentorshipRequest.create({
      menteeId: req.user.id,
      mentorId,
      message,
      goal,
    });

    // Fetch mentor and mentee for the email notification (fire-and-forget)
    const [mentor, mentee] = await Promise.all([
      User.findById(mentorId).select('name email'),
      User.findById(req.user.id).select('name'),
    ]);

    if (mentor && mentee) {
      // Do not await — email failure must not delay the API response
      sendNewRequestEmail(mentor, mentee, request).catch(() => {});
    }

    res.status(201).json(request);
  } catch (err) {
    console.error('POST /requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests/sent — mentee views all their sent requests
router.get('/sent', authMiddleware, requireRole('mentee'), async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ menteeId: req.user.id })
      .populate('mentorId', 'name title photoUrl')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('GET /requests/sent error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests/received — mentor views all incoming requests
router.get('/received', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ mentorId: req.user.id })
      .populate('menteeId', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('GET /requests/received error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/requests/:id/status — mentor accepts or declines a request
router.patch('/:id/status', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be accepted or declined' });
    }

    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Ensure this mentor owns the request
    if (request.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    request.status = status;
    await request.save();

    // Fetch mentor and mentee for the status notification (fire-and-forget)
    const [mentor, mentee] = await Promise.all([
      User.findById(req.user.id).select('name'),
      User.findById(request.menteeId).select('name email'),
    ]);

    if (mentor && mentee) {
      sendStatusUpdateEmail(mentee, mentor, status).catch(() => {});
    }

    res.json(request);
  } catch (err) {
    console.error('PATCH /requests/:id/status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
