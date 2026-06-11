import mongoose from 'mongoose';

/*
  User schema
  -----------
  Fields:
    username     - unique login name, stored lowercase
    passwordHash - bcrypt hash of the raw password (we never store plain text)
    timestamps   - createdAt and updatedAt added automatically by mongoose
*/
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
