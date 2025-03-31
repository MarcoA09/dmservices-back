import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    rol: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
        type: String,
        required: true,
      },
      bloqueado: {
        type: Date,
      },
      intentos: {
        type: Number,
      },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);