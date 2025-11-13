import mongoose from "mongoose";

const vaccineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  recommendedAge: {
    type: String,
    required: true
  },
  dosesRequired: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

export default mongoose.model("Vaccine", vaccineSchema);
