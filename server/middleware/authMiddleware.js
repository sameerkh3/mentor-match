import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verifies the Bearer token in Authorization header.
 * Attaches { id, role } to req.user on success.
 * Also checks that the user account is still active.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm account still exists and is active
    const user = await User.findById(decoded.id).select('_id role isActive');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authMiddleware;
