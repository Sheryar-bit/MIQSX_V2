import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  plan: { type: String, enum: ["free", "pro", "agency"], default: "free" },
  emailVerified: { type: Date, default: null },
  image: { type: String, default: null },
}, { timestamps: true });

const User = models.User || model("User", UserSchema);
export default User;
