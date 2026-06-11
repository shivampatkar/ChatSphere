import { Router } from 'express';
import { fetchMessages } from './message.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

/*
  Message Routes
  --------------
  GET /messages  → fetch chat history

  authMiddleware runs first on every request here.
  If the token is missing or invalid the request never reaches
  fetchMessages — authMiddleware returns 401 immediately.
  This ensures only logged-in users can read messages.
*/
const router = Router();

router.get('/', authMiddleware, fetchMessages);

export default router;
