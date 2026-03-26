import { Router } from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole from '../middleware/roleMiddleware.js';
import { suggestMentors } from '../services/aiService.js';

const router = Router();

// Fields returned in list/search responses (exclude credentials)
const MENTOR_FIELDS =
  '_id name title department bio skills yearsOfExperience availability photoUrl ratingsTotal ratingsCount';

// GET /api/mentors
// Query params: q, department, minExp, maxExp, sort (rating | experience)
router.get('/', async (req, res) => {
  try {
    const { q, department, minExp, maxExp, sort } = req.query;

    const filter = { role: 'mentor', isActive: true };

    if (department) filter.department = department;
    if (minExp !== undefined || maxExp !== undefined) {
      filter.yearsOfExperience = {};
      if (minExp !== undefined) filter.yearsOfExperience.$gte = Number(minExp);
      if (maxExp !== undefined) filter.yearsOfExperience.$lte = Number(maxExp);
    }

    let query;
    if (q) {
      // Full-text search on bio + skills index; project score for relevance sort
      filter.$text = { $search: q };
      query = User.find(filter, { score: { $meta: 'textScore' }, ...Object.fromEntries(MENTOR_FIELDS.split(' ').map((f) => [f, 1])) });
    } else {
      query = User.find(filter).select(MENTOR_FIELDS);
    }

    // Sort order
    if (sort === 'rating') {
      query = query.sort({ ratingsCount: -1, ratingsTotal: -1 });
    } else if (sort === 'experience') {
      query = query.sort({ yearsOfExperience: -1 });
    } else if (q) {
      query = query.sort({ score: { $meta: 'textScore' } });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const mentors = await query.lean();
    res.json(mentors);
  } catch (err) {
    console.error('GET /mentors error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/mentors/:id
router.get('/:id', async (req, res) => {
  try {
    const mentor = await User.findOne({
      _id: req.params.id,
      role: 'mentor',
      isActive: true,
    }).select(MENTOR_FIELDS);

    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    res.json(mentor);
  } catch (err) {
    console.error('GET /mentors/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/mentors/profile — mentor updates their own profile
router.put('/profile', authMiddleware, requireRole('mentor'), async (req, res) => {
  try {
    const allowed = [
      'title', 'department', 'bio', 'skills',
      'yearsOfExperience', 'availability', 'photoUrl',
    ];

    // Build update object from only permitted fields
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (updates.bio && updates.bio.length > 500) {
      return res.status(400).json({ error: 'Bio cannot exceed 500 characters' });
    }

    const mentor = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select(MENTOR_FIELDS);

    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    res.json(mentor);
  } catch (err) {
    console.error('PUT /mentors/profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/mentors/suggest — AI-powered mentor recommendation (auth required)
router.post('/suggest', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'query is required' });
    }

    // Fetch all active mentors (lightweight fields for the AI prompt)
    const mentors = await User.find({ role: 'mentor', isActive: true })
      .select('_id name title skills bio yearsOfExperience')
      .lean();

    // Map _id to id string so Claude sees a consistent key
    const mentorList = mentors.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      title: m.title,
      skills: m.skills,
      bio: m.bio,
      yearsOfExperience: m.yearsOfExperience,
    }));

    const suggestions = await suggestMentors(query, mentorList);

    if (suggestions === null) {
      // AI call failed — return empty list with error flag for graceful degradation
      return res.json({ suggestions: [], aiError: true });
    }

    res.json({ suggestions });
  } catch (err) {
    console.error('POST /mentors/suggest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
