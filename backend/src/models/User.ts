import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  googleTokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number,
  },
});

const User = mongoose.model('User', userSchema);
export default User;
