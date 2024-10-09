import mongoose, { Schema } from "mongoose";
import Role from "./role.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profile_image: String,
    percent: Number,
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
