import jwt from 'jsonwebtoken';

/*
  authMiddleware
  --------------
  Protects any route that needs a logged-in user.

  Flow:
    1. Reads the Authorization header → expects "Bearer <token>"
    2. If missing → 401 immediately
    3. Verifies the token with JWT_SECRET
    4. If valid → attaches decoded payload to req.user and calls next()
    5. If invalid/expired → 401

  req.user will contain: { id, username, iat, exp }
  This is what controllers use to know who is making the request
*/
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
