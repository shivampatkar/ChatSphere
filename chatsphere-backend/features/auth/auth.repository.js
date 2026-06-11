import User from '../../models/User.js';

const findByUsername = async (username) => {
  return await User.findOne({ username });
};

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async ({ username, email, passwordHash }) => {
  const user = new User({ username, email, passwordHash });
  return await user.save();
};

export { findByUsername, findByEmail, createUser };
