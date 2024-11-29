import mongoose from "mongoose";

const HabitSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    target: {
      type: Number,
      required: true,
      min : 1,
    },
    progress: [{
      date : {
        type : Date,
        required : true,
        default : Date.now,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    }],
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Habit = mongoose.model("Habit", habitSchema); 