import mongoose from "mongoose";

const reservesSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    time: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    payment_status: {
      type: String,
      required: true,
    },
    adress: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Reserved", reservesSchema);