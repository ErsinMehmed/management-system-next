import mongoose, { Schema } from "mongoose";

const clientNoteSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const clientPhoneSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, default: "", trim: true },
    notes: { type: [clientNoteSchema], default: [] },
  },
  { timestamps: true }
);

// Търсене по име (prefix regex или exact). Партиалният филтър изключва празни
// имена, които ги има предимно — индексът остава компактен.
clientPhoneSchema.index(
  { name: 1 },
  { partialFilterExpression: { name: { $gt: "" } } }
);

const ClientPhone =
  mongoose.models.ClientPhone || mongoose.model("ClientPhone", clientPhoneSchema);

export default ClientPhone;
