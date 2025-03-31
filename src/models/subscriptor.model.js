import mongoose from "mongoose";

const subscriptorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
     },
  {
    timestamps: true,
  }
);

export default mongoose.model("Subs", subscriptorSchema);