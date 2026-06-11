import { Router } from 'express';
import { register, login } from './auth.controller.js';

/*
  Auth Routes
  -----------
  POST /auth/register  → create new account
  POST /auth/login     → login and receive JWT

  No auth middleware here — these are the public endpoints.
  Anyone can hit them without a token (that is the point).
*/
const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
