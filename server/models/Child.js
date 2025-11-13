import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vaccinationHistory: [
    {
      vaccineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vaccine"
      },
      status: {
        type: String,
        enum: ["pending", "completed", "missed"],
        default: "pending"
      },
      date: {
        type: Date
      },
      administeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ]
}, {
  timestamps: true
});

export default mongoose.model("Child", childSchema);
