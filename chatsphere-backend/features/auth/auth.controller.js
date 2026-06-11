import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findByUsername, createUser } from './auth.repository.js';

/*
  generateToken
  -------------
  Creates a JWT that expires in 7 days.
  Payload contains id and username so any middleware/socket handler
  can identify the user without hitting the DB again.
*/
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/*
  register  →  POST /auth/register
  ----------------------------------
  1. Validates that username and password are present
  2. Enforces minimum password length of 6 characters
  3. Checks if username is already taken → 409 if so
  4. Hashes the password with bcrypt (cost factor 10)
  5. Saves the new user to MongoDB
  6. Returns a JWT + basic user info

  The mobile app stores this token in AsyncStorage immediately
  so the user is considered logged in right after registering.
*/
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await findByUsername(username.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ username: username.toLowerCase(), passwordHash });
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

/*
  login  →  POST /auth/login
  ---------------------------
  1. Validates presence of username and password
  2. Looks up the user by username
  3. If not found → 401 (intentionally vague — don't reveal which field is wrong)
  4. Compares submitted password against stored bcrypt hash
  5. If mismatch → 401
  6. Returns a fresh JWT + basic user info

  The mobile app stores this token in AsyncStorage.
  On every subsequent request the token is sent in the Authorization header.
*/
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await findByUsername(username.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export { register, login };
