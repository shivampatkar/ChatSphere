import User from '../../models/User.js';

/*
  Auth Repository
  ---------------
  All direct MongoDB operations for the User collection live here.
  Controllers never touch the DB directly — they call these functions.
  This keeps DB logic in one place so if you switch DBs only this file changes.

  findByUsername  - used by login to check if user exists
  createUser      - used by register to insert a new user document
*/

const findByUsername = async (username) => {
  return await User.findOne({ username });
};

const createUser = async ({ username, passwordHash }) => {
  const user = new User({ username, passwordHash });
  return await user.save();
};

export { findByUsername, createUser };
