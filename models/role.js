import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;
